"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password: newPassword,
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message || "Invalid or expired code. Try again.");
      return;
    }

    setStatus("success");
    setTimeout(() => router.push("/sign-in"), 2000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-8">
        <h1 className="text-2xl font-semibold mb-2">Reset Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter the code we emailed you along with your new password.
        </p>

        {status === "success" ? (
          <p className="text-green-600">Password updated! Redirecting to sign in...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
            <input
              type="text"
              required
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full border rounded-md px-3 py-2 tracking-widest"
            />
            <input
              type="password"
              required
              minLength={8}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-pink-500 text-white rounded-md py-2"
            >
              {status === "loading" ? "Resetting..." : "Reset Password"}
            </button>
            {status === "error" && (
              <p className="text-red-500 text-sm">{errorMsg}</p>
            )}
          </form>
        )}

        <p className="text-sm text-center mt-4">
          <Link href="/forgot-password" className="text-pink-500">
            Didn't get a code? Send again
          </Link>
        </p>
      </div>
    </div>
  );
}