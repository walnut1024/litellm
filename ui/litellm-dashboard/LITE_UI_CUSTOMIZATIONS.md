# LiteLLM 轻量版前端修改记录

## 用途与基线

这版面向公司内部使用。管理员接入公司采购的模型服务、配置员工权限和预算，员工登录后创建自己的 API Key，通过客户端调用模型

本文件记录轻量分支相对社区源码的完整前端差异，供后续升级和合并时逐项核对。屏蔽清单同时包含企业版能力、实验功能和当前场景不需要的开源功能，不能把这里所有条目都视为企业版功能

本分支的持续维护要求记录在[项目根目录 AGENTS.md](../../AGENTS.md#lightweight-fork-maintenance)，后续修改和社区版本合并均需按该约定核对并同步维护本文件

| 项目               | 当前记录                                        |
| ------------------ | ----------------------------------------------- |
| 记录日期           | 2026-11-03                                      |
| 工作分支           | `main`，保留原 `litellm_lite_ui_masking` 分支   |
| 裁剪前的源码提交   | `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`      |
| 基线提交标题       | `test(router): audit #47498 (#48799)`           |
| 基线源码版本       | `1.109.0`，见根目录 `pyproject.toml`            |
| 轻量版预览         | [localhost:4001/ui/](http://localhost:4001/ui/) |
| 用于对比的原版容器 | `127.0.0.1:4002`，版本 `1.106.6`                |

4002 的镜像和本地源码版本不同，不能把二者的所有页面差异都归因于裁剪。核对自定义修改应使用上表的 Git 提交，而不是用 4002 的截图反推源码差异。4000、4002 的服务和数据没有参与本轻量版改造

## 修改边界

最初只屏蔽前端入口、页面、页签、控件和部分展示字段。2026-10-31 根据选定的方案 2 增加 MoMA 顶部导航主题与中英文国际化，默认中文。保留表单提交、页面权限、API 调用和后端业务实现

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
| Models + Endpoints       | Auto Routers、Pass Through、Model Group Alias、Model Access Group Budgets Beta、Price Data、Decision Models 推广、User Connections                      | 管理员的模型配置和供应商凭据正常保留                                      |
| 员工模型详情             | 新增模型、凭据、健康检查、重试、Raw 页签，以及编辑等管理动作和上游配置展示                                                                              | 模型可用性和基础信息                                                      |
| 模型新增表单             | Team-BYOK 专属模型开关和对应团队选择区域                                                                                                                | 原有必需团队作用域、模型访问组和供应商认证字段保留                        |
| Virtual Keys 详情        | Savings、Auto Router Usage、Regenerate Key、组织和项目展示、独立日志、自动轮换、Guardrails、Policies、Prompts、路由权限、标签及原始 Metadata 等高级区块 | 基本信息、模型、用量、预算、过期时间、编辑、删除及原权限允许的其他动作    |
| Key 创建                 | Agent 所有者、非 AI API 类型及高级配置区块                                                                                                              | You、Service Account、Another User 按原角色提供，团队和访问组配置保留     |
| Logs                     | Audit Logs、Deleted Keys、Deleted Teams，连同 Enterprise 预览和升级说明                                                                                 | Request Logs 及请求详情                                                   |
| Teams                    | Default Team Settings 页签、创建团队中的独立 Logging Settings、组织与密钥管理展示、单模型预算编辑和展示                                                 | 团队基本预算和成员预算保留，成员表中的原始限额数据不重算                  |
| 团队成员添加或编辑       | 新分配团队 Admin 角色、单模型预算                                                                                                                       | 新成员默认普通角色。已有 Admin 成员编辑时保留原角色选项，避免改写已有授权 |
| Usage                    | MCP、Endpoints 页签、Aria 自然语言查询、Top Agents，以及 Customer、Tag、Agent、User Agent Activity、Organization 统计视角                               | 全局、本人、用户、团队统计按原权限提供                                    |
| Router Settings          | 路由策略选择、标签过滤、基于延迟的高级配置                                                                                                              | 原有基础重试等设置                                                        |
| Logging & Alerts         | Logging Callbacks、CloudZero、MS Teams Alerts 页签、Region Outage 企业告警                                                                              | 告警类型、可用的普通告警设置、Email 设置。默认打开 Alerting Types         |
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
| 使用共享表单的页面                   | `organization_id`、`organization_ids`、`secret_manager_settings`、`model_max_budget`、`team_member_model_max_budget`、`allowed_passthrough_routes`、`logging_settings`、`disable_global_guardrails`                                                                                         |
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

列过滤发生在创建表格实例之前，显示列菜单不能重新勾出被屏蔽的列。筛选抽屉当前按原始英文标签识别，翻译仅发生在显示层。社区改标签或调整国际化接入点时必须复查

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

## MoMA 主题与国际化

2026-11-01 根据新的参考控制台，将原方案 2 顶部导航调整为左侧分组导航。桌面分为模型服务、用量与配额、访问控制和系统设置，顶部保留纯文字品牌、语言、搜索、主题、状态和账号。访问控制与系统设置直接复用社区菜单的对应分组，前者包含团队、用户管理、访问组和预算，后者包含路由设置、日志与告警和系统设置。小于 1100px 时将同一份导航放入抽屉。菜单数据、角色判断、用户页面设置和页面白名单继续复用社区过滤函数，未新增管理员权限或放开已屏蔽页面。员工仅在访问控制中看到原有团队入口，没有可见设置项时不显示系统设置分组

品牌在控制台页头、窄屏导航、登录、开通账户、加载页和账户菜单中改为纯文字 MoMA 轻量版。页面标题同时更新。供应商标识、模型名称和技术参数保留原值。保留页面的社区推广与文档链接按下述品牌清理规则移除

当前布局参考[控制台](https://xatokenhub.com/estack/web/maas/console/welcome)，按本轻量版接口和角色调整内容。[方案 2 中文稿](design/moma-workspace-zh.png) 保留为历史资料，当前视觉验收见 [design-qa.md](design-qa.md#首页首屏与用量对齐复核)

浅蓝灰背景、白色侧栏与卡片、蓝紫色强调色集中在 `src/app/moma-theme.css`，同时保留深色模式。当前统一规范记录在 [DESIGN.md](DESIGN.md)，后续调整样式应先核对该规范。字号继续为相邻 1.5 倍的 `47.25 / 31.5 / 21 / 14px` 四档，页面标题和核心指标为 31.5px，区块标题、弹窗标题及桌面品牌为 21px，普通正文、模型名称、导航、表格和控件统一为 14px。47.25px 仅保留为确有需要时使用的展示档。桌面页头高 56px、侧栏宽 208px、内容内边距 20px。模型卡片按最小 240px 自动排布，间距 12px、内边距 16px，手机保持单列和导航抽屉

字号从 `--moma-text-caption` 的 `0.875rem` 逐级乘以 1.5，映射 Tailwind 与已有固定字号类，以上像素值按默认根字号 16px 计算。继续使用系统中文字体、rem、原有中英文切换和人民币单位。原顶部导航的窄桌面压缩规则已删除，避免与新侧栏叠加

表格高度继续随内容结束，保留列调整、排序、筛选和横向滚动。侧栏占用宽度后，部分桌面宽度下也需要横向滚动查看完整密钥表格，未为适配外观删掉原有可用字段

2026-11-01 的统一样式调整将普通桌面控件和分页设为 32px，手机主要控件保留 40px，抽屉导航项保留 44px。表头为 36px，数据单元格上下内边距 8px、行高 20px，多行内容自然增高。卡片使用统一的 16px 内边距、12px 圆角和单层边框。页面区块间距 16px、操作组间距 8px、字段间距 16px，清理重复的页面内边距。模型开通、权限、查询、原始字段及接口逻辑不变

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

2026-11-01 按确认的要求，界面货币单位默认人民币。金额符号使用 `¥`，中文单位使用人民币，英文单位使用 `CNY`。语言切换不会改变币种，不新增汇率、换算、货币切换或金额迁移

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

本轮父提交为 `d47c6c2af2`，源码改动涉及 54 个 TypeScript 生产文件，均未改变数值常量。完整路径可通过该提交至本轮提交的 Git 差异核对。后续合并时要检查新增的金额格式器、写死的美元符号、USD 单位、预算占位、图表提示和导出表头，保留对原始数据与代码示例的边界，不做全局字符串替换

## Docker 与演示数据

| 文件，相对仓库根目录                | 用途                                               |
| ----------------------------------- | -------------------------------------------------- |
| `docker/Dockerfile.lite-ui`         | 在本地源码运行时镜像上替换静态 Dashboard 导出物    |
| `docker/docker-compose.lite-ui.yml` | 独立 Compose 项目、数据库卷和 localhost 4001 端口  |
| `docker/lite-ui-preview.yaml`       | 空 model_list，模型和供应商凭据由外部数据库管理    |
| `docker/lite-ui-preview.md`         | 完整构建、启动和停止说明                           |
| `docker/moma-model-catalog.md`      | 指定 41 项模型的实际映射、启停状态、来源和验证限制 |

这些文件是本地运行设施，不属于 LiteLLM 后端裁剪。最初提供的 10 个 Mock 模型已按要求移除，当前 YAML 不再注册模拟部署或固定向量响应，新数据库需要通过原生管理接口配置模型

预览管理员、员工账户和个人密钥不写入仓库。私有环境文件和数据库卷应继续复用，避免凭据与既有数据不匹配。UI 更新先完成 `npm run build`，再重建 Compose，不能让 Docker 读取尚未完成的静态导出目录

2026-11-01 在原有 10 个 Mock 模型之外，通过原生 `/model/new` 接入两个移动云已订购的真实模型，配置保存在预览数据库，未写入 YAML 或镜像。对外名称为 `moma-deepseek-v3.2` 和 `moma-qwen3.5-397b`，上游名称分别为 `deepseek-v3.2` 和 `qwen3.5-397b-a17b`，地址为 `https://zhenze-huhehaote.cmecloud.cn/v1`。使用 OpenAI 兼容适配器，因此当前界面供应商字段显示 `openai`，不代表请求发送到 OpenAI

沿用移动云账户现有 Key，没有新建供应商 Key、订购套餐或修改原有供应商记录。凭据经原生接口保存，检查数据库存储值与原始密钥不同。员工测试账户在原有模型权限上追加这两个名称，旧会话重新登录后可见。另创建一个仅限这两个模型、有效期 1 天、预算上限 0.05 的测试 Key，未修改原有 Key 权限

测试费率采用官方页面的日间短上下文目录价。DeepSeek 输入和输出每百万 Token 分别为 2 和 8，Qwen 为 1.2 和 7.2。这里的数字按当前人民币展示要求原值配置，没有汇率转换。这是验证用估算，未实现夜间优惠、缓存价格、长上下文阶梯或合同折扣，不能作为供应商结算结果

仅分发镜像不会带上这些真实模型、账户或密钥，复现该接入需要保留当前数据库卷及配套盐值，或在目标环境重新通过原生模型管理配置凭据。不得把私有环境文件、原始 API Key 或数据库备份加入源码或镜像

随后按管理员指定的模型清单继续配置。用户确认不加入 hy3 后，目标调整为 41 项，均已保存配置，新增 40 条并复用原 Qwen 397B 部署，未重命名或删除原有模型。hy3 没有创建过配置，不再列为待补项。当前共 52 条模型记录，其中原有 12 条保留。完整名称、上游 ID、实际地址、适配器、启停状态和核对来源见 [移动云模型配置清单](../../docker/moma-model-catalog.md)

上述 52 条是清理前的阶段记录。本次按仅保留 41 项的要求，移除 10 个 YAML Mock 以及清单外的 `moma-deepseek-v3.2` 数据库部署。数据库部署经原生删除接口移除，删除前在本机仓库外保存加密记录备份。当前模型目录与 41 项清单完全一致，保留项的 ID、供应商参数、价格及启停状态未改动，仍为 5 项启用、36 项停用。没有删除账号、Key、预算或历史日志，也没有清空旧模型授权列表而扩大权限

这批指定型号中，5 项已启用并验证文本连通性，24 项因上游返回 `subscription_required` 保持停用，另 12 项图片、视频和实时模型保留配置但未启用。部分专用协议仍需要适配，不能把保存配置视为已经支持全部模态或生成流程。本轮没有修改应用源码、镜像、员工授权、数据库结构或后端接口，也没有购买或续订移动云套餐

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
| 主题与导航                | 顶部导航与窄屏抽屉复用同一权限过滤，管理员管理菜单不会遗漏原可用入口，深浅色均可读                        |
| Beta 能力                 | 检索 BetaBadge、[BETA] 等标记，核对新入口、字段和直接链接的屏蔽，不按 beta 字符串过滤 API 协议或模型名称  |
| 中文与数据边界            | 新文案补齐词典，用户输入、API 参数、权限判断与模型 ID 不参与翻译，语言切换不重置表单                      |
| 视觉基准                  | 参考 design/moma-workspace-zh.png 与 design-qa.md 重测桌面、中英文、手机和弹窗                            |

推荐把上述检查和本文清单一起更新。优先在集中策略或共享组件补规则，只有独立按钮、无共享表单字段的区块才增加就地屏蔽。已整页屏蔽的功能不再逐个改其内部组件

## 验证记录与限制

### 屏蔽阶段

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

### MoMA 主题与中文阶段

2026-11-01 完成生产构建与下列定向测试，不运行整套 Vitest。测试批次有少量文件重叠，不能直接把批次用例数相加作为唯一用例总数

| 测试批次                                                                               | 结果                                                          |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 基础国际化、顶部导航、原导航、表格、登录、密钥创建与编辑、用户和模型页面，共 23 个文件 | 579 项通过，3 项为社区原有 it.fails 预期失败                  |
| 用量页指标、分组控件、统计范围、供应商统计、密钥排行与图表加载，共 6 个文件            | 78 项通过                                                     |
| 系统设置、团队管理员可编辑字段、公告设置与日期单元格，共 4 个文件                      | 42 项通过                                                     |
| 最终密钥表格、批量邀请、语言切换与顶部导航复核，共 4 个文件                            | 99 项通过                                                     |
| 词典边界复核，共 2 个文件                                                              | 5 项通过，包含 constructor 与 **proto** 等未知文案原样回退    |
| npm run build                                                                          | TypeScript 与静态导出通过                                     |
| ./scripts/pre_commit_lint.sh                                                           | Prettier、ESLint 和规则预算通过，未提高预算或添加 suppression |
| Impeccable detect                                                                      | 对主题与公共导航相关文件检查，未报告反模式                    |

新增国际化测试验证默认中文、英文偏好恢复、未知文案回退与参数插值。输入的 Home 别名在语言切换及提交时仍保持 Home。顶部导航测试验证员工页面限制、管理员管理菜单和原有页面可见性设置

本轮没有新增后端端点、修改数据库或调整 API 请求数据。保留演示数据库与账户，更新的是 4001 镜像中的 Dashboard 静态资源。验证仍使用本地 Mock 模型，没有测试真实供应商计费、负载或生产 SSO。后端错误、原始 JSON、代码和客户端配置示例保留原文，未知或后续新增界面文案会回退英文

浏览器复核覆盖员工与管理员、中文和英文、深浅色、360px、390px、900px、1100px 及 1488px。实际表单内输入 Home 后跨标签切换语言，原值仍保留，未创建新密钥。截图与同尺寸设计对比见 [design-qa.md](design-qa.md)。4001 使用最终构建重新启动，健康检查返回 200

### 方案 2 视觉对齐复核

2026-11-01 修正上一版过于紧凑的实现，调整导航比例、标题说明、工具栏、状态标记、密钥表格列宽、日期与分页。旧视觉验收结论已由本轮 [design-qa.md](design-qa.md) 取代，保留修正前并排图，并更新实际页面、完整并排与局部对比截图

本轮运行 8 个定向测试文件，共 275 项普通通过，1 项为 `create_key_button.integration.test.tsx` 的社区已有 `it.fails`。中途分页显示断言失败后，恢复完整页码信息的无障碍文本，复跑相关 2 个文件的 97 项全部通过，不代表该既有 `it.fails` 已修复

生产构建、TypeScript、静态导出和仓库 `./scripts/pre_commit_lint.sh` 均通过。没有提高 ESLint 预算或新增 suppression。4001 已用最终静态资源重建，健康检查返回 200，数据库卷与既有账户继续复用

浏览器检查覆盖员工与管理员、中文与英文、深浅色、搜索空状态与恢复、创建表单、管理下拉和移动抽屉。复核宽度为 360px、390px、640px、900px、1100px、1391px、1488px 和 1536px。修复了放大导航后在窄桌面和英文 1536px 断点出现的页头溢出，没有新增密钥或调整后端权限，真实供应商与计费仍未参与本轮验收

### 1.5 倍字号阶梯

以下为最初 12px 底档的历史记录，当前字号见[14px 最小字号验证](#14px-最小字号验证)

2026-11-01 将主题字号集中为 `40.5 / 27 / 18 / 12px` 四档，相邻比值为 1.5。源码改动限于 `src/app/moma-theme.css`，没有修改页面组件、API 调用、表单数据或权限。新增字号令牌、Tailwind 映射、已有固定字号类归档和辅助文字规则，响应式规则也改为使用这四档

生产构建、TypeScript、静态导出与仓库前端检查通过，字体扫描未报告问题。实际浏览器检查覆盖管理员和员工密钥页、创建表单、用量页、员工模型列表及 360px、390px、1100px、1488px 和 1536px，所检查的可见文字字号均属于四档，没有页头溢出。最终表单帮助文字实测 12px，4001 使用最终静态资源重建且健康检查返回 200

本轮为纯样式变更，没有新增或重复运行单元测试，也没有生成新的密钥。重建期间员工会话有两次 general_settings 请求 Failed to fetch，最终页面正常加载，未处理接口网络问题。真实供应商调用、计费和跨浏览器回归仍未验证。最新截图与前后比较见 [design-qa.md](design-qa.md#15-倍字号阶梯复核)

### 人民币单位验证

本轮最终定向测试运行 67 个文件，共 1978 项普通通过、7 项既有 `it.fails`、12 项失败。金额格式、非零与负数、小额阈值、预算输入与原值提交、模型价格、CSV 表头和中英文币种用例通过。自定义图表格式器的美元字符串保留并单独复核，8 项通过，不能与前一批重复相加

剩余 12 项集中于 `UsagePageView.test.tsx`，涉及已裁剪的标签、组织、客户、Agent 和 User Agent 统计视图。将本轮源码与测试完整临时恢复到父提交 `d47c6c2af2` 后，同文件复跑为 62 项通过、13 项失败，当前 12 项全部属于该基线失败集合。工作内容随后完整恢复，没有调整既有屏蔽策略。本轮不能声称整批测试全部通过

`npm run build`、TypeScript、静态导出和仓库 `./scripts/pre_commit_lint.sh` 通过，未提高规则预算。4001 复用既有数据库卷与账户，用本轮静态资源重建后健康检查返回 200。没有修改 Docker 文件、后端、数据库或依赖

浏览器验证员工密钥金额为 ¥0.00，创建表单标注最大预算（人民币），输入 150.75 后仍显示 150.75，检查后清空并关闭，没有创建新密钥。英文表单显示 Max Budget (CNY)。用量页原预算 10 显示为 ¥10.00，坐标轴与平均花费使用人民币符号，管理员模型价格也使用 ¥。截图见 [design-qa.md](design-qa.md#人民币单位复核)

真实供应商计费、价格口径校准和跨浏览器回归未验证。本次按要求不涉及汇率或历史金额换算

### 模型服务控制台验证

2026-11-01 本轮起点为 `bea93d4511`，社区基线仍为 `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`、版本 1.109.0，没有合并社区新版本。源码改动限于前端与测试，未改后端、数据库或 Docker 配置

定向测试明确传入 12 个文件，196 项通过。覆盖单击开通、连续点击去重、后台拒绝、不具备权限、只读用户、个人 Key 限制与管理员例外、团队范围与团队公开模型名、有效凭证匹配、完整分页、原密钥列表变更后的开通状态刷新、角色解析后的默认布局、导航和语言切换、首页实际用量与重试、模型列表及现有 Key 查询。补齐了已隐藏 Shadow Eval 页面因共享人民币格式器产生的 7 项旧美元断言，没有恢复该页面或改动金额

此前 `UsagePageView.test.tsx` 的 12 项已屏蔽视图测试不在本轮修复范围，本轮没有运行全仓 380 个前端测试文件，不能据此声称完整测试集全绿。单独复核失败后按实际原因修正，未跳过失败用例、降低 lint 基线或增加忽略

最终生产构建、TypeScript 与静态导出通过。Docker 使用最终 `out` 资源重建 4001，保留原数据库卷、账号、模型配置和密钥。最终健康检查返回 200，仓库前端检查的 Prettier、ESLint 和 lint 预算均通过，未放宽预算。浏览器另行核对，不以构建成功代替页面验证

浏览器核对覆盖中文和英文、1218px 员工工作台与模型广场、搜索空状态与恢复、模型详情与返回、列表切换、管理员配置页签和 390px 管理员卡片及抽屉导航。现有员工凭证覆盖全部演示模型，显示已开通，管理员卡片显示开通入口。未通过浏览器提交真实 Key 创建，没有调用真实供应商或验证真实扣费，开通写操作通过网络边界测试验证

员工控制台记录了 `general_settings` 读取被后端拒绝的错误，来自现有代理设置读取链路。没有放宽后端权限来消除它，也没有声称浏览器无错误。管理员在完整刷新后的会话核对配置入口，首次登录后的即时过渡状态未做完整回归。图像对照与实际截图见 [视觉验收](design-qa.md#模型服务控制台复核)

### 移动云真实模型接入验证

2026-11-01 以 `d37c64c78e` 的代码重新完成 `npm run build`，TypeScript 与静态导出通过。重建 `litellm-lite-ui:local` 并增加 `litellm-moma:d37c64c78e` 标签，镜像 ID 为 `sha256:e606989a0674783a401bf8e62eb95e666f4e881e5b67c5e2bafb6fb517121cf6`。4001 使用该镜像，运行时继续为本地源码构建的 LiteLLM 1.109.0，社区基线未升级

本轮没有修改前后端功能源码、接口、数据库结构或 Docker 构建配置。真实模型、员工模型权限及测试 Key 通过原生管理接口写入现有预览数据库，本次仓库变更仅同步本文和 `docker/lite-ui-preview.md`。镜像只打包应用，真实模型配置依赖外部数据库和凭据，不随镜像分发

| 检查                               | 实际结果                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 已订购 DeepSeek-V3.2 上游直连      | HTTP 200，返回接入成功，14 Token，这次诊断请求没有经过本地网关                                                            |
| 员工 Key 调用 `moma-deepseek-v3.2` | HTTP 200，返回接入成功，14 Token                                                                                          |
| 员工 Key 调用 `moma-qwen3.5-397b`  | HTTP 200，输出上限 512 时返回接入成功，265 Token，其中 244 为思考 Token                                                   |
| DeepSeek 流式调用                  | HTTP 200，收到接入成功、usage 和 `[DONE]`，14 Token                                                                       |
| Qwen 首次 128 Token 请求           | HTTP 200，但全部输出额度用于思考，`finish_reason=length` 且正文为空，不计为完整回答验证                                   |
| Key 模型权限边界                   | 使用仅限两个真实模型的 Key 调用其他模型，HTTP 403，`key_model_access_denied`                                              |
| 请求日志与估算费用                 | 原生 `/spend/logs/v2` 和管理员日志页可查到上述 4 次 HTTP 200 请求，共 437 Token，估算费用合计 0.0028448。403 另有失败日志 |
| 员工模型广场                       | 重新登录后两个真实模型可见，搜索 `moma-` 返回两张卡片，均显示已开通                                                       |
| 容器重启与持久化                   | 健康检查 HTTP 200，两个真实模型记录仍存在，共保留 12 个模型                                                               |
| 凭据保存                           | 数据库中的两个模型均有凭据，存储值与原始 Key 不同，未把原始 Key 放入源码、镜像或本文                                      |

最新 DeepSeek-V4.1 的官方示例使用 `https://vip.moma.cmecloud.cn/v1`。该账户实际返回 HTTP 402、`subscription_required`，因此没有订购套餐或将它加入本地模型。不能从供应商 `/models` 列表推断所有列出型号均已授权，也不能假定不同型号使用同一服务地址

本轮没有新增功能源码，因此没有重复运行前端单元测试或全仓测试。此前 12 项已屏蔽用量视图测试和员工设置读取权限问题的记录仍保留。本次完成真实上游请求与本地日志核对，没有核对供应商账单、验证全部计价档位、长时间负载、生产部署或跨浏览器回归。构建日志位于本机 `/tmp/moma-ecloud-build.log`，Docker 日志位于 `/tmp/moma-ecloud-docker.log`，均不加入仓库

### 管理员批量模型配置验证

2026-11-01 在 `b3586ad447` 后继续使用同一 4001 镜像和数据库。最初按指定 42 项逐项核对网页及两个鉴权 `/models` 目录，确认 41 个上游 ID。MiniMax-M2.7、旧 DeepSeek-V4-Flash 和 Qwen3.5-35B-A3B 从接口目录补齐，保留实际 ID 大小写和供应商前缀。随后用户确认不加入 hy3，最终目标为 41 项，没有待补模型 ID。本次确认仅更新清单与差异记录，没有修改运行环境或重做模型调用测试

29 个聊天型号分别用 1 Token 输出上限检查上游，5 个返回 HTTP 200，24 个返回 HTTP 402、`subscription_required`。5 个可用型号再通过限制模型、有效期 1 小时、预算上限 0.05 的管理员测试 Key 调用本地网关，均返回 HTTP 200。5 次网关调用共 71 Token，日志估算费用 0.0000626，不包含上游直连检查。这些请求均因极短上限以 `length` 结束，不代表完整回答或多模态效果已验证

授权范围内的停用 GLM-5.3 请求返回 HTTP 403。重启容器后健康检查 HTTP 200，原生模型信息接口确认 41 项对应记录及启停状态与清单一致，当前共 52 条。原有 12 条模型的名称、ID 和 litellm_params 与配置前一致，数据库未检出原始供应商 Key。浏览器确认管理员列表能看到新增记录，卡片同时展示可用和 Paused 状态，停用模型的开通按钮禁用。本轮没有扩大员工模型权限或修改原有 Key

12 个非聊天型号没有提交图片、视频或实时音频生成。Qwen 图片与部分 Happyhorse 配置使用当前原生 DashScope 适配器。实时 WebSocket 路径、MiniMax H3 任务协议、豆包专用加密 SDK，以及 Happyhorse 参考视频输入仍有适配限制，继续停用。详细限制、费率来源与未核对项以 [配置清单](../../docker/moma-model-catalog.md) 为准

本轮仅增加运行环境模型记录并维护文档，不需要重新构建应用或重复运行前端测试。既有用量测试失败和员工设置读取权限问题没有在此次配置中处理，没有声称全仓测试或完整供应商计费通过

### 模型清理与紧凑布局验证

2026-11-01 从 `ca972dd046` 继续更新。清理 10 个 YAML Mock 和清单外的 DeepSeek-V3.2 试接部署，使用原生删除接口移除数据库部署并在仓库外保存加密记录备份。重建 4001 后，健康检查及原生模型信息接口均返回 HTTP 200。模型名称集合与已确认的 41 项清单完全一致，没有 mock_response，保留项的 ID、供应商参数和启停状态不变，仍为 5 项启用和 36 项停用

布局变更限于 `moma-theme.css`、`ModelCatalog.tsx` 的展示排布，以及密钥表格的模型摘要数量。没有修改后端源码、接口、鉴权、预算或供应商适配。原有 Key 和历史日志继续保留，可能仍含已移除模型名称，不把这些历史字段清空成通配授权。Docker YAML 为空模型列表，41 项实际配置继续依赖数据库及原盐值，不写入镜像

6 个定向测试文件共 197 项通过，包括模型开通、模型列表、共享表格、Dashboard 布局、模型摘要及密钥表格。密钥表格原先按 3 个可见模型统计剩余数量的用例已同步为当前紧凑展示，未跳过失败用例。生产构建、TypeScript、静态导出和仓库前端检查通过，Prettier、ESLint 及规则预算没有放宽，Impeccable detect 未报告问题。未运行整套前端测试或重复真实推理请求

实际浏览器在 1280×720 下确认页头 72px 改为 56px，侧栏 244px 改为 208px，内容边距 36px 改为 20px。模型列表样本行高从约 83–88px 降为 55px，首行模型卡片从约 251px 降为约 176–196px，列数从 3 列变为 4 列，当前首屏完整显示 8 张卡片。密钥表格的多模型样本行从 115px 降为 65px。凭证状态提示、长名称及复杂数据仍可能增加实际高度，这些数值不是固定行高承诺

浏览器检查覆盖管理员模型卡片与表格、搜索空状态、员工模型列表、密钥页和创建表单、中英文、深浅主题，以及 390px、900px、1280px、1536px。没有整页横向溢出，宽表继续在原容器中横向滚动。手机单列卡片和操作按钮至少 40px，分页按钮实测 40×40px，抽屉导航项实测至少 44px。员工仅显示原有授权范围内的模型，没有为填充界面增加权限

本地镜像标签为 `litellm-moma:compact-20261101`，镜像 ID 为 `sha256:28310e0bb7afad0f34acd03c33c79e1cfa2d3ef1cb203cc8d732a563fb4dd1b9`。源码运行时仍为 LiteLLM 1.109.0，未升级社区基线。模型和密钥数据不在镜像中。实际截图及尺寸记录见 [紧凑布局验收](design-qa.md#紧凑布局与模型清理复核)，旧用量测试及员工设置读取权限问题仍按之前记录处理

### 访问控制与系统设置分组验证

2026-11-01 从 `79a9e15f0b` 继续更新，社区基线和版本不变。`MomaNavigation.tsx` 将合并的管理区改为社区菜单的 ACCESS CONTROL 与 SETTINGS 两组，再显示为访问控制和系统设置。`zh-CN.json` 增加对应中文标签，原有角色、页面白名单和子菜单过滤保持不变。没有修改后端、接口、模型配置或数据库数据

导航、页头及 Dashboard 布局的 4 个定向测试文件共 19 项通过，覆盖管理员两组的菜单归属和地址、员工仅有团队入口、页面限制和语言切换。生产构建、TypeScript、静态导出及仓库前端检查通过。ESLint 保留已有警告，没有新增错误或提高规则预算

4001 使用最终静态资源重建，保留原数据库卷、账户和盐值，健康检查返回 HTTP 200。本地镜像另标记为 `litellm-moma:navigation-20261101`，镜像 ID 为 `sha256:46e969e3b85a299eea35cdb197bae3788dcd74fecb511a83c1ccf8032c8e3a57`

实际浏览器确认管理员访问控制包含团队、用户管理、访问组和预算，系统设置包含路由设置、日志与告警和系统设置。预算页只有预算链接处于选中状态。员工重新登录后仅在访问控制中看到团队，没有空的系统设置分组。中英文分组切换和 390px 管理员、员工抽屉均已核对，所查页面没有整页横向溢出，检查后恢复中文和默认视口。截图见[导航分组复核](design-qa.md#导航分组复核)

本轮没有运行全套前端测试、真实模型推理或计费检查，也没有处理此前记录的员工配置读取权限问题

### 14px 最小字号验证

2026-11-01 从 `0a0a88d05e` 继续更新，社区基线与版本不变。源码仅将 `moma-theme.css` 的基础字号从 `0.75rem` 改为 `0.875rem`，其余三档继续乘以 1.5。默认根字号 16px 下，四档为 `14 / 21 / 31.5 / 47.25px`。原有字号角色、间距、响应式规则、表单、权限和接口不变

生产构建、TypeScript、静态导出及仓库前端检查通过，Impeccable 字体扫描未报告问题。纯样式调整未新增或重复运行单元测试。4001 使用最终静态资源重建，保留数据库、账户、模型和密钥，健康检查返回 HTTP 200。本地镜像另标记为 `litellm-moma:font14-20261101`，镜像 ID 为 `sha256:b93cdfbda20dc5953a86f1e4adf807f471b0d4e0e1ed2d8cf81c6528f15ac629`

实际浏览器在 1280px 下测得标题和桌面品牌为 31.5px，导航与模型名称为 21px，表格、辅助文字和卡片按钮为 14px。管理员中英文模型卡片、模型表格、密钥表格、首页、用量统计和图表，以及管理员、员工创建密钥表单均已检查，所查文字未发现小于 14px 的字号。47.25px 保留为大号展示档，不能把令牌定义视为所有页面都使用该字号

390×844 下核对模型卡片、抽屉导航、密钥表格和管理员创建表单，未出现整页横向溢出。长模型名称继续换行，宽表继续在容器内横向滚动，手机品牌保留原有省略显示，侧栏和表单保留滚动。没有创建新 Key，检查后恢复中文、默认视口和管理员模型广场。截图见[14px 字号复核](design-qa.md#14px-字号复核)

没有执行真实模型推理、计费、全站跨浏览器或完整无障碍回归，之前记录的员工配置读取权限问题不在本次处理范围内

### Beta 屏蔽与中文补齐

2026-11-01 从 `a2ce8adf2d` 继续更新，社区基线仍为 `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`，版本 1.109.0。本轮仅调整前端屏蔽、界面文案和显示格式，没有修改后端接口、模型转发、鉴权、数据库结构、预算数值或模型配置

`liteUi.ts` 对管理员和员工均屏蔽模型访问组共享预算页签 `access-group-budgets`。直接访问旧链接时由原 `useUrlTab` 回到模型列表并清除无效页签参数，其他查询参数保留。项目、自动路由、榜单、Lens、Playground Decisions 以及设置中的项目和聊天 Beta 开关继续按原规则屏蔽。普通访问组管理与模型访问组授权保留。API 头名、协议路径和模型名称中的 beta 属于接口或业务数据，不按文本关键词过滤

邀请用户表单使用复数字段 `organization_ids`，原来只屏蔽了 `organization_id`。本轮将两者一并纳入既有组织字段屏蔽规则，不清空表单或数据库中的组织归属

中文补齐覆盖模型健康检查、重试策略、添加模型和凭据、模型及密钥详情、用户与团队、访问组、预算、用量、路由、日志和告警。显示标签与状态使用词典，含模型名、分组名和字段名的反馈改为参数插值，数据值不送入翻译。账户的系统占位名显示为账户，实际用户标识原样保留。金额描述和日期时间本地化，金额、预算及接口时间戳不变

`getLocale` 提供当前语言给非 React 操作反馈。固定界面提示在触发时按当前语言翻译，真实异常继续通过 `toast.fromError` 显示中文概要并保留原始技术详情。前端输入校验提示使用已翻译的界面错误消息。没有 DOM 扫描、自动改写文本或远程翻译服务，也没有新增依赖

本轮词典新增 476 项并修正 9 项既有翻译。通知中的自动路由推广在轻量版隐藏，版本更新通知继续保留并使用中文。通知图标、部署健康图标、页面操作区、表格排序和访问组资源提示的可读标签同步本地化。访问组的空状态、工具权限摘要及详情日期也使用现有词典和日期组件，资源名称和工具名称保持原值

路由通用设置的说明文字移除固定 `0.65rem`，日志抽屉的固定 12/13/16px 字号改用已有主题变量，使这些区域使用 14px 辅助文字和 21px 标题档，延续最小 14px 的既有要求

| 实现位置，相对 dashboard                                                                                                                                     | 本轮维护点                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `src/utils/liteUi.ts`、模型页和策略测试                                                                                                                      | Beta 页签、旧链接回退、复数组织字段屏蔽                            |
| `src/i18n/zh-CN.json`、`src/contexts/LocaleContext.tsx`、`src/lib/toast.ts`                                                                                  | 中文词典、非组件语言读取和操作反馈                                 |
| `src/components/Navbar/`、`SidebarAccountMenu/`                                                                                                              | 账户占位名、可读标签与用户数据边界                                 |
| `src/components/shared/table_cells/`                                                                                                                         | 金额占位、预算描述及原有数值语义                                   |
| `src/components/add_model/`、`model_add/`、`model_dashboard/`、模型页 components 与 panels                                                                   | 模型配置、凭据、健康、重试、状态和日期                             |
| `src/components/logs/`                                                                                                                                       | 列表筛选、日志详情、相对时间、费用和复制标签，原始请求与响应不翻译 |
| `src/components/router_settings/`、`routing_groups/`、`Settings/RouterSettings/`、路由页 \_components                                                        | 路由设置、规则、后台元数据说明与反馈插值                           |
| 用户页 \_components、`Teams.tsx`、`team/`、访问组页 \_components、预算页 \_components                                                                        | 日常管理页面、表单、角色和状态显示                                 |
| 用量页与 `src/components/UsagePage/`                                                                                                                         | 无关联用户的占位显示，身份与导出数据保持原值                       |
| `src/components/organisms/create_key_button.tsx`、`model_info_view.tsx`、`update_model_credentials_modal.tsx`、`templates/key_info_view.tsx`、`settings.tsx` | 校验、原始错误传递和管理反馈的中文                                 |

<details>
<summary>本轮源码与测试文件清单，相对 dashboard</summary>

```text
src/app/(dashboard)/access-groups/_components/AccessGroupsDetailsPage.test.tsx
src/app/(dashboard)/access-groups/_components/AccessGroupsDetailsPage.tsx
src/app/(dashboard)/access-groups/_components/AccessGroupsModal/AccessGroupBaseForm.tsx
src/app/(dashboard)/access-groups/_components/AccessGroupsTableColumns.tsx
src/app/(dashboard)/access-groups/_components/access-group-create/AccessGroupCreateDialog.tsx
src/app/(dashboard)/budgets/_components/BudgetFormFields.tsx
src/app/(dashboard)/budgets/_components/BudgetPanel.tsx
src/app/(dashboard)/budgets/_components/BudgetTable.tsx
src/app/(dashboard)/logs/page.tsx
src/app/(dashboard)/models-and-endpoints/components/ModelRetrySettingsTab.test.tsx
src/app/(dashboard)/models-and-endpoints/components/ModelRetrySettingsTab.tsx
src/app/(dashboard)/models-and-endpoints/components/ModelsTableColumns.tsx
src/app/(dashboard)/models-and-endpoints/page.test.tsx
src/app/(dashboard)/models-and-endpoints/panels/ModelRetrySettingsPanel.tsx
src/app/(dashboard)/router-settings/_components/RequestTagMappings.tsx
src/app/(dashboard)/router-settings/_components/general_settings.tsx
src/app/(dashboard)/usage/_components/components/EntityUsage/TeamUserSpendCard.tsx
src/app/(dashboard)/users/_components/BulkEditUsers.tsx
src/app/(dashboard)/users/_components/default-user-settings/DefaultUserSettingsForm.tsx
src/app/(dashboard)/users/_components/view_users/UsersTable.tsx
src/app/(dashboard)/users/_components/view_users/UsersTableColumns.tsx
src/app/(dashboard)/users/_components/view_users/user_info_view.tsx
src/components/DeploymentHealth/DeploymentHealth.tsx
src/components/Navbar/NotificationsBell/NotificationsBell.test.tsx
src/components/Navbar/NotificationsBell/NotificationsBell.tsx
src/components/Navbar/UserDropdown/UserDropdown.tsx
src/components/Navbar/navDisplayName.test.ts
src/components/Navbar/navDisplayName.ts
src/components/Settings/RouterSettings/Fallbacks/AddFallbacks.tsx
src/components/Settings/RouterSettings/Fallbacks/EditFallbacks.tsx
src/components/Settings/RouterSettings/Fallbacks/Fallbacks.tsx
src/components/SidebarAccountMenu/SidebarAccountMenu.tsx
src/components/Teams.tsx
src/components/UsagePage/components/KeyActivityPanel.tsx
src/components/UsagePage/components/TopUsersView.tsx
src/components/UsagePage/components/UserActivityTable.tsx
src/components/UsagePage/components/userActivityData.ts
src/components/add_model/AccessGroupTagsCombobox.tsx
src/components/add_model/advanced_settings.tsx
src/components/add_model/conditional_public_model_name.tsx
src/components/add_model/litellm_model_name.tsx
src/components/add_model/provider_specific_fields.tsx
src/components/common_components/MetadataKeyValueFields.tsx
src/components/logs/detail/DrawerHeader.tsx
src/components/logs/detail/HistoryTree.tsx
src/components/logs/detail/JsonViewer.tsx
src/components/logs/detail/LogDetailContent.tsx
src/components/logs/detail/LogDetailsDrawer.tsx
src/components/logs/detail/SectionHeader.tsx
src/components/logs/detail/constants.ts
src/components/logs/detail/sections/CostBreakdownViewer.tsx
src/components/logs/detail/sections/EvalViewer/EvalViewer.tsx
src/components/logs/detail/sections/ToolsSection/FormattedToolView.tsx
src/components/logs/detail/sections/ToolsSection/ToolExpandedContent.tsx
src/components/logs/detail/sections/VectorStoreViewer.tsx
src/components/logs/request/LogsTableToolbar.tsx
src/components/logs/request/timeRange.test.ts
src/components/logs/request/timeRange.ts
src/components/model_add/CredentialModal.tsx
src/components/model_add/CredentialsPanel.tsx
src/components/model_add/CredentialsTable.tsx
src/components/model_add/CredentialsTableColumns.tsx
src/components/model_add/reuse_credentials.tsx
src/components/model_dashboard/HealthCheckComponent.tsx
src/components/model_dashboard/HealthChecksTable.tsx
src/components/model_dashboard/HealthChecksTableColumns.tsx
src/components/model_info_view.tsx
src/components/organisms/create_key_button.tsx
src/components/router_settings/ConfigOwned.tsx
src/components/router_settings/LatencyBasedConfiguration.tsx
src/components/router_settings/ReliabilityRetriesSection.tsx
src/components/router_settings/RoutingStrategySelector.tsx
src/components/router_settings/index.tsx
src/components/routing_groups/RoutingGroupModal.tsx
src/components/routing_groups/RoutingGroupUsagePanel.tsx
src/components/routing_groups/RoutingGroupsTable.tsx
src/components/routing_groups/RoutingGroupsTableColumns.tsx
src/components/routing_groups/index.tsx
src/components/settings.tsx
src/components/shared/DataTable/DataTableSortHeader.tsx
src/components/shared/PageHeader.tsx
src/components/shared/table_cells/money_cell.tsx
src/components/shared/table_cells/spend_budget_cell.test.tsx
src/components/shared/table_cells/spend_budget_cell.tsx
src/components/team/AvailableTeamsPanel.tsx
src/components/team/TeamInfo.tsx
src/components/team/member_permissions.tsx
src/components/templates/key_info_view.tsx
src/components/update_model_credentials_modal.test.tsx
src/components/update_model_credentials_modal.tsx
src/contexts/LiteUiContext.tsx
src/contexts/LocaleContext.tsx
src/i18n/zh-CN.json
src/lib/toast.test.ts
src/lib/toast.ts
src/utils/liteUi.test.ts
src/utils/liteUi.ts
```

</details>

### Beta 与中文补齐验证

最终生产构建、TypeScript 和静态导出通过。仓库前端检查脚本运行 Prettier、ESLint 和现有 lint 预算，未提高任何预算。`make check` 在 bootstrap 阶段因本机旧版 `uv` 无法解析当前锁文件而退出，之后直接运行 `scripts/pre_commit_lint.sh` 完成适用的前端检查。没有修改 Python 环境或锁文件，也没有将未运行的后端检查视为通过

定向测试覆盖管理员和员工的 Beta 页签与旧链接回退、其他 URL 参数保留、组织字段屏蔽、模型名和策略字段不被翻译、金额数值保持不变、日期显示及成功和错误反馈。最初的 44 文件批次运行 670 项，健康状态英文占位被改动导致的失败已恢复原约定，并在相关 3 文件 28 项复核中通过。另一个 14 文件批次的两处真实异常传递失败已修复，最终相关 6 文件复核为 247 项通过和 5 项既有预期失败。密钥日期及预算显示的 2 文件 76 项、访问组和通知等 7 文件 116 项、表格排序 1 文件 4 项，以及缓存费用和路由通用设置 2 文件 28 项均通过。这些批次包含重复用例，不合计为全套测试数

5 项 `it.fails` 在本轮之前已存在，没有新增或扩大预期失败。创建密钥有 1 项空可选设置不应增加请求字段的用例，模型编辑有 4 项仅编辑输入单价时不应提交未编辑字段的用例。它们都关联已有的三态 PATCH 表单问题，本轮没有改写这些业务行为。之前记录的 12 项隐藏 UsagePage 测试也没有在此轮重跑或修复

最终镜像为 `litellm-moma:zh-beta-20261101`，ID 为 `sha256:8f1fd746a1cee22875ad1bdc611492af2b8bbda979d8dc3dfc3b5c838d54733d`。4001 服务只重建应用容器，保留数据库卷、账户、模型、密钥和 salt，健康检查返回 HTTP 200。镜像不包含数据库中的 41 项模型配置和上游凭据，迁移仍须遵守现有部署指南

最终浏览器中，管理员旧 Beta 链接回到模型列表，模型页只显示已接入模型、添加模型、供应商凭据、健康状态和模型重试设置。员工旧链接回到可用模型页，继续只显示其原授权模型。已检查添加模型、凭据、健康、重试、密钥、预算、访问组、用户、团队、路由、日志与告警、系统设置、首页、用量和日志列表，以及访问组详情和日志抽屉。检查的是普通界面文案，模型、供应商、用户标识、API 参数、原始 JSON 和异常技术详情保留原文

中英文切换时，未提交的密钥名称 `Home` 保持原值，检查后清空并关闭表单。390×844 下检查员工模型页、抽屉导航和创建密钥表单，所查文字没有小于 14px，页面无整页横向溢出。检查后恢复中文和默认桌面视口，未提交新密钥或任何模型、预算、用户及团队修改。截图和视觉证据见[本轮中文复核](design-qa.md#beta-屏蔽与中文复核)

没有运行完整前端套件、真实推理、计费、供应商健康探测、跨浏览器或完整无障碍回归。已有员工设置读取权限问题不在本轮处理范围内。今后合并社区版本时，需要继续检查新增 Beta 入口、动态元数据说明和操作反馈，不能只检索页签字面量

### 统一设计规范与界面密度

2026-11-02 从 `b801cbf362` 继续更新，社区基线仍为 `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`，源码版本 1.109.0。新增 [DESIGN.md](DESIGN.md) 作为保留页面的设计规范，明确字号角色、4px 间距基准、标题边界、控件高度、表格和表单密度、响应式及验证要求。保留已有颜色、品牌、语言、货币和角色边界，没有修改后端、接口、转发、预算、鉴权或数据库数据

原来的 Tailwind `text-sm` 和 `text-base` 都被映射为 21px，使普通按钮、输入、导航和说明膨胀，局部区域又使用 14px，因此出现大小和密度不一致。本轮将普通 UI 字号统一为 14px，21px 分配给区块与弹窗标题，31.5px 分配给页面标题和核心指标，继续保持四档字号的 1.5 倍关系。没有降低最小字号，也没有用缩小整个页面或 CSS transform 模拟紧凑效果

主题文件清理重复和过时的局部覆盖，统一页面外边距、卡片、表格、分页、表单和控件。`Page` 增加语义展示标记，`PageHeader` 在主题中统一标题、说明及操作位置。模型页改用共享标题组件，用户、日志、路由、日志与告警、系统设置补齐一致的页面标题。系统设置的原“管理员访问”标题改为“系统设置”，保留原来的管理员管理说明

用量页移除额外的 24px 水平缩进，将筛选项统一在标题下方，复用现有日期组件的 compact 展示，保留完整日期和原有应用与取消逻辑。日期面板使用独立的可用宽度，避免按钮较窄时年份被截断，起止提示和日期预设显示中文，接口及 URL 中的时间值保持不变。概览图表从 380px 调整为 256px，原本 compact 的图表继续为 224px。宽屏采用两个自然高度的统计列，去掉供应商面板的强制撑高，较窄窗口将指标改为双列。筛选项和长日期使用原有省略显示与完整可读文本。统计来源、指标数值、时间范围语义、排序、导出和筛选状态均保持原实现

模型、密钥、团队和用户详情移除重复缩进，并允许标题与动作换行。创建密钥和团队弹窗从 1000px 收到 800px，保留窄屏最大高度、内部滚动、字段顺序、注册、校验和提交处理。团队与密钥表单中额外的 32px、80px 纵向间隔收敛为 16px，没有移除字段或清空已有值。用量和预算页面实际发现的 12 项普通英文占位与说明一并补齐中文，模型与用户名称保留原文

| 文件或目录，相对 dashboard                                                                                                                                     | 维护内容                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `DESIGN.md`、`src/app/moma-theme.css`                                                                                                                          | 设计规范、字号角色、间距令牌和共享展示规则                                                      |
| `src/components/shared/Page.tsx`、模型页 `page.tsx`、用户 `view_users.tsx`、日志 `page.tsx`、`settings.tsx`、`AdminPanel.tsx`、`general_settings.tsx`          | 页面结构标记、共享标题和重复边距清理                                                            |
| 用量页 `UsagePageView.tsx`、`overview/Primitives.tsx`、`UsageStatStrip.tsx`、`UsageBreakdownChart.tsx`、`UsageOverview.tsx`、`EntityUsage/SpendByProvider.tsx` | 筛选、图表与指标的展示布局，不改数据链路                                                        |
| 首页 `HomePage.tsx`                                                                                                                                            | 趋势高度与使用指引间距，数据及入口不变                                                          |
| `model_info_view.tsx`、`templates/key_info_view.tsx`、`team/TeamInfo.tsx`、用户 `user_info_view.tsx`                                                           | 详情页对齐与换行                                                                                |
| `organisms/create_key_button.tsx`、`Teams.tsx`                                                                                                                 | 弹窗宽度和表单间距                                                                              |
| `common_components/UserDropdown.tsx`、`src/i18n/zh-CN.json`                                                                                                    | 受影响界面的普通中文文案，选项 value 不变，`shared/advanced_date_picker.tsx` 同时本地化日期面板 |
| `AdminPanel.test.tsx`                                                                                                                                          | 按统一页面标题更新原有可见文案断言                                                              |

视觉对比、测量值和最后验证结果见 [统一设计规范复核](design-qa.md#统一设计规范复核)。之前各轮字号和密度记录保留为历史证据，当前界面以本节和 DESIGN.md 为准

### 统一设计规范验证

本轮最终按桌面 Web 范围验证，页面与共享骨架的首批 12 文件运行 122 项，其中 1 项管理员标题断言随“系统设置”标题更新，之后在相关复核中通过。模型权限、页面页签、日志、用户列表、首页及布局的其他用例通过。后续 7 文件 339 项、用量与日期相关 4 文件 39 项、日期面板 1 文件 24 项、供应商与用量图表 2 文件 28 项、首页 1 文件 4 项均通过，各批次有重叠，不相加为独立测试总数。没有新增跳过或预期失败，也没有运行此前记录的 12 项隐藏用量视图失败用例或全套前端测试

最终生产构建、TypeScript 和静态导出通过，使用 `scripts/pre_commit_lint.sh` 执行本轮适用的 Prettier、ESLint 和 lint 预算检查，预算和规则没有放宽。未重复执行已知被旧版 uv bootstrap 阻塞的 `make check`，未改动 Python 环境、依赖、锁文件、后端或 OpenAPI 类型。Impeccable layout 扫描未报告问题，不能据此替代实际页面验收

1280px 下检查 12 个保留页面，页面标题左边界均为 228px、字号均为 31.5px，所查普通控件均为 32px，未出现整页横向溢出。补查管理员、员工、英文、深色、1536px 宽屏及 900px 窄桌面窗口，表格和表单继续使用原有内部滚动。模型搜索和清空恢复正常，目录仍为 41 项。弹窗仅打开、输入和关闭，没有创建或修改模型、密钥、用户、团队或预算。最终恢复中文浅色和默认视口。视觉对比及限制记录在 [design-qa.md](design-qa.md#统一设计规范复核)

最终镜像另标记为 `litellm-moma:uniform-20261102`，镜像 ID 为 `sha256:7028c6be80d998ac2144d79bf8929116449264e39adff778528414e2cdd88da1`。4001 应用容器使用最终静态资源重建，健康检查返回 HTTP 200，原数据库卷、salt、账户、模型和密钥保留。4000 和 4002 未参与本轮更新。镜像本身仍不包含数据库中的模型和上游凭据

没有重复真实推理、计费、供应商健康探测、完整可访问性、全套前端或跨浏览器回归，已有员工配置读取权限问题未在此轮处理

### 首页首屏与用量对齐

2026-11-02 从 `8b32bbf80a` 继续调整，社区基线和版本不变。字号及颜色保持上一轮规范，只调整布局和间距。首页与用量共用的指标从四列调整为五列，原来叠放的平均花费和平均延迟分别占一列，所有数值顶部对齐，指标小趋势从 32px 收到 24px。Token 缓存提示与明细入口允许同行排列，所有数值、查询、预算提示和明细弹窗仍使用原实现

首页区块间距及面板内边距使用 12px，趋势图从 224px 收到 160px，使用指引同步压紧。可用模型将图标与文字横排，并使用 auto-fit 让实际卡片占满可用宽度，仍只展示原授权接口返回的前三项。没有增加模型权限、改变开通动作或修改 API Key 创建入口

用量统计移除主题对 Panel 内边距的重复覆盖，保留组件原有 bodyClassName，使“常用模型”与面板标题共享内容边界。供应商与用户排行位于第一行，密钥排行与 API 路径请求量位于第二行，1100px 以上使用双列，同行顶部对齐。原先的两个独立堆叠列不再保留。移除花费列强制左对齐的主题规则，恢复共享表格按 numeric 元数据对齐表头与数值。修复 InputGroup 内输入高 36px 超出 32px 外框的问题，内部输入跟随外框内容高度，外部筛选控件仍为 32px

按要求在集中隐藏页签列表增加 `ms-teams-alerts`，管理员“日志与告警”只保留告警类型、告警设置及邮件告警三个页签。共享 Tabs 同时阻止 Teams 页签按钮和内容挂载，即使已有选中值也不展示。没有删除 Teams 配置或后端告警实现，也没有关闭已存在的 Webhook 配置

本轮改动涉及 `home/_components/HomePage.tsx`、用量 `overview/UsageStatStrip.tsx`、`Primitives.tsx`、`UsageOverview.tsx`、`src/app/moma-theme.css`、`src/utils/liteUi.ts`。`liteUi.test.ts` 和 `LiteUiContext.integration.test.tsx` 增加 Teams 告警屏蔽及保留邮件入口的回归。设计规范与截图证据分别维护于 [DESIGN.md](DESIGN.md) 和 [首屏与对齐复核](design-qa.md#首页首屏与用量对齐复核)

### 首页与对齐验证

定向运行 5 个文件、56 项测试，以及图表、供应商、密钥排行和设置页相关 4 个文件、87 项测试，全部通过。生产构建、TypeScript、静态导出及 `scripts/pre_commit_lint.sh` 的适用前端格式、ESLint、lint 预算检查通过。没有放宽规则或预算，没有修改依赖、后端或 OpenAPI 类型

默认中文 1280×720 下，首页指标区从 176px 收到 144px，趋势及指引面板从 298px 收到 222px，可用模型区从 y=683px 提前到 y=563px，三张模型卡片连同入口在约 y=698px 内完整显示。普通文字仍为 14px，区块标题 21px，页面标题及指标 31.5px。长文案、不同数据和缩放可能继续需要滚动，不以隐藏内容保证首屏

用量页五个指标数值顶部均为 y=306px，同排筛选外框均高 32px、顶部均为 y=169px。两排统计面板各自顶部对齐，常用模型左边界为 x=245px，与每日用量标题一致。请求日志的筛选控件同排等高，金额表头与数值均恢复右对齐。检查用量概览、模型、密钥、用户及错误页签，以及 2078px 宽桌面与 900px 窄桌面窗口，所查页面没有整页横向溢出，宽表保留内部滚动。首页另外检查 1536×900、英文和深色，检查后恢复中文浅色及默认视口

最终镜像另标记 `litellm-moma:dense-home-20261102`，ID 为 `sha256:c394f1a296a8b6648f982a27f646936095721c9743b534b012e54c5629da5747`。4001 应用容器已重建，健康检查返回 HTTP 200，数据库、salt、账户、模型及密钥保留。首次容器启动尚未就绪时浏览器出现临时连接错误，待健康检查成功后重新加载并完成最终验收。旧浏览器缓存需要强制刷新才能加载新静态资源

本轮按桌面 Web 验收，没有手机专项、真实模型调用、计费、完整前端套件或跨浏览器回归。没有提交任何告警设置，也没有创建、删除或修改模型、用户、密钥和预算。已有员工配置读取权限限制不在此轮修改范围

### 设置参数与邮件通知汉化

2026-11-02 从 `fb8057e539` 继续补齐设置页翻译，社区基线仍为 `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`、版本 1.109.0。复用现有 LocaleContext、LocalizedText、useTranslation 和词典，不引入翻译依赖，不修改 API 或后台配置

邮件通知原组件没有接入翻译，现将标题、提示、五类已知通知事件、事件说明、保存和恢复按钮接入语言上下文。只翻译显示文本，API 接收的事件名称仍为原英文标识。SMTP 参数标签改为中文，例如“邮件服务器地址”，原先并列的括号英文参数名已按 2026-11-03 的要求移除，补齐输入与标签关联，保留 name、defaultValue、凭据遮蔽和仅提交修改字段的原逻辑。凭据显示与隐藏按钮也提供中文名称

告警设置将后端返回的 field_name、field_description、来源标记、更新与重置操作接入翻译。参数说明使用 14px，长名称与说明可换行，企业参数仍按原规则隐藏。报告检查间隔说明保留单位与用途，省去社区说明中与实际默认值不一致的“默认每小时”字样，没有调整当前字段值或后台默认值。花费说明沿用当前轻量版的数值单位约定，不新增汇率换算

系统设置的日志配置将标题、说明、字段标签、提示、保存状态和操作反馈接入翻译。词典中已有的技术参数中文标签补充英文原名，覆盖路由通用设置等已使用翻译的动态参数。共新增 76 个词条、更新 52 个已有词条，包含补齐的一条 MCP 通用设置说明。原参数键、枚举值、用户输入及提交数据不参与翻译。后续社区新增字段、修改描述或新增邮件事件时，仍需核对词典，未知技术内容保留原文，不自动生成未经核实的翻译

本轮文件为 `src/components/email_events/email_event_settings.tsx`、`email_settings.tsx`、`alerting/dynamic_form.tsx`、`Settings/AdminSettings/LoggingSettings/LoggingSettings.tsx` 以及 `src/i18n/zh-CN.json`。对应邮件、SMTP 和动态告警表单的三个已有测试文件增加中文显示与原字段提交的回归。界面规范继续记录在 [DESIGN.md](DESIGN.md)，实际截图见 [设置页汉化复核](design-qa.md#设置页汉化复核)

### 设置页汉化验证

定向测试首批 5 个文件、66 项，相关设置与语言切换 4 个文件、51 项全部通过，共 9 个不同文件、117 项。日志设置的后续错误提示调整另复核原 25 项用例通过，该批次与首批重叠，不另计入总数。新增回归证明中文事件及参数标签不改变原事件 ID、SMTP 参数名和告警表单提交键，语言切换保留未提交的字段内容。最终生产构建、TypeScript、静态导出和适用前端检查通过，未调整检查规则、依赖、锁文件或 lint 预算

浏览器检查日志与告警三个保留页签、系统设置的日志配置、路由通用设置，覆盖 1280×720 和 2078×1104 桌面宽度。所查页签普通正文没有剩余的整行英文说明，技术参数名、API、SMTP、TLS、UTC 和原输入值按设计保留。告警参数名称与说明实测为 14px，所查区域没有整页横向溢出。SMTP_HOST 填入临时示例地址后切换到英文仍保留原值，返回中文后清空，未点击保存、恢复、重置或测试告警。默认端口、TLS 文本和五类事件的原启用状态保持不变，最后恢复中文浅色与默认视口

最终镜像标记 `litellm-moma:settings-zh-20261102`，ID 为 `sha256:c1689732161579061418e6f7faa90072be3fe871479346ca7e4f8a64433ec3af`。已重建并重启 4001 应用容器，健康检查返回 HTTP 200，原数据库卷、salt、模型、用户与密钥保留，4000 与 4002 未参与。已有浏览器标签页需强制刷新以加载新的静态资源，MS Teams 页签继续屏蔽

没有发送真实邮件、调用真实模型、修改后台配置或执行全套前端、手机专项、跨浏览器及完整可访问性回归。已知员工设置读取权限问题仍不在本轮处理范围

### 保留页面的完整文案与排版复核

2026-11-02 从 `3859052075` 继续检查保留的管理员和员工页面，社区基线仍为 `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`、版本 1.109.0。本轮只修改前端显示、相关测试与文档，不修改代理、数据库结构、接口、权限、模型配置或人民币数值约定

共享表单通过 `LocaleContext.LocalizedLabel` 显示本地化标签，不再追加原注册字段名。字符串和带提示图标的标签均遵循该规则，词典内写死的括号英文参数名也已移除。英文模式保留原标签，语言切换不重建字段。`FormField`、`MountedFormField` 的注册、校验、隐藏逻辑和提交值保持原实现。局部自定义的模型编辑、预算和密钥生命周期标签也接入同一显示规则

补齐用量模型明细、密钥和用户用量、错误分析、默认用户设置、模型价格与参数详情、密钥摘要、团队扩展字段、模型别名、密钥生命周期等保留入口的说明、状态、占位和操作名称。动态计数使用带变量的翻译模板，模型名、别名、用户信息、ID、JSON、API 枚举及上游错误消息保留原值。没有通过 DOM 替换、CSS 伪元素或翻译输入值实现汉化。未知供应商的新字段仍需按真实元数据补充词典，不能把所有后端返回文本视为已翻译

模型参数和默认用户设置使用两列网格。移除新增模型模式说明与高级 JSON 说明的旧横向占位。错误指标预留一致的两行标签空间，提示可换行，数值顶部对齐，状态与失败排行移除重复内边距。参数标签按 14px 自然换行，日志详情中残留的 10 至 16px 内联字号改为既定字号令牌，保留 14、21、31.5、47.25px 阶梯及原始日志内容

| 影响位置       | 本轮维护范围                                                                                                                                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 共享表单       | `src/contexts/LocaleContext.tsx`、`shared/form/FormField.tsx`、`common_components/MountedFormField.tsx`、`common_components/LabeledField.tsx`                                                                                                 |
| 通用控件       | `src/components/ui/button.tsx`、`checkbox.tsx`、`select.tsx`、`switch.tsx`、`dropdown-menu.tsx`、`tooltip.tsx`、`shared/DataTable/DataTableSelectionColumn.tsx`，只翻译操作及辅助名称                                                         |
| 模型管理       | `ModelInfoEditForm.tsx`、`model_info_view.tsx`、`molecules/models/ModelPricingSummary.tsx`、模型目录的 `ModelsTableColumns.tsx` 和 `ModelRetrySettingsTab.tsx`、`add_model/AddModelForm.tsx` 和 `advanced_settings.tsx`                       |
| 用量与配额     | `activity_metrics.tsx`、`UsagePage/components/KeyActivityPanel.tsx` 和 `UserActivityTable.tsx`、用量 `ModelViewToggle.tsx`、`errors/ErrorsTab.tsx`、`overview/Primitives.tsx`、`shared/charts/chart_tooltip.tsx`、预算 `BudgetFormFields.tsx` |
| 用户与设置     | 默认用户设置 `DefaultUserSettingsForm.tsx`、`UsersTableColumns.tsx`、`Settings/AdminSettings/UISettings/TeamAdminEditableFieldsSettings.tsx`                                                                                                  |
| 密钥与团队表单 | `templates/KeyInfoHeader.tsx`、`key_info_view.tsx`、`common_components/DefaultProxyAdminTag.tsx`、`KeyLifecycleSettings.tsx`、`ModelAliasManager.tsx`，团队扩展字段的显示文案由词典覆盖                                                       |
| 故障转移       | `Settings/RouterSettings/Fallbacks/` 中 `AddFallbacks.tsx`、`AddFallbacksModal.tsx`、`FallbackSelectionForm.tsx` 和 `FallbackGroupConfig.tsx`                                                                                                 |
| 日志详情       | `logs/detail/` 中 `LogDetailsDrawer.tsx`、`LogDetailContent.tsx`、`DrawerHeader.tsx`、`TokenFlow.tsx`、`CollapsibleMessage.tsx`、`SimpleMessageBlock.tsx`、`HistoryTree.tsx`、`OutputCard.tsx`，以及实时事件和评估详情中的字号                |
| 样式与词典     | `src/app/moma-theme.css`、`src/i18n/zh-CN.json`、`DESIGN.md`、`design-qa.md`、Docker 预览说明及对应截图                                                                                                                                       |

共享提示图标的英文辅助名称由内部图标名改为 `Field help`，相应调用方测试同步调整，包括已屏蔽的 MCP 和智能路由测试中的该项断言，没有恢复这些功能。社区升级时重点合并新的表单注册方式、动态文案、价格展示、图表类别和日志组件，继续核对中文标签不附带括号英文参数名、原输入和提交键不被翻译、所有已屏蔽入口保持隐藏

### 保留页面复核的验证与限制

保留页面和共享控件相关的 27 个测试文件、424 项不同用例通过。语言回归验证双语参数名不重复、切换语言不丢失未提交输入，提交仍使用原键和值，表格选择仍返回原实体 ID。最后的对齐检查 2 个文件、11 项，以及后续 3 个文件、40 项和语言 3 项复核均通过，重复用例没有累计到不同用例数量中

另外运行了已屏蔽的 `AutoRouterBenchmarksTab.test.tsx`，36 项中 22 项通过，14 项失败。失败集中在旧测试仍断言美元符号，而本轮起点的 `costOptimizationUtils.ts` 已输出人民币符号，金额展示代码不在本轮差异中。仅同步该测试内共享提示图标名称的断言，没有调整金额断言、恢复智能路由页面或把这些失败视为通过。此前记录的其他全套测试限制仍保留

最终生产构建、TypeScript、静态导出，以及 `scripts/pre_commit_lint.sh` 的适用前端 Prettier、ESLint 和 lint 预算检查通过，没有放宽规则、预算或修改依赖。初次检查发现的新增嵌套条件、文件行数超限和测试断言写法已修正后复核通过

浏览器检查管理员 12 个主页面、18 个保留页签和员工 5 个主页面，并检查创建密钥及有效期、创建团队的七个扩展区、用户邀请、预算、模型新增与编辑等常用表单和日志详情。默认 1280×720 下主页面标题左边界均为 x=228px，所查文字属于 14、21、31.5、47.25px 阶梯，没有整页横向溢出。错误页六个指标数值顶部均为 y=330px，标签与说明换行后仍保持一致。另检查 900px 窄桌面、1536px 及 2078px 宽桌面窗口和英文、深色模式，最后恢复中文浅色及默认视口。模型目录仍为 41 项，原业务字段、历史日志和员工可见范围保持不变

最终镜像标记 `litellm-moma:ui-audit-20261102`，ID 为 `sha256:72f28a862648e4874b09132817b01e3e72527ca1de1d41ca782b0697e9c610af`。4001 应用容器已重建并重启，健康检查返回 HTTP 200。原数据库卷、salt、账户、模型与密钥保留，4000 和 4002 服务未参与。旧浏览器需要强制刷新加载新静态资源

本轮没有提交任何表单、创建或删除业务记录、调用供应商模型、发送邮件、执行完整前端套件、手机专项或跨浏览器及完整可访问性回归。实时事件和评估详情的字号按共享令牌修正，当前预览没有对应真实业务样本，不把源码修正视为这些流程已完成业务验证。上游错误消息、用户内容及原始 JSON 保留原文，未为未知供应商的全部动态字段承诺翻译覆盖

## 首次使用提示与详情页汉化补齐

2026-11-02 从 `f4dcafae12` 继续补齐用户列出的 14 类遗漏，社区基线仍为 `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`、版本 1.109.0。沿用现有翻译组件和词典，没有新增依赖、修改后端接口、鉴权或金额数值

`src/components/CommandPalette/` 补齐首次使用提示、命令面板标题、动作、页面分组、类型、搜索空状态及底部快捷键说明，品牌行统一为 MoMA 轻量版，密钥搜索结果的金额符号统一为人民币。中文搜索使用本地化后的页面和动作名称，首次打开后的提示隐藏逻辑保持原样

`src/components/VirtualKeysPage/VirtualKeysTable.tsx` 与 `logs/request/RequestLogsFilters.tsx` 同时翻译状态选项和当前选中值，筛选仍提交原状态字符串。请求日志表格空状态、公开模型或搜索工具标签，以及 `logs/detail/` 的请求标题、提示词存储说明、令牌数、费用和凭据状态同步汉化。配置示例、请求 ID、原始请求与响应保持原值

`src/components/templates/key_info_view.tsx` 翻译详情占位值和人民币单位，`key_edit_view.tsx` 将访问组标签与创建表单对齐。模型表单的超时字段补充词典，`shared/CredentialIdentity.tsx` 翻译手动配置状态。`SidebarAccountMenu/SidebarAccountMenu.tsx` 翻译账户角色，版本标签由词典补齐

`src/app/(dashboard)/usage/_components/components/overview/UsageBreakdownChart.tsx` 与 `overviewData.ts` 按当前语言格式化每日及每周图表刻度和提示日期。`src/app/(dashboard)/users/_components/view_users/user_info_view.tsx` 补齐节省费用、自动路由用量、详情占位值、中文日期和预算重置周期，`src/components/permissions/MCPServerPermissions.tsx` 补齐区块标题与空状态。模型名、用户别名和分组数据不参与翻译

`src/app/login/LoginPage.tsx` 仅在展示层翻译词典内已知的登录凭据错误，覆盖管理员环境变量密码和用户密码两种提示。其他后端错误继续显示原文，后端返回值不变。这是原先保留后端错误原文边界中的明确登录场景例外

最终定向回归 12 个文件、334 项全部通过，覆盖首次提示、命令面板中文搜索与英文切换、筛选状态原值、密钥详情金额及占位值、登录错误、账户角色、用户日期与 MCP 空状态。另运行密钥编辑集成测试，112 项通过、2 项预期失败、7 项失败。通过临时 Vitest 加载插件使用修改前的该组件复跑，得到相同的 7 项失败，均涉及旧测试查找 Prompts 或 Models 标签；没有修改这些无关断言或把失败记为通过

最终生产构建、TypeScript、静态导出和 `scripts/pre_commit_lint.sh` 的适用前端 Prettier、ESLint 与 lint 预算检查通过，没有放宽规则或预算。日期格式化合并后，用户详情 29 项用例复核通过，属于前述 334 项，不重复累计。4001 应用容器使用现有 Compose 项目及私有环境文件重新构建、创建并启动，数据库服务与卷保持原状，健康检查返回 HTTP 200。当前镜像 ID 为 `sha256:2e4ce49f0f90c5fb700ba5a8d864fdc1353e38e06f069df1abc6ccb291400bef`，4000 和 4002 服务没有参与本次更新

Chrome 实际复现了更新前的英文登录错误，并验证更新后的中文错误、英文切换及页面截图，最后恢复中文。镜像替换时旧页面出现一次静态资源加载错误，重新加载后登录页面和交互正常。本次浏览器会话已经退出，登录后的页面通过组件回归验证，没有声称完成登录后的全页面浏览器复核。没有创建、删除业务记录、调用模型、发送邮件、修改账户密码或执行全套前端、跨浏览器与完整可访问性回归

## 移除中文标签后的括号英文

2026-11-03 从 `56a173dcf4` 按要求移除中文界面中附带的英文参数名，社区基线仍为 `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`、版本 1.109.0。本节取代此前保留括号英文参数名的显示约定

`src/contexts/LocaleContext.tsx` 删除旧的 `ParameterLabel` 自动追加与重复检测逻辑，使用仅负责翻译和标签排版的 `LocalizedLabel`。`shared/form/FormField.tsx`、`common_components/MountedFormField.tsx`、`KeyLifecycleSettings.tsx`、`ModelInfoEditForm.tsx`、预算表单和模型重试设置同步移除字段名展示参数，`src/app/moma-theme.css` 保留标签换行与提示图标样式。表单注册、校验、隐藏字段和提交逻辑不变

`src/i18n/zh-CN.json` 清理 97 处写死的括号英文标注，覆盖模型、密钥、日志、SMTP、告警和系统设置等区域。必要的大小单位使用“兆字节”，时区使用“协调世界时”，输入格式说明继续保留所需字母。英文模式、用户输入、模型名、原始 JSON、接口字段和值不做字符串替换。当前设计规则同步写入 `DESIGN.md`

10 个相关测试文件、143 项通过，覆盖共享及自定义表单、模型编辑、密钥生命周期、SMTP、动态告警和日志设置。语言回归验证中文标签不附带英文参数名，切换英文后保留原文，包含括号参数名的用户输入也原样提交。SMTP 与动态告警继续验证原字段名和参数值

生产构建、TypeScript、静态导出和 `scripts/pre_commit_lint.sh` 的适用前端 Prettier、ESLint 与 lint 预算检查通过，没有放宽规则、预算或依赖。4001 应用容器使用原 Compose 项目和私有环境文件重建并启动，镜像 ID 为 `sha256:a152b5b6102960161a42c44d956a22889e6f911fe84a243485c330c448887d7e`，健康检查返回 HTTP 200。数据库服务、卷、密码和其他 Docker 服务未改动

在独立的内置浏览器标签页检查模型新增及高级设置，已有凭据、模式、API 基础地址、密钥和模型访问组等标签均不再附带括号英文。填写临时示例地址后切换英文，输入保留；随后清空并恢复中文，没有提交表单或测试连接。截图检查正常，所查页面没有控制台错误或警告。原用户标签页保留原状态，刷新后加载新资源。本轮没有执行全套前端、手机专项或跨浏览器回归，也没有调用模型或修改业务记录

## 保留页面的品牌文案与系统资源显示名

2026-11-03 从 `0e8a9ebd45` 清理走查确认的品牌暴露，社区基线仍为 `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`、版本 1.109.0。仅修改前端展示、相关测试和本记录，不修改数据库、后端接口、权限、许可证校验或模型调用

`DashboardHeader.tsx` 与 `navbar.tsx` 不再挂载 Docs、Blog 和社区推广入口。账户菜单移除上游版本徽章、发布说明外链及版本查询，感谢提示统一为 MoMA。轻量版通知面板保留组件与空状态，但不查询和展示上游版本发布通知。非轻量版通知分支保持原社区行为

密钥列表与详情的累计花费提示移除上游版本及发布日期，保留历史用量可能未回填的说明，列头提示接入翻译。模型新增、详情、凭据复用、连接测试、团队字段及邮件设置移除社区文档或问题反馈链接，保留字段解释、表单校验和原操作。模型名称和调用参数标签改为产品中性文案，日志处理开销与调用 ID 的可见及复制辅助名称同步调整。登录页 SSO 与默认凭据提示不再包含上游品牌或文档链接

部署健康告警没有屏蔽。`DeploymentWarningContent.tsx`、`DeploymentHealthPanel.tsx` 与 `licenseUtils.ts` 提供中文告警、分组、动作和许可证日期，保留共享环境密码、缺少 Redis、调试日志的实际风险与修复配置说明，移除厂商文档和销售联系。忽略、暂缓、恢复及原有权限逻辑保留，未知告警继续显示原消息

`src/utils/systemResourceLabel.ts` 仅映射五个完整系统标识。`litellm-internal-health-check` 和 `key-hash-litellm-internal-health-check` 显示为“系统健康检查”，`litellm_proxy_master_key` 和 `key-hash-litellm_proxy_master_key` 显示为“平台主密钥”，`litellm-dashboard` 显示为“控制台团队”。共享 ID、身份及字段单元格、用量密钥与团队标签、排行榜和图表、日志表格与筛选选项使用显示名。中文与英文均有对应名称，用户自定义内容不按子串替换。数据库值、筛选选项值、点击回调、链接与复制结果继续使用原始标识

词典同步清理自有译文中保留的品牌字样。模型调用参数原始 JSON 中的 `use_litellm_proxy` 等键、请求和响应、未知上游错误、静态资源前缀 `/litellm-asset-prefix/`、隐藏功能源码与依赖元数据不在展示文案替换范围内。本轮不承诺源码、网络请求或全部原始业务数据中完全没有上游技术标识

首批定向回归 21 个文件、332 项通过。补充检查模型新增与详情、旧顶栏、登录、请求筛选、用量排行和密钥详情，修正本轮文案改变引起的断言，最终旧顶栏、缓存提示、共享 ID 与排行 4 个文件、67 项通过，系统显示名和用量标签 3 个文件、73 项通过，重复用例不累计。模型详情集成用例“shows a zeroed PTU price as 0.0000 rather than Not Set”仍失败，通过临时 Vitest 加载插件用修改前的 `ModelInfoEditForm.tsx` 复跑得到相同失败。该用例依赖旧标签父元素结构，没有改动无关 PTU 逻辑或将它记为通过，另有 4 项既定预期失败

生产构建、TypeScript 与静态导出通过，适用前端 Prettier、ESLint 和 lint 预算检查通过，没有放宽规则或预算。管理员内置浏览器实查模型新增、账户菜单及感谢提示、通知空状态、部署告警抽屉、用量概览和密钥用量。安全告警保留共享密码风险及配置修复步骤，没有操作忽略、暂缓或恢复。用量页验证系统健康检查、平台主密钥和控制台团队的友好显示，页面没有重新提交表单、创建或删除记录、测试模型连接或发送邮件

本轮未重走全部管理员和员工页面，员工条件展示由轻量版组件测试覆盖，没有将此前全站审计当作本轮完整浏览器复核。未执行完整前端套件、真实供应商调用、手机专项、跨浏览器或完整可访问性回归。累计花费与历史回填提示的内容及翻译按源码和构建核对，本轮未重新实测鼠标悬停

最终 4001 应用容器以现有 Compose 项目及私有环境文件重建并启动，镜像 ID 为 `sha256:84e06fe75861720cb044ee2a19002f6582962bbba03e456618b6afdd62d52820`，`/health/liveliness` 返回 HTTP 200。核对运行时密码、salt 和主密钥与原私有环境文件一致，仅重建应用服务，数据库服务、卷和 4000、4002 未参与更新。最终浏览器确认带 `key-hash-` 的健康检查记录也显示为“系统健康检查”。用量页加载时捕获图表宽高为零的警告，没有在本轮扩展为图表布局修复。容器启动窗口内验收标签页曾短暂连接失败，健康就绪后新标签页加载正常，原用户标签页未操作

## 管理员与员工品牌复核及条件内容补漏

2026-11-03 从 `d6f38d64b0` 重新核对两种真实角色，社区基线仍为 `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`、版本 1.109.0。浏览器走查管理员 12 个保留主页面和员工 5 个主页面，覆盖全局账户、通知、命令面板，模型新增与高级字段、模式选项、凭据新增与身份联合、健康和重试页签、模型详情与编辑，密钥创建与可选设置、详情及编辑，用量全部保留页签，成功与失败日志、筛选下拉、用户邀请与批量邀请、默认用户设置和用户详情页签，团队创建的七个扩展区、可加入团队空状态，访问组创建和编辑、预算创建、路由组与故障转移创建，以及告警和系统设置各保留页签。两种角色均核对组织、试用页的屏蔽回退；未知地址与 `/ui/404.html` 当前经过页面白名单后均显示“当前版本不提供此页面”

实测密钥表头的信息图标悬停，确认管理员和员工均展示不含上游品牌的中文累计花费说明。进一步展开模型密钥更新、用户邀请、可加入团队、用户节省费用、路由组创建及团队字段帮助时发现上一轮遗漏，没有把前一轮重点检查当作全站通过。新修复包括以下范围

| 位置           | 本轮变更                                                                                                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 模型凭据更新   | `update_model_credentials_modal.tsx` 去除警告中的上游参数名称，翻译警告、说明和新密钥输入，不改变仅更新 `api_key` 的请求结构                                                              |
| 模型列表与详情 | `ModelsTableColumns.tsx`、`AllModelsTab.tsx`、`model_info_view.tsx` 的悬停标签、复制辅助名称、复制反馈及校验提示改为上游模型或模型调用参数；高级参数说明与身份联合地址示例同步清理        |
| 密钥创建成功   | `shared/CreatedKeyDisplay.tsx` 的安全说明和展开、复制的客户端接入说明改为产品文案，移除文档推广行，保留真实网关地址、密钥及原协议端点                                                     |
| 用户与团队     | `CreateUserButton.tsx` 移除邀请邮件文档外链，`AvailableTeamsTable.tsx` 的空状态改为联系管理员，`TeamAdminEditableFieldsSettings.tsx` 移除两个悬停帮助中的厂商文档链接，解释和权限保持不变 |
| 节省费用       | `SavingsTiles.tsx` 改为网关注入，`SummaryCard.tsx` 将标题、提示和计算说明接入已有翻译组件，不改金额与统计逻辑                                                                             |
| 路由与用量     | 路由组说明改为网关，故障转移测试成功提示不再链接厂商文档，通用设置的透传端点描述使用前端自有说明，模型用量标签同步改名                                                                    |
| 请求日志       | 空状态与未存储请求数据的英文源文案改为网关，`DrawerHeader.tsx` 的环境显示和 `LogDetailContent.tsx` 的标签值复用完整系统标识映射，原始元数据与复制内容保留原值                             |

没有改后端源码、数据库结构、转发、角色授权或业务记录。用户另行授权重置员工测试账号密码，使用现有 `/user/update` 和 `/user/password/change` 完成临时密码及正常修改流程，私有凭据文件同步更新。核对员工角色、模型权限、团队、预算、预算周期和 TPM/RPM 未改变，管理员密码、主密钥和 salt 保留。密码不进入仓库、截图或本记录

当前真实团队列表为空，没有新建团队来制造详情样本；创建密钥成功说明、缺少日志数据、版本更新与许可证到期等未在现场触发的状态，通过现有组件定向用例和源码检查补核，不将其描述为全部真实后端条件均已实测。日志和模型的原始 JSON、技术配置字段、请求头与上游错误继续保留原值，静态资源前缀仍为 `/litellm-asset-prefix/`。本轮不包含真实模型调用、邮件发送、表单业务提交、删除动作、手机专项、跨浏览器或完整可访问性回归

本轮最终定向测试 19 个文件，475 项通过，4 项预期失败。模型详情中与上一轮相同的 PTU 零价格断言仍失败，期望读取价格的旧父节点实际只包含字段标签；没有把该既有失败记为通过。新增验证覆盖凭据更新中文说明、创建成功后的展开与复制说明、系统健康检查标签、可加入团队空状态和悬停帮助内容。生产构建、TypeScript 和静态导出通过。首次 lint 发现新增文案未转义的单引号，修正后重新执行适用检查，不调整既有预算

浏览器记录共 145 个页面或交互状态，包含新镜像复验，不将其等同于 145 个独立页面。员工控制台仍有原有的管理员配置接口 403，和用量图表加载时的宽高为零警告，未越权放开接口或扩展为图表布局修复。页面保留有权限的业务内容，无框架错误覆盖层

最终 Prettier、ESLint 和 lint 预算检查通过，没有放宽规则。4001 应用服务使用原 Compose 项目和私有环境文件重建并启动，镜像 ID 为 `sha256:c1f9793a115e5047f61257fc402c34295f69cb54b9adf7da86667eb7f0feefb5`，`/health/liveliness` 返回 HTTP 200。管理员环境密码、salt 和主密钥与原私有文件一致，数据库服务与卷、4000 和 4002 未参与更新

浏览器在普通导航和新标签页中仍复用了部分旧页面资源；核对服务端 HTML 与本地静态导出一致后，使用忽略缓存的完整刷新重新验证。最终确认模型凭据更新、用户邀请、节省费用、路由组创建、透传端点说明、团队字段帮助和日志系统显示名均已生效，并在员工账号复验五个页面、模型详情、创建密钥、累计花费悬停、团队空状态与通知。另检查英文模型悬停和凭据更新文案，最后恢复中文及管理员模型新增页面，关闭临时禁用缓存设置。已有用户页面应强制刷新以加载新资源

## 本地测试账号密码统一

2026-11-03 用户要求管理员和员工测试账号使用同一指定密码，并明确授权仅在 4001 测试环境关闭泄露密码校验。`docker/lite-ui-preview.yaml` 增加 `general_settings.password_policy_check_breached_passwords: false`，最少 12 位、大小写、数字和特殊字符等其他要求继续使用原策略。此项是本地测试部署配置差异，不修改后端校验源码、生产默认值或 4000、4002 的设置

管理员密码仅更新至原私有 Compose 环境文件，员工密码通过现有登录会话调用 `/user/password/change` 更新，同步原私有账号文件，不在仓库、日志或文档中保存密码。4001 应用使用现有镜像重新创建和启动，数据库服务与卷、主密钥和 salt 保留。仅更改配置及凭据，没有重新构建前端或执行供应商模型调用

通过真实 `/v2/login` 验证两个账号均返回 HTTP 200，角色分别为 `proxy_admin` 和 `internal_user`，均无强制修改密码标记。核对两账号私有文件中的密码相同、运行时管理员密码匹配私有文件，主密钥、salt 和数据库密码保留。Compose 配置校验及修改文件的 Prettier 检查通过，`/health/liveliness` 返回 HTTP 200。未重新执行前端测试、构建或页面走查，此次没有界面代码变更

## 轻量版进入 main

2026-11-03 按用户要求，将 `walnut1024/litellm` 的默认分支 `main` 快进到轻量版 `32043834b5`，保留原 `litellm_lite_ui_masking` 分支和完整提交历史。原 `main` 为 `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`，它也是本记录的社区源码基线，两者没有分叉。本次没有合入新的社区版本，社区基线及版本 1.109.0 保持不变

后续默认从 `main` 维护轻量版。核对社区差异继续使用固定社区基线，不能把已包含自定义改造的 `main` 当作未修改的社区源码。本次仅整理分支并更新本记录，运行代码与已验证的轻量分支一致，没有重复执行构建、测试或重启 Docker，既有验证结果和限制沿用前述记录
