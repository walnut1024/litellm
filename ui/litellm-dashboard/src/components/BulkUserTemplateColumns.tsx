import { useTranslation } from "@/contexts/LocaleContext";

export default function BulkUserTemplateColumns() {
  const t = useTranslation();
  return (
    <div className="bg-muted p-4 rounded-md border border-border mb-4">
      <h4 className="font-medium mb-2">{t("Template Column Names")}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-start">
          <div className="w-3 h-3 rounded-full bg-destructive mt-1.5 mr-2 shrink-0"></div>
          <div>
            <p className="font-medium">user_email</p>
            <p className="text-sm text-muted-foreground">{t("User's email address (required)")}</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="w-3 h-3 rounded-full bg-destructive mt-1.5 mr-2 shrink-0"></div>
          <div>
            <p className="font-medium">user_role</p>
            <p className="text-sm text-muted-foreground">
              {t('User\'s role (one of: "proxy_admin", "proxy_admin_viewer", "internal_user", "internal_user_viewer")')}
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="w-3 h-3 rounded-full bg-border mt-1.5 mr-2 shrink-0"></div>
          <div>
            <p className="font-medium">teams</p>
            <p className="text-sm text-muted-foreground">{t('Comma-separated team IDs (e.g., "team-1,team-2")')}</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="w-3 h-3 rounded-full bg-border mt-1.5 mr-2 shrink-0"></div>
          <div>
            <p className="font-medium">max_budget</p>
            <p className="text-sm text-muted-foreground">{t('Maximum budget as a number (e.g., "100")')}</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="w-3 h-3 rounded-full bg-border mt-1.5 mr-2 shrink-0"></div>
          <div>
            <p className="font-medium">budget_duration</p>
            <p className="text-sm text-muted-foreground">{t('Budget reset period (e.g., "30d", "1mo")')}</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="w-3 h-3 rounded-full bg-border mt-1.5 mr-2 shrink-0"></div>
          <div>
            <p className="font-medium">models</p>
            <p className="text-sm text-muted-foreground">
              {t('Comma-separated allowed models (e.g., "gpt-3.5-turbo,gpt-4")')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
