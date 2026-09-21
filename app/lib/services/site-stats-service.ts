import "server-only";

import { unstable_cache } from "next/cache";

import { getPublicBookCount } from "../repositories/bookRepository";
import { CustomerRepository } from "../repositories/customerRepository";

export const getSiteStats = unstable_cache(
  async () => {
    const [bookCount, customerCount] = await Promise.all([
      getPublicBookCount(),
      CustomerRepository.getTotalCount(),
    ]);

    return { bookCount, customerCount };
  },
  ["site-stats"],
  { tags: ["books", "customers"], revalidate: 300 }
);
