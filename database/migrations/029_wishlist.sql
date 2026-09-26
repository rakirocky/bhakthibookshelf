-- Wishlist ("♡ save for later") for logged-in customers. Guests keep
-- theirs in the browser (localStorage) and it's merged in here when they
-- log in — see app/context/WishlistContext.tsx.
CREATE TABLE IF NOT EXISTS wishlist_items (
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    book_id     BIGINT  NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id, book_id)
);
