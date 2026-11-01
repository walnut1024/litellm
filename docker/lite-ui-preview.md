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

Open [the dashboard](http://localhost:4001/ui/) and use the `admin` account with the generated `LITELLM_PREVIEW_PASSWORD`. Configure models through Models + Endpoints, invite employees through Internal Users, and grant them the `internal_user` role with access to the required configured models

The YAML model list is empty. Models and encrypted provider credentials are stored in the external preview database through the native management APIs. A new database starts without models, while the current environment contains only the forty-one models in [moma-model-catalog.md](moma-model-catalog.md)

The ten original YAML mock entries, including `preview-text` and nine `demo-*` names, were removed. The earlier `moma-deepseek-v3.2` trial deployment was also removed because it is outside the approved list. The existing Qwen 397B deployment is retained as `moma-qwen3.5-397b`. Existing users, keys, and request history are retained, so historical logs or stored key scopes can still mention removed models. No scope was widened by clearing an allowlist

For UI-only updates, rebuild the dashboard and run the same Compose command. The final image replaces only the exported dashboard in the source-built runtime, so it does not need to recompile Rust for every UI edit

Stop this stack with the same project name and environment file. Do not use volume deletion unless you intend to discard the preview database

The dashboard keeps the existing page names, validation, and backend APIs, with the MoMA navigation and theme recorded in the differences guide. Home, Virtual Keys, Models + Endpoints, and Usage remain available. Access Control retains Teams, Internal Users, Access Groups, and Budgets. The original role and API restrictions still apply. Team and access-group assignments and team usage remain available

Administrators additionally retain Logs, Router Settings, Logging & Alerts, and Admin Settings. Playground and the deprecated API Reference page remain hidden for both roles, including navigation, search, and direct page URLs

The beta Projects feature and Enterprise Organizations page are masked in navigation, search, direct page access, and related fields. The local preview's Projects UI setting is disabled. Existing ownership is preserved when editing keys. Audit Logs, deleted-resource history, SSO and security configuration tabs, key regeneration, per-model budget controls, per-key/team logging, secret manager settings, and paid alert controls are also masked

The complete employee and administrator inventory, source baseline, changed-file map, and upstream merge checklist are recorded in [LITE_UI_CUSTOMIZATIONS.md](../ui/litellm-dashboard/LITE_UI_CUSTOMIZATIONS.md). The source baseline is version 1.109.0, while the separate original container on port 4002 is version 1.106.6

Browser verification covered both roles signing in, employee key creation, administrator visibility of that key, and blocked page URLs. Mock chat and hidden-tab fallback were verified before Playground was fully hidden. The static dashboard build, scoped frontend lint gates, and focused tests passed

Some existing employee-page hooks still request administrator-only configuration and team endpoints, which return 403 in the console. The verified key and chat flows succeed. Backend authorization and those API contracts are unchanged by this masking pass. SSO and production deployment were not validated

## Real provider verification

On 2026-11-01 the dashboard at commit `d37c64c78e` was rebuilt and packaged as `litellm-lite-ui:local`, also tagged `litellm-moma:d37c64c78e`. The image ID is `sha256:e606989a0674783a401bf8e62eb95e666f4e881e5b67c5e2bafb6fb517121cf6`. The runtime remains the existing source-built LiteLLM 1.109.0 image. No Python or Rust changes were introduced

The first real provider verification added `moma-deepseek-v3.2` and `moma-qwen3.5-397b`. They use the existing provider API Key and the OpenAI-compatible endpoint `https://zhenze-huhehaote.cmecloud.cn/v1`, with upstream model IDs `deepseek-v3.2` and `qwen3.5-397b-a17b`. They were added through `/model/new` and are separate from the ten YAML mock entries. Image distribution alone does not include these database records or credentials

The preview employee received these two additional model permissions. An existing session needed a fresh login before the new models appeared. A separate one-day employee test Key is limited to these two names and a budget of 0.05. Its value is not recorded here

Employee chat requests returned HTTP 200 and the expected answer for both models. DeepSeek streaming also returned HTTP 200 and completed with `[DONE]`. Calling an unrelated model with the scoped test Key returned HTTP 403. The four successful HTTP requests, including the initial Qwen response that exhausted its 128-token output limit on reasoning, recorded 437 total tokens. Repeating Qwen with a 512-token limit produced the final answer. Request logs recorded an estimated total cost of 0.0028448 in the configured numerical units

Configured estimates use the provider page's daytime short-context rates per million tokens, 2 input and 8 output for DeepSeek, and 1.2 input and 7.2 output for Qwen. They do not cover night discounts, cache pricing, long-context tiers, or contract discounts. Provider invoices were not reconciled

The latest DeepSeek-V4.1 model has a different official endpoint, `https://vip.moma.cmecloud.cn/v1`. This account returned HTTP 402 with `subscription_required` there. No subscription was purchased and that model was not added to the preview. A model appearing in `/models` does not establish that its subscription or serving endpoint is available

After a container restart, health returned HTTP 200 and both real model records remained available. Existing accounts, mock entries, database volumes, and the separate services on ports 4000 and 4002 were preserved. Keep provider credentials outside the checkout and rebuild or relocate these records through the native model management flow when deploying elsewhere

## Administrator model inventory

The administrator model list contains forty-one models after the user excluded hy3. All forty-one have verified upstream IDs and saved deployments, including forty new records and reuse of the existing Qwen 397B deployment. The later cleanup removed the ten original mock entries and the extra DeepSeek-V3.2 trial deployment, leaving exactly forty-one active catalog records. No hy3 deployment was created and it is no longer a pending item

Five requested Qwen models are enabled and passed both upstream and local gateway checks. Twenty-four chat models returned HTTP 402 with `subscription_required` and remain paused. Twelve image, video, and realtime records also remain paused because generation and subscription were not verified, with specific adapter limitations recorded for several protocols. No provider subscription, employee authorization change, application code change, or image rebuild was performed in this pass

The complete mappings, endpoint sources, statuses, pricing limits, and validation evidence are maintained in [moma-model-catalog.md](moma-model-catalog.md). Preserve this inventory together with the external database and salt configuration when moving the environment. The image alone contains neither the configured model records nor their credentials

## Compact dashboard

The compact dashboard image is also tagged `litellm-moma:compact-20261101`, with image ID `sha256:28310e0bb7afad0f34acd03c33c79e1cfa2d3ef1cb203cc8d732a563fb4dd1b9`. It retains the existing 1.5 typography scale while reducing header, sidebar, table, toolbar, panel, and card spacing. Model cards adapt to a minimum width of 240px, and key rows display one model plus the remaining count through the existing ModelsCell control. These changes affect presentation only

After rebuilding and recreating the 4001 service, health and model inventory returned HTTP 200, with exactly forty-one configured models and no mock responses. The retained model IDs, provider parameters, and pause states were unchanged. Six focused frontend test files passed 197 tests, and the production build, TypeScript check, and static export passed. Browser checks covered both roles, language and theme switching, model search and view switching, the key form, and phone, tablet, and desktop layouts. No provider inference or invoice reconciliation was repeated for this layout change

## Navigation groups

The subsequent navigation update is tagged `litellm-moma:navigation-20261101`, with image ID `sha256:46e969e3b85a299eea35cdb197bae3788dcd74fecb511a83c1ccf8032c8e3a57`. It separates Access Control and System Settings using the original menu groups and permissions. The 4001 service was rebuilt with this image and returned HTTP 200 for its health check. Nineteen focused tests, the production build, and the frontend lint gates passed. Browser checks covered both roles, Chinese and English labels, and phone drawers. This update did not change model records, keys, budgets, or backend APIs
