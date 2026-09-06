export default function Spinner({
  variant = "light",
}: {
  /** "light" for use on colored buttons, "dark" for use on white backgrounds */
  variant?: "light" | "dark";
}) {
  return (
    <span
      className={
        variant === "dark"
          ? "spinner spinner-dark"
          : "spinner"
      }
    />
  );
}
