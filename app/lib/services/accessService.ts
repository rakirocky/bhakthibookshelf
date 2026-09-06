import { OrderRepository } from "../repositories/orderRepository";
import { SubscriptionRepository } from "../repositories/subscriptionRepository";

export class AccessService {
  static async customerHasAccessToBook(
    customerId: number,
    bookId: number
  ): Promise<boolean> {
    const activeSubscription =
      await SubscriptionRepository.getActiveForCustomer(
        customerId
      );

    if (activeSubscription) {
      return true;
    }

    return OrderRepository.hasCustomerPurchasedBook(
      customerId,
      bookId
    );
  }
}
