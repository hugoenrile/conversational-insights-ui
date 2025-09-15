import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageTransition } from "@/components/page-transition";
import { AnimatedBackground } from "@/components/animated-background";
import { Toaster } from "sonner";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen bg-background text-foreground">
        <AnimatedBackground />
        <ThemeProvider defaultTheme="system" storageKey="conversational-insights-theme">
          <SidebarProvider>
            <Sidebar className="w-64 border-r bg-background">
              <nav className="flex flex-col gap-2 p-4">
                <div className="mb-4 px-2">
                  <h2 className="text-lg font-semibold text-foreground">🍍 Pineapple</h2>
                </div>
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent transition-all hover:translate-x-1 hover:shadow-sm">
                    📊 Dashboard
                  </Button>
                </Link>
                <Link href="/customers">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent transition-all hover:translate-x-1 hover:shadow-sm">
                    👥 Customers
                  </Button>
                </Link>
                <Link href="/conversations">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent transition-all hover:translate-x-1 hover:shadow-sm">
                    📞 Conversations
                  </Button>
                </Link>
                <Link href="/insights">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent transition-all hover:translate-x-1 hover:shadow-sm">
                    💡 Insights
                  </Button>
                </Link>
              </nav>
            </Sidebar>

            <div className="flex-1 flex flex-col">
              <header className="h-14 border-b bg-background px-6 flex items-center justify-between">
                <div></div>
                <ThemeToggle />
              </header>
              
              <main className="flex-1 overflow-y-auto bg-background">
                <PageTransition>{children}</PageTransition>
              </main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
        <Toaster 
          position="top-right"
          expand={true}
          richColors
          closeButton
          toastOptions={{
            style: {
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            },
          }}
        />
      </body>
    </html>
  );
}
