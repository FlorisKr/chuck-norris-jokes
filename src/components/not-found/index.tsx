import { Notice } from "../shared/notice";

export function NotFound() {
  return (
    <Notice linkText="Go to jokes">
      <h2 className="text-xl font-bold text-foreground">Page not found</h2>
      <p className="text-foreground">Even Chuck Norris couldn't find this page.</p>
    </Notice>
  );
}
