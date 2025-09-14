import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen bg-background text-foreground">
        <ThemeProvider defaultTheme="system" storageKey="conversational-insights-theme">
          <SidebarProvider>
            {/* Sidebar */}
            <Sidebar className="w-64 border-r bg-background">
              <nav className="flex flex-col gap-2 p-4">
                <div className="mb-4 px-2">
                  <h2 className="text-lg font-semibold text-foreground">🍍 Pineapple</h2>
                </div>
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent">
                    📊 Dashboard
                  </Button>
                </Link>
                <Link href="/customers">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent">
                    👥 Customers
                  </Button>
                </Link>
                <Link href="/conversations">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent">
                    📞 Conversations
                  </Button>
                </Link>
                <Link href="/insights">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent">
                    💡 Insights
                  </Button>
                </Link>
              </nav>
            </Sidebar>

            {/* Main content area */}
            <div className="flex-1 flex flex-col">
              {/* Top bar with theme toggle */}
              <header className="h-14 border-b bg-background px-6 flex items-center justify-between">
                <div></div>
                <ThemeToggle />
              </header>
              
              {/* Main content */}
              <main className="flex-1 overflow-y-auto bg-background">{children}</main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
