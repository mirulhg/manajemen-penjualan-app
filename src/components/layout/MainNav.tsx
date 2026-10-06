import { NavLink } from 'react-router';

import { cn } from '@/lib/utils';
import type { NavItem } from './nav-items';

type MainNavProps = {
  items: NavItem[];
};

// Navigasi header untuk layar lebar; di layar kecil diganti TabBar. NavLink memasang aria-current="page" pada link aktif.
export function MainNav({ items }: MainNavProps) {
  return (
    <nav aria-label="Menu utama" className="hidden md:block">
      <ul className="flex gap-2">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-md px-3 font-medium transition-colors duration-(--duration-fast) ease-out',
                  isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60',
                )
              }
            >
              <item.icon aria-hidden="true" className="size-4" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
