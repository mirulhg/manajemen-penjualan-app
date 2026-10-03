import { NavLink } from 'react-router';

const LINKS = [
  { to: '/stok', label: 'Stok' },
  { to: '/kasir', label: 'Kasir' },
];

// Sementara, sampai tab bar bawah dibuat bersama Mode Kasir. NavLink memasang aria-current="page" pada link aktif.
export function MainNav() {
  return (
    <nav aria-label="Menu utama">
      <ul className="flex gap-2">
        {LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `inline-flex min-h-11 items-center rounded-md px-3 ${
                  isActive ? 'font-semibold text-primary underline' : 'text-text'
                }`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
