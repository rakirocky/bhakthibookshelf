import { SubscriptionRepository } from "../repositories/subscriptionRepository";

export class SubscriptionService {
  static async getActivePlans() {
    return SubscriptionRepository.getActivePlans();
  }

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

    const existing =
      await SubscriptionRepository.getActiveForCustomer(
        customerId
      );

    if (existing) {
      throw new Error(
        `You already have an active subscription until ${new Date(
          existing.ends_at
        ).toLocaleDateString("en-IN")}.`
      );
    }

    return SubscriptionRepository.create({
      customerId,
      planId,
      amount: plan.price,
      promoterId,
    });
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

  static async getAllForAdmin(promoterCode?: string) {
    return SubscriptionRepository.getAllForAdmin(
      promoterCode
    );
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
