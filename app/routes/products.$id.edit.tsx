import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { productService } from "~/services/product.server";
import { requireAdmin } from "~/utils/session.server";
import { v2 as cloudinary } from "cloudinary";
import { writeAsyncIterableToWritable } from "@remix-run/node";
import { PassThrough } from "stream";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${data?.product.name} 수정` || "제품 수정" }];
};

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
  },
  form: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "1rem",
    boxSizing: "border-box" as const,
  },
  textarea: {
    width: "100%",
    padding: "0.75rem",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "1rem",
    minHeight: "120px",
    boxSizing: "border-box" as const,
  },
  button: {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
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

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

  if (!params.id) {
    throw new Response("Not Found", { status: 404 });
  }

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

      // Check if file was actually uploaded
      const stream = new PassThrough();
      writeAsyncIterableToWritable(data, stream);
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      if (chunks.length === 0 || (chunks.length === 1 && chunks[0].length === 0)) {
        return "";
      }

      // Re-create the data for upload
      async function* regenerateData() {
        for (const chunk of chunks) {
          yield chunk;
        }
      }

      const uploadedImage = await uploadImageToCloudinary(regenerateData());
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

    await productService.update(params.id, {
      name,
      description: description || null,
      price: parseFloat(price),
    });

    // 새 이미지가 있으면 추가
    if (imageData && imageData !== "") {
      try {
        const { url, publicId } = JSON.parse(imageData);
        await productService.addImage(params.id, url, publicId);
      } catch (e) {
        console.error("Image upload error:", e);
      }
    }

    return redirect(`/products/${params.id}`);
  } catch (error) {
    console.error("Product update error:", error);
    if (error instanceof Error) {
      return json({ error: error.message }, { status: 400 });
    }
    return json({ error: "제품 수정에 실패했습니다." }, { status: 400 });
  }
}

export default function EditProduct() {
  const { product, admin } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div style={styles.container}>
      <div style={{ marginBottom: "2rem" }}>
        <Link to={`/products/${product.id}`} style={{ color: "#667eea", textDecoration: "none" }}>
          ← 제품 상세로
        </Link>
      </div>

      <h1>제품 수정</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        관리자: {admin.email}
      </p>

      <div style={styles.form}>
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
              defaultValue={product.name}
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
              defaultValue={product.description || ""}
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
              defaultValue={product.price}
              style={styles.input}
            />
          </div>

          {product.images.length > 0 && (
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                현재 이미지
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {product.images.map((image) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt={product.name}
                    style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "4px" }}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="image" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              새 이미지 추가
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
              {isSubmitting ? "수정 중..." : "수정 완료"}
            </button>
            <Link
              to={`/products/${product.id}`}
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
    </div>
  );
}
