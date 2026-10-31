# LiteLLM 轻量版前端修改记录

## 用途与基线

这版面向公司内部使用。管理员接入公司采购的模型服务、配置员工权限和预算，员工登录后创建自己的 API Key，通过客户端调用模型

本文件记录轻量分支相对社区源码的完整前端差异，供后续升级和合并时逐项核对。屏蔽清单同时包含企业版能力、实验功能和当前场景不需要的开源功能，不能把这里所有条目都视为企业版功能

| 项目               | 当前记录                                        |
| ------------------ | ----------------------------------------------- |
| 记录日期           | 2026-10-31                                      |
| 工作分支           | `litellm_lite_ui_masking`                       |
| 裁剪前的源码提交   | `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`      |
| 基线提交标题       | `test(router): audit #47498 (#48799)`           |
| 基线源码版本       | `1.109.0`，见根目录 `pyproject.toml`            |
| 轻量版预览         | [localhost:4001/ui/](http://localhost:4001/ui/) |
| 用于对比的原版容器 | `127.0.0.1:4002`，版本 `1.106.6`                |

4002 的镜像和本地源码版本不同，不能把二者的所有页面差异都归因于裁剪。核对自定义修改应使用上表的 Git 提交，而不是用 4002 的截图反推源码差异。4000、4002 的服务和数据没有参与本轻量版改造

## 修改边界

只屏蔽前端入口、页面、页签、控件和部分展示字段，保留原有页面名称、布局、交互和表单提交逻辑。没有做界面重设计、中文化或后端功能删除

模型转发、供应商适配、数据库结构、API 路由、预算计算、鉴权和许可证校验均保持社区实现。前端隐藏不等于 API 禁用或权限隔离，隐藏的数据也可能仍在接口响应及已挂载组件中。必须继续依靠后端权限保护敏感数据

未删除隐藏功能的源码、依赖或静态导出页面，不承诺镜像、安装包或 JavaScript 体积下降。恢复能力时需要同步检查页面、表单、页签和关联入口，不能只恢复一个菜单

## 菜单和页面

以下“保留”均受社区原有角色、页面可见性和接口权限继续约束，不会因为轻量版白名单而给员工增加管理员权限

| 区域               | 员工端                                        | 管理员端                                                              |
| ------------------ | --------------------------------------------- | --------------------------------------------------------------------- |
| Home               | 保留个人概览和创建 Key 等核心入口             | 保留核心概览                                                          |
| Virtual Keys       | 保留本人有权访问的 Key 列表、创建、查看和管理 | 保留 Key 日常管理以及用户、团队归属                                   |
| Models + Endpoints | 保留获授权模型的列表和基础信息                | 保留添加、编辑、删除模型、凭据、健康检查、重试配置                    |
| Usage              | 保留原权限允许的本人和团队用量                | 保留全局、本人、用户、团队用量                                        |
| Logs               | 不开放，延续轻量版角色限制                    | 保留 Request Logs                                                     |
| Teams              | 保留原权限允许的团队查看和操作                | 保留团队、普通成员、模型权限、基本预算、TPM/RPM                       |
| Internal Users     | 延续社区管理员角色限制                        | 保留员工创建、查看、编辑、预算和权限管理                              |
| Access Groups      | 延续社区角色限制                              | 保留分组及其原有管理流程                                              |
| Budgets            | 延续社区管理员角色限制                        | 保留原有预算管理页面                                                  |
| Organizations      | 屏蔽                                          | 屏蔽，已确认不保留 Enterprise 授权介绍页                              |
| Projects Beta      | 屏蔽                                          | 屏蔽                                                                  |
| Settings           | 屏蔽管理员菜单和对应页面                      | 保留 Router Settings、Logging & Alerts、Admin Settings 的下述开源部分 |

两类用户都屏蔽 Playground、API Reference、Agents、Workflow Runs、Memory、MCP Servers、Skills、Guardrails、Policies、Search Tools、Vector Stores、Tool Policies、Model Insights、Cost Optimization、Lens、Guardrails Monitor、AI Hub、Learning Resources、Response Cache、Experimental 及其子入口，以及不在页面白名单内的其他独立页面，例如 Chat、Moyai、Cost Tracking、UI Theme

侧栏、移动导航和命令搜索共用菜单过滤。直接访问被屏蔽的页面 URL 会显示当前版本不可用，不会展示原功能。登录、onboarding、修改密码和既有 MCP 回调路由继续保留，MCP 管理页面仍被屏蔽

## 页签与页面内区块

| 页面                     | 屏蔽项                                                                                                                                                  | 保留项和说明                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Home                     | Lite Admin 入口、新闻、榜单和更新推广区域                                                                                                               | 核心用量与日常操作                                                        |
| Models + Endpoints       | Auto Routers、Pass Through、Model Group Alias、Price Data、Decision Models 推广、User Connections                                                       | 管理员的模型配置和供应商凭据正常保留                                      |
| 员工模型详情             | 新增模型、凭据、健康检查、重试、Raw 页签，以及编辑等管理动作和上游配置展示                                                                              | 模型可用性和基础信息                                                      |
| 模型新增表单             | Team-BYOK 专属模型开关和对应团队选择区域                                                                                                                | 原有必需团队作用域、模型访问组和供应商认证字段保留                        |
| Virtual Keys 详情        | Savings、Auto Router Usage、Regenerate Key、组织和项目展示、独立日志、自动轮换、Guardrails、Policies、Prompts、路由权限、标签及原始 Metadata 等高级区块 | 基本信息、模型、用量、预算、过期时间、编辑、删除及原权限允许的其他动作    |
| Key 创建                 | Agent 所有者、非 AI API 类型及高级配置区块                                                                                                              | You、Service Account、Another User 按原角色提供，团队和访问组配置保留     |
| Logs                     | Audit Logs、Deleted Keys、Deleted Teams，连同 Enterprise 预览和升级说明                                                                                 | Request Logs 及请求详情                                                   |
| Teams                    | Default Team Settings 页签、创建团队中的独立 Logging Settings、组织与密钥管理展示、单模型预算编辑和展示                                                 | 团队基本预算和成员预算保留，成员表中的原始限额数据不重算                  |
| 团队成员添加或编辑       | 新分配团队 Admin 角色、单模型预算                                                                                                                       | 新成员默认普通角色。已有 Admin 成员编辑时保留原角色选项，避免改写已有授权 |
| Usage                    | MCP、Endpoints 页签、Aria 自然语言查询、Top Agents，以及 Customer、Tag、Agent、User Agent Activity、Organization 统计视角                               | 全局、本人、用户、团队统计按原权限提供                                    |
| Router Settings          | 路由策略选择、标签过滤、基于延迟的高级配置                                                                                                              | 原有基础重试等设置                                                        |
| Logging & Alerts         | Logging Callbacks、CloudZero 页签、Region Outage 企业告警                                                                                               | 告警类型、可用的普通告警设置、Email 设置。默认打开 Alerting Types         |
| 告警参数表               | 后端标记 `premium_field=true` 的整行，包括付费控件、说明和升级链接                                                                                      | 普通参数继续编辑和重置，重置使用原始配置索引                              |
| Email 设置               | `EMAIL_LOGO_URL`、`EMAIL_SUPPORT_CONTACT` 品牌定制                                                                                                      | SMTP、测试邮件和普通邮件事件                                              |
| Admin Settings           | SSO Settings、Security Settings、SCIM、Hashicorp Vault、CyberArk、Plugins、Web Search Interception                                                      | UI Settings、Logging Settings。默认打开 UI Settings                       |
| Security Settings 原区块 | SSO 管理、IP 白名单、UI Access Control 弹窗入口                                                                                                         | 随所属页签整体屏蔽，后端安全配置和现有登录不变                            |
| UI Settings              | Projects、Chat、Agents、Vector Stores 相关开关、公开 AI Hub 认证设置、组织搜索作用域、客户端 Header 转发、供应商认证 Header 转发、Moyai 整个连接区域    | 其余原有开源设置，仍保留社区限制                                          |
| 顶栏                     | View Switcher、Lite Admin、Docs、Blog、Community 等非核心入口                                                                                           | 原有导航、搜索、账号及基础状态                                            |

Playground 已整页屏蔽，早期添加到 `Composer`、`Inspector`、`PlaygroundChat`、`SettingsPopover` 四个组件内的重复屏蔽已撤回。这四个文件与基线一致，后续无需维护内部控件差异

## 字段与表格

字段策略的准确信息以 [src/utils/liteUi.ts](src/utils/liteUi.ts) 为准。这里按提交字段名记录，避免社区调整英文标签后难以定位

| 生效位置                             | 屏蔽字段                                                                                                                                                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 使用共享表单的页面                   | `organization_id`、`secret_manager_settings`、`model_max_budget`、`team_member_model_max_budget`、`allowed_passthrough_routes`、`logging_settings`、`disable_global_guardrails`                                                                                                             |
| Key 和模型表单的资源扩展             | `project_id`、`metadata`、`tags`、`guardrails`、`policies`、`prompts`、`vector_stores`、`vector_store_ids`、`allowed_vector_store_ids`、`allowed_routes`、`allowed_mcp_servers_and_groups`、`mcp_servers_and_groups`、`mcp_tool_permissions`、`allowed_agents_and_groups`、`allowed_skills` |
| Key 和模型表单的高级预算与限流       | `soft_budget`、`budget_windows`、`budget_fallbacks`、`end_user_budget_id`、`tpd_limit`、`tpm_limit_type`、`rpm_limit_type`、`model_tpm_limit`、`model_rpm_limit`、`throttle_on_budget_exceeded`、`default_estimated_output_tokens`、`default_estimated_output_tokens_per_model`             |
| Key 和模型表单的缓存、路由与成本参数 | `enable_prompt_caching`、`use_in_pass_through`、`kubernetes_pod_discovery`、`cache_control`、`cache_control_injection_points`、`litellm_extra_params`、`model_info_params`、`ptu_count`、`cost_per_ptu_per_hour`、`ptu_effective_from`、`ptu_effective_to`                                  |

共享 `ModelMaxBudgetField` 另行屏蔽整个区块，覆盖 Key、用户、团队和默认成员预算，不依赖当前是否有 Enterprise 许可证。独立 `PremiumLoggingSettings` 同样不展示付费介绍或配置

`max_budget`、`budget_duration`、`tpm_limit`、`rpm_limit`、模型选择、供应商 `api_key` 等认证字段不在上述屏蔽列表。`team_id`、`access_group_ids`、`model_access_group` 继续保留

| 表格或筛选              | 修改                                                                            |
| ----------------------- | ------------------------------------------------------------------------------- |
| 共享表格                | 隐藏 `organization_id`、`organization_alias` 列                                 |
| Key、模型、日志列表     | 隐藏 `project_id`、`request_tags`、`tags`、`end_user` 列                        |
| 员工 Key 列表           | 另隐藏 `user_id`、`user`、`user_email` 列                                       |
| 员工模型列表            | 另隐藏 `litellm_credential_name`、`input_cost`、`actions` 列及对应管理展示      |
| 共享筛选抽屉            | 隐藏 Organization 筛选                                                          |
| Key、模型、日志筛选抽屉 | 另隐藏 Project、End User、Tags、Cache、Credential、Span Type、Request Type 筛选 |

列过滤发生在创建表格实例之前，Columns 菜单不能重新勾出被屏蔽的列。筛选抽屉当前按标签识别，社区改标签或引入国际化时必须复查

## 实现位置与数据保留

| 文件或目录，相对 dashboard                                                                        | 与社区源码的差异                                                                                                             |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/utils/liteUi.ts`                                                                             | 集中定义页面白名单、角色范围、隐藏页签、字段、列                                                                             |
| `src/contexts/LiteUiContext.tsx`                                                                  | 轻量版上下文、页面边界、`LiteUiMask`                                                                                         |
| `src/app/layout.tsx`                                                                              | 在原 AuthProvider 内挂载轻量版边界                                                                                           |
| `src/components/leftnav.tsx`、`page_utils.ts`                                                     | 菜单、命令搜索数据源和页面可见性设置的过滤                                                                                   |
| `src/components/ui/tabs.tsx`、`src/hooks/useUrlTab.ts`                                            | 屏蔽页签触发器和内容，处理已有 URL 选中隐藏页签的情况                                                                        |
| `src/components/shared/form/FormField.tsx`、`common_components/MountedFormField.tsx`              | 共享表单字段屏蔽，保留注册和已有值                                                                                           |
| `src/components/shared/DataTable/DataTable.tsx`、`DataTableFilterDrawer.tsx`                      | 列、列选择器和筛选区块过滤                                                                                                   |
| `src/components/DashboardHeader.tsx`、Home 的 `HomePage.tsx`                                      | 入口和非核心区块屏蔽                                                                                                         |
| `src/components/organisms/create_key_button.tsx`、`templates/key_edit_view.tsx`                   | Key 类型、所有者和高级表单区域屏蔽                                                                                           |
| `src/components/templates/KeyInfoHeader.tsx`、`key_info_view.tsx`                                 | Key 重新生成按钮及详情展示区块屏蔽                                                                                           |
| Models 下的 `page.tsx`、`AllModelsTable.tsx`、`ModelsTableColumns.tsx`、`LlmCredentialsPanel.tsx` | 模型管理权限展示、表格和非核心面板                                                                                           |
| `src/components/model_info_view.tsx`、`add_model/AddModelForm.tsx`                                | 员工端管理区块和 Team-BYOK 控件屏蔽                                                                                          |
| Usage 下的 `UsagePageView.tsx`、`UsageViewSelect.tsx`                                             | 非核心统计和查询入口屏蔽                                                                                                     |
| `src/components/key_team_helpers/ModelMaxBudgetEditor.tsx`                                        | 共享单模型预算字段区块屏蔽                                                                                                   |
| `src/components/common_components/PremiumLoggingSettings.tsx`                                     | Key 和团队独立日志的付费介绍及控件屏蔽                                                                                       |
| `src/components/Teams.tsx`、`team/TeamInfo.tsx`、`team/EditMembership.tsx`                        | 团队日志、预算展示和成员角色选项调整                                                                                         |
| `src/components/settings.tsx`、`alerting/dynamic_form.tsx`、`email_settings.tsx`                  | 默认告警页签、企业告警行和邮件品牌字段屏蔽                                                                                   |
| `src/components/router_settings/RouterSettingsForm.tsx`                                           | 高级路由区块屏蔽                                                                                                             |
| AdminPanel 和 `src/components/Settings/AdminSettings/UISettings/UISettings.tsx`                   | 管理设置默认页签和隐藏功能开关、关联入口。`TeamAdminEditableFieldsSettings.tsx` 另外隐藏 Projects 权限复选框，保留已有选择值 |
| `eslint-suppressions.json`                                                                        | 随本分支既有 lint 清理收紧基线，不放宽规则                                                                                   |
| 对应测试文件                                                                                      | 菜单、搜索、路由、表单值保留、页签、表格及付费控件行为回归                                                                   |

`LiteUiMask` 和共享字段用 `hidden` 与 `display:none` 隐藏区块，通常保留子组件挂载，避免表单编辑把原来存有的配置清空。屏蔽的页签内容则不渲染，即使有 `keepMounted` 或旧 URL 参数也不展示

共享字段对必填项和当前校验错误保留原有保护。例如 Team Admin 添加模型仍需要的团队作用域不能隐藏，否则原表单无法提交。已有团队 Admin 成员的角色也不会被强制改为普通成员

隐藏字段的已有值可能继续随原表单提交，或按社区原有 diff 逻辑不发送未改动字段。这不负责撤销已经启用的后端能力。若需要停用配置，必须另外评估并授权相应的数据或后端修改

## Docker 与演示数据

| 文件，相对仓库根目录                | 用途                                                        |
| ----------------------------------- | ----------------------------------------------------------- |
| `docker/Dockerfile.lite-ui`         | 在本地源码运行时镜像上替换静态 Dashboard 导出物             |
| `docker/docker-compose.lite-ui.yml` | 独立 Compose 项目、数据库卷和 localhost 4001 端口           |
| `docker/lite-ui-preview.yaml`       | 10 个本地 Mock 模型，其中 8 个聊天模型、2 个 Embedding 模型 |
| `docker/lite-ui-preview.md`         | 完整构建、启动和停止说明                                    |

这些文件是本地演示设施，不属于 LiteLLM 后端裁剪。模型名字和供应商图标用于模拟列表效果，Mock 请求不会访问真实供应商。新增演示模型按零成本配置，Embedding 返回固定四维向量，不能用于真实语义检索或账单验证

预览管理员、员工账户和个人密钥不写入仓库。私有环境文件和数据库卷应继续复用，避免凭据与既有数据不匹配。UI 更新先完成 `npm run build`，再重建 Compose，不能让 Docker 读取尚未完成的静态导出目录

## 合并社区新版本

每次升级都以本文件的源码提交为旧基线，记录新基线 SHA 和源码版本。先保留工作分支的已提交状态，再获取并检查社区目标版本，合并后重做下面的核对，不把更新许可证、改后端权限或删除数据夹带进 UI 合并

```bash
git status --short --branch
git diff --stat 9546f9a69ff470dfcc5a21eccab89d2fd86a634f..HEAD
git diff 9546f9a69ff470dfcc5a21eccab89d2fd86a634f..HEAD -- ui/litellm-dashboard docker/Dockerfile.lite-ui docker/docker-compose.lite-ui.yml docker/lite-ui-preview.yaml docker/lite-ui-preview.md
```

| 核对位置                  | 合并时要确认的行为                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| 页面和菜单注册表          | 新增页面默认未进入轻量白名单，侧栏、搜索、移动端和直达 URL 一致                                           |
| 路由 ID 和菜单 page 名    | `/models-and-endpoints` 对应 `models`，`/usage` 对应 `new_usage` 等映射没有失效                           |
| Tabs 和 PageTabs          | 社区重写页签组件后仍会调用过滤，隐藏内容不能因 `keepMounted` 渲染                                         |
| 默认页签和 URL 状态       | Admin Settings 仍默认 UI Settings，Logging & Alerts 仍默认普通告警页，旧高级页签链接能回退                |
| 新增 Enterprise 控件      | 检查 `premiumUser`、`premium_field`、`Enterprise`、`Upgrade`、`license`，区分真正付费功能与普通供应商文字 |
| Key、用户、团队和模型表单 | 新的字段组件是否绕过共享 `FormField` 或 `MountedFormField`，创建、详情、编辑三处都要看                    |
| 已有隐藏值                | 改普通字段不会清空已有组织、项目、日志、单模型预算等配置，必填校验仍能完成                                |
| 成员角色                  | 新建成员不能默认提交被隐藏的 Admin 角色，已有 Admin 编辑不改授权                                          |
| 表格及筛选                | 社区新增列 ID、列选择器或修改筛选标签后仍保持屏蔽，清空筛选不会带出隐藏控件                               |
| 告警参数元数据            | `premium_field` 的含义和重置接口索引仍与原配置一致                                                        |
| 关联入口                  | Home、模型详情、Key 详情、设置开关没有留下通往被屏蔽页面的按钮或链接                                      |
| Docker 运行时             | Python 或 Rust 更新后先重建 `litellm-lite-runtime:local`，不能只替换 UI 后声称后端也升级                  |

推荐把上述检查和本文清单一起更新。优先在集中策略或共享组件补规则，只有独立按钮、无共享表单字段的区块才增加就地屏蔽。已整页屏蔽的功能不再逐个改其内部组件

## 验证记录与限制

2026-10-31 的定向检查覆盖 26 个测试文件、848 个用例，整体通过。其中 845 个为普通通过，3 个是社区已有的 `it.fails` 预期失败用例，分别位于 `create_key_button.integration.test.tsx` 和 `key_edit_view.integration.test.tsx`，不代表这 3 个既有问题已修复

| 检查                                | 本轮结果                                   |
| ----------------------------------- | ------------------------------------------ |
| 定向 Vitest                         | 上述 26 个文件通过，无新增失败             |
| `npm run build`                     | 通过，包括 TypeScript 检查和静态导出       |
| 仓库 `./scripts/pre_commit_lint.sh` | 通过，执行 Prettier、ESLint 和规则预算检查 |
| Python、后端类型与迁移检查          | 没有修改对应文件，作用域检查按仓库规则跳过 |
| 4001 Docker 运行                    | 使用本轮静态导出物重建，健康检查通过       |

测试命令仅运行受影响文件，不运行整个 Vitest 套件

```bash
cd ui/litellm-dashboard
npx vitest run --maxWorkers=4 \
  src/utils/liteUi.test.ts \
  src/contexts/LiteUiContext.integration.test.tsx \
  src/components/leftnav.test.tsx \
  src/components/page_utils.test.ts \
  src/components/CommandPalette/utils.test.ts \
  src/components/alerting/dynamic_form.integration.test.tsx \
  src/components/team/EditMembership.integration.test.tsx \
  src/components/team/EditMembership.test.tsx \
  src/components/templates/KeyInfoHeader.test.tsx \
  src/components/templates/key_info_view.test.tsx \
  src/components/templates/key_info_view.budget_display.test.tsx \
  src/components/templates/key_edit_view.integration.test.tsx \
  src/components/organisms/create_key_button.integration.test.tsx \
  src/components/key_team_helpers/ModelMaxBudgetEditor.integration.test.tsx \
  'src/app/(dashboard)/usage/_components/components/UsageViewSelect/UsageViewSelect.test.tsx' \
  'src/app/(dashboard)/admin-panel/_components/AdminPanel.test.tsx' \
  src/components/email_settings.test.tsx \
  src/components/settings.test.tsx \
  src/components/Teams.test.tsx \
  src/components/Teams.integration.test.tsx \
  src/components/team/TeamInfo.test.tsx \
  src/components/team/TeamInfo.integration.test.tsx \
  src/components/add_model/AddModelForm.integration.test.tsx \
  src/components/Settings/AdminSettings/UISettings/UISettings.test.tsx \
  src/components/Settings/AdminSettings/UISettings/TeamAdminEditableFieldsSettings.test.tsx \
  src/hooks/useUrlTab.test.tsx
npm run build
cd ../..
./scripts/pre_commit_lint.sh
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4001/health/liveliness
```

健康检查返回 `200`。仓库检查完整日志位于本地 `.git/pre_commit_lint.log`，不加入版本管理

自动化覆盖包括普通字段可编辑、隐藏配置值保留、已选中的 Enterprise 页签不渲染、隐藏列无法从 Columns 菜单恢复、不同许可证状态下付费控件均不可见、普通告警重置索引不偏移，以及新成员默认角色有效

| 浏览器验收                 | 观察结果                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| 管理员 Logs                | 仅 Request Logs 可见，审计和删除历史页签、Enterprise 预览不再出现                            |
| 管理员 Admin Settings      | 默认 UI Settings，仅 UI Settings、Logging Settings 两个页签，企业安全与 SSO 入口不再出现     |
| 管理员告警页               | 默认 Alerting Types，普通告警和参数可见，无 Region Outage 付费行和升级按钮                   |
| 管理员 Teams               | Your Teams、Available Teams 保留，组织列及默认 SSO 团队设置页签隐藏                          |
| 管理员创建团队             | 团队名称、模型、基本预算、TPM/RPM 和成员基本限额保留，付费日志、密钥管理和单模型预算控件隐藏 |
| 员工导航与 Key             | Home、Virtual Keys、Models + Endpoints、Usage、Teams 保留，现有 Key 可查看                   |
| 员工创建 Key 表单          | 可打开，名称、模型、基本预算、TPM/RPM、团队和访问组配置可见，本轮没有提交新的 Key            |
| 两种角色直达 Organizations | 均显示当前版本不可用                                                                         |

浏览器使用既有管理员和员工会话，不配置 Enterprise 许可证。验证码、企业 IdP 和真实供应商账户没有参与本轮验收

Docker 浏览器验收使用 4001 的独立演示环境。真实供应商调用、真实成本核算、SSO 登录、生产部署和全站跨浏览器回归不在此次验证范围内。前序预览中部分员工页面仍有原有管理配置请求返回 403，不能把前端屏蔽当作消除后台请求或修复这些接口权限

社区升级后可能通过新增独立控件引入新的企业版入口，这份静态清单需要随升级维护，不能把本轮检查理解为未来版本的自动保证
