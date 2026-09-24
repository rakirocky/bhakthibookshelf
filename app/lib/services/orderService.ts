import { OrderRepository } from "../repositories/orderRepository";
import { sendPaymentConfirmationEmail } from "./orderEmailService";
import {
  CreateOrderRequest,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "../types/order";

export class OrderService {
  static async createOrder(
    order: CreateOrderRequest,
    promoterId?: number | null,
    customerId?: number | null
  ) {
    if (order.items.length === 0) {
      throw new Error("Cart is empty");
    }

    if (!order.customer_name.trim()) {
      throw new Error("Customer name is required");
    }

    if (!order.email.trim()) {
      throw new Error("Email is required");
    }

    if (!order.mobile.trim()) {
      throw new Error("Mobile number is required");
    }

    return await OrderRepository.createOrder(
      order,
      promoterId,
      customerId
    );
  }

  static async getDashboardOrderCount() {
    return OrderRepository.getOrderCount();
}

static async getDashboardRevenue() {
    return OrderRepository.getTotalRevenue();
}

static async getDashboardRecentOrders() {
    return OrderRepository.getRecentOrders();
}

  static async getAllOrders(promoterCode?: string) {
    return OrderRepository.getAllOrders(promoterCode);
  }

  static async getOrderDetail(id: number) {
    const order = await OrderRepository.getOrderById(id);

    if (!order) {
      return null;
    }

    const items = await OrderRepository.getOrderItems(id);

    return {
      ...order,
      items,
    };
  }

  static async updateOrderStatus(
    id: number,
    updates: {
      order_status?: string;
      payment_status?: string;
    }
  ) {
    if (
      updates.order_status &&
      !ORDER_STATUSES.includes(updates.order_status as any)
    ) {
      throw new Error("Invalid order status");
    }

    if (
      updates.payment_status &&
      !PAYMENT_STATUSES.includes(updates.payment_status as any)
    ) {
      throw new Error("Invalid payment status");
    }

    if (!updates.order_status && !updates.payment_status) {
      throw new Error("Nothing to update");
    }

    const updated = await OrderRepository.updateOrderStatus(
      id,
      updates
    );

    if (!updated) {
      throw new Error("Order not found");
    }

    return updated;
  }

  static async setRazorpayOrderId(
    id: number,
    razorpayOrderId: string
  ) {
    return OrderRepository.setRazorpayOrderId(
      id,
      razorpayOrderId
    );
  }

  static async markPaidWithPaymentDetails(
    id: number,
    paymentDetails: {
      paymentId: string;
      paymentMethod: string;
    }
  ) {
    const updated =
      await OrderRepository.markPaidWithPaymentDetails(
        id,
        paymentDetails
      );

    if (!updated) {
      throw new Error("Order not found");
    }

    if (updated.newly_paid) {
      // Fire-and-forget: the payment is already recorded, and a mail
      // hiccup must never turn a successful payment into an error for
      // the customer (admin can resend from the order page).
      void OrderService.sendConfirmationEmail(id);
    }

    return updated;
  }

  private static async sendConfirmationEmail(id: number) {
    try {
      const order = await OrderService.getOrderDetail(id);

      if (!order?.email) {
        return;
      }

      await sendPaymentConfirmationEmail(order);

      console.log(
        `[order-paid] confirmation email sent to ${order.email} for order ${order.order_number}`
      );
    } catch (error) {
      console.error(
        `[order-paid] confirmation email FAILED for order id ${id}:`,
        error
      );
    }
  }

  static async getByRazorpayOrderId(
    razorpayOrderId: string
  ) {
    return OrderRepository.getByRazorpayOrderId(
      razorpayOrderId
    );
  }

  static async getCustomerOrderStatus(
    orderNumber: string,
    customerId: number
  ) {
    return OrderRepository.getCustomerOrderStatus(
      orderNumber,
      customerId
    );
  }

  static async getPurchasedBooksForCustomer(
    customerId: number
  ) {
    return OrderRepository.getPurchasedBooksForCustomer(
      customerId
    );
  }

}


