import { NavLink } from 'react-router';

import type { NavItem } from './nav-items';

type TabBarProps = {
  items: NavItem[];
};

export function TabBar({ items }: TabBarProps) {
  return (
    <nav
      aria-label="Menu bawah"
      className="fixed inset-x-0 bottom-0 z-sticky border-t border-border bg-surface pb-safe md:hidden"
    >
      <ul className="flex">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex min-h-12 items-center justify-center px-2 ${
                  isActive ? 'font-semibold text-primary underline' : 'text-text'
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
