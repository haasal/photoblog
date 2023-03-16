import { rewrite } from "@vercel/edge";

interface AuthorizationResponse {
  authorized: boolean;
  message: string;
}

export const config = {
  matcher: "/collection/:collection",
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const collection = url.pathname.split("/").pop();
  const password = url.searchParams.get("password") ?? "";

  const authorizationUrl = new URL(
    `${url.origin}/collection/${collection}/authorized.json`
  );
  authorizationUrl.searchParams.set("password", password);

  let resp = (await (
    await fetch(authorizationUrl.toString())
  ).json()) as AuthorizationResponse;

  if (resp.authorized) {
    return rewrite(url);
  }

  return new Response(resp.message, { status: 401 });
}
