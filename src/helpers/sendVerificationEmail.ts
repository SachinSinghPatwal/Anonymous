import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";
import NormalizeError from "./normalizeError";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Anonymous | Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    return {
      success: true,
      message: "Verification email send Successfully",
    };
  } catch (emailError: unknown) {
    return {
      success: false,
      message: "Failed to send Verification Email",
      error: NormalizeError(
        "Error while sending verification email",
        emailError
      ),
    };
  }
}
