import dbConnection from "@/lib/dbConnect";
import { ApiResponse } from "@/types/ApiResponse";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import NormalizeError from "@/helpers/normalizeError";
import UserModel from "@/models/User";

export async function POST(request: NextRequest) {
  await dbConnection();
  try {
    const { username, email, password } = await request.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByUsername) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }
    const existingUserVerifiedByEmail = await UserModel.findOne({ email });
    // verify code 6 character
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserVerifiedByEmail) {
      if (existingUserVerifiedByEmail.isVerified) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            message: "User already exist with this email",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcryptjs.hash(password, 10);
        existingUserVerifiedByEmail.password = hashedPassword;
        existingUserVerifiedByEmail.verifyCode = verifyCode;
        existingUserVerifiedByEmail.verifyCodeExpiry = new Date(
          Date.now() + 3600000
        );
        await existingUserVerifiedByEmail.save();
      }
    } else {
      const hashedPassword = await bcryptjs.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        username,
        email,
        verifyCode,
        password: hashedPassword,
        verifyCodeExpiry: expiryDate,
        messages: [],
      });
      await newUser.save();
    }
    // send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: emailResponse.message,
      });
    }
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "User registered Successfully . Please verify your email",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Error registering user",
        error: NormalizeError("Error registering user", error),
      },
      { status: 500 }
    );
  }
}
