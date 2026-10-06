import { NavLink } from 'react-router';

import { cn } from '@/lib/utils';
import type { NavItem } from './nav-items';

type TabBarProps = {
  items: NavItem[];
};

export function TabBar({ items }: TabBarProps) {
  return (
    <nav
      aria-label="Menu bawah"
      className="fixed inset-x-0 bottom-0 z-sticky border-t border-border bg-card pb-safe md:hidden print:hidden"
    >
      <ul className="flex">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink to={item.to} className="press flex min-h-(--tabbar-height) flex-col items-center justify-center gap-0.5 px-1 text-xs">
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-7 w-14 items-center justify-center rounded-full transition-colors duration-(--duration-fast) ease-out',
                      isActive && 'bg-accent text-accent-foreground',
                    )}
                  >
                    <item.icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className={cn('font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
