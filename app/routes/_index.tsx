import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { getAdmin } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "TechPlan 관리자" },
    { name: "description", content: "제품 관리 시스템" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const admin = await getAdmin(request);
  return json({ admin });
}

export default function Index() {
  const { admin } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Hero Section */}
      <header style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "1rem 2rem",
      }}>
        <nav style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold" }}>TechPlan</h2>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {user ? (
              <>
                <span>{user.name || user.email}</span>
                <Form method="post" action="/logout">
                  <button
                    type="submit"
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "white",
                      border: "1px solid white",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    로그아웃
                  </button>
                </Form>
              </>
            ) : (
              <Link
                to="/login"
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "white",
                  color: "#667eea",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontWeight: "600"
                }}
              >
                로그인
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Content */}
      <section style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "4rem 2rem",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{
            fontSize: "3.5rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
            lineHeight: "1.2"
          }}>
            당신이 찾던 모든 것을<br />한 곳에서
          </h1>
          <p style={{
            fontSize: "1.3rem",
            marginBottom: "2rem",
            opacity: 0.95
          }}>
            최고의 상품을 합리적인 가격으로 만나보세요
          </p>
          <Link
            to="/products"
            style={{
              display: "inline-block",
              padding: "1rem 2.5rem",
              backgroundColor: "white",
              color: "#667eea",
              textDecoration: "none",
              borderRadius: "8px",
              fontSize: "1.2rem",
              fontWeight: "600",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            지금 쇼핑하기 →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: "4rem 2rem",
        backgroundColor: "#f8f9fa"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "2.5rem",
            marginBottom: "3rem",
            color: "#333"
          }}>
            왜 저희를 선택해야 할까요?
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem"
          }}>
            {[
              { icon: "🚚", title: "빠른 배송", desc: "당일 주문 시 다음날 배송" },
              { icon: "💳", title: "안전한 결제", desc: "모든 결제는 암호화되어 보호됩니다" },
              { icon: "🎁", title: "특별 혜택", desc: "회원 전용 할인과 이벤트" },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "white",
                  padding: "2rem",
                  borderRadius: "12px",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{feature.icon}</div>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "#333" }}>
                  {feature.title}
                </h3>
                <p style={{ color: "#666" }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "4rem 2rem",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
            지금 바로 시작하세요
          </h2>
          <p style={{ fontSize: "1.2rem", marginBottom: "2rem", opacity: 0.95 }}>
            수천 개의 상품이 당신을 기다리고 있습니다
          </p>
          <Link
            to="/products"
            style={{
              display: "inline-block",
              padding: "1rem 2.5rem",
              backgroundColor: "white",
              color: "#667eea",
              textDecoration: "none",
              borderRadius: "8px",
              fontSize: "1.2rem",
              fontWeight: "600",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
            }}
          >
            제품 둘러보기
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: "#2d3748",
        color: "white",
        padding: "2rem",
        textAlign: "center"
      }}>
        <p style={{ margin: 0, opacity: 0.8 }}>
          © 2024 TechPlan. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
