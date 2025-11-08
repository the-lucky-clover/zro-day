import React, { useState } from "react";

export default function LoginMagicLink() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Sending magic link...");
    try {
      const res = await fetch("/api/magic-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage("Magic login link sent! Check your email.");
    } catch (err: any) {
      setMessage("Failed to send magic link: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ width: 300, padding: "8px", margin: "8px 0" }}
      />
      <button type="submit">Send Magic Link</button>
      <p>{message}</p>
    </form>
  );
}
