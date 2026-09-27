import Link from "next/link";

import { ADMIN_NAV } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="grid md:grid-cols-[14rem_1fr]">
      <aside className="border-b border-rule px-4 py-6 md:min-h-screen md:border-b-0 md:border-r">
        <Link href="/admin" className="editorial text-2xl">
          EJC
        </Link>
        <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-muted">Command center</p>
        <nav className="mt-6 grid gap-2 text-sm">
          {ADMIN_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/logout" method="post" className="mt-8">
          <button type="submit" className="text-[0.7rem] uppercase tracking-[0.12em] underline">
            Sign out
          </button>
        </form>
      </aside>
      <div className="px-5 py-8 md:px-8">{children}</div>
    </div>
  );
}
