import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl text-foreground">404</h1>
        <h2 className="mt-4 font-serif text-2xl text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Zoe Essence — Contemporary Fashion for Women of Substance" },
      { name: "description", content: "Made-to-order garments, ready-to-wear, and curated accessories. Timeless elegance from Zoe Essence." },
      { property: "og:title", content: "Zoe Essence — Contemporary Fashion for Women of Substance" },
      { property: "og:description", content: "Made-to-order garments, ready-to-wear, and curated accessories. Timeless elegance from Zoe Essence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Zoe Essence — Contemporary Fashion for Women of Substance" },
      { name: "twitter:description", content: "Made-to-order garments, ready-to-wear, and curated accessories. Timeless elegance from Zoe Essence." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/8seU6tOL0pgAX1noRJ0TDRYy0va2/social-images/social-1778039420032-219401.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/8seU6tOL0pgAX1noRJ0TDRYy0va2/social-images/social-1778039420032-219401.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster position="top-center" />
    </AuthProvider>
  );
}
