import { ReportsRepository } from "../repositories/reportsRepository";

export class ReportsService {
  static async getMonthlyRevenue(months = 12) {
    return ReportsRepository.getMonthlyRevenue(months);
  }

  static async getMonthlyCustomerGrowth(months = 12) {
    return ReportsRepository.getMonthlyCustomerGrowth(months);
  }

  static async getTopBooks(limit = 10) {
    return ReportsRepository.getTopBooks(limit);
  }

  static async getSubscriptionBreakdown() {
    return ReportsRepository.getSubscriptionBreakdown();
  }

  static async getConversionStats() {
    const { total_customers, subscribed_customers } =
      await ReportsRepository.getConversionStats();

    const conversionRate =
      total_customers === 0
        ? 0
        : Math.round((subscribed_customers / total_customers) * 1000) / 10;

    return { total_customers, subscribed_customers, conversionRate };
  }
}
