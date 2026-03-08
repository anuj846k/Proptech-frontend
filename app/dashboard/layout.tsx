import { Plus_Jakarta_Sans } from 'next/font/google';
import DashboardGuard from '@/components/dashboard/DashboardGuard';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-dashboard',
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <div
        className={`${plusJakarta.variable} ${plusJakarta.className} h-screen min-h-screen overflow-hidden bg-brand-50`}
      >
        <div className="min-h-[125vh] w-[125%] origin-top-left scale-[0.8]">
          {children}
        </div>
      </div>
    </DashboardGuard>
  );
}
