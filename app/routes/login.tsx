import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation, useSearchParams } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "관리자 로그인" }];
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "2rem",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "border-color 0.2s",
    boxSizing: "border-box" as const,
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  errorBox: {
    padding: "1rem",
    backgroundColor: "#fee",
    color: "#c00",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    border: "1px solid #fcc",
  },
};

export async function action({ request }: ActionFunctionArgs) {
  // Clone request to read formData without consuming it
  const clonedRequest = request.clone();
  const formData = await clonedRequest.formData();
  const redirectTo = (formData.get("redirectTo") as string) || "/products";

  console.log('[Admin Login] Redirect to:', redirectTo);

  try {
    return await authenticator.authenticate("admin-pass", request, {
      successRedirect: redirectTo,
      failureRedirect: "/login",
      throwOnError: true,
    });
  } catch (error) {
    console.log('[Admin Login] Error:', error);

    // If it's a Response (redirect), return it
    if (error instanceof Response) {
      return error;
    }

    if (error instanceof Error) {
      return json({ error: error.message }, { status: 400 });
    }
    return json({ error: "로그인에 실패했습니다." }, { status: 400 });
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/products";
  const isSubmitting = navigation.state === "submitting";

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#333", marginBottom: "0.5rem" }}>
            관리자 로그인
          </h1>
          <p style={{ color: "#666" }}>관리자 계정에 로그인하세요</p>
        </div>

        {actionData?.error && (
          <div style={styles.errorBox}>
            {actionData.error}
          </div>
        )}

        <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div>
            <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              placeholder="admin@example.com"
              defaultValue="a@a.com"
              style={styles.input}
              onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              defaultValue="test123"
              style={styles.input}
              onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.button,
              backgroundColor: isSubmitting ? "#999" : "#667eea",
              color: "white",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              marginTop: "0.5rem",
            }}
            onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#5568d3")}
            onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#667eea")}
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </Form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link
            to="/products"
            style={{
              color: "#667eea",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: "500"
            }}
          >
            제품 관리로 돌아가기
          </Link>
        </div>

        <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.875rem", color: "#666" }}>
          <p>테스트 계정: a@a.com / test123</p>
        </div>
      </div>
    </div>
  );
}
