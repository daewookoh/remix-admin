import { redirect } from "@remix-run/node";
import { authenticator, sessionStorage, type Admin } from "~/services/auth.server";

export const { getSession, commitSession, destroySession } = sessionStorage;

export async function getAdmin(request: Request): Promise<Admin | null> {
  return await authenticator.isAuthenticated(request);
}

export async function requireAdmin(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const admin = await getAdmin(request);
  if (!admin) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return admin;
}

export async function logout(request: Request) {
  return await authenticator.logout(request, { redirectTo: "/login" });
}
