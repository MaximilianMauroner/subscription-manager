import Link from "next/link";

import { cn } from "@/lib/utils";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="hover:text-primary text-sm font-medium transition-colors"
      >
        Overview
      </Link>
      <Link
        href="/subscriptions"
        className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
      >
        Subscriptions
      </Link>
      <Link
        href="/new"
        className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
      >
        New Subscrption
      </Link>
      <Link
        href="/examples/dashboard"
        className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
      >
        Settings
      </Link>
    </nav>
  );
}
