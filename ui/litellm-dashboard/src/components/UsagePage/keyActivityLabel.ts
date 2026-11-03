import { systemResourceLabel } from "@/utils/systemResourceLabel";
import type { KeyMetadata } from "./types";

export function keyActivityLabel(
  metadata: Pick<KeyMetadata, "key_alias" | "user_email"> | null | undefined,
  fallback = "-",
): string {
  return systemResourceLabel(metadata?.key_alias || metadata?.user_email || fallback);
}
