export function PortraitPlaceholder({ caption }: { caption: string }) {
  return (
    <figure className="max-w-sm">
      <svg
        viewBox="0 0 320 400"
        role="img"
        aria-label={caption}
        className="w-full border border-rule bg-paper-2"
      >
        <rect width="320" height="400" fill="#e6e2d8" />
        <circle cx="160" cy="150" r="54" fill="none" stroke="#121211" strokeWidth="1.5" />
        <path d="M70 330c20-70 160-70 180 0" fill="none" stroke="#121211" strokeWidth="1.5" />
        <text
          x="160"
          y="158"
          textAnchor="middle"
          fontFamily="var(--font-newsreader), serif"
          fontSize="28"
          fill="#121211"
        >
          EJC
        </text>
        <text
          x="160"
          y="372"
          textAnchor="middle"
          fontFamily="var(--font-plex), sans-serif"
          fontSize="10"
          letterSpacing="2"
          fill="#5f5c54"
        >
          PORTRAIT TO BE SUPPLIED
        </text>
      </svg>
      <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption>
    </figure>
  );
}
