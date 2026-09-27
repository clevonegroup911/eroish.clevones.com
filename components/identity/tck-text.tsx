export function TckText({ text }: { text: string }) {
  const parts = text.split("Third Culture Kid");
  if (parts.length === 1) return text;
  return (
    <>
      {parts[0]}
      <em>Third Culture Kid</em>
      {parts.slice(1).join("Third Culture Kid")}
    </>
  );
}
