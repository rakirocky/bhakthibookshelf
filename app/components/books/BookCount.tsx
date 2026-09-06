type Props = {
  count: number;
};

export default function BookCount({ count }: Props) {
  return (
    <div className="book-count">
      <p>{count} books found</p>
    </div>
  );
}
