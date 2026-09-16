"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  // Two steps on one page: "request" (enter email) and "verify" (enter code + new password)
  const [step, setStep] = useState<"request" | "verify">(
    emailFromUrl ? "verify" : "request"
  );

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      });

      if (error) {
        setStatus("error");
        setErrorMsg(error.message || "Something went wrong. Try again.");
        return;
      }

      setStatus("idle");
      // Move to step 2 on the SAME page instead of navigating away
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      setStep("verify");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Network error. Check your connection and try again.");
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const { error } = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password,
      });

      if (error) {
        setStatus("error");
        setErrorMsg(error.message || "Invalid or expired code. Try again.");
        return;
      }

      // Success — send them to sign in with the new password
      router.push("/sign-in");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Network error. Check your connection and try again.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-8">
        {step === "request" ? (
          <>
            <h1 className="text-2xl font-semibold mb-2">Forgot Password</h1>
            <p className="text-sm text-gray-500 mb-6">
              Enter your email and we&apos;ll send you a 6-digit code to reset your password.
            </p>

            <form onSubmit={handleSendCode} className="space-y-4">
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
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold mb-2">Enter Code</h1>
            <p className="text-sm text-gray-500 mb-6">
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below along with your new password.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="text"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border rounded-md px-3 py-2 tracking-widest"
              />
              <input
                type="password"
                required
                minLength={8}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <button
              onClick={() => setStep("request")}
              className="text-sm text-gray-500 mt-4 underline"
            >
              Didn&apos;t get a code? Send again
            </button>
          </>
        )}

        <p className="text-sm text-center mt-4">
          <Link href="/sign-in" className="text-pink-500">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}