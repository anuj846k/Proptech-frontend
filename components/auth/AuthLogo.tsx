import { Building2 } from 'lucide-react';
import Link from 'next/link';

export function AuthLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 self-center font-semibold text-foreground transition-colors hover:opacity-90"
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm">
        <Building2 className="size-5" />
      </div>
      <span className="text-xl tracking-tight">proptech</span>
    </Link>
  );
}
