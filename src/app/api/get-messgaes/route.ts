import dbConnection from "@/lib/dbConnect";
import UserModel from "@/models/User";
import NormalizeError from "@/helpers/normalizeError";
import { NextResponse } from "next/server";
import { getServerSession, User } from "next-auth";
import { ApiResponse } from "@/types/ApiResponse";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";

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
  const userId = new mongoose.Types.ObjectId(user._id);
  try {
    const user = await UserModel.aggregate([
      {
        $match: { _id: userId },
      },
      {
        $unwind: "$messages",
      },
      {
        $sort: { "messages.createdAt": -1 },
      },
      {
        $group: {
          _id: "$_id",
          isAcceptingMessages: { $push: "$messages" },
        },
      },
    ]);
    if (!user || user.length === 0) {
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
        messages: user[0].messages,
        isAcceptingMessages: user[0].isAcceptingMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Error while fetching user accept messages setting",
        error: NormalizeError("Error fetching accept messages setting", error),
      },
      { status: 500 }
    );
  }
}
