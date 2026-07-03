'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 border-r bg-white p-4">
      <h2 className="text-lg font-semibold normal-case tracking-normal mb-4">RED HEX Admin</h2>
      <nav className="space-y-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded px-3 py-2 text-sm ${active ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={onLogout}
        className="mt-6 w-full rounded border px-3 py-2 text-sm hover:bg-gray-100"
      >
        Logout
      </button>
    </aside>
  );
}
