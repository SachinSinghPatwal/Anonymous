import NormalizeError from "@/helpers/normalizeError";
import dbConnection from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { ApiResponse } from "@/types/ApiResponse";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  dbConnection();
  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });
    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      user.verifyCode = "";
      await user.save();
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          message: "User verified successfully",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Verification code has expired please sign up again",
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Invalid verification code",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Error while verify user's code",
        error: NormalizeError("Error verifying user code", error),
      },
      { status: 500 }
    );
  }
}
