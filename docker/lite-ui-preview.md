# Lightweight dashboard preview

This local stack uses a source-built runtime, a separately built dashboard, an isolated database, and port 4001. Existing proxy containers and data are kept in place

Build the runtime from this checkout once. Rebuild it when Python or Rust code changes

```bash
docker build -t litellm-lite-runtime:local .
```

Build the dashboard from this branch

```bash
cd ui/litellm-dashboard
npm ci --no-audit --no-fund
npm run build
cd ../..
```

Create a private environment file outside the checkout. Keep it for the lifetime of the preview database

```bash
umask 077
LITELLM_PREVIEW_ENV=$(mktemp -t litellm-lite-preview)
{
  printf 'LITELLM_PREVIEW_MASTER_KEY=sk-%s\n' "$(openssl rand -hex 24)"
  printf 'LITELLM_PREVIEW_SALT_KEY=sk-%s\n' "$(openssl rand -hex 24)"
  printf 'LITELLM_PREVIEW_PASSWORD=%s\n' "$(openssl rand -hex 24)"
  printf 'LITELLM_PREVIEW_DB_PASSWORD=%s\n' "$(openssl rand -hex 24)"
} > "$LITELLM_PREVIEW_ENV"
docker compose -p litellm-lite-preview --env-file "$LITELLM_PREVIEW_ENV" -f docker/docker-compose.lite-ui.yml up -d --build
```

Open [the dashboard](http://localhost:4001/ui/) and use the `admin` account with the generated `LITELLM_PREVIEW_PASSWORD`. Invite employees through Internal Users and grant them the `internal_user` role with access to `preview-text`

The `preview-text` model returns a local mock response. It validates the UI flow without sending requests to a provider. Its usage is preview data, with no real supplier balance or production billing represented

For UI-only updates, rebuild the dashboard and run the same Compose command. The final image replaces only the exported dashboard in the source-built runtime, so it does not need to recompile Rust for every UI edit

Stop this stack with the same project name and environment file. Do not use volume deletion unless you intend to discard the preview database

The dashboard keeps the existing page names, layout, form defaults, validation, and backend APIs. The employee view exposes Home, Virtual Keys, Playground, Models + Endpoints, Usage, and API Reference. Administrators additionally retain Logs, Internal Users, Router Settings, Logging & Alerts, and Admin Settings

Browser verification covered both roles signing in, employee key creation, administrator visibility of that key, a mock chat response, blocked page URLs, and hidden-tab fallback. The static dashboard build, scoped frontend lint gates, and focused tests passed

Some existing employee-page hooks still request administrator-only configuration and team endpoints, which return 403 in the console. The verified key and chat flows succeed. Backend authorization and those API contracts are unchanged by this masking pass. Real provider requests, real cost attribution, SSO, and production deployment were not validated
