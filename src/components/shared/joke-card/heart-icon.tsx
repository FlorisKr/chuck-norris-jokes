interface HeartIconProps {
  filled: boolean;
}

export function HeartIcon({ filled }: HeartIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinejoin="round"
      className={`size-6 stroke-current ${filled ? "fill-current" : "fill-none"}`}
    >
      <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.8 3.6 4.5 7 4.5c2 0 3.8 1.2 5 3 1.2-1.8 3-3 5-3 3.4 0 5.5 3.3 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z" />
    </svg>
  );
}
