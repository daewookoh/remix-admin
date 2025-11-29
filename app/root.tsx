import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

export const links: LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  console.error("=== ROOT ERROR BOUNDARY ===");
  console.error("Error:", error);

  if (isRouteErrorResponse(error)) {
    return (
      <html lang="ko">
        <head>
          <title>{error.status} {error.statusText}</title>
          <Meta />
          <Links />
        </head>
        <body style={{ padding: "2rem", fontFamily: "monospace" }}>
          <div style={{
            backgroundColor: "#fee",
            border: "2px solid #f00",
            padding: "2rem",
            borderRadius: "8px",
            maxWidth: "800px",
            margin: "0 auto"
          }}>
            <h1 style={{ color: "#c00", marginTop: 0 }}>
              {error.status} {error.statusText}
            </h1>
            <pre style={{
              backgroundColor: "#fff",
              padding: "1rem",
              overflow: "auto",
              borderRadius: "4px"
            }}>
              {JSON.stringify(error.data, null, 2)}
            </pre>
            <p style={{ marginBottom: 0 }}>
              <a href="/products" style={{ color: "#667eea" }}>← 제품 목록으로 돌아가기</a>
            </p>
          </div>
          <Scripts />
        </body>
      </html>
    );
  }

  let errorMessage = "Unknown error";
  if (error instanceof Error) {
    errorMessage = error.message;
    console.error("Error stack:", error.stack);
  }

  return (
    <html lang="ko">
      <head>
        <title>에러 발생</title>
        <Meta />
        <Links />
      </head>
      <body style={{ padding: "2rem", fontFamily: "monospace" }}>
        <div style={{
          backgroundColor: "#fee",
          border: "2px solid #f00",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "800px",
          margin: "0 auto"
        }}>
          <h1 style={{ color: "#c00", marginTop: 0 }}>애플리케이션 에러</h1>
          <pre style={{
            backgroundColor: "#fff",
            padding: "1rem",
            overflow: "auto",
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}>
            {errorMessage}
            {error instanceof Error && error.stack && (
              <>
                {"\n\n"}
                {error.stack}
              </>
            )}
          </pre>
          <p style={{ marginBottom: 0 }}>
            <a href="/products" style={{ color: "#667eea" }}>← 제품 목록으로 돌아가기</a>
          </p>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
