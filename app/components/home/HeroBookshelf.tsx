import Image from "next/image";

export default function HeroBookshelf() {
  return (
    <div className="hero-bookshelf">
      <Image
        src="/images/books/bhagavad-gita.jpg"
        alt="Bhagavad Gita"
        width={170}
        height={250}
        className="hero-book hero-book-1"
      />

      <Image
        src="/images/books/ramayana.jpg"
        alt="Ramayana"
        width={170}
        height={250}
        className="hero-book hero-book-2"
      />

      <Image
        src="/images/books/mahabharata.jpg"
        alt="Mahabharata"
        width={170}
        height={250}
        className="hero-book hero-book-3"
      />

      <Image
        src="/images/books/hanuman-chalisa.jpg"
        alt="Hanuman Chalisa"
        width={170}
        height={250}
        className="hero-book hero-book-4"
      />
    </div>
  );
}