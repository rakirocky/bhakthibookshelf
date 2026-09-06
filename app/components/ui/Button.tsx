import Link from "next/link";

interface ButtonProps {
  href: string;
  text: string;
}

export default function Button({
  href,
  text,
}: ButtonProps) {
  return (
    <Link href={href} className="hero-button">
      {text}
    </Link>
  );
}
