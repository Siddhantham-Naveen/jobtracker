import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { emailOTP } from "better-auth/plugins";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { initializeUserBoard } from "../init-user-board";
import connectDB from "../db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const mongooseInstance = await connectDB();
const client = mongooseInstance.connection.getClient();
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300, // OTP valid for 5 minutes
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "forget-password") {
          await resend.emails.send({
            from: "Job Tracker <onboarding@resend.dev>",
            to: email,
            subject: "Your Job Tracker password reset code",
            html: `
              <p>Hi,</p>
              <p>Your password reset code is:</p>
              <h2 style="letter-spacing: 4px;">${otp}</h2>
              <p>This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
            `,
          });
        }
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.id) {
            await initializeUserBoard(user.id);
          }
        },
      },
    },
  },
});

export async function getSession() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  return result;
}

export async function signOut() {
  const result = await auth.api.signOut({
    headers: await headers(),
  });

  if (result.success) {
    redirect("/sign-in");
  }
}