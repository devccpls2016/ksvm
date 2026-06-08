import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">पृष्ठ सापडले नाही</h2>
        <p className="mt-2 text-sm text-muted-foreground">तुम्ही शोधत असलेले पृष्ठ अस्तित्वात नाही.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">मुख्यपृष्ठावर जा</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">पृष्ठ लोड होऊ शकले नाही</h1>
        <p className="mt-2 text-sm text-muted-foreground">काहीतरी चूक झाली. पुन्हा प्रयत्न करा.</p>
        <div className="mt-6 flex gap-2 justify-center">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">पुन्हा प्रयत्न करा</button>
          <a href="/" className="rounded-md border px-4 py-2 text-sm hover:bg-accent">मुख्यपृष्ठ</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "कुटुंब सर्वेक्षण | Family Survey System" },
      { name: "description", content: "ग्राम, तालुका व जिल्हा स्तरीय कुटुंब सर्वेक्षण व्यवस्थापन प्रणाली." },
      { property: "og:title", content: "कुटुंब सर्वेक्षण | Family Survey System" },
      { name: "twitter:title", content: "कुटुंब सर्वेक्षण | Family Survey System" },
      { property: "og:description", content: "ग्राम, तालुका व जिल्हा स्तरीय कुटुंब सर्वेक्षण व्यवस्थापन प्रणाली." },
      { name: "twitter:description", content: "ग्राम, तालुका व जिल्हा स्तरीय कुटुंब सर्वेक्षण व्यवस्थापन प्रणाली." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/90e155fc-341d-4d47-81a0-b194935c5557/id-preview-06c533bb--b53b821b-772f-4776-bea9-175c3bd74fcb.lovable.app-1780904614087.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/90e155fc-341d-4d47-81a0-b194935c5557/id-preview-06c533bb--b53b821b-772f-4776-bea9-175c3bd74fcb.lovable.app-1780904614087.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Mukta:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="mr">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
