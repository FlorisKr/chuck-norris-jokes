import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface NoticeProps {
  children: ReactNode;
  linkText: string;
}

export function Notice({ children, linkText }: NoticeProps) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-xl border border-line bg-surface p-4">
      {children}
      <Link
        to="/"
        className="rounded font-semibold text-secondary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
      >
        {linkText}
      </Link>
    </div>
  );
}
