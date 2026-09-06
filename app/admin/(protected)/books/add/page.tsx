import BookForm from "@/app/components/admin/BookForm";

export default function AddBookPage() {
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Add Book</h1>

      <BookForm mode="add" />
    </div>
  );
}
