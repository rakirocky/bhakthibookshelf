import Image from "next/image";
import Link from "next/link";

import { fileUrl } from "@/app/lib/upload/fileUrl";

type Props = {
  slug: string;
  title: string;
  author: string;
  price: number;
  cover?: string | null;
};

export default function BookCard({
  slug,
  title,
  author,
  price,
  cover,
}: Props) {
  return (
    <article className="book-card">
      <Link href={`/books/${slug}`}>

        <div className="book-image">

          <Image
            src={
              fileUrl(cover) ||
              "/images/books/default-book.jpg"
            }
            alt={title}
            width={300}
            height={450}
            priority={false}
          />

        </div>

      </Link>

      <div className="book-details">

        <h3>{title}</h3>

        <p className="author">
          {author}
        </p>

        <div className="price">

          ₹{price}

        </div>

        <Link
          href={`/books/${slug}`}
          className="book-button"
        >
          View Details
        </Link>

      </div>
    </article>
  );
}
