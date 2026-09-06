import Link from "next/link";

type Props = {
  title: string;
};

export default function Breadcrumb({
  title,
}: Props) {
  return (
    <nav
      style={{
        marginBottom: 30,
        fontSize: 15,
      }}
    >
      <Link href="/">Home</Link>

      {" / "}

      <Link href="/books">
        Books
      </Link>

      {" / "}

      <strong>{title}</strong>
    </nav>
  );
}
