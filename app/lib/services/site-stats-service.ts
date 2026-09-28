import "server-only";

import { cache } from "react";

import { getPublicBookCount } from "../repositories/bookRepository";
import { CustomerRepository } from "../repositories/customerRepository";

// Per-request only — see the note in book-service.ts (2-process cluster).
export const getSiteStats = cache(
  async () => {
    const [bookCount, customerCount] = await Promise.all([
      getPublicBookCount(),
      CustomerRepository.getTotalCount(),
    ]);

    return { bookCount, customerCount };
  }
);
