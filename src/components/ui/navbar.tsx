import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type NavbarProps = ComponentProps<"nav"> & {
  links?: { label: string; href: string }[];
};

function Navbar({ className, links = [], children, ...props }: NavbarProps) {
  return (
    <nav
      className={cn(
        "flex h-14 w-full items-center border-b border-border-primary bg-bg-page px-6 font-primary",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-accent-green">{">"}</span>
        <span className="text-lg font-medium text-text-primary">devroast</span>
      </div>
      <div className="flex-1" />
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="text-[13px] text-text-secondary transition-colors hover:text-text-primary"
        >
          {link.label}
        </a>
      ))}
      {children}
    </nav>
  );
}

export type { NavbarProps };
export { Navbar };
