import { nanoid } from "nanoid";
import { sendEmailViaSMTP } from "./workerMailerClient";

export async function registerUser(env: Env, email: string) {
  const user = await env.DB
    .prepare(`SELECT id, is_verified FROM users WHERE email = ?`)
    .bind(email)
    .first();

  let userId: number;
  if (!user) {
    const result = await env.DB
      .prepare(`INSERT INTO users (email) VALUES (?)`)
      .bind(email)
      .run();
    userId = result.lastInsertRowid as number;
  } else {
    userId = user.id;
    if (user.is_verified) return;
  }

  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await env.DB
    .prepare(
      `INSERT INTO auth_tokens (user_id, token, type, expires_at) VALUES (?, ?, 'verification', ?)`,
    )
    .bind(userId, token, expiresAt)
    .run();

  const verifyUrl = `https://yourfrontend.com/verify?token=${token}`;

  await sendEmailViaSMTP(
    env,
    email,
    "Verify your email address",
    `Please <a href="${verifyUrl}">verify your email</a>. Link valid for 24 hours.`,
  );
}

export async function magicLoginRequest(env: Env, email: string) {
  const user = await env.DB
    .prepare(`SELECT id FROM users WHERE email = ? AND is_verified = 1`)
    .bind(email)
    .first();
  if (!user) throw new Error("User not found or email not verified");

  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await env.DB
    .prepare(
      `INSERT INTO auth_tokens (user_id, token, type, expires_at) VALUES (?, ?, 'magic_link', ?)`,
    )
    .bind(user.id, token, expiresAt)
    .run();

  const magicLinkUrl = `https://yourfrontend.com/magic-login?token=${token}`;

  await sendEmailViaSMTP(
    env,
    email,
    "Your magic login link",
    `Click <a href="${magicLinkUrl}">here</a> to login. Link valid for 15 minutes.`,
  );
}

export async function validateToken(env: Env, token: string, type: string) {
  const now = new Date().toISOString();
  const tokenRow = await env.DB
    .prepare(
      `SELECT id, user_id, consumed FROM auth_tokens WHERE token = ? AND type = ? AND expires_at > ?`,
    )
    .bind(token, type, now)
    .first();

  if (!tokenRow) throw new Error("Invalid or expired token");
  if (tokenRow.consumed) throw new Error("Token already used");

  await env.DB
    .prepare(`UPDATE auth_tokens SET consumed = 1 WHERE id = ?`)
    .bind(tokenRow.id)
    .run();

  return tokenRow.user_id;
}
