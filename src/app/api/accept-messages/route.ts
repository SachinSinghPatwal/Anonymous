import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnection from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/ApiResponse";
import { projectUpdate } from "next/dist/build/swc/generated-native";
import { normalize } from "path";
import normalizeError from "@/helpers/normalizeError";

export async function POST(request: NextRequest) {
  dbConnection();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;
  if (!session || !session.user) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "You must be logged in to accept messages",
      },
      { status: 401 }
    );
  }
  const userId = user._id;
  const { acceptMessages } = await request.json();
  try {
    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptMessages: acceptMessages },
      { new: true }
    );
    if (!updateUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Accept messages setting updated successfully",
        isAcceptingMessages: updateUser.isAcceptingMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Error while updating accept messages setting",
        error: normalizeError("Error updating accept messages setting", error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  dbConnection();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;
  if (!session || !session.user) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "You must be logged in to accept messages",
      },
      { status: 401 }
    );
  }
  try {
    const foundUser = await UserModel.findById(user._id);
    if (!foundUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "User accept messages setting fetched successfully",
        isAcceptingMessages: foundUser.isAcceptingMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Error while fetching user accept messages setting",
        error: normalizeError("Error fetching accept messages setting", error),
      },
      { status: 500 }
    );
  }
}
