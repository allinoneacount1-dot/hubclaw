import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-xs font-mono text-slate-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-2">
            {index === 0 && <Home size={12} className="text-slate-600" />}
            {isLast ? (
              <span className="text-slate-300">{item.label}</span>
            ) : item.onClick ? (
              <button
                onClick={item.onClick}
                className="hover:text-cyan-400 transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span>{item.label}</span>
            )}
            {!isLast && <ChevronRight size={10} className="text-slate-700" />}
          </div>
        );
      })}
    </nav>
  );
}
