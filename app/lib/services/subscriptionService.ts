import { SubscriptionRepository } from "../repositories/subscriptionRepository";
import { RazorpayService } from "./razorpayService";

export class SubscriptionService {
  static async getActivePlans() {
    return SubscriptionRepository.getActivePlans();
  }

  /**
   * Starts (or resumes) a subscription purchase. An unpaid subscription
   * from an earlier attempt is reused — every click used to insert a new
   * PENDING row — and `reused` tells the caller it may already have a
   * Razorpay order to pay against.
   */
  static async purchase(
    customerId: number,
    planId: number,
    promoterId?: number | null
  ) {
    const plan = await SubscriptionRepository.getPlanById(
      planId
    );

    if (!plan || !plan.is_active) {
      throw new Error("This plan is not available.");
    }

    // Settles a pending payment that actually went through first, so a
    // customer who already paid isn't asked to pay again.
    const status = await this.getStatusForCustomer(customerId);

    if (status.status === "ACTIVE") {
      throw new Error(
        status.subscription.ends_at
          ? `You already have an active subscription until ${new Date(
              status.subscription.ends_at
            ).toLocaleDateString("en-IN")}.`
          : "You already have lifetime access."
      );
    }

    if (
      status.status === "PENDING" &&
      Number(status.subscription.plan_id) === Number(planId) &&
      Number(status.subscription.amount) === Number(plan.price)
    ) {
      return { ...status.subscription, reused: true as const };
    }

    const created = await SubscriptionRepository.create({
      customerId,
      planId,
      amount: plan.price,
      promoterId,
    });

    return { ...created, reused: false as const };
  }

  static async getStatusForCustomer(customerId: number) {
    const active =
      await SubscriptionRepository.getActiveForCustomer(
        customerId
      );

    if (active) {
      return { status: "ACTIVE" as const, subscription: active };
    }

    const latest =
      await SubscriptionRepository.getLatestForCustomer(
        customerId
      );

    if (!latest) {
      return { status: "NONE" as const, subscription: null };
    }

    if (latest.payment_status === "PENDING") {
      const settled = await this.reconcileWithRazorpay(latest);

      if (settled) {
        return { status: "ACTIVE" as const, subscription: settled };
      }

      return {
        status: "PENDING" as const,
        subscription: latest,
      };
    }

    return {
      status: "EXPIRED" as const,
      subscription: latest,
    };
  }

  /**
   * If Razorpay says this pending subscription's order was paid, mark it
   * PAID (same path as verify-payment / webhook) and return the active
   * row. Any Razorpay error leaves it pending — the next page view will
   * check again.
   */
  private static async reconcileWithRazorpay(subscription: {
    id: number;
    customer_id: number;
    razorpay_order_id?: string | null;
  }) {
    const orderId = subscription.razorpay_order_id;
    if (!orderId) return null;

    try {
      const paymentId = await RazorpayService.getCapturedPaymentId(orderId);
      if (!paymentId) return null;

      await SubscriptionRepository.markPaid(subscription.id, {
        paymentId,
        paymentMethod: "razorpay",
      });

      console.log(
        `[subscription-reconcile] subscription ${subscription.id} marked PAID — Razorpay reports order ${orderId} paid (payment ${paymentId}); the verify call and webhook had not arrived`
      );

      return SubscriptionRepository.getActiveForCustomer(
        subscription.customer_id
      );
    } catch (error) {
      console.error(
        `[subscription-reconcile] could not check Razorpay order ${orderId}:`,
        error instanceof Error ? error.message : error
      );
      return null;
    }
  }

  static async getAllForAdmin(promoterCode?: string) {
    return SubscriptionRepository.getAllForAdmin(
      promoterCode
    );
  }

  static async getDashboardRevenue() {
    return SubscriptionRepository.getTotalPaidRevenue();
  }

  static async markPaid(
    id: number,
    paymentDetails?: {
      paymentId?: string;
      paymentMethod?: string;
      razorpayOrderId?: string;
    }
  ) {
    const updated = await SubscriptionRepository.markPaid(
      id,
      paymentDetails
    );

    if (!updated) {
      throw new Error("Subscription not found.");
    }

    return updated;
  }

  static async setRazorpayOrderId(
    id: number,
    razorpayOrderId: string
  ) {
    return SubscriptionRepository.setRazorpayOrderId(
      id,
      razorpayOrderId
    );
  }

  static async getById(id: number) {
    return SubscriptionRepository.getById(id);
  }

  static async getByRazorpayOrderId(
    razorpayOrderId: string
  ) {
    return SubscriptionRepository.getByRazorpayOrderId(
      razorpayOrderId
    );
  }
}
