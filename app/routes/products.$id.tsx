import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { productService } from "~/services/product.server";
import { requireAdmin } from "~/utils/session.server";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.product.name || "제품 상세" }];
};

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  link: {
    color: "#667eea",
    textDecoration: "none",
    marginBottom: "1rem",
    display: "inline-block" as const,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
    marginTop: "1rem",
  },
  imagePlaceholder: {
    width: "100%",
    height: "400px",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    textAlign: "center" as const,
  },
  editButton: {
    backgroundColor: "#667eea",
    color: "white",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    color: "white",
  },
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const admin = await requireAdmin(request);

  if (!params.id) {
    throw new Response("Not Found", { status: 404 });
  }

  const product = await productService.getById(params.id);

  if (!product) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ product, admin });
}

export async function action({ params, request }: ActionFunctionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete" && params.id) {
    const product = await productService.getById(params.id);

    if (product) {
      // Delete images from Cloudinary
      for (const image of product.images) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
        }
      }

      // Delete product from database
      await productService.delete(params.id);
    }

    return redirect("/products");
  }

  return json({ success: false }, { status: 400 });
}

export default function ProductDetail() {
  const { product, admin } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isDeleting = navigation.state === "submitting";

  return (
    <div style={styles.container}>
      <div style={{ marginBottom: "2rem" }}>
        <Link to="/products" style={styles.link}>
          ← 제품 목록으로
        </Link>
        <p style={{ color: "#666", marginTop: "0.5rem" }}>
          관리자: {admin.email}
        </p>
      </div>

      <div style={styles.grid}>
        <div>
          {product.images[0] ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              style={{ width: "100%", borderRadius: "8px" }}
            />
          ) : (
            <div style={styles.imagePlaceholder}>
              이미지 없음
            </div>
          )}

          {product.images.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              {product.images.slice(1).map((image) => (
                <img
                  key={image.id}
                  src={image.url}
                  alt={product.name}
                  style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "4px" }}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h1>{product.name}</h1>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea", marginTop: "1rem" }}>
            ₩{product.price.toLocaleString()}
          </p>
          <p style={{ marginTop: "1rem", lineHeight: "1.6", color: "#333" }}>
            {product.description || "설명 없음"}
          </p>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <Link
              to={`/products/${product.id}/edit`}
              style={{
                ...styles.button,
                ...styles.editButton,
              }}
            >
              수정
            </Link>
            <Form method="post" style={{ flex: 1 }}>
              <input type="hidden" name="intent" value="delete" />
              <button
                type="submit"
                disabled={isDeleting}
                style={{
                  ...styles.button,
                  ...styles.deleteButton,
                  width: "100%",
                  opacity: isDeleting ? 0.6 : 1,
                }}
                onClick={(e) => {
                  if (!confirm("정말 이 제품을 삭제하시겠습니까?")) {
                    e.preventDefault();
                  }
                }}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </Form>
          </div>

          <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
            <p style={{ fontSize: "0.875rem", color: "#666", margin: 0 }}>
              등록일: {new Date(product.createdAt).toLocaleDateString("ko-KR")}
            </p>
            <p style={{ fontSize: "0.875rem", color: "#666", margin: "0.5rem 0 0 0" }}>
              등록자: {product.admin.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
