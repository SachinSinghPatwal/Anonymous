export default function NormalizeError(context: string, error: unknown): void {
  if (error instanceof Error) {
    console.log({ context, error });
  }
}
