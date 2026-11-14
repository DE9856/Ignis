import { IgnisError } from "@/lib/core/errors";

/** Throws if development-only code is reached in a production build. */
export function assertDevOnly(what: string): void {
  if (process.env.NODE_ENV === "production") {
    throw new IgnisError("DEV_ONLY", { detail: `${what} must not run in production` });
  }
}
