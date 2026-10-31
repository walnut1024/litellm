import { LocalizedText as L } from "@/contexts/LocaleContext";

import React from "react";
import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/shared/Alert";
import { buttonVariants } from "@/components/ui/button";
import { getLoginUrl } from "@/utils/returnUrlUtils";

export function OnboardingErrorView() {
  return (
    <div className="mx-auto w-full max-w-md mt-10">
      <Alert variant="error">
        <CircleAlert />
        <AlertTitle>
          <L>Failed to load invitation</L>
        </AlertTitle>
        <AlertDescription>
          <L>The invitation link may be invalid or expired.</L>
        </AlertDescription>
      </Alert>
      <div className="mt-4">
        <a href={getLoginUrl()} className={buttonVariants({ variant: "outline" })}>
          <L>Back to Login</L>
        </a>
      </div>
    </div>
  );
}
