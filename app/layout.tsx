// app/layout.tsx
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar"; // ✅ import this
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen">
        {/* Wrap everything in SidebarProvider */}
        <SidebarProvider>
          {/* Sidebar */}
          <Sidebar className="w-64 border-r">
            <nav className="flex flex-col gap-2 p-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  Dashboard
                </Button>
              </Link>
              <Link href="/customers">
                <Button variant="ghost" className="w-full justify-start">
                  Customers
                </Button>
              </Link>
              <Link href="/conversations">
                <Button variant="ghost" className="w-full justify-start">
                  Conversations
                </Button>
              </Link>
              <Link href="/insights">
                <Button variant="ghost" className="w-full justify-start">
                  Insights
                </Button>
              </Link>
            </nav>
          </Sidebar>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </SidebarProvider>
      </body>
    </html>
  );
}
