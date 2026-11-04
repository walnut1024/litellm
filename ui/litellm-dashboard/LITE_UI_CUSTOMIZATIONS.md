# 轻量版差异与维护指南

## 用途与基线

这版面向公司内部使用。管理员接入公司采购的模型服务、配置员工权限和预算，员工登录后创建自己的 API Key，通过客户端调用模型

本文件记录当前轻量版相对社区源码的前端差异及部署配置，供后续升级和合并时逐项核对。屏蔽清单同时包含企业版能力、实验功能和当前场景不需要的开源功能，不能把这里所有条目都视为企业版功能

本分支的持续维护要求记录在[项目根目录 AGENTS.md](../../AGENTS.md#lightweight-fork-maintenance)，后续修改和社区版本合并均需按该约定核对并同步维护本文件

| 项目             | 当前记录                                        |
| ---------------- | ----------------------------------------------- |
| 记录日期         | 2026-11-04                                      |
| 工作分支         | `main`，保留原 `litellm_lite_ui_masking` 分支   |
| 裁剪前的源码提交 | `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`      |
| 基线提交标题     | `test(router): audit #47498 (#48799)`           |
| 基线源码版本     | `1.109.0`，见根目录 `pyproject.toml`            |
| 轻量版预览       | [localhost:4001/ui/](http://localhost:4001/ui/) |

main 是轻量版维护分支。核对自定义修改应使用上表固定的社区基线，不能把 main 当作未修改的社区源码，也不能用其他版本的容器截图反推差异

## 修改边界

前端调整包括入口、页面、页签、控件和展示字段屏蔽，以及 MoMA 主题与中英文国际化，默认中文。保留表单提交、页面权限、API 调用和后端业务实现

模型转发、供应商适配、数据库结构、API 路由、预算计算、鉴权和许可证校验均保持社区实现。前端隐藏不等于 API 禁用或权限隔离，隐藏的数据也可能仍在接口响应及已挂载组件中。必须继续依靠后端权限保护敏感数据

未删除隐藏功能的源码、依赖或静态导出页面，不承诺镜像、安装包或 JavaScript 体积下降。恢复能力时需要同步检查页面、表单、页签和关联入口，不能只恢复一个菜单

## 菜单和页面

以下“保留”均受社区原有角色、页面可见性和接口权限继续约束，不会因为轻量版白名单而给员工增加管理员权限

| 区域               | 员工端                                        | 管理员端                                                           |
| ------------------ | --------------------------------------------- | ------------------------------------------------------------------ |
| Home               | 保留个人概览和创建 Key 等核心入口             | 保留核心概览                                                       |
| Virtual Keys       | 保留本人有权访问的 Key 列表、创建、查看和管理 | 保留 Key 日常管理以及用户、团队归属                                |
| Models + Endpoints | 保留获授权模型的列表和基础信息                | 保留添加、编辑、删除模型、凭据、健康检查、重试配置                 |
| Usage              | 保留原权限允许的本人和团队用量                | 保留全局、本人、用户、团队用量                                     |
| Logs               | 不开放，延续轻量版角色限制                    | 保留 Request Logs                                                  |
| Teams              | 保留原权限允许的团队查看和操作                | 保留团队、成员分配与角色编辑、模型权限、预算、TPM/RPM              |
| Internal Users     | 延续社区管理员角色限制                        | 保留员工创建、查看、编辑、预算和权限管理                           |
| Access Groups      | 延续社区角色限制                              | 保留分组及其原有管理流程                                           |
| Budgets            | 延续社区管理员角色限制                        | 保留原有预算管理页面                                               |
| Organizations      | 屏蔽                                          | 屏蔽，已确认不保留 Enterprise 授权介绍页                           |
| Projects Beta      | 屏蔽                                          | 屏蔽                                                               |
| Settings           | 屏蔽管理员菜单和对应页面                      | 保留 Router Settings、Logging & Alerts、Admin Settings 和 UI Theme |

两类用户都屏蔽 Playground、API Reference、Agents、Workflow Runs、Memory、MCP Servers、Skills、Guardrails、Policies、Search Tools、Vector Stores、Tool Policies、Model Insights、Cost Optimization、Lens、Guardrails Monitor、AI Hub、Learning Resources、Response Cache、Experimental 及其子入口，以及不在页面白名单内的其他独立页面，例如 Chat、Moyai、Cost Tracking

侧栏、移动导航和命令搜索共用菜单过滤。直接访问被屏蔽的页面 URL 会显示当前版本不可用，不会展示原功能。登录、onboarding、修改密码和既有 MCP 回调路由继续保留，MCP 管理页面仍被屏蔽

## 页签与页面内区块

| 页面                     | 屏蔽项                                                                                                                                                  | 保留项和说明                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Home                     | Lite Admin 入口、新闻、榜单和更新推广区域                                                                                                               | 核心用量与日常操作                                                                                                  |
| Models + Endpoints       | Auto Routers、Pass Through、Model Group Alias、Model Access Group Budgets Beta、Price Data、Decision Models 推广、User Connections                      | 管理员的模型配置和供应商凭据正常保留                                                                                |
| 员工模型详情             | 新增模型、凭据、健康检查、重试、Raw 页签，以及编辑等管理动作和上游配置展示                                                                              | 模型可用性和基础信息                                                                                                |
| 模型新增表单             | Team-BYOK 专属模型开关和对应团队选择区域                                                                                                                | 原有必需团队作用域、模型访问组和供应商认证字段保留                                                                  |
| Virtual Keys 详情        | Savings、Auto Router Usage、Regenerate Key、组织和项目展示、独立日志、自动轮换、Guardrails、Policies、Prompts、路由权限、标签及原始 Metadata 等高级区块 | 基本信息、模型、用量、预算、过期时间、编辑、删除及原权限允许的其他动作                                              |
| Key 创建                 | Agent 所有者、非 AI API 类型及高级配置区块                                                                                                              | You、Service Account、Another User 按原角色提供，团队和访问组配置保留                                               |
| Logs                     | Audit Logs、Deleted Keys、Deleted Teams，连同 Enterprise 预览和升级说明                                                                                 | Request Logs 及请求详情                                                                                             |
| Teams                    | Default Team Settings 页签、MCP/智能体/搜索工具/技能配置与资源权限概览、创建团队中的独立 Logging Settings、组织与密钥管理展示、单模型预算编辑和展示     | 团队基本预算和成员预算保留，成员表中的原始限额数据不重算                                                            |
| 团队成员添加或编辑       | 无额外裁剪                                                                                                                                              | 添加成员默认 User，可选择 Admin。编辑保留角色、模型范围、预算、周期、临时预算、TPM/RPM 和按原许可证开放的单模型预算 |
| 访问组创建、编辑及详情   | MCP Servers、Agents、Skills 页签、对应内容及列表中的资源数量标记                                                                                        | 创建和编辑保留基本信息与模型，详情保留模型，隐藏项已有授权不会被清空                                                |
| 用户详情及编辑           | MCP 权限展示、MCP 服务器选择和工具权限配置                                                                                                              | 用户身份、平台角色、团队、模型、预算和限流继续保留                                                                  |
| Usage                    | MCP、Endpoints 页签、Aria 自然语言查询、Top Agents，以及 Customer、Tag、Agent、User Agent Activity、Organization 统计视角                               | 全局、本人、用户、团队统计按原权限提供                                                                              |
| Router Settings          | 路由策略选择、标签过滤、基于延迟的高级配置                                                                                                              | 原有基础重试等设置                                                                                                  |
| Logging & Alerts         | Logging Callbacks、CloudZero、MS Teams Alerts 页签、Region Outage 企业告警                                                                              | 告警类型、可用的普通告警设置、Email 设置。默认打开 Alerting Types                                                   |
| 告警参数表               | 后端标记 `premium_field=true` 的整行，包括付费控件、说明和升级链接                                                                                      | 普通参数继续编辑和重置，重置使用原始配置索引                                                                        |
| Email 设置               | `EMAIL_LOGO_URL`、`EMAIL_SUPPORT_CONTACT` 品牌定制                                                                                                      | SMTP、测试邮件和普通邮件事件                                                                                        |
| Admin Settings           | Security Settings、Hashicorp Vault、CyberArk、Plugins、Web Search Interception                                                                          | SSO Settings、SCIM、UI Settings、Logging Settings。默认打开 UI Settings，SCIM 同步继续受后端企业许可证校验          |
| Security Settings 原区块 | 旧 SSO 管理、IP 白名单、UI Access Control 弹窗入口                                                                                                      | 随所属页签整体屏蔽，后端安全配置和现有登录不变                                                                      |
| UI Settings              | Projects、Chat、Agents、Vector Stores 相关开关、公开 AI Hub 认证设置、组织搜索作用域、客户端 Header 转发、供应商认证 Header 转发、Moyai 整个连接区域    | 其余原有开源设置，仍保留社区限制                                                                                    |
| 顶栏                     | View Switcher、Lite Admin、Docs、Blog、Community 等非核心入口                                                                                           | 原有导航、搜索、账号及基础状态                                                                                      |

界面设置内的 Moyai、智能体、向量库与组织搜索区块分隔线随对应区块一起隐藏，避免被裁剪功能留下连续空白横线。单点登录设置补齐提供方、角色映射、字段、校验、创建与编辑弹窗及删除确认的中文，保留原提交值与密钥遮罩。SCIM 配置页补齐地址、令牌创建和结果提示的中文，并在未持有企业许可证时说明同步接口的授权限制。开放管理员配置页不改变后端鉴权、许可证或同步接口

## 新增模型的供应商目录

新增模型的供应商下拉仅保留现有国产供应商，包含 DeepSeek、阿里云百炼及其 DashScope 和 QwenCloud 适配、MiniMax、月之暗面、腾讯云和火山引擎。移动云 MoMA 位于首项，初次进入及成功添加后的表单均默认选中。MoMA 复用 OpenAI 兼容适配器，上游模型名称由管理员输入，API 地址不预置且必填，API 密钥字段使用通用中文名称。各供应商原有认证字段与适配协议保留

目录由 `src/components/add_model/modelProviders.ts` 维护，`AddModelForm.tsx` 展示选项，`models-and-endpoints/panels/AddModelPanel.tsx` 管理默认值、模型提示和表单重置，`provider_specific_fields.tsx` 调整 MoMA 模型表单中的密钥标签。URL 预填同样限定在此目录，已有模型、供应商凭据、后端支持范围与 API 权限不受前端目录筛选影响。该目录不是后端供应商白名单

## 字段与表格

字段策略的准确信息以 [src/utils/liteUi.ts](src/utils/liteUi.ts) 为准。这里按提交字段名记录，避免社区调整英文标签后难以定位

| 生效位置                             | 屏蔽字段                                                                                                                                                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 使用共享表单的页面                   | `organization_id`、`organization_ids`、`secret_manager_settings`、`model_max_budget`、`team_member_model_max_budget`、`allowed_passthrough_routes`、`logging_settings`、`disable_global_guardrails`                                                                                         |
| 保留页面的资源授权表单               | `allowed_mcp_servers_and_groups`、`mcp_servers_and_groups`、`mcp_tool_permissions`、`allowed_agents_and_groups`、`agents_and_groups`、`allowed_skills`、`skills`、`object_permission_search_tools`、`object_permission_skills`、`vector_stores`、`allowed_vector_store_ids`                 |
| Key 和模型表单的资源扩展             | `project_id`、`metadata`、`tags`、`guardrails`、`policies`、`prompts`、`vector_stores`、`vector_store_ids`、`allowed_vector_store_ids`、`allowed_routes`、`allowed_mcp_servers_and_groups`、`mcp_servers_and_groups`、`mcp_tool_permissions`、`allowed_agents_and_groups`、`allowed_skills` |
| Key 和模型表单的高级预算与限流       | `soft_budget`、`budget_windows`、`budget_fallbacks`、`end_user_budget_id`、`tpd_limit`、`tpm_limit_type`、`rpm_limit_type`、`model_tpm_limit`、`model_rpm_limit`、`throttle_on_budget_exceeded`、`default_estimated_output_tokens`、`default_estimated_output_tokens_per_model`             |
| Key 和模型表单的缓存、路由与成本参数 | `enable_prompt_caching`、`use_in_pass_through`、`kubernetes_pod_discovery`、`cache_control`、`cache_control_injection_points`、`litellm_extra_params`、`model_info_params`、`ptu_count`、`cost_per_ptu_per_hour`、`ptu_effective_from`、`ptu_effective_to`                                  |

共享 `ModelMaxBudgetField` 另行屏蔽整个区块，覆盖 Key、用户、团队和默认成员预算，不依赖当前是否有 Enterprise 许可证。成员编辑表单的附加字段恢复社区完整展示，不受上述字段屏蔽影响，单模型预算仍受原许可证校验约束。独立 `PremiumLoggingSettings` 同样不展示付费介绍或配置

`max_budget`、`budget_duration`、`tpm_limit`、`rpm_limit`、模型选择、供应商 `api_key` 等认证字段不在上述屏蔽列表。`team_id`、`access_group_ids`、`model_access_group` 继续保留

| 表格或筛选              | 修改                                                                            |
| ----------------------- | ------------------------------------------------------------------------------- |
| 共享表格                | 隐藏 `organization_id`、`organization_alias` 列                                 |
| Key、模型、日志列表     | 隐藏 `project_id`、`request_tags`、`tags`、`end_user` 列                        |
| 员工 Key 列表           | 另隐藏 `user_id`、`user`、`user_email` 列                                       |
| 员工模型列表            | 另隐藏 `litellm_credential_name`、`input_cost`、`actions` 列及对应管理展示      |
| 共享筛选抽屉            | 隐藏 Organization 筛选                                                          |
| Key、模型、日志筛选抽屉 | 另隐藏 Project、End User、Tags、Cache、Credential、Span Type、Request Type 筛选 |

列过滤发生在创建表格实例之前，显示列菜单不能重新勾出被屏蔽的列。筛选抽屉当前按原始英文标签识别，翻译仅发生在显示层。社区改标签或调整国际化接入点时必须复查

## 实现位置与数据保留

| 文件或目录，相对 dashboard                                                                          | 与社区源码的差异                                                                                                             |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/utils/liteUi.ts`                                                                               | 集中定义页面白名单、角色范围、隐藏页签、字段、列                                                                             |
| `src/contexts/LiteUiContext.tsx`                                                                    | 轻量版上下文、页面边界、`LiteUiMask`                                                                                         |
| `src/app/layout.tsx`                                                                                | 在原 AuthProvider 内挂载轻量版边界                                                                                           |
| `src/components/leftnav.tsx`、`page_utils.ts`                                                       | 菜单、命令搜索数据源和页面可见性设置的过滤                                                                                   |
| `src/components/ui/tabs.tsx`、`src/hooks/useUrlTab.ts`                                              | 屏蔽页签触发器和内容，处理已有 URL 选中隐藏页签的情况                                                                        |
| `src/components/shared/form/FormField.tsx`、`common_components/MountedFormField.tsx`                | 共享表单字段屏蔽，保留注册和已有值                                                                                           |
| `src/components/shared/DataTable/DataTable.tsx`、`DataTableFilterDrawer.tsx`                        | 列、列选择器和筛选区块过滤                                                                                                   |
| `src/components/DashboardHeader.tsx`、Home 的 `HomePage.tsx`                                        | 入口和非核心区块屏蔽                                                                                                         |
| `src/components/organisms/create_key_button.tsx`、`templates/key_edit_view.tsx`                     | Key 类型、所有者和高级表单区域屏蔽                                                                                           |
| `src/components/templates/KeyInfoHeader.tsx`、`key_info_view.tsx`                                   | Key 重新生成按钮及详情展示区块屏蔽                                                                                           |
| Models 下的 `page.tsx`、`AllModelsTable.tsx`、`ModelsTableColumns.tsx`、`LlmCredentialsPanel.tsx`   | 模型管理权限展示、表格和非核心面板                                                                                           |
| 访问组下的 `AccessGroupCreateDialog.tsx`、`AccessGroupEditModal.tsx`、`AccessGroupsDetailsPage.tsx` | 复用集中页签过滤，创建、编辑和详情保留模型配置，编辑不清空隐藏授权                                                           |
| `src/components/model_info_view.tsx`、`add_model/AddModelForm.tsx`                                  | 员工端管理区块和 Team-BYOK 控件屏蔽                                                                                          |
| Usage 下的 `UsagePageView.tsx`、`UsageViewSelect.tsx`                                               | 非核心统计和查询入口屏蔽                                                                                                     |
| `src/components/key_team_helpers/ModelMaxBudgetEditor.tsx`                                          | 共享单模型预算字段区块屏蔽                                                                                                   |
| `src/components/common_components/PremiumLoggingSettings.tsx`                                       | Key 和团队独立日志的付费介绍及控件屏蔽                                                                                       |
| `src/components/Teams.tsx`、`team/TeamInfo.tsx`、`team/EditMembership.tsx`                          | 团队日志与预算展示屏蔽，成员添加和编辑保留完整角色及附加字段                                                                 |
| `src/components/object_permissions_view.tsx`                                                        | 轻量版不挂载资源权限概览，覆盖团队概览与设置详情及复用位置                                                                   |
| `src/app/(dashboard)/users/_components/user_edit_view.tsx`、`view_users/user_info_view.tsx`         | 隐藏用户 MCP 配置与展示，普通用户配置保存不提交 MCP 授权                                                                     |
| `src/app/(dashboard)/access-groups/_components/AccessGroupsTableColumns.tsx`                        | 轻量版资源数量仅展示模型，已有 MCP、智能体和技能授权不变                                                                     |
| `src/components/logs/request/RequestLogsFilters.tsx`                                                | 保留公开模型查询及原后端参数，轻量版不展示搜索工具专属文案                                                                   |
| `src/components/settings.tsx`、`alerting/dynamic_form.tsx`、`email_settings.tsx`                    | 默认告警页签、企业告警行和邮件品牌字段屏蔽                                                                                   |
| `src/components/router_settings/RouterSettingsForm.tsx`                                             | 高级路由区块屏蔽                                                                                                             |
| AdminPanel 和 `src/components/Settings/AdminSettings/UISettings/UISettings.tsx`                     | 管理设置默认页签和隐藏功能开关、关联入口。`TeamAdminEditableFieldsSettings.tsx` 另外隐藏 Projects 权限复选框，保留已有选择值 |
| `eslint-suppressions.json`                                                                          | 随本分支既有 lint 清理收紧基线，不放宽规则                                                                                   |
| 对应测试文件                                                                                        | 菜单、搜索、路由、表单值保留、页签、表格及付费控件行为回归                                                                   |

`LiteUiMask` 和共享字段用 `hidden` 与 `display:none` 隐藏区块，通常保留子组件挂载，避免表单编辑把原来存有的配置清空。屏蔽的页签内容则不渲染，即使有 `keepMounted` 或旧 URL 参数也不展示

共享字段对必填项和当前校验错误保留原有保护。例如 Team Admin 添加模型仍需要的团队作用域不能隐藏，否则原表单无法提交。团队成员表单保留原始角色选项和默认值，编辑时不会强制改写已有角色

隐藏字段的已有值可能继续随原表单提交，或按社区原有 diff 逻辑不发送未改动字段。这不负责撤销已经启用的后端能力。若需要停用配置，必须另外评估并授权相应的数据或后端修改

团队和密钥在轻量版中保存普通配置时，不再重算或提交隐藏的资源授权。用户编辑也不提交 MCP 授权字段，避免改名、改预算时覆盖已有授权，或被不可用的 MCP 目录阻塞。资源权限概览不渲染，创建团队的资源折叠区和编辑团队的对应字段整体屏蔽，模型、预算、限流及成员 Admin/User 角色继续保留

历史请求的实际类型、费用、模型响应和原始 JSON 继续保留，不按资源类型删除或漏算记录。日志中的公开模型筛选保留原查询字段，仅移除搜索工具专属文案。模型本身的工具调用参数不参与屏蔽。前端隐藏不会停用后端能力，已有配置、访问组授权、密钥或外部客户端仍可能发起相关请求

## MoMA 主题与国际化

控制台使用左侧分组导航。桌面分为模型服务、用量与配额、访问控制和系统设置，顶部保留品牌、语言、搜索、主题、状态和账号。访问控制与系统设置直接复用社区菜单的对应分组，前者包含团队、用户管理、访问组和预算，后者包含路由设置、日志与告警、系统设置和界面主题。小于 1100px 时将同一份导航放入抽屉。菜单数据、角色判断、用户页面设置和页面白名单继续复用社区过滤函数，未新增管理员权限或放开已屏蔽页面。员工仅在访问控制中看到原有团队入口，没有可见设置项时不显示系统设置分组

默认品牌在控制台页头、窄屏导航、登录、开通账户、加载页和账户菜单中为纯文字 MoMA 轻量版。管理员可在界面主题配置普通、深色 Logo 和浏览器图标的 HTTP(S) 地址。页头和登录页通过 `MomaBrand.tsx` 显示已配置 Logo，深色标志缺失或加载失败时使用普通标志，全部不可用时显示默认文字。`ThemeContext.tsx` 同步图标预览与恢复默认，配置字段、保存接口和权限保持原实现，未新增文件上传入口。页面标题同时更新。供应商标识、模型名称和技术参数保留原值。保留页面的社区推广与文档链接按下述品牌清理规则移除

浅蓝灰背景、白色侧栏与卡片、蓝紫色强调色集中在 `src/app/moma-theme.css`，同时保留深色模式。当前统一规范记录在 [DESIGN.md](DESIGN.md)，后续调整样式应先核对该规范。字号继续为相邻 1.5 倍的 `47.25 / 31.5 / 21 / 14px` 四档，页面标题和核心指标为 31.5px，区块标题、弹窗标题及桌面品牌为 21px，普通正文、模型名称、导航、表格和控件统一为 14px。47.25px 仅保留为确有需要时使用的展示档。桌面页头高 56px、侧栏宽 208px、内容内边距 20px。模型卡片按最小 240px 自动排布，间距 12px、内边距 16px，手机保持单列和导航抽屉

字号从 `--moma-text-caption` 的 `0.875rem` 逐级乘以 1.5，映射 Tailwind 与已有固定字号类，以上像素值按默认根字号 16px 计算。继续使用系统中文字体、rem、原有中英文切换和人民币单位。原顶部导航的窄桌面压缩规则已删除，避免与新侧栏叠加

表格高度继续随内容结束，保留列调整、排序、筛选和横向滚动。侧栏占用宽度后，部分桌面宽度下也需要横向滚动查看完整密钥表格，未为适配外观删掉原有可用字段

实体名称下钻统一复用 `shared/table_cells/identity_cell.tsx`。有点击回调或真实链接时，名称默认使用主色并常显右箭头，悬停增加浅色背景与名称下划线，键盘聚焦显示内侧 2px 主色边框与下划线。副标题、ID、状态和纯文本保留原有展示，不改变下钻目标、角色权限、修饰键新标签页或表格其他操作。影响团队、用户、密钥和关联实体列，以及复用该组件的模型、凭据、健康检查和访问组等列表，不恢复已屏蔽的页面。`team/TeamVirtualKeysTable.tsx` 的密钥别名也使用此组件，打开与原 Key ID 相同的密钥详情

`shared/table_cells/UserPopoverCell.tsx` 的悬停卡片触发容器保留列宽限制，移除会裁掉关联用户链接焦点边框的额外 overflow 裁切，名称省略继续由 IdentityCell 和表格单元格负责

普通桌面控件和分页设为 32px，手机主要控件保留 40px，抽屉导航项保留 44px。表头为 36px，数据单元格上下内边距 8px、行高 20px，多行内容自然增高。卡片使用统一的 16px 内边距、12px 圆角和单层边框。页面区块间距 16px、操作组间距 8px、字段间距 16px，清理重复的页面内边距。模型开通、权限、查询、原始字段及接口逻辑不变

密钥表格在 `VirtualKeysPage/keyTableColumns.tsx` 使用原 `ModelsCell` 的 `maxVisible` 参数，默认显示 1 个模型及剩余数量，避免窄列中的多个标签将整行撑高。其余模型继续通过原提示和密钥详情查看，不修改 Key 的 models、模型权限或接口提交值。对应表格测试同步检查首项和剩余数量，未修改共享 ModelsCell 的默认行为

共享表格的工具栏、状态标记和分页一并应用主题。分页显示总条数和当前页码，完整结果范围与总页数继续提供给读屏工具，翻页和每页条数回调不变。中文日期与相对时间使用中文显示，英文使用英语日期和相对时间，原始时间戳不变。这些是展示调整，原有创建、编辑、筛选、排序、分页和弹窗操作继续使用原实现

| 实现位置，相对 dashboard                                                                                                                                                                                                                                                                                                    | 维护内容                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `src/components/MomaNavigation.tsx`、`DashboardHeader.tsx`、`src/app/(dashboard)/layout.tsx`                                                                                                                                                                                                                                | 左侧分组导航、顶部账号入口、窄屏同源抽屉               |
| `src/app/moma-theme.css`、`src/components/shared/PageHeader.tsx`、`DataTable/DataTable.tsx`                                                                                                                                                                                                                                 | 主题令牌、页面留白、密钥页操作区、表格高度与样式作用域 |
| `src/components/VirtualKeysPage/keyTableColumns.tsx`、`src/components/shared/DataTable/DataTablePagination.tsx`、`src/components/shared/table_cells/status_badge.tsx`、`date_cell.tsx`                                                                                                                                      | 默认列宽、分页展示、状态标记与日期格式                 |
| `src/contexts/LocaleContext.tsx`、`src/i18n/translate.ts`、`src/i18n/zh-CN.json`                                                                                                                                                                                                                                            | 中英文切换、词典与参数插值、未知文案回退               |
| `src/components/LanguageSwitcher.tsx`、`src/contexts/TerminologyContext.tsx`、`src/app/layout.tsx`                                                                                                                                                                                                                          | 语言切换按钮、现有术语层接入、默认中文和 HTML lang     |
| `src/components/ui/` 中的 input、textarea、button、combobox、select、label、field、tabs、dialog、alert-dialog、card、sheet                                                                                                                                                                                                  | 标签、提示、占位符和无障碍文案的显示层翻译             |
| `src/components/shared/` 中的 PageHeader、DataTable、CopyButton、MultiSelect、advanced_date_picker、chart_loader、CreatedKeyDisplay、form/LabelWithHint、table_cells                                                                                                                                                        | 表头、分页、状态、日期与常用交互文案                   |
| `src/app/(dashboard)/` 下 home、api-keys、models-and-endpoints、usage、users、teams、access-groups、budgets、logs、admin-panel                                                                                                                                                                                              | 保留页面的静态中文文案                                 |
| `src/components/` 下 UsagePage、Teams、TeamsPage、team、organisms/create_key_button、templates/key_info_view、templates/key_edit_view、model_info_view、CreateUserButton、bulk_create_users_button、settings、router_settings、email_settings、Settings/AdminSettings/UISettings、Settings/AdminSettings/UserBannerSettings | 保留表单、详情与管理区域的界面文案                     |
| `src/components/CommandPalette/CommandPaletteTrigger.tsx`、`ThemeToggle/ThemeToggle.tsx`、`DeploymentHealth/DeploymentHealth.tsx`、`common_components/budget_duration_dropdown.tsx`                                                                                                                                         | 紧凑搜索入口、主题切换、告警标题、预算周期的界面文案   |
| `src/app/login`、`src/app/onboarding`、`src/app/(dashboard)/change-password`、leftnav、navbar、SidebarAccountMenu、common_components/LoadingScreen                                                                                                                                                                          | 文字品牌与账户流程文案                                 |

`src/app/(dashboard)/ui-theme/UIThemeSettings.tsx`、`src/components/MomaBrand.tsx`、`DashboardHeader.tsx`、`src/app/login/LoginPage.tsx` 和 `src/contexts/ThemeContext.tsx` 负责主题配置与品牌展示，`SSOSettings/`、`SCIM.tsx`、`AdminPanel.tsx` 和 `liteUi.ts` 负责恢复身份配置入口及中文显示

共享组合框通过 `dismissLabel` 将屏幕阅读器关闭按钮接入词典，中文为“关闭”，语言切换时同步更新。`scripts/localize-base-ui.mjs` 在安装依赖和构建前为固定版本 `@base-ui/react@1.6.0` 应用最小补丁，覆盖 ESM、CommonJS 和类型声明。补丁保留原关闭事件与焦点管理，不扫描或改写 DOM。依赖版本或补丁锚点不匹配时停止安装或构建，升级前须核对补丁及共享组合框回归

英文源码文案作为词典键，中文词典位于一个 JSON 文件。`LocalizedText` 只翻译显式包裹的界面字符串，不扫描或改写 DOM，不递归翻译用户数据。字段的 name、选项 value、请求参数、模型 ID、用户邮箱和密钥值保持原样。模型通配选项、角色选项等只翻译显示标签，提交值保持原值

语言偏好保存在浏览器 `moma.locale`，不发送到后端。支持 `zh-CN` 与 `en`，默认中文，刷新时恢复已保存语言。语言切换不重新挂载页面或表单。日期显示可以本地化，时间戳和时区语义保持原逻辑。货币标识默认人民币，金额数值和接口提交值保持原样

未知文案仍有英文回退机制，不能把回退作为新增界面文案的验收结果。普通说明、状态、选项、帮助与反馈使用中文。模型名称、供应商名称、用户输入、接口标识、原始模型响应、API 错误详情、JSON 和代码示例保留原文。社区新增或修改界面文案时，需要同步补充词典和渲染位置，不能把中英文字符串用于权限、路由或筛选条件判断。已有组织等字段屏蔽仍以原始字段名和英文配置标签为依据，翻译发生在显示层之后

## 模型服务控制台与一键开通

首页改为工作台，展示原有最近 7 天实际花费、请求数、Token、平均费用与延迟，以及同一接口数据的 Token 趋势。没有改成当月统计或预计费用。另展示可用模型入口和使用指引，不提供账户钱包、订单、支付、退订、Token Plan、智能路由、模型排行榜或 Token 计算器。模型体验和工具管理继续按原裁剪策略隐藏

模型页的员工默认视图为卡片，管理员默认仍为配置列表，两者均可切换卡片或列表。视图切换仅为当前组件的展示状态。搜索、团队、查看范围、排序、筛选和分页仍由 `AllModelsTab` 的原 nuqs 状态及服务端查询管理，列表视图保留完整的原有筛选与列操作，切换视图不清空筛选。卡片和开通参数复用社区的团队公开模型名称解析，保留团队别名。卡片沿用真实模型名、供应商标识、可用上下文参数和暂停状态，不补造模型介绍、价格、销量或排名

“开通”是新的前端快捷交互，复用 `POST /key/generate`。员工点击后，为当前用户及所选个人或团队范围创建一个 `llm_api` Key，`models` 只包含所选具体模型，不提交空模型列表或通配权限，不新增订单、开通记录、审批接口或数据库字段。授权模型仍取自现有 `/models` 接口，预算、限流、团队及用户权限由原后端校验。禁用非管理员个人 Key 创建时需要选择有权使用的团队，管理员仍遵守原有角色边界

开通状态来自当前用户在所选范围的有效 Key。先读取全部 Key 列表分页，排除停用、删除、过期、管理型、只读型和被停用团队的 Key，已有 Key 覆盖所选模型时直接显示已开通及立即使用。已有全模型 Key 会使其覆盖的模型直接显示已开通，不制造另一份独立订购状态。访问组等间接授权不能从 Key 模型列表确认时，不推断为已开通，实际调用权限继续由后端决定

成功后展示新 Key、模型名和网关 Base URL，完整 Key 只放在当前结果弹窗的 React 状态中，关闭后清除，不写入浏览器存储、URL、截图或文档。已有凭证入口只使用原 Key 列表返回的标识。单个页面内用请求锁防止连续点击重复创建，未新增跨标签页或服务端幂等保证。响应不符合预期时提示先查看 API 密钥结果，失败不伪造成功

开通只完成原生凭证配置，不代表上游服务已实际连通或调用成功。暂停模型和用户尚无权限的模型不能使用此快捷入口，后端拒绝时沿用错误反馈，不绕过管理员权限或许可证

| 实现位置，相对 dashboard                                                                     | 当前差异                                                                                                                                    |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/MomaNavigation.tsx`、`DashboardHeader.tsx`、`src/app/(dashboard)/layout.tsx` | 分组侧栏、精简页头、桌面与抽屉共用菜单及社区可见性判断                                                                                      |
| `src/app/moma-theme.css`                                                                     | 控制台布局、蓝紫色令牌、卡片、响应式尺寸与保留的字号阶梯                                                                                    |
| `src/app/(dashboard)/home/_components/HomePage.tsx`                                          | 真实 7 天概览、趋势、可用模型入口和指引，删除原首页已隐藏的新闻与榜单渲染及其请求                                                           |
| Models 下的 `page.tsx`、`components/AllModelsTab.tsx`、`AllModelsTable.tsx`                  | 模型广场文案、角色默认视图、复用原查询的卡片与列表切换                                                                                      |
| `src/components/ModelCatalog.tsx`、`modelAccess.ts`                                          | 有效凭证匹配、原生创建 Key 的快捷开通及结果展示                                                                                             |
| `src/app/(dashboard)/hooks/keys/useKeys.ts`                                                  | 无限分页与普通 Key 列表共用原查询命名空间，以额外键区分响应结构。原有创建、编辑、删除和停用的缓存失效同步刷新开通状态，无接口参数或响应变更 |
| `src/i18n/zh-CN.json`                                                                        | 新导航、卡片、开通成功与失败提示的中文                                                                                                      |
| 对应导航、页头、布局、首页和模型测试                                                         | 按当前裁剪版显示行为更新过时预期，新增开通成功、拒绝、重复点击和范围约束测试                                                                |

合并社区版本时核对 Key 模型通配符与空列表含义、Key 类型、生命周期状态、个人 Key 设置、团队模型范围、用户归属和分页字段。若社区调整凭证列表结构或 `/key/generate` 的必填字段，同步修改快捷开通及其测试，不以新增后端兼容接口绕开原策略

## 人民币单位

界面货币单位默认人民币。金额符号使用 `¥`，中文单位使用人民币，英文单位使用 `CNY`。语言切换不会改变币种，不新增汇率、换算、货币切换或金额迁移

花费、预算、模型价格、单次成本、图表坐标与提示、表单单位和金额导出表头统一更新。输入 150.75 仍按 150.75 提交，现有预算 10 仍显示为 ¥10.00。零值、精度、小额阈值、负数、预算比率和上限校验保留原实现。用户输入、模型标识、API 字段名、原始 JSON 和外部数据不会被全局替换

这是前端单位标识调整。数据库、成本计算、模型费率、供应商账单、后端 API 及其社区 USD 说明没有修改，历史数值也没有重新计价。使用内置美元费率时，本次不会将其数值换算成人民币，真实成本口径需要由实际配置的模型价格保证

| 实现位置，相对 dashboard                                                                                                                                                                                                    | 修改内容                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/utils/dataUtils.ts`、`src/components/UsagePage/utils/value_formatters.tsx`、`src/app/(dashboard)/cost-optimization/_components/costOptimizationUtils.ts`                                                               | 公共金额、小额阈值、每秒成本、图表和节省金额格式器使用人民币符号。最后一个模块也被用户详情等保留页面复用 |
| `src/components/shared/table_cells/`、`BudgetPeriodTooltip.tsx`、`InheritedBudgetHint.tsx`、`shared/charts/chart_tooltip.tsx`                                                                                               | 表格、预算提示、继承预算和图表金额显示                                                                   |
| `src/components/organisms/create_key_button.tsx`、`templates/key_info_view.tsx`、`key_edit_view.tsx`、`key_team_helpers/`                                                                                                   | 密钥创建与编辑的 CNY 标签、明细、预算输入占位与提示，提交逻辑不变                                        |
| `src/components/Teams.tsx`、`TeamsPage/`、`team/`、`src/app/(dashboard)/users/_components/`、`budgets/_components/`                                                                                                         | 团队、成员、用户和预算的金额、表单标签、CSV 表头                                                         |
| `src/app/(dashboard)/models-and-endpoints/components/`、`src/components/molecules/models/ModelPricingSummary.tsx`、`ModelInfoEditForm.tsx`、`add_model/advanced_settings.tsx`、`common_components/check_openapi_schema.tsx` | 模型价格显示、访问组预算、费率单位与预算占位                                                             |
| `src/components/UsagePage/components/`、`activity_metrics.tsx`、`per_user_usage.tsx`、`src/app/(dashboard)/usage/_components/components/`、`router-settings/_components/general_settings.tsx`                               | 用量卡片、排名、图表、导出金额标签与配置金额符号                                                         |
| `src/components/logs/`                                                                                                                                                                                                      | 请求费用、分类器费用与成本明细。既有审计抽屉的金额文字也同步，审计入口仍屏蔽                             |
| `src/i18n/zh-CN.json`、`translate.test.ts` 与对应组件测试                                                                                                                                                                   | 人民币翻译、英文 CNY 标签，以及输入数据不被翻译的回归验证                                                |

后续合并时要检查新增的金额格式器、写死的美元符号、USD 单位、预算占位、图表提示和导出表头，保留对原始数据与代码示例的边界，不做全局字符串替换

## 布局与本地化补充

首页与用量的概览指标采用五列，平均花费和平均延迟分别展示，数值顶部对齐。首页趋势图高 160px，区块与面板内边距为 12px，可用模型仍只展示原授权接口返回的前三项。用量页的供应商与用户排行位于第一行，密钥排行与 API 路径请求量位于第二行，1100px 以上双列对齐。普通概览图高 256px，compact 图表高 224px，金额列沿用 numeric 元数据右对齐

共享 Page 和 PageHeader 统一页面标题与内容边界，详情页移除重复缩进并允许动作换行。模型参数和默认用户设置采用两列网格，错误指标为标签预留一致高度。创建密钥和团队弹窗宽 800px，保留窄屏内部滚动、字段顺序、校验和提交处理。日期控件使用 compact 展示及独立面板宽度，InputGroup 内输入跟随外框高度，不改变查询状态或日期语义

共享表单通过 `LocaleContext.LocalizedLabel` 显示标签，中文不附带括号英文参数名，英文模式保留原标签。表单字段注册、必填校验、隐藏值及请求键保持原实现，用户输入中的括号和英文不会被清理

命令面板的首次提示、标题、分组、动作、类型、快捷键说明和中文搜索使用现有词典。密钥及日志筛选同时翻译选项与选中值，筛选仍提交原枚举。密钥、模型及用户详情的占位值、预算周期、凭据状态、每日与每周图表日期均按当前语言显示，金额数值和时间戳不变

预算创建与编辑共用 `budgets/_components/BudgetFormFields.tsx`。重置周期下拉项和选中值显示为“总计、每天、每周、每月”，词典补齐 `per day`、`per week`、`per month`，英文模式保留原文。提交值仍为 `null`、`24h`、`7d`、`30d`，不改变预算重置规则或已有数据

批量邀请的说明、CSV 校验、预览与结果提示，默认用户的角色和预算周期，模型模式、身份联合认证、路由分组和回退配置均使用中文显示。模型模式保留协议路径，角色、模型、周期、认证来源和路由策略仍提交原始值。模板列名与用户自定义名称不翻译

用户详情的节省与自动路由用量补齐统计卡片、计算说明、缓存类别、空状态和日期。共享资源选择器、图表与用量排行补齐空状态，费用明细、复制操作、排序及筛选移除按钮补齐辅助名称。部署告警的忽略和暂缓时间按当前语言显示，不改变时间点和操作人标识

SMTP、邮件事件、动态告警参数和日志设置接入现有翻译。事件 ID、参数键、原输入和仅提交修改字段的逻辑保留。`getLocale` 为非 React 操作反馈提供当前语言，已知界面提示与校验使用翻译，真实异常通过 `toast.fromError` 提供中文概要并保留技术详情。登录页只额外翻译词典内已知的凭据错误，不改后端响应，其他未知错误继续显示原文

| 实现位置，相对 dashboard                                                                                                                                                          | 维护内容                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `src/components/shared/Page.tsx`、`PageHeader.tsx`、`src/app/moma-theme.css`                                                                                                      | 页面对齐、详情、表单、控件与弹窗密度            |
| 首页 `HomePage.tsx`、用量 `overview/UsageStatStrip.tsx`、`Primitives.tsx`、`UsageOverview.tsx`                                                                                    | 概览指标、趋势和统计面板排布                    |
| `src/contexts/LocaleContext.tsx`、共享 `FormField.tsx`、`MountedFormField.tsx`、`LabeledField.tsx`                                                                                | 中文标签、注册值与语言切换边界                  |
| `src/components/CommandPalette/`、`VirtualKeysPage/VirtualKeysTable.tsx`、`logs/request/RequestLogsFilters.tsx`                                                                   | 首次提示、中文搜索、状态筛选与空状态            |
| `src/components/logs/detail/`、`templates/key_info_view.tsx`、`key_edit_view.tsx`、`ModelInfoEditForm.tsx`、用户 `user_info_view.tsx`                                             | 详情占位、人民币、角色、日期、请求说明与字号    |
| 用量 `overview/UsageBreakdownChart.tsx`、`overviewData.ts`、`shared/advanced_date_picker.tsx`                                                                                     | 图表刻度、提示与日期面板本地化                  |
| `src/components/email_events/email_event_settings.tsx`、`email_settings.tsx`、`alerting/dynamic_form.tsx`、`Settings/AdminSettings/LoggingSettings/LoggingSettings.tsx`           | 邮件、告警及日志设置文案，原参数提交不变        |
| `src/components/bulk_create_users_button.tsx`、`BulkUserTemplateColumns.tsx`、用户 `default-user-settings/`                                                                       | 批量邀请与默认用户选项，原 CSV 列名和提交值保留 |
| `src/components/ModelSelect/`、`shared/SearchSelect.tsx`、`model_add/FederationFields.tsx`、`add_model/AddModelForm.tsx`、`routing_groups/`、`Settings/RouterSettings/Fallbacks/` | 模型、资源、认证与路由弹窗的选项和说明          |
| `src/components/shared/ScopedSavingsTab.tsx`、`SavingsTiles.tsx`、`SummaryCard.tsx`、`shared/charts/`、用户复用的 `cost-optimization/_components/`                                | 节省、路由用量和图表条件内容，日期和费用单位    |
| `src/components/shared/CopyButton.tsx`、`shared/DataTable/`、`ui/sonner.tsx`                                                                                                      | 复制、排序、筛选及通知辅助名称                  |
| `src/lib/toast.ts`、`src/app/login/LoginPage.tsx`、`src/i18n/zh-CN.json`                                                                                                          | 操作反馈、已知登录错误与词典                    |

## 品牌文案与系统资源显示名

顶栏不再挂载 Docs、Blog 和社区推广入口。账户菜单移除上游版本徽章、发布说明外链及版本查询，感谢提示使用 MoMA。轻量版通知面板保留组件与空状态，但不查询和展示上游版本发布通知。非轻量版分支保持社区行为

密钥累计花费提示保留历史用量可能未回填的说明，移除上游版本和发布日期并接入翻译。模型新增、详情、凭据复用、连接测试、用户邀请、团队字段帮助和邮件设置移除社区文档或反馈链接，保留字段解释、校验和原操作。模型名称、调用参数、日志处理开销、复制辅助名称、开通成功说明和客户端接入说明使用产品文案

部署健康告警继续展示。已知告警、分组、动作和许可证日期提供中文，保留共享环境密码、缺少 Redis、调试日志等实际风险和配置说明，移除厂商文档和销售联系。忽略、暂缓、恢复与原权限逻辑不变，未知告警继续显示原消息

`src/utils/systemResourceLabel.ts` 只映射下表中的完整系统标识，中英文均有对应名称，不对子串或用户自定义内容做替换。共享 ID、身份及字段单元格，用量标签、排行、图表和日志筛选使用显示名。数据库值、筛选值、点击回调、链接与复制结果仍使用原始标识

| 原始标识                                                                  | 中文显示名   |
| ------------------------------------------------------------------------- | ------------ |
| `litellm-internal-health-check`、`key-hash-litellm-internal-health-check` | 系统健康检查 |
| `litellm_proxy_master_key`、`key-hash-litellm_proxy_master_key`           | 平台主密钥   |
| `litellm-dashboard`                                                       | 控制台团队   |

主要维护位置为 `DashboardHeader.tsx`、`navbar.tsx`、`SidebarAccountMenu/`、`Navbar/NotificationsBell/`、`DeploymentHealth/`、`licenseUtils.ts`、`VirtualKeysPage/keyTableColumns.tsx`、`templates/key_info_view.tsx`、`update_model_credentials_modal.tsx`、`shared/CreatedKeyDisplay.tsx`、`shared/SavingsTiles.tsx`、`SummaryCard.tsx`、`logs/detail/` 和词典

原始 JSON 中的 `use_litellm_proxy` 等键、请求与响应、技术配置、请求头、未知上游错误、静态资源前缀 `/litellm-asset-prefix/`、隐藏功能源码和依赖元数据不做品牌替换，不承诺源码与网络请求中完全没有上游标识

## Docker 与演示数据

| 文件，相对仓库根目录                                         | 用途                                              |
| ------------------------------------------------------------ | ------------------------------------------------- |
| `Dockerfile`                                                 | 从源码完整构建 Python、Rust、Prisma 与 Dashboard  |
| `docker/Dockerfile.lite-ui`                                  | 在已有源码运行时镜像上替换静态 Dashboard 导出物   |
| `docker/docker-compose.lite-ui.yml`                          | 独立 Compose 项目、数据库卷和 localhost 4001 端口 |
| `docker/lite-ui-preview.yaml`                                | 空 model_list，模型及供应商凭据由外部数据库管理   |
| [docker/lite-ui-preview.md](../../docker/lite-ui-preview.md) | 构建、启动、停止及私有配置说明                    |
| [README.md](../../README.md)                                 | 轻量版能力、构建入口、上游来源与许可证说明        |

上述部署文件不是后端裁剪。新数据库需要通过原生模型管理接口配置模型，镜像不内置账户、密钥或数据库中的模型记录。环境文件、数据库备份和上游凭据不加入源码或镜像。界面更新先完成 `npm run build`，再重建 Compose，不能读取尚未完成的静态导出目录

部署示例支持从 main 完整构建运行层，使用独立 Compose 项目及数据库，模型通过原生管理流程配置。具体部署版本、数据卷、供应商接入、账户和调用记录由部署方私有维护，不作为仓库默认状态或公开库存清单。后续重启应沿用对应项目、环境文件和镜像覆盖文件

预览配置将 `general_settings.password_policy_check_breached_passwords` 设为 `false`，仅供本机测试。最少 12 位及其他密码强度要求仍使用原策略，不改变后端默认值。此配置不应作为生产部署模板，实际账户和密码操作不记录在本指南中

完整运行层构建和仅替换静态 UI 是不同操作。UI 或文档发布层可以复用运行层，镜像发布 revision、UI 源码 revision 和运行源码 revision 应分别核对，不能仅凭镜像标签认定后端也来自同一提交

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
| 成员角色                  | 添加和编辑均保留 Admin/User 选项及原始提交值，新增成员默认 User，其他成员配置及许可证限制沿用社区逻辑     |
| 表格及筛选                | 社区新增列 ID、列选择器或修改筛选标签后仍保持屏蔽，清空筛选不会带出隐藏控件                               |
| 告警参数元数据            | `premium_field` 的含义和重置接口索引仍与原配置一致                                                        |
| 关联入口                  | Home、模型详情、Key 详情、设置开关没有留下通往被屏蔽页面的按钮或链接                                      |
| Docker 运行时             | Python 或 Rust 更新后先重建 `litellm-lite-runtime:local`，不能只替换 UI 后声称后端也升级                  |
| 主题与导航                | 侧栏与窄屏抽屉复用同一权限过滤，管理员管理菜单不会遗漏原可用入口，深浅色均可读                            |
| Beta 能力                 | 检索 BetaBadge、[BETA] 等标记，核对新入口、字段和直接链接的屏蔽，不按 beta 字符串过滤 API 协议或模型名称  |
| 中文与数据边界            | 新文案补齐词典，用户输入、API 参数、权限判断与模型 ID 不参与翻译，语言切换不重置表单                      |
| 视觉基准                  | 按 DESIGN.md 与 design-qa.md 重测桌面、中英文、手机和弹窗                                                 |

推荐把上述检查和本文清单一起更新。优先在集中策略或共享组件补规则，只有独立按钮、无共享表单字段的区块才增加就地屏蔽。已整页屏蔽的功能不再逐个改其内部组件

## 验证记录与限制

以下汇总既有实现的验证结果，保留影响维护判断的覆盖与失败，不将各轮重叠用例相加，也不代表当前提交重新运行了所有检查。具体执行记录与截图保存在仓库外，通用检查范围见 [design-qa.md](design-qa.md)，布局与字号以 [DESIGN.md](DESIGN.md) 为准

### 页面屏蔽与数据保留验证

2026-10-31 定向检查 26 个文件，845 项普通通过、3 项社区已有预期失败。生产构建、TypeScript、静态导出及适用前端检查通过。自动化覆盖菜单、命令搜索、页面白名单、隐藏页签不渲染、隐藏列不可恢复、表单已有值保留、必填作用域、普通告警重置索引及成员角色。管理员与员工浏览器核对核心页面、创建表单和屏蔽页回退，未提交新密钥

### 团队成员分配恢复验证

2026-11-04 恢复成员编辑表单的 Admin/User 角色选项与全部附加字段，成员新增继续使用原有搜索与默认 User 角色。独立源码快照中，成员新增、编辑、成员表格和轻量屏蔽边界 5 个定向文件共 94 项通过，覆盖 Admin 提交、原预算与限额保留及其他表单继续屏蔽。生产构建、TypeScript、58 个页面静态导出和适用前端检查通过，未修改后端授权或许可证校验

本地 4001 应用容器已更新静态前端并重建启动，沿用现有运行层、数据库和私有配置，存活与就绪接口均返回 200，数据库连接正常。浏览器在空演示团队中检查新增成员的 Admin/User 选项、编辑成员的完整配置与未授权时禁用的单模型预算，1280×720 桌面未出现框架错误或控制台错误。演示团队自动包含创建者，未给其他账号添加团队归属或提交角色变更，未运行全量前端、移动端、计费或真实权限变更回归

### 非模型资源屏蔽复核

2026-11-04 复核 MCP、智能体、搜索工具和技能的菜单、直达路由、团队与密钥表单、用户详情和编辑、访问组、用量视图、系统设置及日志展示。补齐团队创建的四个折叠区、团队编辑的资源授权、团队资源概览、用户 MCP 区块、访问组数量标记和共享字段别名，保留模型分配、预算、限流、成员角色及真实历史日志

21 个定向文件共 557 项通过，覆盖资源入口屏蔽、模型和预算提交、已有隐藏授权不重写、MCP 目录失败时普通团队保存、成员角色、访问组编辑、菜单搜索和历史日志。生产构建、TypeScript、58 个页面静态导出和适用前端检查通过，未修改后端 API、鉴权、数据库或许可证规则。一个旧策略字段用例在修改前也失败，已将内部 label 结构查询改为用户可见的输入占位检查，继续验证原角色条件

本地 4001 应用容器已更新并重建启动，就绪接口返回 200，数据库连接正常，沿用原数据库和私有配置。浏览器在 1280×720 桌面核对团队创建、概览和编辑，用户详情和编辑，密钥创建和编辑，访问组创建及日志筛选，所查入口和配置均已隐藏，普通团队保存成功。四个资源管理页面直接访问均显示“当前版本不提供此页面”，模型与预算控件和历史请求行保留，检查结束时未捕获控制台错误或警告。合并版本另用员工账号登录，核对首页、模型、密钥、用量、团队五个页面，以及创建密钥、通知和账户菜单，所查中文文案与角色范围正常，结束后恢复管理员会话。未运行全量、移动端、真实模型调用或计费回归，前端屏蔽不阻止已有配置和外部客户端继续产生相关调用及费用

### 人民币单位验证

2026-11-01 的金额回归中，格式、精度、预算输入与原值提交、模型价格、导出表头及双语单位用例通过。`UsagePageView.test.tsx` 的 12 项失败涉及已屏蔽视图，在修改前基线也失败。生产构建与适用前端检查通过，不能据此声明完整测试集全绿。浏览器确认中英文币种标签与输入值保留，未核对供应商结算

### 模型服务控制台验证

2026-11-01 定向 12 文件、196 项通过，覆盖开通去重、后台拒绝、角色与团队范围、模型别名、有效凭证匹配、完整分页和密钥变更后的状态刷新。构建与前端检查通过。浏览器核对管理员、员工、双语、卡片和列表、搜索及移动抽屉，开通写操作由网络边界测试验证，未在浏览器提交真实创建

### 访问控制与系统设置分组验证

2026-11-01 导航、页头及布局 4 文件、19 项通过，管理员访问控制与系统设置菜单、员工团队入口、页面限制和语言切换均有覆盖。构建及前端检查通过，浏览器另核对双语与移动抽屉，没有改变后端授权

### 14px 最小字号验证

2026-11-01 生产构建与前端检查通过，浏览器覆盖管理员、员工、表格、卡片、表单、用量及 390px 窄屏，所查文字不小于 14px。后续统一设计调整了字号角色，当前应核对 DESIGN.md，不能沿用旧截图中的导航和标题字号

### Beta 与中文补齐验证

2026-11-01 的定向回归覆盖 Beta 旧链接回退、其他 URL 参数保留、组织字段、翻译数据边界、日期、金额和操作反馈。构建与适用前端检查通过。`make check` 当时被本机旧版 uv 的锁文件解析阻塞，改用 `scripts/pre_commit_lint.sh` 完成适用前端检查，未将后端检查记为通过。浏览器核对两种角色、保留管理页面和手机创建表单，未提交资源变更

### 统一设计规范验证

2026-11-02 定向回归覆盖布局、模型权限、页签、日志、用户、首页、日期和用量组件，构建与适用前端检查通过。浏览器检查 12 个保留主页面、桌面与窄桌面、管理员及员工、英文和深色，核对标题边界、控件高度、内部滚动与表单输入，没有运行完整前端套件

### 列表下钻入口验证

2026-11-04 将实体名称入口统一为主色名称、常显右箭头、悬停背景与下划线、键盘焦点边框，团队内密钥别名打开原密钥详情。7 个定向文件共 181 项通过，另有 1 项既有会话团队品牌文案断言失败，在修改前的 `64261369dd` 基线也失败，未修改该无关断言。覆盖实体点击、真实链接与修饰键、团队和用户详情入口、密钥别名及 Key ID 选择同一记录，以及同期组合框补丁

生产构建、TypeScript 和 58 个页面静态导出通过，本次 UI 修改的格式、ESLint 与 lint 预算门禁通过。独立源码快照显式执行已有 Base UI 本地化预构建脚本后完成构建。完整合并快照另因同期 package 变动触发 API 类型再生成检查，快照缺少代理 Python 依赖，该项未完成，未记为通过，也未因此修改后端或生成类型

本地 4001 应用容器已更新静态前端并重建启动，就绪接口返回 200，数据库连接正常，沿用原数据库和私有配置。浏览器检查 1280×720 桌面的团队、用户和密钥列表，验证名称点击下钻、团队名称回车下钻，以及密钥所属用户链接的完整焦点边框和回车下钻。另核对团队列表的浅深主题、900×900 窄桌面与 390×844 窄屏，名称省略时箭头仍可见，窄屏页面没有整体横向溢出。浏览器缓存旧页面时强制刷新后确认新样式，检查结束时未捕获控制台错误或警告

未在浏览器创建或修改业务记录，团队内密钥别名下钻由组件用例验证，没有对应团队密钥实测样本。未运行全量前端、员工账号、其他复用列表的逐页回归或真实供应商调用，不能据此推断后端授权和计费验收通过

### 首页与对齐验证

2026-11-02 两批定向回归分别为 5 文件 56 项、4 文件 87 项，均通过，构建与前端检查通过。浏览器检查五列指标、两排统计面板、金额对齐、首页首屏、双语、深色及宽窄桌面，没有提交告警或业务记录

### 设置页汉化验证

2026-11-02 的 9 个不同测试文件、117 项通过，验证中文事件与参数标签不改变原事件 ID、SMTP 参数键及告警提交值，语言切换保留输入。构建与前端检查通过。浏览器检查邮件、动态告警、日志与路由设置，未保存配置或发送邮件

### 保留页面复核的验证与限制

2026-11-02 保留页面与共享控件 27 文件、424 项不同用例通过，构建与前端检查通过。另跑的 `AutoRouterBenchmarksTab.test.tsx` 有 14 项旧美元符号断言失败，不能记为通过。浏览器检查管理员 12 个主页面、18 个页签、员工 5 个主页面及常用弹窗，实时事件和评估详情没有对应真实样本

首次提示及详情补译的 12 文件、334 项通过，密钥编辑另有 7 项旧标签查找失败，在修改前组件复跑结果相同。移除括号英文参数名的 10 文件、143 项通过，验证中文标签、英文原文、原字段提交与用户输入边界。两轮构建与前端检查均通过，首次提示补译只在浏览器复核登录错误，未将组件覆盖描述为登录后全站实测

### 预算周期汉化验证

2026-11-04 的创建、编辑、预算表格与词典 4 个定向文件共 42 项通过，新增回归验证中文选项、已有周期回显及原周期值提交。补词条前，4 项新增回归均失败，已有英文用例的可读名称按当前控件标签同步修正。生产构建、TypeScript 与静态导出通过，未修改后端、周期计算或真实预算记录

### 弹窗、选项与空状态汉化验证

2026-11-04 的 17 个不同定向文件共 319 项用例最终通过，覆盖中英文模型选项与原值提交、默认用户周期与团队角色、批量邀请 CSV 校验、用户节省和自动路由费用、认证配置、路由、日志、部署告警、图表及资源空状态。生产构建、TypeScript、静态导出和适用前端检查通过，未运行完整前端套件

浏览器走查管理员 12 个保留页面和员工 5 个页面，发布后再次核对新增翻译入口。检查下拉选项、创建与编辑弹窗、用户和模型详情、通知、账户、成功与失败日志、空用量及屏蔽页回退，实测累计花费与响应缓存悬停。没有在浏览器保存业务记录、发送邮件或调用供应商；批量导入结果、未配置的认证来源及缺少用户 ID 等条件由组件用例或源码补核

### 主题与身份设置恢复验证

2026-11-04 的 23 个不同定向文件、266 项最终通过，覆盖管理员入口、员工路由限制、中英文主题字段、原 URL 与 SSO 角色值提交、SCIM 路由限制、Logo 深浅色与失败回退、图标恢复默认、SSO 加载及空状态、带图标的条件按钮和图标无障碍说明。`common_components/DeleteResourceModal.tsx` 的取消与删除状态及 `molecules/logo/Logo.tsx` 的替代文字复用语言上下文，资源值和供应商名称保持原样。空白分隔线回归在原源码上失败，原先显示 6 条分隔线，修改后仅保留 2 条可见分区线。生产构建、TypeScript、静态导出和适用前端检查通过，未运行完整套件。后端接口未修改，未执行实际身份提供方登录、SCIM 用户同步或真实令牌创建，不能将入口开放视为企业能力授权

浏览器实测管理员入口、主题字段、普通与深色 Logo 实时预览、SSO 空状态和提供方与角色映射选项、SCIM 中文配置及授权提示，另核对 390×844 窄屏表单和导航抽屉。仅修改未提交的预览值，检查后恢复原值与浅色主题，未保存认证配置或创建真实访问令牌

### 组合框关闭文案验证

2026-11-04 的共享组合框及四类选择器 5 个定向文件、56 项通过，覆盖单选和多选的两个关闭按钮、打开时切换语言及关闭后不改变选值。使用原版依赖包验证首次补丁、重复执行、版本不符与锚点失配保护。隔离已提交代码快照的生产构建、TypeScript 和静态导出通过，未包含其他任务未提交的改动。前端格式、ESLint 和预算检查通过，API 类型再生成检查因缺少 Python 代理依赖未完成。浏览器确认管理员创建密钥弹窗的两个读屏关闭按钮均显示中文，Esc 可收起下拉；员工登录凭据被拒绝，本轮员工浏览器复测未完成

### 品牌与条件内容验证

2026-11-03 最终定向回归 19 文件、475 项通过、4 项既有预期失败。模型详情的 PTU 零价格断言在修改前后均失败，旧断言父节点只含标签，未将其记为通过。构建与适用前端检查通过，未放宽规则或预算

浏览器重新走查管理员 12 个保留主页面和员工 5 个主页面，检查账户、通知、命令面板、模型详情和凭据、密钥创建与详情、用量、成功与失败日志、团队、用户、访问组、预算、路由和告警设置，实测累计花费悬停及屏蔽页回退。未知地址与 404 在页面白名单后显示当前版本不可用。未触发的创建成功说明、缺少日志数据、版本更新与许可证状态由定向用例或源码检查补核，不能称为全部真实条件均已触发

### 访问组资源页签验证

2026-11-03 的 5 个定向文件、116 项通过，覆盖创建仅基本信息与模型、编辑保留隐藏授权、详情和强制选中隐藏页签。构建、TypeScript、静态导出与适用前端检查通过。浏览器确认创建弹窗的模型选择和返回后输入保留，未提交创建，编辑与详情来自组件回归

### 全新环境与供应商调用验证

2026-11-03 的完整镜像构建及健康检查通过，两个安装后的后端源码文件哈希与构建提交一致。真实供应商的普通请求与流式请求经本地网关返回 HTTP 200，流式正常结束，日志可查询。浏览器确认管理员登录、模型、测试密钥和请求日志。该次新数据库验收未沿用旧员工会话结论，也未覆盖完整计费、长文本、工具调用或并发。供应商库存、具体测试账户、Token 与费用记录不作为公开部署配置

### 已知限制与后续复核

历史定向回归仍包含已屏蔽用量视图、旧货币或标签断言失败，以及三态 PATCH 表单的既有预期失败，没有通过全套前端测试。员工部分管理员配置请求仍可能返回 403，用量图表加载时曾出现宽高为零警告，未通过放宽权限或隐藏错误解决。访问组空状态已补齐中文。浏览器原生日期按钮的语言由浏览器环境决定，未知供应商动态字段、上游错误及原始 JSON 不承诺翻译

既有验收不包含完整跨浏览器、可访问性、生产 SSO、实际邮件投递、所有模态、供应商账单及持续负载验证。社区升级或功能变更后应重跑受影响测试、构建和角色走查，定向 Vitest 必须传入明确文件，不运行整个前端套件

文档整理只检查 Markdown 格式、相对链接、章节引用和 Git 差异，不据此更新已有测试、构建、浏览器或部署结论
