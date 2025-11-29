import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { productService } from "~/services/product.server";
import { requireAdmin } from "~/utils/session.server";
import { cloudinary } from "~/lib/cloudinary.server";
import { writeAsyncIterableToWritable } from "@remix-run/node";
import { PassThrough } from "stream";

export const meta: MetaFunction = () => {
  return [{ title: "제품 추가" }];
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
  },
  contentSection: {
    backgroundColor: "white",
    padding: "2rem",
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
  input: {
    width: "100%",
    padding: "0.75rem",
    border: "2px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "0.9rem",
    boxSizing: "border-box" as const,
  },
  textarea: {
    width: "100%",
    padding: "0.75rem",
    border: "2px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "0.9rem",
    minHeight: "120px",
    boxSizing: "border-box" as const,
  },
  button: {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    textAlign: "center" as const,
  },
  errorBox: {
    padding: "1rem",
    backgroundColor: "#fed7d7",
    color: "#742a2a",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    border: "1px solid #fc8181",
  },
};

async function uploadImageToCloudinary(data: AsyncIterable<Uint8Array>) {
  const uploadPromise = new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "products",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (result) {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      }
    );
    writeAsyncIterableToWritable(data, uploadStream).catch(reject);
  });

  return uploadPromise;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const admin = await requireAdmin(request);
  return json({ admin });
}

export async function action({ request }: ActionFunctionArgs) {
  const admin = await requireAdmin(request);

  try {
    const uploadHandler = async ({ name, data }: { name: string; data: AsyncIterable<Uint8Array> }) => {
      if (name !== "image") {
        const stream = new PassThrough();
        writeAsyncIterableToWritable(data, stream);
        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        return Buffer.concat(chunks).toString("utf-8");
      }

      const uploadedImage = await uploadImageToCloudinary(data);
      return JSON.stringify(uploadedImage);
    };

    const formData = await unstable_parseMultipartFormData(request, uploadHandler);

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const imageData = formData.get("image") as string;

    if (!name || !price) {
      return json({ error: "제품명과 가격은 필수입니다." }, { status: 400 });
    }

    const product = await productService.create({
      name,
      description: description || null,
      price: parseFloat(price),
      adminId: admin.id,
    });

    // 이미지가 있으면 추가
    if (imageData && imageData !== "") {
      try {
        const { url, publicId } = JSON.parse(imageData);
        await productService.addImage(product.id, url, publicId);
      } catch (e) {
        // 이미지 업로드 실패는 무시 (제품은 이미 생성됨)
        console.error("Image upload error:", e);
      }
    }

    return redirect("/products");
  } catch (error) {
    console.error("Product creation error:", error);
    if (error instanceof Error) {
      return json({ error: error.message }, { status: 400 });
    }
    return json({ error: "제품 생성에 실패했습니다." }, { status: 400 });
  }
}

export default function NewProduct() {
  const { admin } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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
            style={styles.navItem}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4a5568"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            📦 제품 관리
          </Link>
          <Link
            to="/products/new"
            style={{
              ...styles.navItem,
              backgroundColor: "#4a5568",
            }}
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
          <Link
            to="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#667eea",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: "600",
              marginBottom: "1rem",
            }}
          >
            ← 제품 목록으로
          </Link>
          <h1 style={{ margin: 0, fontSize: "1.75rem", color: "#2d3748" }}>
            새 제품 추가
          </h1>
        </div>

        {/* Form Content */}
        <div style={styles.contentSection}>
        {actionData?.error && (
          <div style={styles.errorBox}>
            {actionData.error}
          </div>
        )}

        <Form method="post" encType="multipart/form-data" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label htmlFor="name" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              제품명 *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              style={styles.input}
            />
          </div>

          <div>
            <label htmlFor="description" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              설명
            </label>
            <textarea
              id="description"
              name="description"
              style={styles.textarea}
            />
          </div>

          <div>
            <label htmlFor="price" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              가격 (₩) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min="0"
              step="1"
              style={styles.input}
            />
          </div>

          <div>
            <label htmlFor="image" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              제품 이미지
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              style={styles.input}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.button,
                backgroundColor: isSubmitting ? "#999" : "#667eea",
                color: "white",
                flex: 1,
              }}
            >
              {isSubmitting ? "생성 중..." : "제품 생성"}
            </button>
            <Link
              to="/products"
              style={{
                ...styles.button,
                backgroundColor: "#6c757d",
                color: "white",
                flex: 1,
                textAlign: "center",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              취소
            </Link>
          </div>
        </Form>
        </div>
      </main>
    </div>
  );
}
