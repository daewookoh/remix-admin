import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { productService } from "~/services/product.server";
import { requireAdmin } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return [{ title: "제품 관리 - TechPlan 관리자" }];
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
  tableSection: {
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
  badge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
};

export async function loader({ request }: LoaderFunctionArgs) {
  const admin = await requireAdmin(request);
  const products = await productService.getAll();
  return json({ products, admin });
}

export default function ProductsIndex() {
  const { products, admin } = useLoaderData<typeof loader>();

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
            style={styles.navItem}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4a5568"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            📊 대시보드
          </Link>
          <Link
            to="/products"
            style={{
              ...styles.navItem,
              backgroundColor: "#4a5568",
            }}
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
              제품 관리
            </h1>
            <p style={{ margin: "0.5rem 0 0 0", color: "#718096" }}>
              총 {products.length}개의 제품
            </p>
          </div>
          <Link to="/products/new" style={styles.button}>
            + 제품 추가
          </Link>
        </div>

        {/* Products Table */}
        <div style={styles.tableSection}>
          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "#a0aec0" }}>
              <p style={{ fontSize: "4rem", margin: "0 0 1rem 0" }}>📦</p>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: "#2d3748" }}>
                등록된 제품이 없습니다
              </h3>
              <p style={{ margin: "0 0 2rem 0" }}>
                첫 번째 제품을 추가하여 시작하세요
              </p>
              <Link to="/products/new" style={styles.button}>
                제품 추가하기
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", backgroundColor: "#f7fafc" }}>
                    <th style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      color: "#718096",
                      fontWeight: "700",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.05em",
                    }}>
                      제품 정보
                    </th>
                    <th style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      color: "#718096",
                      fontWeight: "700",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.05em",
                    }}>
                      가격
                    </th>
                    <th style={{
                      padding: "1rem",
                      textAlign: "center",
                      fontSize: "0.75rem",
                      color: "#718096",
                      fontWeight: "700",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.05em",
                    }}>
                      이미지
                    </th>
                    <th style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      color: "#718096",
                      fontWeight: "700",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.05em",
                    }}>
                      등록 정보
                    </th>
                    <th style={{
                      padding: "1rem",
                      textAlign: "center",
                      fontSize: "0.75rem",
                      color: "#718096",
                      fontWeight: "700",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.05em",
                    }}>
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          {product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              style={{
                                width: "64px",
                                height: "64px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                              }}
                            />
                          ) : (
                            <div style={{
                              width: "64px",
                              height: "64px",
                              backgroundColor: "#e2e8f0",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.5rem",
                            }}>
                              📦
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: "600", color: "#2d3748", marginBottom: "0.25rem" }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: "0.875rem", color: "#718096" }}>
                              {product.description ?
                                (product.description.length > 60
                                  ? `${product.description.substring(0, 60)}...`
                                  : product.description)
                                : "설명 없음"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: "700", color: "#2d3748", fontSize: "1.125rem" }}>
                          ₩{product.price.toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: product.images.length > 0 ? "#c6f6d5" : "#fed7d7",
                          color: product.images.length > 0 ? "#22543d" : "#742a2a",
                        }}>
                          {product.images.length}개
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontSize: "0.875rem", color: "#718096" }}>
                          <div style={{ marginBottom: "0.25rem" }}>
                            {new Date(product.createdAt).toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#a0aec0" }}>
                            {product.admin.email}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        <Link
                          to={`/products/${product.id}/edit`}
                          style={{
                            padding: "0.5rem 1.5rem",
                            backgroundColor: "#667eea",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "0.875rem",
                            textDecoration: "none",
                            fontWeight: "600",
                            transition: "all 0.2s",
                            cursor: "pointer",
                            display: "inline-block",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#5568d3";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#667eea";
                          }}
                        >
                          수정
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
