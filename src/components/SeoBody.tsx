export function SeoBody({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="max-w-3xl">
      {paragraphs.map((text, index) => (
        <p
          key={text.slice(0, 48)}
          className={index === 0 ? "mt-5 text-xl text-ink-soft" : "mt-4 text-lg text-ink-soft"}
        >
          {text}
        </p>
      ))}
    </div>
  );
}
