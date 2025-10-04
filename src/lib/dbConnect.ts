import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

export default async function dbConnection(): Promise<void> {
  if (connection.isConnected) {
    console.log("already connected to DB");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGO_DB_URI || "");
    connection.isConnected = db.connections[0].readyState;
    console.log("DB Connected Successfully");
  } catch (error: unknown) {
    console.log("Error while connection DB : ", error);
    process.exit(1);
  }
}
