/** Kept for older compositions. Content stays readable without JavaScript. */
export function Reveal({ children, className = "", as: Tag = "div" }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "span" | "li";
}) {
  return <Tag className={className}>{children}</Tag>;
}
