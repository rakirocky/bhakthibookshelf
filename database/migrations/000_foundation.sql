-- Foundational schema — books, orders, order_items.
-- These have existed since Module 2/3, created manually via psql before
-- this numbered migration system started (hence starting at 007, not 001).
-- Written defensively with IF NOT EXISTS so this is always safe to run,
-- whether the tables already exist (your laptop) or not (a fresh
-- database, like a new server).

CREATE TABLE IF NOT EXISTS books (
    id BIGSERIAL PRIMARY KEY,

    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    author VARCHAR(255) NOT NULL,
    publisher VARCHAR(255),
    language VARCHAR(100) DEFAULT 'English',
    pages INTEGER,
    description TEXT,

    price NUMERIC(10,2) NOT NULL,
    discount_price NUMERIC(10,2),

    cover_image TEXT,
    sample_pdf TEXT,
    full_pdf TEXT,

    featured BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_books_featured ON books(featured);
CREATE INDEX IF NOT EXISTS idx_books_published ON books(published);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,

    order_number VARCHAR(30) UNIQUE NOT NULL,

    customer_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    mobile VARCHAR(20) NOT NULL,

    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',

    gst_number VARCHAR(20),

    total_amount NUMERIC(10,2) NOT NULL,

    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(30),
    order_status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    payment_id VARCHAR(100),
    razorpay_order_id VARCHAR(100),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,

    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id),

    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_book_id ON order_items(book_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
