import { m } from 'motion/react';
import { NavLink } from 'react-router';

import { useIndicatorTransition } from '@/hooks/use-input-modality';
import { cn } from '@/lib/utils';
import type { NavItem } from './nav-items';

// Sama dengan --radius-md (rounded-md). Motion hanya mengoreksi sudut yang melar saat pil berganti lebar bila radius ada di style, dalam px.
const INDICATOR_RADIUS_PX = 6;

type MainNavProps = {
  items: NavItem[];
};

// Navigasi header untuk layar lebar; di layar kecil diganti TabBar. NavLink memasang aria-current="page" pada link aktif.
export function MainNav({ items }: MainNavProps) {
  const indicatorTransition = useIndicatorTransition();

  return (
    <nav aria-label="Menu utama" className="hidden md:block">
      <ul className="flex gap-2">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative inline-flex min-h-11 items-center gap-2 rounded-md px-3 font-medium transition-colors duration-(--duration-fast) ease-out',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:bg-secondary/60',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <m.span
                      layoutId="mainnav-indicator"
                      transition={indicatorTransition}
                      style={{ borderRadius: INDICATOR_RADIUS_PX }}
                      className="absolute inset-0 bg-secondary"
                    />
                  )}
                  <item.icon aria-hidden="true" className="relative size-4" />
                  <span className="relative">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
