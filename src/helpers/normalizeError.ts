export default function NormalizeError(
  context: string,
  error: unknown
): { message: string } {
  console.log(context, error);
  if (error instanceof Error) {
    return { message: error.message };
  }
  if (typeof error === "string") {
    return { message: error };
  }
  return { message: "Unknown error something went wrong" };
}
