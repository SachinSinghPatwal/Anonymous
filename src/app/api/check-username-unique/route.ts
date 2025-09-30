import dbConnection from "@/lib/dbConnect";
import UserModel from "@/models/User";
import z, { success } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/ApiResponse";
import NormalizeError from "@/helpers/normalizeError";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: NextRequest) {
  await dbConnection();
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };
    // validate with  zod
    const result = UsernameQuerySchema.safeParse(queryParam);
    console.log("result: ", result);
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }
    const { username } = result.data;
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingVerifiedUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "username is already taken",
        },
        { status: 400 }
      );
    }
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Error checking username",
        error: NormalizeError("Error checking user's name here :", error),
      },
      { status: 500 }
    );
  }
}
