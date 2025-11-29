import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { getAdmin } from "~/utils/session.server";
import { productService } from "~/services/product.server";
import { prisma } from "~/lib/prisma.server";

export const meta: MetaFunction = () => {
  return [
    { title: "대시보드 - TechPlan 관리자" },
    { name: "description", content: "관리자 대시보드" },
  ];
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#2d3748",
    color: "white",
    padding: "2rem 0",
    position: "fixed" as const,
    height: "100vh",
    display: "flex",
    flexDirection: "column" as const,
  },
  main: {
    marginLeft: "250px",
    flex: 1,
    padding: "2rem",
  },
  header: {
    backgroundColor: "white",
    padding: "1.5rem 2rem",
    borderRadius: "8px",
    marginBottom: "2rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  statCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  recentSection: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  navItem: {
    padding: "0.75rem 2rem",
    color: "white",
    textDecoration: "none",
    display: "block",
    transition: "background-color 0.2s",
  },
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  },
};

export async function loader({ request }: LoaderFunctionArgs) {
  const admin = await getAdmin(request);

  if (!admin) {
    return redirect("/login");
  }

  // 통계 데이터 가져오기
  const [totalProducts, totalAdmins, recentProducts] = await Promise.all([
    prisma.product.count(),
    prisma.admin.count(),
    productService.getAll(),
  ]);

  return json({
    admin,
    stats: {
      totalProducts,
      totalAdmins,
      totalImages: recentProducts.reduce((acc, p) => acc + p.images.length, 0),
    },
    recentProducts: recentProducts.slice(0, 5),
  });
}

export default function AdminDashboard() {
  const { admin, stats, recentProducts } = useLoaderData<typeof loader>();

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={{ padding: "0 2rem", marginBottom: "2rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold" }}>
            TechPlan
          </h2>
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem", opacity: 0.8 }}>
            관리자 패널
          </p>
        </div>

        <nav style={{ flex: 1, overflowY: "auto" }}>
          <Link
            to="/"
            style={{
              ...styles.navItem,
              backgroundColor: "#4a5568",
            }}
          >
            📊 대시보드
          </Link>
          <Link
            to="/products"
            style={styles.navItem}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4a5568"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            📦 제품 관리
          </Link>
          <Link
            to="/products/new"
            style={styles.navItem}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4a5568"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            ➕ 제품 추가
          </Link>
          <Form method="post" action="/logout">
            <button
              type="submit"
              style={{
                ...styles.navItem,
                marginTop: "2rem",
                paddingTop: "1.5rem",
                width: "100%",
                textAlign: "left",
                backgroundColor: "transparent",
                border: "none",
                borderTop: "1px solid #4a5568",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4a5568"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              🚪 로그아웃
            </button>
          </Form>
        </nav>

        <div style={{
          margin: "0 2rem 2rem 2rem",
          padding: "1rem",
          backgroundColor: "#1a202c",
          borderRadius: "6px",
        }}>
          <p style={{ margin: 0, fontSize: "0.75rem", opacity: 0.7 }}>로그인 계정</p>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", fontWeight: "600" }}>
            {admin.email}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.75rem", color: "#2d3748" }}>
              대시보드
            </h1>
            <p style={{ margin: "0.5rem 0 0 0", color: "#718096" }}>
              관리자 시스템 개요
            </p>
          </div>
          <Link to="/products/new" style={styles.button}>
            + 제품 추가
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#718096" }}>
                  총 제품 수
                </p>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "2rem", fontWeight: "bold", color: "#2d3748" }}>
                  {stats.totalProducts}
                </p>
              </div>
              <div style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#667eea",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.75rem",
              }}>
                📦
              </div>
            </div>
            <Link
              to="/products"
              style={{
                marginTop: "1rem",
                display: "inline-block",
                color: "#667eea",
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              제품 관리 →
            </Link>
          </div>

          <div style={styles.statCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#718096" }}>
                  관리자 수
                </p>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "2rem", fontWeight: "bold", color: "#2d3748" }}>
                  {stats.totalAdmins}
                </p>
              </div>
              <div style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#48bb78",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.75rem",
              }}>
                👥
              </div>
            </div>
            <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#a0aec0" }}>
              활성 관리자
            </p>
          </div>

          <div style={styles.statCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#718096" }}>
                  총 이미지 수
                </p>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "2rem", fontWeight: "bold", color: "#2d3748" }}>
                  {stats.totalImages}
                </p>
              </div>
              <div style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#ed8936",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.75rem",
              }}>
                🖼️
              </div>
            </div>
            <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#a0aec0" }}>
              Cloudinary 저장
            </p>
          </div>
        </div>

        {/* Recent Products */}
        <div style={styles.recentSection}>
          <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem", color: "#2d3748" }}>
            최근 등록된 제품
          </h2>

          {recentProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#a0aec0" }}>
              <p style={{ fontSize: "3rem", margin: "0 0 1rem 0" }}>📦</p>
              <p style={{ margin: 0 }}>등록된 제품이 없습니다.</p>
              <Link
                to="/products/new"
                style={{
                  ...styles.button,
                  marginTop: "1rem",
                }}
              >
                첫 제품 추가하기
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.875rem", color: "#718096", fontWeight: "600" }}>
                      제품명
                    </th>
                    <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.875rem", color: "#718096", fontWeight: "600" }}>
                      가격
                    </th>
                    <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.875rem", color: "#718096", fontWeight: "600" }}>
                      이미지
                    </th>
                    <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.875rem", color: "#718096", fontWeight: "600" }}>
                      등록일
                    </th>
                    <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.875rem", color: "#718096", fontWeight: "600" }}>
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map((product) => (
                    <tr key={product.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: "500", color: "#2d3748" }}>{product.name}</div>
                        <div style={{ fontSize: "0.875rem", color: "#718096", marginTop: "0.25rem" }}>
                          {product.description?.substring(0, 50)}...
                        </div>
                      </td>
                      <td style={{ padding: "1rem", color: "#2d3748", fontWeight: "600" }}>
                        ₩{product.price.toLocaleString()}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px" }}
                          />
                        ) : (
                          <div style={{
                            width: "50px",
                            height: "50px",
                            backgroundColor: "#e2e8f0",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            color: "#a0aec0",
                          }}>
                            없음
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#718096" }}>
                        {new Date(product.createdAt).toLocaleDateString("ko-KR")}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <Link
                          to={`/products/${product.id}`}
                          style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#f7fafc",
                            color: "#667eea",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            fontSize: "0.875rem",
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          보기
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {recentProducts.length > 0 && (
            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <Link
                to="/products"
                style={{
                  color: "#667eea",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                }}
              >
                모든 제품 보기 →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
