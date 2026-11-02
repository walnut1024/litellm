import { LocalizedText as L } from "@/contexts/LocaleContext";

import { Badge } from "@/components/ui/badge";
import { DEFAULT_PROXY_ADMIN_USER_ID } from "@/utils/sentinels";

interface DefaultProxyAdminTagProps {
  userId: string | null | undefined;
}

export default function DefaultProxyAdminTag({ userId }: DefaultProxyAdminTagProps) {
  if (userId === DEFAULT_PROXY_ADMIN_USER_ID) {
    return (
      <Badge variant="secondary">
        <L>Default Proxy Admin</L>
      </Badge>
    );
  }

  return <span>{userId}</span>;
}
