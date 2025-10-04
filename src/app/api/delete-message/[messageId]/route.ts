import UserModel, { User } from "@/models/User";
import dbConnection from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import NormalizeError from "@/helpers/normalizeError";
import { ApiResponse } from "@/types/ApiResponse";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function DELETE(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  const messageId = params.messageId;
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
    const updateResult = await UserModel.updateOne(
      {
        _id: user._id,
      },
      {
        $pull: { messages: { _id: messageId } },
      }
    );
    if (updateResult.modifiedCount === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "message not found or already deleted",
        },
        { status: 404 }
      );
    }
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "message deleted",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Error while deleting messages",
        error: NormalizeError("Error while deleting messages", error),
      },
      { status: 500 }
    );
  }
}
