import * as auth from "./auth";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/register" && request.method === "POST") {
        const { email } = await request.json();
        await auth.registerUser(env, email);
        return new Response("Verification email sent");
      }
      if (url.pathname === "/api/magic-login" && request.method === "POST") {
        const { email } = await request.json();
        await auth.magicLoginRequest(env, email);
        return new Response("Magic login email sent");
      }
      if (url.pathname === "/api/validate-token" && request.method === "POST") {
        const { token, type } = await request.json();
        const userId = await auth.validateToken(env, token, type);
        return new Response(JSON.stringify({ userId }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("Not Found", { status: 404 });
    } catch (e: any) {
      return new Response(e.message || "Error", { status: 400 });
    }
  },
};
