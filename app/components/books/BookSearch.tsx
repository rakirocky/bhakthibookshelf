type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function BookSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="book-search">
      <input
        type="text"
        placeholder="Search books..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
