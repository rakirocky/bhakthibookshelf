-- Let admins delete a book that has been ordered. order_items keeps its
-- own copy of the title, so order history, invoices and reports still
-- read correctly after the book row is gone; book_id becomes NULL.
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS book_title VARCHAR(255);

UPDATE order_items oi
SET book_title = b.title
FROM books b
WHERE b.id = oi.book_id AND oi.book_title IS NULL;

ALTER TABLE order_items ALTER COLUMN book_id DROP NOT NULL;

ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_book_id_fkey;
ALTER TABLE order_items
    ADD CONSTRAINT order_items_book_id_fkey
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL;
