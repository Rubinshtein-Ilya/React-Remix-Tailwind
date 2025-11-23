import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";

import type { Route } from "./+types/root";
import "./app.css";
import "./styles/notistack.css";
import "./styles/autofill.css";
import { ThemeProvider } from "~/contexts/ThemeContext";
import { LanguageProvider } from "~/contexts/LanguageContext";
import { EnvProvider } from "~/contexts/EnvContext";
import { getClientLocales } from "./utils/locale.server";
import { YandexMetrika } from "~/components/YandexMetrika";
import { CookieNotification } from "~/components/CookieNotification";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      refetchOnWindowFocus: false,
    },
  },
});

export const links: Route.LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "/fonts/Inter/inter.css",
  },
  {
    rel: "stylesheet",
    href: "/fonts/productSans/productSans.css",
  },
  {
    rel: "stylesheet",
    href: "/fonts/zen/zen.css",
  },
  // Favicon и иконки сайта
  {
    rel: "icon",
    type: "image/svg+xml",
    href: "/images/logo.svg",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/images/logo.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/images/logo.png",
  },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/images/logo.png",
  },
  {
    rel: "apple-touch-icon",
    sizes: "152x152",
    href: "/images/logo.png",
  },
  {
    rel: "apple-touch-icon",
    sizes: "144x144",
    href: "/images/logo.png",
  },
  {
    rel: "apple-touch-icon",
    sizes: "120x120",
    href: "/images/logo.png",
  },
  {
    rel: "apple-touch-icon",
    sizes: "114x114",
    href: "/images/logo.png",
  },
  {
    rel: "apple-touch-icon",
    sizes: "76x76",
    href: "/images/logo.png",
  },
  {
    rel: "apple-touch-icon",
    sizes: "72x72",
    href: "/images/logo.png",
  },
  {
    rel: "apple-touch-icon",
    sizes: "60x60",
    href: "/images/logo.png",
  },
  {
    rel: "apple-touch-icon",
    sizes: "57x57",
    href: "/images/logo.png",
  },
  {
    rel: "shortcut icon",
    href: "/images/logo.svg",
  },
  // Дополнительные иконки для Android и других платформ
  {
    rel: "manifest",
    href: "/manifest.json",
  },
];

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Fan's Dream - Мечта фаната" },
    {
      name: "description",
      content:
        "Аутентичная игровая экипировка футболистов и памятные вещи. Живи мечтой!",
    },
    // Open Graph
    { property: "og:title", content: "Fan's Dream - Мечта фаната" },
    {
      property: "og:description",
      content:
        "Аутентичная игровая экипировка футболистов и памятные вещи. Живи мечтой!",
    },
    { property: "og:image", content: "/images/logo.png" },
    { property: "og:type", content: "website" },
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Fan's Dream - Мечта фаната" },
    {
      name: "twitter:description",
      content:
        "Аутентичная игровая экипировка футболистов и памятные вещи. Живи мечтой!",
    },
    { name: "twitter:image", content: "/images/logo.png" },
    // Дополнительные meta-теги
    { name: "theme-color", content: "#B91C1C" },
    { name: "msapplication-TileColor", content: "#B91C1C" },
    { name: "msapplication-TileImage", content: "/images/logo.png" },
  ];
};

export const loader = async ({ request }: { request: Request }) => {
  const locale = await getClientLocales(request);

  return {
    locale,
    ENV: {
      YANDEX_CLIENT_ID: process.env.YANDEX_CLIENT_ID,
      VK_CLIENT_ID: process.env.VK_CLIENT_ID,
    },
  } as const;
};

// Добавляем тип для данных лоадера
type LoaderData = Awaited<ReturnType<typeof loader>>;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <YandexMetrika counterId={102343901} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { locale, ENV } = useLoaderData<LoaderData>();

  return (
    <QueryClientProvider client={queryClient}>
      <EnvProvider env={ENV}>
        <LanguageProvider defaultLocale={locale}>
          <ThemeProvider>
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              autoHideDuration={4000}
              preventDuplicate
            >
              <Outlet />
              <CookieNotification />
            </SnackbarProvider>
          </ThemeProvider>
        </LanguageProvider>
      </EnvProvider>
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (
    process.env.NODE_ENV === "development" &&
    error &&
    error instanceof Error
  ) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
