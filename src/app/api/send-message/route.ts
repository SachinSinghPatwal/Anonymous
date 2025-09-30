import UserModel from "@/models/User";
import { Message } from "@/models/User";

import dbConnection from "@/lib/dbConnect";

import { NextRequest, NextResponse } from "next/server";
import NormalizeError from "@/helpers/normalizeError";

export async function POST(request: NextRequest) {
  dbConnection();
  const { username, content } = await request.json();
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    if (!user.isAcceptingMessages) {
      return NextResponse.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        { status: 403 }
      );
    }
    const newMessage = {
      content,
      createdAt: new Date(),
    };
    user.messages.push(newMessage as Message);
    await user.save();
    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error while sending message",
        error: NormalizeError("Error sending message", error),
      },
      { status: 500 }
    );
  }
}
