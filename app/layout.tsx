import { LoadingProvider } from "@/components/loading-provider";
import { AuthProvider } from "@/contexts/auth-context";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "proptech",
  description: "Build Faster, Ship with Confidence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <LoadingProvider>
            {children}
            <Toaster richColors />
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
