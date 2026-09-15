"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "forget-password",
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message || "Something went wrong. Try again.");
      return;
    }

    // Send them to the reset page, carrying the email along
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-8">
        <h1 className="text-2xl font-semibold mb-2">Forgot Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email and we&apos;ll send you a 6-digit code to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-pink-500 text-white rounded-md py-2"
          >
            {status === "loading" ? "Sending..." : "Send Code"}
          </button>
          {status === "error" && (
            <p className="text-red-500 text-sm">{errorMsg}</p>
          )}
        </form>

        <p className="text-sm text-center mt-4">
          <Link href="/sign-in" className="text-pink-500">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}