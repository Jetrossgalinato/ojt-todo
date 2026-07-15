export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as { data?: unknown }).data === "object" &&
    (error as { data?: { message?: unknown } }).data?.message
  ) {
    return String((error as { data: { message: string } }).data.message)
  }

  return fallback
}
