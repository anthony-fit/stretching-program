import React from 'react';

export interface BreadcrumbItem {
  label: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-charcoal/60">
      {items.map((item, i) => (
        <span key={i}>
          <a href={item.url} className="hover:text-charcoal hover:underline transition-colors capitalize">
            {item.label}
          </a>
          {i < items.length - 1 && <span className="mx-2">&gt;</span>}
        </span>
      ))}
    </nav>
  );
}
