import { LocalizedText as L } from "@/contexts/LocaleContext";

import React, { useState } from "react";
import { useLiteUi } from "@/contexts/LiteUiContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/lib/toast";
import { serviceHealthCheck, setCallbacksCall } from "./networking";
import { EmailEventSettings } from "./email_events";

interface EmailSettingsProps {
  accessToken: string | null;
  premiumUser: boolean;
  alerts: any[];
}

const REQUIRED_MARKER = (
  <span className="text-destructive">
    <L> Required * </L>
  </span>
);

const FIELD_HELP: Record<string, React.ReactNode> = {
  SMTP_HOST: (
    <>
      <L>Enter the SMTP host address, e.g. `smtp.resend.com`</L>
      {REQUIRED_MARKER}
    </>
  ),
  SMTP_PORT: (
    <>
      <L>Enter the SMTP port number, e.g. `587`</L>
      {REQUIRED_MARKER}
    </>
  ),
  SMTP_USERNAME: (
    <>
      <L>Enter the SMTP username, e.g. `username`</L>
      {REQUIRED_MARKER}
    </>
  ),
  SMTP_PASSWORD: REQUIRED_MARKER,
  SMTP_SENDER_EMAIL: (
    <>
      <L>Enter the sender email address, e.g. `sender@berri.ai`</L>
      {REQUIRED_MARKER}
    </>
  ),
  TEST_EMAIL_ADDRESS: (
    <>
      <L>Email Address to send `Test Email Alert` to. example: `info@berri.ai`</L>
      {REQUIRED_MARKER}
    </>
  ),
  EMAIL_LOGO_URL: <>(Optional) Customize the Logo that appears in the email, pass a url to your logo</>,
  EMAIL_SUPPORT_CONTACT: (
    <>(Optional) Customize the support email address that appears in the email. Default is support@berri.ai</>
  ),
};

const PREMIUM_ONLY_FIELDS = ["EMAIL_LOGO_URL", "EMAIL_SUPPORT_CONTACT"];

const SENSITIVE_FIELD_PATTERN = /(PASSWORD|SECRET|KEY|TOKEN)/i;

const EmailSettings: React.FC<EmailSettingsProps> = ({ accessToken, premiumUser, alerts }) => {
  const lite = useLiteUi();
  const fieldIdPrefix = React.useId();
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});

  const toggleFieldVisibility = (key: string) => {
    setVisibleFields((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveEmailSettings = async () => {
    if (!accessToken) {
      return;
    }

    let updatedVariables: Record<string, string> = {};

    alerts
      .filter((alert) => alert.name === "email")
      .forEach((alert) => {
        Object.entries(alert.variables ?? {}).forEach(([key, value]) => {
          const inputElement = document.querySelector(`input[name="${key}"]`) as HTMLInputElement;
          if (!inputElement || !inputElement.value) {
            return;
          }
          // Only send fields the admin actually edited. Values rendered from the
          // server are masked (SMTP_PASSWORD) or sourced from the process
          // environment, so re-submitting an untouched field would persist a mask
          // or copy env-managed config into the database.
          if (inputElement.value === (value == null ? "" : String(value))) {
            return;
          }
          updatedVariables[key] = inputElement.value;
        });
      });

    //filter out null / undefined values for updatedVariables

    const payload = {
      general_settings: {
        alerting: ["email"],
      },
      environment_variables: updatedVariables,
    };
    try {
      await setCallbacksCall(accessToken, payload);
      toast.success("Email settings updated successfully");
    } catch (error) {
      toast.fromError(error);
    }
  };

  return (
    <>
      <div className="mt-6 mb-6">
        <EmailEventSettings accessToken={accessToken} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <L>Email Server Settings</L>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {alerts
            .filter((alert) => alert.name === "email")
            .map((alert, index) => (
              <div key={index} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.entries(alert.variables ?? {}).map(([key, value]) => {
                  if (lite && PREMIUM_ONLY_FIELDS.includes(key)) return null;
                  const isLocked = !premiumUser && PREMIUM_ONLY_FIELDS.includes(key);
                  const isSensitive = SENSITIVE_FIELD_PATTERN.test(key);
                  const isVisible = visibleFields[key] || false;
                  return (
                    <div key={key} className="space-y-1">
                      {isLocked ? (
                        <a
                          href="https://forms.gle/W3U4PZpJGFHWtHyA9"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary underline underline-offset-4"
                        >
                          ✨ {key}
                        </a>
                      ) : (
                        <label htmlFor={`${fieldIdPrefix}-${key}`} className="block text-sm">
                          <L>{key}</L>
                        </label>
                      )}
                      <InputGroup className="max-w-100">
                        <InputGroupInput
                          id={`${fieldIdPrefix}-${key}`}
                          name={key}
                          defaultValue={value as string}
                          type={isSensitive && !isVisible ? "password" : "text"}
                          disabled={isLocked}
                        />
                        {isSensitive && (
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              size="icon-xs"
                              onClick={() => toggleFieldVisibility(key)}
                              aria-label={isVisible ? "Hide credential" : "Show credential"}
                            >
                              {isVisible ? <EyeOff /> : <Eye />}
                            </InputGroupButton>
                          </InputGroupAddon>
                        )}
                      </InputGroup>
                      <div className="text-xs text-muted-foreground italic">{FIELD_HELP[key]}</div>
                    </div>
                  );
                })}
              </div>
            ))}

          <div className="mt-6 flex gap-2">
            <Button onClick={() => handleSaveEmailSettings()}>
              <L>Save Changes</L>
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                if (!accessToken) return;
                try {
                  await serviceHealthCheck(accessToken, "email");
                  toast.success("Email test triggered. Check your configured email inbox/logs.");
                } catch (error) {
                  toast.fromError(error);
                }
              }}
            >
              <L>Test Email Alerts</L>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default EmailSettings;
