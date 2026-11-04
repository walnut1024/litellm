# MoMA 轻量版相对开源版定制清单

## 对比基线与阅读口径

本版面向内部模型服务分发。管理员接入采购的模型服务并配置用户、团队、权限和预算，员工登录后获取自己的 API Key，通过客户端调用模型

本文按功能模块记录相对开源源码的屏蔽、新增和修改，同时列出保留能力、实现位置和验证边界。屏蔽项既有企业能力，也有实验功能和当前场景不需要的开源功能，不能把所有屏蔽项统称为企业版功能

| 项目             | 本次核对口径                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| 整理日期         | 2026-11-04                                                                                       |
| 开源基线提交     | `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`                                                       |
| 基线标题与版本   | `test(router): audit #47498 (#48799)`，根目录 `pyproject.toml` 的版本为 `1.109.0`                |
| 已核对的定制提交 | `a04f2c34ef4a2cdfaac0484a1d0014919db075d9`，后续本文整理提交只修改本文件                         |
| 维护分支         | `main`，原 `litellm_lite_ui_masking` 分支保留                                                    |
| 差异范围         | 上述两个提交之间共 462 个文件，包含界面、测试、说明、依赖配置和本机部署文件，并非 462 个功能改动 |
| 本机预览入口     | [localhost:4001/ui/](http://localhost:4001/ui/)，这是部署地址，不是本次运行验收结论              |
| 未提交改动       | 本次开始时工作区另有 19 个业务代码文件的修改，未作为本文已完成差异或验证依据，也未纳入本次提交   |

`main` 已包含定制，不能把它当作未修改的开源源码。升级时应记录旧、新开源基线的 SHA 与版本，再逐模块核对。持续维护要求见[根目录 AGENTS.md](../../AGENTS.md#lightweight-fork-maintenance)

“屏蔽”指前端入口、控件或内容不可见，不表示删除源码、停用后端 API 或撤销已有授权。“新增”指基线没有的交互、组件或部署资料。“修改”包括展示、默认值、表单提交边界和查询行为的调整。复用原生接口实现的新交互仍属于前端新增，不表示新增后端能力

本次对比中，`litellm/`、`enterprise/`、`litellm-rust/` 和 `prisma/` 没有源码差异。模型转发、供应商适配、数据库结构、API 路由、预算计算、鉴权与许可证校验沿用开源基线。隐藏数据仍可能在接口响应或已挂载组件中，敏感数据保护继续依靠后端权限

## 功能模块总览

下表是定制后的可见范围，仍叠加开源原有角色、页面配置与后端权限。页面白名单不会赋予员工管理员权限

| 功能模块           | 员工可见范围                               | 管理员可见范围                             | 主要定制                                                 |
| ------------------ | ------------------------------------------ | ------------------------------------------ | -------------------------------------------------------- |
| 导航与页面访问     | 工作台、模型、密钥、用量和原权限允许的团队 | 保留模型运营、访问控制和系统设置           | 新增 MoMA 导航与页面白名单，屏蔽非核心页面和推广入口     |
| 工作台 Home        | 个人概览、模型入口和创建密钥               | 原权限范围内的概览和快捷入口               | 移除新闻、榜单，新增 Token 趋势、可用模型和使用指引      |
| 模型服务           | 授权模型、基础详情、卡片与列表、快捷开通   | 另保留模型增删改、凭据、健康检查和重试配置 | 新增卡片与开通，供应商目录收窄并默认 MoMA，隐藏高级页签  |
| API 密钥           | 本人有权访问的密钥及原有操作               | 原有密钥管理和用户、团队归属               | 简化所有者、类型、字段、详情、列与筛选                   |
| 用量统计           | 原权限允许的本人和团队用量                 | 全局、本人、用户和团队视角                 | 隐藏资源统计与自然语言查询，调整概览布局与本地化         |
| 请求日志           | 不开放日志页                               | Request Logs 与请求详情                    | 隐藏审计和删除记录页签，保留真实请求与费用               |
| 团队               | 原权限允许的团队查看和操作                 | 团队、成员、模型、预算和 TPM/RPM           | 隐藏非模型资源与高级配置，成员角色和编辑字段保留         |
| 用户               | 沿用原角色限制                             | 用户创建、批量邀请、详情、编辑及默认设置   | 隐藏 MCP 权限，补齐中文、金额与状态展示                  |
| 访问组             | 沿用原角色限制                             | 基本信息、模型及原有管理流程               | 隐藏 MCP、智能体和技能页签与数量标记                     |
| 预算               | 沿用原管理员限制                           | 原有预算管理                               | 本地化周期与人民币单位，不新增计费规则                   |
| 路由设置           | 不开放                                     | 基础设置与原有重试配置                     | 隐藏路由策略、标签过滤和延迟高级配置                     |
| 日志与告警设置     | 不开放                                     | 普通告警、参数和邮件设置                   | 隐藏日志回调、企业参数和部分集成，默认进入告警类型       |
| 系统管理           | 不开放                                     | SSO、SCIM、UI Settings、Logging Settings   | 精简页签与界面开关，默认进入 UI Settings，保留许可证约束 |
| 界面主题与通用展示 | 使用统一主题与语言切换                     | 另可配置 Logo 和浏览器图标                 | MoMA 品牌、统一布局、中英文和人民币显示                  |
| 本机部署           | 无独立员工配置                             | 独立 Compose、数据库和静态 UI 发布流程     | 新增本机预览资料，未裁剪后端运行时                       |

## 按功能模块的具体差异

### 导航、入口与页面访问

开源基线已有侧栏、移动导航、命令搜索、菜单角色过滤和页面本身的权限判断。本版在这些能力上增加轻量白名单，并以 MoMA 分组导航替换控制台原有布局

| 类型 | 具体差异                                                                                                                                                                               |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新增 | `liteUi.ts` 集中定义页面、页签、字段和表格列策略，`LiteUiBoundary` 拦截不在白名单的页面，显示“当前版本不提供此页面”                                                                    |
| 新增 | 模型服务、用量与配额、访问控制、系统设置四组导航。桌面使用左侧导航，小于 1100px 时改用同源抽屉，空分组不展示                                                                           |
| 修改 | 侧栏、移动导航和命令搜索复用 `visibleMenuGroups`，先按轻量白名单收窄，再执行原角色、团队管理员身份和员工页面配置过滤                                                                   |
| 屏蔽 | Organizations、Projects Beta、Playground、API Reference、Agents、Workflow Runs、Memory、MCP Servers、Skills、Guardrails、Policies、Search Tools、Vector Stores、Tool Policies          |
| 屏蔽 | Model Insights、Cost Optimization、Lens、Guardrails Monitor、AI Hub、Learning Resources、Response Cache、Experimental 及其子入口，以及白名单外的 Chat、Moyai、Cost Tracking 等独立页面 |
| 屏蔽 | 顶栏 View Switcher、Lite Admin、Docs、Blog、Community 等入口，移除上游版本徽章、发布说明外链及账户菜单中的版本查询                                                                     |
| 修改 | 隐藏页签的触发器和内容都不渲染，旧页签 URL 回退到允许的默认项，`keepMounted` 不恢复隐藏内容                                                                                            |
| 保留 | 登录、onboarding、修改密码和既有 `mcp` 回调路由，MCP 管理页仍被屏蔽。原有导航注册表、角色权限和相关源码保留                                                                            |

页面路径与菜单 ID 并不总相同，例如 `models-and-endpoints` 对应 `models`，`usage` 对应 `new_usage`。访问控制页面继续由原页面和后端判断具体角色，不能把 `litePageAllowed` 单独视为授权系统。隐藏功能的依赖和静态页面未统一删除，不承诺安装包或 JavaScript 体积下降

主要实现为 [liteUi.ts](src/utils/liteUi.ts)、[LiteUiContext.tsx](src/contexts/LiteUiContext.tsx)、[leftnav.tsx](src/components/leftnav.tsx)、[MomaNavigation.tsx](src/components/MomaNavigation.tsx)、[控制台 layout](<src/app/(dashboard)/layout.tsx>)、[tabs.tsx](src/components/ui/tabs.tsx) 和 [useUrlTab.ts](src/hooks/useUrlTab.ts)

### 工作台 Home

| 类型           | 开源基线                                 | 本版差异                                                                                    |
| -------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| 屏蔽并移除请求 | Lite Admin、社区新闻、模型榜单与更新推广 | 首页不再渲染这些区块，移除对应博客和榜单查询，顶栏发布通知也不再查询上游更新                |
| 新增           | 原有最近 7 天用量概览                    | 同一用量数据增加 Token 趋势，新增可用模型入口与使用指引，模型入口仅展示授权接口返回的前三项 |
| 修改           | 原概览指标和首页排布                     | 改为工作台，花费、请求数、Token、平均花费、平均延迟采用五列，指标顶部对齐，首页趋势高 160px |
| 保留           | 原有时间与角色范围                       | 继续统计最近 7 天实际花费，不改成当月数据或预计费用，创建密钥仍受只读角色约束               |

本版未新增账户钱包、订单、支付、退订、Token Plan、智能路由、排行榜或 Token 计算器。页面中的“开通”含义见下一模块

主要实现为 [HomePage.tsx](<src/app/(dashboard)/home/_components/HomePage.tsx>)、[UsageStatStrip.tsx](<src/app/(dashboard)/usage/_components/components/overview/UsageStatStrip.tsx>) 和 [NotificationsBell](src/components/Navbar/NotificationsBell/)

### 模型服务、供应商与快捷开通

| 类型 | 具体差异                                                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 新增 | 模型卡片视图与卡片、列表切换。员工默认卡片，管理员默认列表，切换状态仅在当前组件内保存                                                        |
| 新增 | 卡片“开通”和结果弹窗，复用 `POST /key/generate` 为当前用户创建所选具体模型的 `llm_api` Key，并显示模型名和网关 Base URL                       |
| 修改 | 页面展示为模型广场，搜索、团队、查看范围、排序、筛选和分页仍使用 `AllModelsTab` 的原 nuqs 状态与服务端查询，切换视图不清空筛选                |
| 修改 | 卡片和开通参数复用原有团队公开模型名称解析，保留团队别名、真实供应商、上下文参数及暂停状态，不编造介绍、价格、销量和排名                      |
| 屏蔽 | Auto Routers、Pass Through、Model Group Alias、Model Access Group Budgets Beta、Price Data 页签，以及 Decision Models 推广和 User Connections |
| 屏蔽 | 员工的新增、凭据、健康检查、重试和 Raw 页签，管理动作、上游模型、价格及模型设置区块，列表另隐藏凭据、输入成本和操作列                         |
| 屏蔽 | 新增模型表单的 Team-BYOK 开关与配套团队选择区，Key 与模型共用高级字段的屏蔽项见附录一                                                         |
| 修改 | 新增模型供应商由完整目录收窄为下表九项，首次进入和成功添加后都默认 MoMA，URL 供应商预填也受同一目录约束                                       |
| 保留 | 管理员原有模型添加、编辑、删除、凭据复用、认证字段、连接测试、健康检查和重试，必需团队作用域、模型访问组及供应商认证不被误隐藏                |

| 供应商选择项         | 原有适配标识        | 本版处理                                                                                                |
| -------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| 移动云 MoMA          | `OpenAI_Compatible` | 复用 OpenAI 兼容适配器，置于首项并默认选中，管理员手填上游模型名称和必填 API 地址，密钥使用通用中文标签 |
| DeepSeek（深度求索） | `Deepseek`          | 保留原认证与协议                                                                                        |
| 阿里云百炼           | `Qwen_AI_Platform`  | 保留原认证与协议                                                                                        |
| 阿里云 DashScope     | `Dashscope`         | 保留原认证与协议                                                                                        |
| 阿里云 QwenCloud     | `QwenCloud`         | 保留原认证与协议                                                                                        |
| MiniMax              | `MINIMAX`           | 保留原认证与协议                                                                                        |
| 月之暗面 Moonshot    | `MOONSHOT`          | 保留原认证与协议                                                                                        |
| 腾讯云               | `Tencent`           | 保留原认证与协议                                                                                        |
| 火山引擎             | `VolcEngine`        | 保留原认证与协议                                                                                        |

移动云 MoMA 选项使用本地 [ecloud.png](public/assets/logos/ecloud.png)，通过共享 Logo 组件保留原色与比例，随静态资源打包，不在运行时请求官网，不影响顶部品牌和供应商提交值。图标来源沿用既有记录，为[移动云官网](https://ecloud.10086.cn/portal)引用的 [favicon](https://ecloud.eos-guangzhou-1.cmecloud.cn/fe/favicon.ico) 转为 PNG

目录由后端返回的原供应商元数据筛选生成，不伪造缺失项。MoMA 没有预置服务地址，也没有新增后端供应商实现。这里限制的是新增模型界面，既有模型、凭据、API 权限和后端支持范围继续保留

开通状态通过当前用户、所选个人或团队范围的全部 Key 分页计算，排除停用、删除、过期、非 `llm_api` 和所属团队停用的 Key。已有全模型或通配 Key 按原语义匹配，访问组等间接授权无法从 Key 列表确认时不推断为已开通。创建、编辑、删除和停用 Key 后，查询缓存失效同步刷新开通状态

新 Key 的 `models` 仅包含所选具体模型，不提交空列表或通配授权。禁用员工个人 Key 创建时必须选择有权使用的团队，暂停模型、无权模型和只读用户不能快捷开通，最终权限、预算和限流由原后端校验。完整新 Key 仅存于结果弹窗的 React 状态，关闭后清除，不写浏览器存储或 URL。页面内请求锁防止连续点击重复创建，没有跨标签页或服务端幂等保证

开通仅创建原生凭证，不新增订单、审批、开通记录或数据库字段，也不代表上游连通。异常响应提示先查密钥结果，后台拒绝沿用错误反馈

主要实现为 [模型页面](<src/app/(dashboard)/models-and-endpoints/page.tsx>)、[AllModelsTable.tsx](<src/app/(dashboard)/models-and-endpoints/components/AllModelsTable.tsx>)、[AddModelPanel.tsx](<src/app/(dashboard)/models-and-endpoints/panels/AddModelPanel.tsx>)、[modelProviders.ts](src/components/add_model/modelProviders.ts)、[AddModelForm.tsx](src/components/add_model/AddModelForm.tsx)、[provider_specific_fields.tsx](src/components/add_model/provider_specific_fields.tsx)、[ModelCatalog.tsx](src/components/ModelCatalog.tsx)、[modelAccess.ts](src/components/modelAccess.ts)、[useKeys.ts](<src/app/(dashboard)/hooks/keys/useKeys.ts>) 和 [model_info_view.tsx](src/components/model_info_view.tsx)。操作说明见[模型接入](../../README.md#模型接入)

### API 密钥

| 类型 | 具体差异                                                                                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 屏蔽 | 创建时的 Agent 所有者和非 AI API 类型，只提供 `llm_api`，You、Service Account、Another User 仍按原角色提供                                                 |
| 屏蔽 | 创建和编辑中的资源授权、日志、组织、项目、标签、策略、提示词、路由及高级预算限流配置，完整字段名见附录一                                                   |
| 屏蔽 | 详情的 Savings、Auto Router Usage、Regenerate Key、组织和项目、独立日志、自动轮换、Guardrails、Policies、Prompts、路由权限、标签和原始 Metadata 等高级区块 |
| 屏蔽 | 组织、项目、标签和 End User 列，员工另隐藏用户 ID、用户和邮箱列，列选择器不能恢复这些列。对应高级筛选也隐藏                                                |
| 修改 | 密钥模型列默认仅展示 1 个模型和剩余数量，其余模型通过原提示和详情查看，未修改 Key 的模型权限                                                               |
| 修改 | 累计花费提示保留历史用量可能未回填的说明，去除上游版本与发布日期。无团队时不展示无意义的团队预算和限额说明                                                 |
| 保留 | 基本信息、模型、用量、预算、周期、过期时间、TPM/RPM、团队和访问组，查看、创建、编辑、删除等仍受原角色与接口权限约束                                        |

轻量版保存普通配置时不再重算或提交隐藏的资源授权，避免改名和改预算覆盖已有授权或被 MCP 目录失败阻塞。其他隐藏字段仍可能保留在表单状态并按原逻辑提交，不会自动撤销后端已有配置

主要实现为 [create_key_button.tsx](src/components/organisms/create_key_button.tsx)、[key_edit_view.tsx](src/components/templates/key_edit_view.tsx)、[key_info_view.tsx](src/components/templates/key_info_view.tsx)、[KeyInfoHeader.tsx](src/components/templates/KeyInfoHeader.tsx) 和 [VirtualKeysPage](src/components/VirtualKeysPage/)

### 用量统计与图表

| 类型 | 具体差异                                                                                                               |
| ---- | ---------------------------------------------------------------------------------------------------------------------- |
| 屏蔽 | MCP、Endpoints 页签，Aria 自然语言查询入口与编辑器，Top Agents                                                         |
| 屏蔽 | Customer、Tag、Agent、User Agent Activity、Organization 统计视角，选择器仅保留全局、本人、用户和团队，再叠加原权限     |
| 修改 | 概览五列指标将平均花费和平均延迟分开，供应商与用户排行在第一排，密钥排行与 API 路径请求量在第二排，1100px 以上双列对齐 |
| 修改 | 普通概览图高 256px，compact 图高 224px，金额右对齐，图表日期、提示、空状态、筛选、导出和请求说明接入中文与人民币显示   |
| 修改 | 日期控件使用 compact 展示和独立面板宽度，保留原日期语义、时间戳、查询状态和分享链接参数                                |
| 保留 | 原权限允许的用量、模型、密钥、用户、错误统计及导出。历史非模型资源请求不因界面屏蔽而删除、过滤或漏算费用               |

主要实现为 [UsagePageView.tsx](<src/app/(dashboard)/usage/_components/components/UsagePageView.tsx>)、[UsageViewSelect](<src/app/(dashboard)/usage/_components/components/UsageViewSelect/>)、[usage 概览组件](<src/app/(dashboard)/usage/_components/components/overview/>)、[UsagePage 公共组件](src/components/UsagePage/) 和 [advanced_date_picker.tsx](src/components/shared/advanced_date_picker.tsx)

### 请求日志与审计

| 类型   | 具体差异                                                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 屏蔽   | Audit Logs、Deleted Keys、Deleted Teams 页签及其企业预览和升级说明，员工不开放日志页                                               |
| 屏蔽   | 组织、项目、标签、End User 列与高级筛选，规则见附录一                                                                              |
| 修改   | 请求筛选只保留公开模型查询及原后端参数，不再展示搜索工具专属说明。日志详情、费用拆分、缓存类别、原始数据占位和辅助操作名称补齐中文 |
| 保留   | 管理员 Request Logs、请求详情、真实类型、费用、模型响应及原始 JSON，不伪造或删除历史请求                                           |
| 未新增 | 没有实现独立操作审计系统，没有新增审计采集、存储、查询接口或绕过企业许可证                                                         |

主要实现为 [日志页面](<src/app/(dashboard)/logs/>)、[RequestLogsFilters.tsx](src/components/logs/request/RequestLogsFilters.tsx)、[日志详情组件](src/components/logs/detail/) 和共享页签、表格策略。审计抽屉的金额文案曾随公共格式更新，但审计入口仍隐藏，不能据此认定审计能力开放

### 团队与成员

| 类型 | 具体差异                                                                                                                                 |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 屏蔽 | Default Team Settings 页签，创建团队中的独立 Logging Settings，以及组织、密钥管理设置、单模型预算编辑和详情展示                          |
| 屏蔽 | 创建团队中的 MCP、智能体、搜索工具、技能四个折叠区，编辑中的对应授权字段及向量库字段，团队概览和详情的资源权限展示                       |
| 修改 | 保存普通团队配置时跳过隐藏资源授权的重算和提交，避免目录不可用阻塞保存或覆盖已有权限                                                     |
| 修改 | 团队、成员、默认预算、角色、周期、额度提示和权限表补齐中文及人民币单位，原始成员限额数据不重算                                           |
| 保留 | 团队创建、编辑、删除、成员分配、模型权限、基本预算、成员预算和 TPM/RPM，团队管理员可编辑范围仍由原设置决定                               |
| 保留 | 新增成员默认 User，可选择 Admin。编辑成员保留 Admin/User、模型范围、预算、周期、临时预算及到期时间、TPM/RPM 和按原许可证开放的单模型预算 |

成员编辑是明确例外，附加字段通过局部解除轻量上下文恢复社区完整表单。不能将“共享单模型预算隐藏”写成“所有成员预算控件都删除”，也不能把恢复原表单写成新增权限

主要实现为 [Teams.tsx](src/components/Teams.tsx)、[TeamInfo.tsx](src/components/team/TeamInfo.tsx)、[EditMembership.tsx](src/components/team/EditMembership.tsx)、[TeamsPage](src/components/TeamsPage/)、[团队组件](src/components/team/) 和 [object_permissions_view.tsx](src/components/object_permissions_view.tsx)

### 用户管理与批量邀请

| 类型 | 具体差异                                                                                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 屏蔽 | 用户详情的 MCP 权限、编辑中的 MCP 服务器选择和工具权限，普通编辑不提交 MCP 授权字段                                                                  |
| 屏蔽 | 共享组织和单模型预算字段，受共享表单策略覆盖的位置见附录一                                                                                           |
| 修改 | 创建、详情、编辑、批量编辑、默认用户设置与批量邀请补齐中文，含角色、模型通配选项、预算周期、CSV 校验、预览和结果提示                                 |
| 修改 | 用户详情的 Savings、Auto-router usage 补齐节省计算、缓存类别、空状态和日期，金额用人民币展示。这两个用户详情页签仍保留，不受密钥详情同名页签屏蔽影响 |
| 保留 | 用户身份、平台角色、团队、模型、预算、限流和原有管理操作，CSV 模板列名、邮箱、用户输入与提交值不翻译                                                 |

主要实现为 [用户管理目录](<src/app/(dashboard)/users/>)、[user_edit_view.tsx](<src/app/(dashboard)/users/_components/user_edit_view.tsx>)、[user_info_view.tsx](<src/app/(dashboard)/users/_components/view_users/user_info_view.tsx>)、[CreateUserButton.tsx](src/components/CreateUserButton.tsx)、[bulk_create_users_button.tsx](src/components/bulk_create_users_button.tsx) 和新增的 [BulkUserTemplateColumns.tsx](src/components/BulkUserTemplateColumns.tsx)。被屏蔽的独立 Cost Optimization 页中仍有被用户详情复用的组件，因此相关中文和金额修改不表示重新开放该页面

### 访问组与预算

| 类型 | 模块   | 具体差异                                                                                                            |
| ---- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| 屏蔽 | 访问组 | 创建、编辑、详情中的 MCP Servers、Agents、Skills 页签和内容，列表资源数量仅显示模型                                 |
| 修改 | 访问组 | 共享页签过滤同样处理强制选中隐藏页签，编辑只改可见内容，不清空已有隐藏资源授权                                      |
| 保留 | 访问组 | 创建和编辑的基本信息、模型，详情的模型与原有管理流程，不新增后端分组规则                                            |
| 修改 | 预算   | 创建、编辑、列表和提示使用中文与人民币，重置周期显示“总计、每天、每周、每月”，提交值仍为 `null`、`24h`、`7d`、`30d` |
| 保留 | 预算   | 原预算 CRUD、校验、重置周期计算及接口，不新增钱包、汇率、收费或结算                                                 |

主要实现为 [访问组目录](<src/app/(dashboard)/access-groups/>)、[预算目录](<src/app/(dashboard)/budgets/>)、[BudgetFormFields.tsx](<src/app/(dashboard)/budgets/_components/BudgetFormFields.tsx>)、[BudgetPeriodTooltip.tsx](src/components/shared/BudgetPeriodTooltip.tsx) 和 [InheritedBudgetHint.tsx](src/components/shared/InheritedBudgetHint.tsx)

### 路由设置

| 类型 | 具体差异                                                                                   |
| ---- | ------------------------------------------------------------------------------------------ |
| 屏蔽 | Routing Strategy Selector、Tag Filtering 和 Latency Based Configuration 高级配置区         |
| 修改 | 基础设置、重试、回退和路由分组弹窗的标签、选项、说明和反馈接入中文，显示标签与请求枚举分离 |
| 保留 | 可见的基础重试等设置、原配置归属和接口提交逻辑，隐藏设置的已有后端效果继续存在             |

主要实现为 [RouterSettingsForm.tsx](src/components/router_settings/RouterSettingsForm.tsx)、[路由设置组件](src/components/router_settings/)、[回退设置](src/components/Settings/RouterSettings/Fallbacks/) 和 [routing_groups](src/components/routing_groups/)。被其他保留界面复用的弹窗补译不表示恢复 Auto Routers 等隐藏页签

### 日志与告警、邮件设置

| 类型 | 具体差异                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------ |
| 屏蔽 | Logging Callbacks、CloudZero、MS Teams Alerts 页签，Region Outage 企业告警                                   |
| 屏蔽 | 动态参数表中 `premium_field=true` 的整行，包括控件、说明和升级链接，独立 `PremiumLoggingSettings` 也不展示   |
| 屏蔽 | 邮件品牌字段 `EMAIL_LOGO_URL`、`EMAIL_SUPPORT_CONTACT`                                                       |
| 修改 | 默认页签从 Logging Callbacks 改为 Alerting Types，SMTP、普通邮件事件、动态告警、参数标签和反馈补齐中文       |
| 保留 | 普通告警类型与参数、SMTP、测试邮件和普通邮件事件，原始事件 ID、SMTP 键、敏感值遮罩、仅提交修改字段和重置逻辑 |

隐藏付费行不改变原配置数组索引，普通参数重置仍使用原始索引，不能先过滤数组再将新索引传给后端。界面设置中的 Logging Settings 与此处被隐藏的 Logging Callbacks 是不同区块，前者继续保留

主要实现为 [settings.tsx](src/components/settings.tsx)、[dynamic_form.tsx](src/components/alerting/dynamic_form.tsx)、[email_settings.tsx](src/components/email_settings.tsx)、[email_event_settings.tsx](src/components/email_events/email_event_settings.tsx) 和 [PremiumLoggingSettings.tsx](src/components/common_components/PremiumLoggingSettings.tsx)

### 系统管理与身份配置

| 类型         | 具体差异                                                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 屏蔽         | Security Settings、Hashicorp Vault、CyberArk、Plugins、Web Search Interception 页签，旧 Security Settings 内的 SSO 管理、IP 白名单和 UI Access Control 弹窗入口随之隐藏 |
| 保留并本地化 | 独立 SSO Settings、SCIM、UI Settings、Logging Settings，管理员可进入配置，默认打开 UI Settings                                                                          |
| 修改         | SSO 提供方、角色映射、字段、校验、创建、编辑和删除确认补齐中文，保留原提交值与密钥遮罩                                                                                  |
| 修改         | SCIM 地址、令牌创建与结果提示补齐中文，缺少企业许可证时说明同步接口的授权限制                                                                                           |
| 屏蔽         | UI Settings 中 Projects、Chat、Agents、Vector Stores 相关开关，公开 AI Hub 认证、组织搜索作用域、客户端 Header 转发、供应商认证 Header 转发，以及 Moyai 整个连接区域    |
| 屏蔽         | 团队管理员可编辑字段设置中的 Projects 权限复选框，已有选择值保留。被隐藏区块对应的分隔线一并隐藏                                                                        |
| 保留         | 其他原有界面和日志设置、SSO 与 SCIM 原接口、鉴权和许可证。开放配置入口不等于获得企业授权，不停用已配置的安全策略或现有登录                                              |

主要实现为 [AdminPanel.tsx](<src/app/(dashboard)/admin-panel/_components/AdminPanel.tsx>)、[UISettings.tsx](src/components/Settings/AdminSettings/UISettings/UISettings.tsx)、[TeamAdminEditableFieldsSettings.tsx](src/components/Settings/AdminSettings/UISettings/TeamAdminEditableFieldsSettings.tsx)、[SSOSettings](src/components/Settings/AdminSettings/SSOSettings/) 和 [SCIM.tsx](src/components/SCIM.tsx)

### 界面主题、品牌与通用交互

| 类型 | 具体差异                                                                                                                                                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新增 | MoMA 主题样式与 `MomaBrand`，页头、登录和账户开通默认显示移动云官方完整 Logo，加载页与账户菜单继续显示产品名“MoMA 轻量版”，页面标题保持产品名                                                                                |
| 修改 | 沿用原主题配置接口，管理员可配置普通 Logo、深色 Logo 和浏览器图标的 HTTP(S) 地址。深色 Logo 缺失或失败时回退普通 Logo，自定义图片失败时回退本地移动云 Logo，本地图也失败时回退产品文字，支持实时预览及恢复默认，没有新增上传 |
| 修改 | 浅蓝灰背景、白色侧栏与卡片、蓝紫强调色并保留深色模式，统一页面、详情、控件、卡片、弹窗、表格和分页                                                                                                                           |
| 修改 | 页头高 56px，侧栏宽 208px，内容内边距 20px，区块间距 16px，操作组 8px。卡片最小 240px、间距 12px、内边距 16px、圆角 12px，手机单列                                                                                           |
| 修改 | 普通正文、导航、表格和控件为 14px，区块、弹窗标题及桌面品牌为 21px，页面标题与核心指标为 31.5px，47.25px 保留作展示档，按 rem 和默认根字号换算                                                                               |
| 修改 | 桌面普通控件与分页 32px，手机主要控件 40px，抽屉项 44px，表头 36px，数据行上下内边距 8px、行高 20px，多行自然增高                                                                                                            |
| 修改 | 共享实体名称以主色、常显右箭头、悬停背景与下划线提示下钻，键盘焦点有内侧 2px 边框，团队内密钥别名与原 Key ID 打开同一详情                                                                                                    |
| 修改 | 共享用户悬停卡片去除会裁掉焦点边框的额外 overflow，继续保留列宽与省略。分页展示总条数和当前页，完整范围与总页数保留读屏说明                                                                                                  |
| 修改 | 密钥和团队创建弹窗宽 800px，模型参数与默认用户设置使用两列网格，去除重复缩进，动作可换行，窄屏保留内部滚动                                                                                                                   |
| 保留 | 表格原排序、筛选、列宽调整、横向滚动与翻页回调。表格高度随内容结束，窄桌面可能需要横向滚动，不因布局删掉其他可用字段                                                                                                         |

默认完整 Logo 使用[移动云官网](https://ecloud.10086.cn/portal)引用的[官方横版图片](https://ecloud.eos-guangzhou-1.cmecloud.cn/op-portal-static/static/images/home/ecloud-logo.png)，原图保存在 `public/assets/logos/ecloud-brand.png` 并随镜像打包。供应商选项继续使用独立的云形小图标。配置的图片保持原始比例，近方形图片会按页头高度缩小，不拉伸为横版标志

`ThemeContext.tsx` 忽略用户编辑后迟到的初始配置响应，避免旧 Logo 覆盖实时预览或恢复默认结果。`ui-theme/UIThemeSettings.tsx` 在读取配置与保存期间禁用输入和操作，恢复默认仅在后端确认成功后清空表单与预览，失败时保留原值

默认品牌和主题是本版新增或修改，配置 Logo 的后端能力则来自开源基线。实体下钻样式影响复用单元格的团队、用户、密钥、模型、凭据、健康检查、访问组等列表，不改变目标、权限、真实链接或修饰键行为

保留页面移除社区文档、反馈和销售外链，保留字段解释与校验。部署健康告警仍展示真实密码、Redis、调试日志和许可证风险，忽略、暂缓、恢复及权限不变，已知文案补译，未知告警原样显示。通知面板保留组件与空状态，但不查询或展示上游版本发布通知

主要实现为 [moma-theme.css](src/app/moma-theme.css)、[MomaBrand.tsx](src/components/MomaBrand.tsx)、[DashboardHeader.tsx](src/components/DashboardHeader.tsx)、[ThemeContext.tsx](src/contexts/ThemeContext.tsx)、[UIThemeSettings.tsx](<src/app/(dashboard)/ui-theme/UIThemeSettings.tsx>)、[shared 组件](src/components/shared/)、[identity_cell.tsx](src/components/shared/table_cells/identity_cell.tsx)、[UserPopoverCell.tsx](src/components/shared/table_cells/UserPopoverCell.tsx)、[TeamVirtualKeysTable.tsx](src/components/team/TeamVirtualKeysTable.tsx)、[DeploymentHealth](src/components/DeploymentHealth/) 和 [SidebarAccountMenu](src/components/SidebarAccountMenu/)。具体样式以 [DESIGN.md](DESIGN.md) 为准，视觉复核范围见 [design-qa.md](design-qa.md)

### 中英文与系统资源显示名

| 类型 | 具体差异                                                                                                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新增 | `LocaleContext`、`LanguageSwitcher`、中文词典和翻译函数，支持 `zh-CN` 与 `en`，默认中文                                                                   |
| 修改 | 语言偏好存于浏览器 `moma.locale`，刷新恢复并同步 HTML `lang`，切换语言不重新挂载页面和表单，不发送语言到后端                                              |
| 修改 | 保留页面的静态说明、菜单、搜索、表头、日期、相对时间、状态、占位、表单、下拉、弹窗、通知、校验、操作反馈和辅助名称接入显示层翻译                          |
| 修改 | 中文表单标签不附括号英文参数名，英文保留原标签，字段注册与用户输入不变。命令面板支持中文搜索                                                              |
| 修改 | 组合框用 `dismissLabel` 翻译两个读屏关闭按钮，安装和构建前对固定 `@base-ui/react@1.6.0` 应用最小补丁，覆盖 ESM、CommonJS 与类型声明，版本或锚点失配时停止 |
| 修改 | 非 React 反馈通过 `getLocale` 获取语言，真实异常由 `toast.fromError` 给出中文概要并保留技术详情，登录只翻译词典内已知错误                                 |
| 保留 | 字段 name、选项 value、请求枚举、模型 ID、供应商名称、用户输入、邮箱、密钥、原始 JSON、代码示例、响应和未知上游错误，不递归翻译用户数据或扫描改写 DOM     |

系统资源显示名仅精确匹配下表标识，中英文均有名称，不替换子串或用户自定义内容。表格、用量排行、图表与日志筛选显示名称，数据库值、过滤值、复制结果、链接和点击参数保持原始标识

| 原始标识                                                                  | 中文显示名   |
| ------------------------------------------------------------------------- | ------------ |
| `litellm-internal-health-check`、`key-hash-litellm-internal-health-check` | 系统健康检查 |
| `litellm_proxy_master_key`、`key-hash-litellm_proxy_master_key`           | 平台主密钥   |
| `litellm-dashboard`                                                       | 控制台团队   |

主要实现为 [LocaleContext.tsx](src/contexts/LocaleContext.tsx)、[translate.ts](src/i18n/translate.ts)、[zh-CN.json](src/i18n/zh-CN.json)、[LanguageSwitcher.tsx](src/components/LanguageSwitcher.tsx)、[TerminologyContext.tsx](src/contexts/TerminologyContext.tsx)、[systemResourceLabel.ts](src/utils/systemResourceLabel.ts)、[toast.ts](src/lib/toast.ts)、[ui 公共组件](src/components/ui/) 和 [localize-base-ui.mjs](scripts/localize-base-ui.mjs)。`package.json` 新增 `postinstall` 与 `prebuild`，将 Base UI 版本由范围约束固定为 `1.6.0`

未知界面文案仍会回退英文，新增文案不能以回退作为中文验收。原生日期按钮受浏览器语言影响，动态供应商字段与技术错误不承诺全部翻译。API 键、请求头、静态资源前缀 `/litellm-asset-prefix/`、隐藏源码和依赖元数据不做全局品牌替换

### 金额与人民币单位

| 类型   | 开源基线                                         | 本版差异                                                                                                   |
| ------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| 修改   | 界面美元符号和 USD 单位                          | 符号改为 ¥，中文单位“人民币”，英文单位 CNY，语言切换不改变币种                                             |
| 修改   | 花费、预算、模型价格、单次费用、节省、图表与导出 | 公共格式器、坐标与提示、表单标签和金额导出表头同步使用人民币标识                                           |
| 保留   | 数字、计算和接口                                 | 输入 150.75 仍提交 150.75，原预算 10 显示 ¥10.00，精度、零值、小额阈值、负数、预算比率和上限校验沿用原逻辑 |
| 未新增 | 原成本计算与数据                                 | 没有汇率、金额换算、历史重计价、金额迁移、钱包或结算，不改变数据库、后端 API、内置模型费率和供应商账单     |

这是前端金额单位定制，不是人民币计费改造。若仍使用内置美元费率，数值不会自动换算成人民币，真实成本口径需要由实际配置的模型价格保证。不能以显示 ¥ 或 CNY 作为人民币结算验收

主要实现为 [dataUtils.ts](src/utils/dataUtils.ts)、[value_formatters.tsx](src/components/UsagePage/utils/value_formatters.tsx)、[金额单元格](src/components/shared/table_cells/money_cell.tsx)、[图表提示](src/components/shared/charts/chart_tooltip.tsx)、各模块预算和价格组件及词典。用户详情复用的 [costOptimizationUtils.ts](<src/app/(dashboard)/cost-optimization/_components/costOptimizationUtils.ts>) 也修改格式，不表示开放独立成本优化页面

### Docker、本机预览与演示资料

| 类型       | 文件，相对仓库根目录                                                                        | 与开源基线的差异                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 保留       | `Dockerfile`                                                                                | 沿用源码完整构建 Python、Rust、Prisma 和 Dashboard 的流程，此文件未被本版修改                             |
| 新增       | [docker/Dockerfile.lite-ui](../../docker/Dockerfile.lite-ui)                                | 在 `litellm-lite-runtime:local` 上替换已完成的静态 Dashboard 导出，不重新编译后端                         |
| 新增       | [docker/docker-compose.lite-ui.yml](../../docker/docker-compose.lite-ui.yml)                | 独立应用和 PostgreSQL 服务、数据库卷，默认仅绑定 localhost 4001，密码和主密钥从外部环境提供               |
| 新增       | [docker/lite-ui-preview.yaml](../../docker/lite-ui-preview.yaml)                            | 空 `model_list`，启用原数据库模型管理，仅本机测试关闭泄露密码在线查询                                     |
| 新增       | [docker/lite-ui-preview.md](../../docker/lite-ui-preview.md)                                | 构建、启动、停止与私有配置流程                                                                            |
| 修改       | [根 README](../../README.md)、[Dashboard README](README.md)                                 | 说明轻量版能力、接入和构建入口、上游来源与许可证                                                          |
| 新增或修改 | 本文、[DESIGN.md](DESIGN.md)、[design-qa.md](design-qa.md)、[根 AGENTS.md](../../AGENTS.md) | 定制清单、设计规范、视觉验收与升级维护约定，另随既有 lint 清理收紧 `eslint-suppressions.json`，未放宽规则 |

镜像不内置账户、密钥、演示模型记录或供应商库存，新数据库通过原生管理配置。环境文件、备份、上游凭据与具体测试账户由部署方私有维护，不加入源码或镜像。已有本机数据库中的演示记录也不构成仓库默认数据

先完成 `npm run build`，再重建静态 UI 层。Python 或 Rust 变化时应先完整重建运行层，不能仅凭镜像标签或 UI 更新认定后端也已升级。镜像发布 revision、UI revision 和运行源码 revision 应分别核对，重启沿用对应 Compose 项目、环境与覆盖文件

预览的 `password_policy_check_breached_passwords: false` 仅关闭本机测试的在线查询，至少 12 位及其他强度规则沿用原策略，不改变后端默认值，也不应作为生产配置模板

## 附录一 共享屏蔽规则与数据保留

### 按路由核对页签值

下表使用代码中的原始页签值，显示名称可随语言变化。创建、编辑或详情组件复用共享页签时同样生效

| 路由                   | 所有角色隐藏的页签值                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `models-and-endpoints` | `auto-routers`、`pass-through`、`model-group-alias`、`access-group-budgets`、`price-data` |
| `api-keys`             | `savings`、`auto-router-usage`                                                            |
| `usage`                | `mcp`、`endpoints`                                                                        |
| `logs`                 | `audit logs`、`deleted keys`、`deleted teams`                                             |
| `teams`                | `default-settings`                                                                        |
| `access-groups`        | `mcp-servers`、`mcp`、`agents`、`skills`                                                  |
| `logging-and-alerts`   | `logging-callbacks`、`cloudzero-cost-tracking`、`ms-teams-alerts`                         |
| `admin-panel`          | `security-settings`、`hashicorp-vault`、`cyberark`、`plugins`、`web-search-interception`  |

员工的 `models-and-endpoints` 另隐藏 `add`、`llm-credentials`、`health`、`retry-settings`、`raw`。该表不替代原角色校验，Key 详情隐藏同名页签也不影响用户详情中的节省和自动路由统计

### 按字段名核对

以下是集中策略的精确字段名，按生效范围列出。独立区块还可能通过 `LiteUiMask` 隐藏，应与上文各模块一起核对，不能只查此表

| 生效范围                     | 屏蔽字段                                                                                                                                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 所有使用共享字段策略的位置   | `organization_id`、`organization_ids`、`secret_manager_settings`、`model_max_budget`、`team_member_model_max_budget`、`allowed_passthrough_routes`、`logging_settings`、`disable_global_guardrails`                                                                             |
| 保留页面的非模型资源授权     | `allowed_mcp_servers_and_groups`、`mcp_servers_and_groups`、`mcp_tool_permissions`、`allowed_agents_and_groups`、`agents_and_groups`、`allowed_skills`、`skills`、`object_permission_search_tools`、`object_permission_skills`、`vector_stores`、`allowed_vector_store_ids`     |
| Key 和模型的资源扩展         | `project_id`、`metadata`、`tags`、`guardrails`、`policies`、`prompts`、`vector_store_ids`、`allowed_routes`                                                                                                                                                                     |
| Key 和模型的高级预算、限流   | `soft_budget`、`budget_windows`、`budget_fallbacks`、`end_user_budget_id`、`tpd_limit`、`tpm_limit_type`、`rpm_limit_type`、`model_tpm_limit`、`model_rpm_limit`、`throttle_on_budget_exceeded`、`default_estimated_output_tokens`、`default_estimated_output_tokens_per_model` |
| Key 和模型的缓存、路由、成本 | `enable_prompt_caching`、`use_in_pass_through`、`kubernetes_pod_discovery`、`cache_control`、`cache_control_injection_points`、`litellm_extra_params`、`model_info_params`、`ptu_count`、`cost_per_ptu_per_hour`、`ptu_effective_from`、`ptu_effective_to`                      |

`max_budget`、`budget_duration`、`tpm_limit`、`rpm_limit`、`team_id`、`access_group_ids`、`model_access_group`、模型选择及供应商 `api_key` 等认证字段不在此屏蔽集合中。共享 `ModelMaxBudgetField` 还会隐藏 Key、用户、团队和默认成员预算中的整个单模型预算区块，成员编辑的完整表单是例外，仍受原许可证约束

### 按列与筛选核对

| 生效范围            | 隐藏内容                                                                        |
| ------------------- | ------------------------------------------------------------------------------- |
| 共享表格            | `organization_id`、`organization_alias` 列                                      |
| Key、模型和日志表格 | 另隐藏 `project_id`、`request_tags`、`tags`、`end_user` 列                      |
| 员工 Key 表格       | 另隐藏 `user_id`、`user`、`user_email` 列                                       |
| 员工模型表格        | 另隐藏 `litellm_credential_name`、`input_cost`、`actions` 列                    |
| 共享筛选抽屉        | Organization 筛选                                                               |
| Key、模型和日志筛选 | 另隐藏 Project、End User、Tags、Cache、Credential、Span Type、Request Type 筛选 |

列在建立表格实例前被过滤，不能从显示列菜单恢复。筛选按原始英文标签匹配，再翻译显示标签，社区重命名或改变翻译接入位置后必须复查

### 隐藏与保存的边界

`LiteUiMask` 及共享字段通常使用 `hidden` 与 `display:none`，保留子组件挂载和原表单状态。页签内容、资源权限概览及部分目录控件采用不渲染，两种处理不能混为源码删除或接口停用

`MountedFormField` 对声明为必填的字段及当前校验错误保留显示保护，`FormField` 保留当前错误字段显示，模型必需团队作用域另在可见区保留。隐藏值可能继续按原表单提交，或由原 diff 逻辑省略，不能统一声称所有隐藏字段都不发送

团队、Key 和用户的资源授权保存另有显式保护，普通编辑不重算或覆盖隐藏授权。访问组编辑也保留已有隐藏授权。需要停用旧配置时，应另行评估和授权后端或数据操作，不能通过清空隐藏表单实现

主要实现为 [FormField.tsx](src/components/shared/form/FormField.tsx)、[MountedFormField.tsx](src/components/common_components/MountedFormField.tsx)、[ModelMaxBudgetEditor.tsx](src/components/key_team_helpers/ModelMaxBudgetEditor.tsx)、[DataTable.tsx](src/components/shared/DataTable/DataTable.tsx)、[DataTableFilterDrawer.tsx](src/components/shared/DataTable/DataTableFilterDrawer.tsx) 及对应模块组件

## 社区升级与差异复核

本文件列出功能差异和主要实现入口，不复制全部 462 个文件名。完整文件清单、测试文件和任意新增差异从固定基线生成，不能仅依赖历史修改说明

```bash
git status --short --branch
git diff --stat 9546f9a69ff470dfcc5a21eccab89d2fd86a634f..HEAD
git diff --name-status 9546f9a69ff470dfcc5a21eccab89d2fd86a634f..HEAD
git diff 9546f9a69ff470dfcc5a21eccab89d2fd86a634f..HEAD -- ui/litellm-dashboard docker README.md AGENTS.md
git diff 9546f9a69ff470dfcc5a21eccab89d2fd86a634f..HEAD -- litellm enterprise litellm-rust prisma
```

每次升级记录旧、新基线 SHA 与版本，再核对全部模块并在同次变更更新本文。恢复功能时同时检查菜单、路由、页签、字段、详情和关联入口，不能只恢复一个菜单

| 核对范围             | 验收要点                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 页面、菜单、命令搜索 | 新页面默认未进入白名单，桌面、抽屉、搜索和直达 URL 一致，路径与菜单 ID 映射正确，原角色过滤继续生效                                     |
| 页签与旧链接         | 隐藏内容不因 keepMounted 或 URL 渲染，系统管理默认 UI Settings，日志与告警默认 Alerting Types                                           |
| 模型与供应商         | 目录、MoMA 默认和成功后重置、必填地址、认证字段、团队作用域与 URL 预填保持一致，不误限后端供应商                                        |
| 快捷开通             | 核对 Key 类型、状态、通配与空列表语义、全分页、个人 Key 限制、团队别名、用户归属及缓存刷新，跟进原接口必填字段变化                      |
| 表单与已有数据       | 新控件没有绕过共享策略，新增、编辑、详情都检查，隐藏授权不覆盖，必填和错误可见，成员 Admin/User 与完整附加字段继续保留                  |
| 企业控件和 Beta      | 核对 premiumUser、premium_field、Enterprise、Upgrade、license、BetaBadge 与 [BETA]，不按 beta 字符串误删 API 协议或模型名，不放宽许可证 |
| 表格、筛选、告警     | 新列 ID、列选择器、英文筛选标签和翻译顺序正确，普通告警重置沿用原索引                                                                   |
| 中文、金额与品牌     | 新界面文案补词典，数据与提交值不翻译，语言切换保留表单，不以人民币标签宣称后端换算，不重新引入上游推广                                  |
| 共享依赖补丁         | 升级 Base UI 前复查 dismissLabel 补丁的版本、锚点、类型与关闭按钮回归，不跳过失败保护                                                   |
| 主题与交互           | 按 DESIGN.md、design-qa.md 核对双语、深浅色、管理员、员工、桌面、手机、弹窗、焦点和下钻                                                 |
| 运行层与前端发布     | 区分完整源码构建和静态 UI 替换，后端变化先重建运行层，保留私有配置及数据，不夹带数据删除                                                |
| 检查与证据           | 运行受影响的明确路径定向用例、构建及适用门禁，保留已有失败和未覆盖项，不运行无路径的完整前端套件                                        |

## 本次文档核对的验证范围

本次先拉取维护分支，再按固定基线核对已提交的全仓文件差异、主要功能实现、集中策略及部署配置，按模块重写说明。后端目录无源码差异这一结论来自 Git 对比，功能清单来自源码核读，不是本次浏览器操作结果

本次仅修改本文，检查 Markdown 格式、相对文件链接、章节引用、集中字段和页签清单与 Git 差异。未运行应用测试、生产构建、浏览器走查、容器重建、供应商调用或计费验证，不据此更新任何历史通过结论

文档检查通过，109 处本地文件与目录链接及相关章节锚点有效，附录的 50 个屏蔽字段、8 组路由页签清单及员工额外隐藏的 5 个页签与定制源码一致，14 个新增生产代码文件均有对应说明。原有历史验证记录保留，同期提交 `1a89df2c57` 补充的 MoMA 图标浏览器验证也继续保留。3 处外部链接沿用部署入口或图标来源记录，本次未重新访问

下列历史记录由原文保留，未在本次重新执行，也未重新取得仓库外的原始日志或截图。各轮可能覆盖同一用例，不能相加作为总覆盖量，更不能视为当前提交的完整回归。具体通用范围见 [design-qa.md](design-qa.md)

## 附录二 历史验证记录与限制

### 默认移动云 Logo 与主题配置验证

品牌组件、主题表单、页头和主题上下文的 4 个定向文件共 20 项通过，覆盖默认移动云 Logo、自定义普通与深色 Logo、清空配置恢复默认、加载失败逐级回退、迟到响应不覆盖编辑、初始加载期间禁止操作和恢复失败时保留原值。新增的迟到响应与表单回归在修复前各失败 2 项，修复后全部通过。管理员浏览器已验证普通 Logo 地址实时预览、保存与刷新后保留，主题配置入口与提交没有被屏蔽

### 移动云 MoMA 图标验证

新增模型面板、模型表单与共享 Logo 组件的 3 个定向测试文件共 87 项通过，覆盖 MoMA 选项本地图标、选中与表单提交。生产构建、TypeScript、静态导出及适用前端检查通过。管理员浏览器实测浅色与深色主题，确认图标从本地静态资源正常加载、按 20×20 像素显示，选项仍可选择，未捕获控制台错误或警告。未单独验收手机端，未调用上游。图标仅补充供应商选项，不改变顶部品牌或上游模型数据

### 国产供应商与 MoMA 默认项验证

定向 7 个测试文件共 122 项通过，覆盖供应商目录、默认项、地址必填、模型名称原样提交、成功后重置、URL 预填边界、认证字段、请求构建与连接测试展示。生产构建、TypeScript、静态导出和适用前端检查通过。管理员浏览器核对九个供应商选项、MoMA 与 DeepSeek 切换、地址字段及必填校验。供应商搜索空状态与模型映射校验均已在部署后确认显示中文，未捕获浏览器错误或警告

未提供实际 MoMA 地址与凭据，未创建真实 MoMA 模型或调用上游。供应商目录只限制新增模型界面，不改变后端支持与既有数据

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
