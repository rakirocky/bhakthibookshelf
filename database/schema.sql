CREATE TABLE books (
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

CREATE INDEX idx_books_slug
ON books(slug);

CREATE INDEX idx_books_featured
ON books(featured);

CREATE INDEX idx_books_published
ON books(published);
