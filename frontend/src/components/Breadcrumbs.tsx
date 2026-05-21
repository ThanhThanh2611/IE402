import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mb-4">
      <Link
        to="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5 mr-1" />
        <span>Trang chủ</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
            {isLast || !item.to ? (
              <span className="font-medium text-foreground truncate max-w-[200px]" title={item.label}>
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="hover:text-foreground transition-colors truncate max-w-[200px]"
                title={item.label}
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
