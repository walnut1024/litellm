# MoMA 轻量版与开源版差异清单

## 版本与对比基线

本版面向内部模型服务分发。管理员接入采购的模型服务并配置用户、团队、权限和预算，员工登录后获取自己的 API Key，通过客户端调用模型

本文按功能模块记录相对开源源码的屏蔽、新增和修改，同时列出保留能力、实现位置和功能边界。屏蔽项既有企业能力，也有实验功能和当前场景不需要的开源功能，不能把所有屏蔽项统称为企业版功能

| 项目           | 对比范围                                            |
| -------------- | --------------------------------------------------- |
| 轻量版产品版本 | V1.0                                                |
| 开源基线版本   | `1.109.0`，以基线提交的根目录 `pyproject.toml` 为准 |
| 开源基线提交   | `9546f9a69ff470dfcc5a21eccab89d2fd86a634f`          |
| 轻量版源码     | 本文所在提交的源码                                  |

`main` 已包含定制，不作为未修改的开源对照。本文以固定开源基线描述轻量版的最终功能、可见范围和实现边界

“屏蔽”指前端入口、控件或内容不可见，不表示删除源码、停用后端 API 或撤销已有授权。“新增”指基线没有的交互、组件或部署资料。“修改”包括展示、默认值、表单提交边界和查询行为的调整。复用原生接口实现的新交互仍属于前端新增，不表示新增后端能力

相对上述基线，`litellm/`、`enterprise/`、`litellm-rust/` 和 `prisma/` 没有源码差异。模型转发、供应商适配、数据库结构、API 路由、预算计算、鉴权与许可证校验沿用开源基线。隐藏数据仍可能在接口响应或已挂载组件中，敏感数据保护继续依靠后端权限

## 功能模块总览

下表是定制后的可见范围，仍叠加开源原有角色、页面配置与后端权限。页面白名单不会赋予员工管理员权限

| 功能模块           | 员工可见范围                               | 管理员可见范围                                 | 主要定制                                                   |
| ------------------ | ------------------------------------------ | ---------------------------------------------- | ---------------------------------------------------------- |
| 导航与页面访问     | 工作台、模型、密钥、用量和原权限允许的团队 | 保留模型运营、访问控制和系统设置               | 新增 MoMA 导航与页面白名单，屏蔽非核心页面和推广入口       |
| 工作台 Home        | 个人概览、模型入口和创建密钥               | 原权限范围内的概览和快捷入口                   | 移除新闻、榜单，新增 Token 趋势、可用模型和使用指引        |
| 模型广场           | 授权模型组、能力、价格与调用示例           | 同一目录及模型组详情                           | 基于 AI Hub 登录态接口，保留双协议接入地址，不提供管理动作 |
| 模型管理           | 不开放                                     | 部署列表、模型增删改、凭据、健康检查和重试配置 | 独立中文管理入口，限制供应商选择并屏蔽高级页签             |
| API 密钥           | 本人有权访问的密钥及原有操作               | 原有密钥管理和用户、团队归属                   | 简化所有者、类型、字段、详情、列与筛选                     |
| 用量统计           | 原权限允许的本人和团队用量                 | 全局、本人、用户和团队视角                     | 隐藏资源统计与自然语言查询，调整概览布局与本地化           |
| 请求日志           | 不开放日志页                               | Request Logs 与请求详情                        | 隐藏审计和删除记录页签，保留真实请求与费用                 |
| 团队               | 原权限允许的团队查看和操作                 | 团队、成员、模型、预算和 TPM/RPM               | 隐藏非模型资源与高级配置，成员角色和编辑字段保留           |
| 用户               | 沿用原角色限制                             | 用户创建、批量邀请、详情、编辑及默认设置       | 隐藏 MCP 权限，补齐中文、金额与状态展示                    |
| 访问组             | 沿用原角色限制                             | 基本信息、模型及原有管理流程                   | 隐藏 MCP、智能体和技能页签与数量标记                       |
| 预算               | 沿用原管理员限制                           | 原有预算管理                                   | 本地化周期与人民币单位，不新增计费规则                     |
| 路由设置           | 不开放                                     | 基础重试、路由分组、回退、提示词缓存和通用参数 | 隐藏基础负载均衡页的全局路由策略、标签过滤和延迟高级配置   |
| 日志与告警设置     | 不开放                                     | 普通告警、参数和邮件设置                       | 隐藏日志回调、企业参数和部分集成，默认进入告警类型         |
| 系统管理           | 不开放                                     | SSO、SCIM、UI Settings、Logging Settings       | 精简页签与界面开关，默认进入 UI Settings，保留许可证约束   |
| 界面主题与通用展示 | 使用统一主题与语言切换                     | 另可配置 Logo 和浏览器图标                     | MoMA 品牌、统一布局、中英文和人民币显示                    |
| 本机部署           | 无独立员工配置                             | 独立 Compose、数据库和静态 UI 发布流程         | 新增本机预览资料，未裁剪后端运行时                         |

## 按功能模块的具体差异

### 导航、入口与页面访问

开源基线已有侧栏、移动导航、命令搜索、菜单角色过滤和页面本身的权限判断。本版在这些能力上增加轻量白名单，并以 MoMA 分组导航替换控制台原有布局

| 类型 | 具体差异                                                                                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 新增 | `liteUi.ts` 集中定义页面、页签、字段和表格列策略，`LiteUiBoundary` 拦截不在白名单的页面，显示“当前版本不提供此页面”                                                            |
| 新增 | 模型服务、用量与配额、访问控制、系统设置四组导航。桌面使用左侧导航，小于 1100px 时改用同源抽屉，空分组不展示                                                                   |
| 修改 | 侧栏、移动导航和命令搜索复用 `visibleMenuGroups`，先按轻量白名单收窄，再执行原角色、团队管理员身份和员工页面配置过滤                                                           |
| 屏蔽 | Organizations、Projects Beta、Playground、API Reference、Agents、Workflow Runs、Memory、MCP Servers、Skills、Guardrails、Policies、Search Tools、Vector Stores、Tool Policies  |
| 屏蔽 | Model Insights、Cost Optimization、Lens、Guardrails Monitor、Learning Resources、Response Cache、Experimental 及其子入口，以及白名单外的 Chat、Moyai、Cost Tracking 等独立页面 |
| 屏蔽 | 顶栏 View Switcher、Lite Admin、Docs、Blog、Community 等入口，移除上游版本徽章、发布说明外链及账户菜单中的版本查询                                                             |
| 修改 | 隐藏页签的触发器和内容都不渲染，旧页签 URL 回退到允许的默认项，`keepMounted` 不恢复隐藏内容                                                                                    |
| 保留 | 登录、onboarding、修改密码和既有 `mcp` 回调路由，MCP 管理页仍被屏蔽。原有导航注册表、角色权限和相关源码保留                                                                    |

页面路径与菜单 ID 并不总相同，例如 `model-hub-table` 对应员工设置中的 `models`，`models-and-endpoints` 对应仅管理员可用的 `model-management`，`usage` 对应 `new_usage`。访问控制页面继续由原页面和后端判断具体角色，不能把 `litePageAllowed` 单独视为授权系统。隐藏功能的依赖和静态页面未统一删除，不承诺安装包或 JavaScript 体积下降

主要实现为 [liteUi.ts](src/utils/liteUi.ts)、[LiteUiContext.tsx](src/contexts/LiteUiContext.tsx)、[leftnav.tsx](src/components/leftnav.tsx)、[MomaNavigation.tsx](src/components/MomaNavigation.tsx)、[控制台 layout](<src/app/(dashboard)/layout.tsx>)、[tabs.tsx](src/components/ui/tabs.tsx) 和 [useUrlTab.ts](src/hooks/useUrlTab.ts)

### 工作台 Home

| 类型           | 开源基线                                 | 本版差异                                                                                    |
| -------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| 屏蔽并移除请求 | Lite Admin、社区新闻、模型榜单与更新推广 | 首页不再渲染这些区块，移除对应博客和榜单查询，顶栏发布通知也不再查询上游更新                |
| 新增           | 原有最近 7 天用量概览                    | 同一用量数据增加 Token 趋势，新增可用模型入口与使用指引，模型入口仅展示授权接口返回的前三项 |
| 修改           | 原概览指标和首页排布                     | 改为工作台，花费、请求数、Token、平均花费、平均延迟采用五列，指标顶部对齐，首页趋势高 160px |
| 保留           | 原有时间与角色范围                       | 继续统计最近 7 天实际花费，不改成当月数据或预计费用，创建密钥仍受只读角色约束               |

本版未新增账户钱包、订单、支付、退订、Token Plan、智能路由、排行榜或 Token 计算器

主要实现为 [HomePage.tsx](<src/app/(dashboard)/home/_components/HomePage.tsx>)、[UsageStatStrip.tsx](<src/app/(dashboard)/usage/_components/components/overview/UsageStatStrip.tsx>) 和 [NotificationsBell](src/components/Navbar/NotificationsBell/)

### 模型广场

开源 AI Hub 使用模型组目录，本版将其登录态入口 `model-hub-table` 改为员工与管理员共用的模型广场。通过既有 `useModelHub` 和 `/model_group/info` 读取当前账号获授权的模型组，不调用公共目录发布接口，不要求管理员另行发布，不把目录可见性当成 API Key 的调用授权

| 类型 | 具体差异                                                                                                                                                                               |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新增 | 以模型卡片展示目录，使用 `model_group` 作为展示、详情、复制和调用名称，同一模型组的多个部署合并展示                                                                                    |
| 新增 | 广场顶部和模型详情弹窗展示 OpenAI 与 Anthropic 协议 Base URL、独立复制按钮和中文填写说明                                                                                               |
| 修改 | 描述、供应商、类型和能力来自模型组元数据，详情保留输入输出 Token 上限、每百万 Token 价格和调用示例。价格采用人民币单位展示，不做汇率换算；缺失字段显示未设置，不推断单个部署的暂停状态 |
| 修改 | 搜索、供应商、类型和选中模型使用 nuqs URL 状态，可分享模型组详情。查询缓存按用户 ID 与角色隔离，切换身份不复用另一账号的目录                                                           |
| 屏蔽 | 广场不挂载 Agents、MCP、Skills、公共发布管理、社区外链或部署管理表单，过滤模型接口附带的 A2A 资源条目                                                                                  |
| 保留 | 立即使用打开 API 密钥页，不查询 Key 列表、不自动创建密钥或新增开通流程。代码示例使用占位 API Key，不包含当前登录令牌                                                                   |

访问地址复用 `getGatewayBaseUrl()`，按已有公开网关与 Worker 选择解析。去掉末尾斜杠及末尾单个 `/v1` 后作为 Anthropic Base URL，再追加 `/v1` 作为 OpenAI Base URL，其他路径前缀保留，不展示供应商 `api_base` 或上游凭据。此处没有新增协议或扩大 Worker 支持范围

首页、导航、命令搜索与模型名称下钻进入广场。原员工页面配置中的 `models` 继续控制广场可见性。团队和密钥详情的真实模型名称打开目录详情，访问组名称仅在管理员视角保留部署筛选链接，员工保留名称显示，不跳到无权访问的模型管理页。独立公共目录路由、源码和后端配置沿用开源实现，内部模型广场不使用匿名发布目录

主要实现为 [目录页面](<src/app/(dashboard)/model-hub-table/page.tsx>)、[ModelMarketplace.tsx](src/components/AIHub/ModelMarketplace.tsx)、[ModelCatalog.tsx](src/components/ModelCatalog.tsx)、[ModelGatewayAddresses.tsx](src/components/ModelGatewayAddresses.tsx)、[useModels.ts](<src/app/(dashboard)/hooks/models/useModels.ts>) 和 [entityLinks.ts](src/utils/entityLinks.ts)

### 模型管理、供应商与接入

开源 Models + Endpoints 在本版中作为独立“模型管理”，路径为 `models-and-endpoints`。导航、页面白名单和直达路由仅向平台管理员开放，读写动作继续受原后端权限及只读管理员限制，不提升角色权限

| 类型 | 具体差异                                                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 修改 | 管理页使用开源部署表格，保留搜索、团队、查看范围、排序、筛选、分页及 nuqs 状态，不提供模型卡片视图切换                                        |
| 保留 | 已接入模型、添加模型、供应商凭据、健康状态和模型重试设置五个轻量版页签，页签和管理操作使用中文文案，保留详情、编辑、删除和测试连接            |
| 屏蔽 | 隐藏 Auto Routers、Pass Through、Model Group Alias、Model Access Group Budgets Beta、Price Data，以及 Decision Models 推广和 User Connections |
| 屏蔽 | 新增模型表单的 Team-BYOK 开关与配套团队选择区，以及共享策略中的非模型资源和高级字段，字段提交边界不变                                         |
| 修改 | 新增模型供应商收窄为下表九项，首次进入和成功添加后默认 MoMA，URL 供应商预填也受同一目录约束                                                   |
| 修改 | 模型名称必填、对外名称映射、价格校验、计价选项及管理表格使用中文和人民币显示，原供应商枚举、模型名称与价格提交值不变                          |

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

移动云 MoMA 选项使用本地 [ecloud.png](public/assets/logos/ecloud.png)，通过共享 Logo 组件保留原色与比例，随静态资源打包，不在运行时请求官网，不影响顶部品牌和供应商提交值。图标来源为[移动云官网](https://ecloud.10086.cn/portal)引用的 [favicon](https://ecloud.eos-guangzhou-1.cmecloud.cn/fe/favicon.ico) 转为 PNG

目录由后端返回的原供应商元数据筛选生成，不伪造缺失项。MoMA 没有预置服务地址，也没有新增后端供应商实现。这里限制的是新增模型界面，既有模型、凭据、API 权限和后端支持范围继续保留

主要实现为 [管理页面](<src/app/(dashboard)/models-and-endpoints/page.tsx>)、[AllModelsTable.tsx](<src/app/(dashboard)/models-and-endpoints/components/AllModelsTable.tsx>)、[AllModelsTab.tsx](<src/app/(dashboard)/models-and-endpoints/components/AllModelsTab.tsx>)、[AddModelPanel.tsx](<src/app/(dashboard)/models-and-endpoints/panels/AddModelPanel.tsx>)、[modelProviders.ts](src/components/add_model/modelProviders.ts)、[AddModelForm.tsx](src/components/add_model/AddModelForm.tsx) 和 [model_info_view.tsx](src/components/model_info_view.tsx)。操作说明见[模型接入](../../README.md#模型接入)

### API 密钥

| 类型 | 具体差异                                                                                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 屏蔽 | 创建时的 Agent 所有者和非 AI API 类型，只提供 `llm_api`，You、Service Account、Another User 仍按原角色提供                                                 |
| 屏蔽 | 创建和编辑中的资源授权、日志、组织、项目、标签、策略、提示词、路由及高级预算限流配置，完整字段名见共享屏蔽规则                                             |
| 屏蔽 | 详情的 Savings、Auto Router Usage、Regenerate Key、组织和项目、独立日志、自动轮换、Guardrails、Policies、Prompts、路由权限、标签和原始 Metadata 等高级区块 |
| 屏蔽 | 组织、项目、标签和 End User 列，员工另隐藏用户 ID、用户和邮箱列，列选择器不能恢复这些列。对应高级筛选也隐藏                                                |
| 修改 | 密钥模型列默认仅展示 1 个模型和剩余数量，其余模型通过原提示和详情查看，未修改 Key 的模型权限                                                               |
| 修改 | 累计花费提示保留历史用量可能未回填的说明，去除上游版本与发布日期。无团队时不展示无意义的团队预算和限额说明                                                 |
| 保留 | 基本信息、模型、用量、预算、周期、过期时间、TPM/RPM、团队和访问组，查看、创建、编辑、删除等仍受原角色与接口权限约束                                        |

轻量版保存普通配置时跳过隐藏资源授权的重算和提交，避免改名和改预算覆盖已有授权或被 MCP 目录失败阻塞。其他隐藏字段仍可能保留在表单状态并按原逻辑提交，不会自动撤销后端已有配置

主要实现为 [create_key_button.tsx](src/components/organisms/create_key_button.tsx)、[key_edit_view.tsx](src/components/templates/key_edit_view.tsx)、[key_info_view.tsx](src/components/templates/key_info_view.tsx)、[KeyInfoHeader.tsx](src/components/templates/KeyInfoHeader.tsx) 和 [VirtualKeysPage](src/components/VirtualKeysPage/)

### 用量统计与图表

| 类型 | 具体差异                                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------ |
| 屏蔽 | MCP、Endpoints 页签，Aria 自然语言查询入口与编辑器，Top Agents，团队内部 Agent 页签、排行及查询                                |
| 屏蔽 | Customer、Tag、Agent、User Agent Activity、Organization 统计视角，选择器仅保留全局、本人、用户和团队，再叠加原权限             |
| 修改 | 概览五列指标将平均花费和平均延迟分开，供应商与用户排行在第一排，密钥排行与 API 路径请求量在第二排，1100px 以上双列对齐         |
| 修改 | 普通概览图高 256px，compact 图高 224px，金额右对齐，图表日期、提示、空状态、筛选、导出和请求说明接入中文与人民币显示           |
| 修改 | 日期控件使用 compact 展示和独立面板宽度，保留原日期语义、时间戳、查询状态和分享链接参数                                        |
| 修改 | 隐藏页签旧链接立即回退概览并清除无效 tab，保留时间及其他有效参数。团队及用户动态标题、导出弹窗、客户端日期和复制反馈完整本地化 |
| 保留 | 原权限允许的用量、模型、密钥、用户、错误统计及导出。历史非模型资源请求不因界面屏蔽而删除、过滤或漏算费用                       |

主要实现为 [UsagePageView.tsx](<src/app/(dashboard)/usage/_components/components/UsagePageView.tsx>)、[UsageViewSelect](<src/app/(dashboard)/usage/_components/components/UsageViewSelect/>)、[usage 概览组件](<src/app/(dashboard)/usage/_components/components/overview/>)、[UsagePage 公共组件](src/components/UsagePage/) 和 [advanced_date_picker.tsx](src/components/shared/advanced_date_picker.tsx)

### 请求日志与审计

| 类型   | 具体差异                                                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 屏蔽   | Audit Logs、Deleted Keys、Deleted Teams 页签及其企业预览和升级说明，员工不开放日志页                                               |
| 屏蔽   | 组织、项目、标签、End User 列与高级筛选，规则见共享屏蔽规则                                                                        |
| 修改   | 请求筛选只保留公开模型查询及原后端参数，不再展示搜索工具专属说明。日志详情、费用拆分、缓存类别、原始数据占位和辅助操作名称补齐中文 |
| 保留   | 管理员 Request Logs、请求详情、真实类型、费用、模型响应及原始 JSON，不伪造或删除历史请求                                           |
| 未新增 | 没有实现独立操作审计系统，没有新增审计采集、存储、查询接口或绕过企业许可证                                                         |

主要实现为 [日志页面](<src/app/(dashboard)/logs/>)、[RequestLogsFilters.tsx](src/components/logs/request/RequestLogsFilters.tsx)、[日志详情组件](src/components/logs/detail/) 和共享页签、表格策略。审计抽屉使用公共金额格式，但审计入口隐藏，不提供完整操作审计能力

### 团队与成员

| 类型 | 具体差异                                                                                                                                                               |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 屏蔽 | Default Team Settings 页签，创建团队中的独立 Logging Settings，以及组织、密钥管理设置、单模型预算编辑和详情展示                                                        |
| 屏蔽 | 创建团队中的 MCP、智能体、搜索工具、技能四个折叠区，编辑中的对应授权字段及向量库字段，团队概览和详情的资源权限展示                                                     |
| 屏蔽 | 团队概览中的护栏、策略和日志配置卡片，沿用前端屏蔽方式，不撤销已有后端配置                                                                                             |
| 修改 | 保存普通团队配置时跳过隐藏资源授权的重算和提交，避免目录不可用阻塞保存或覆盖已有权限                                                                                   |
| 修改 | 团队、成员、默认预算、角色、周期、额度提示和权限表补齐中文及人民币单位，原始成员限额数据不重算                                                                         |
| 修改 | 补齐团队资源数量提示、成员搜索筛选、加入团队空说明、本人及成员预算周期、模型授权来源和成员接口权限说明。预算日期按当前语言展示，UTC 日期与本地预算窗口仍分别沿用原语义 |
| 保留 | 团队创建、编辑、删除、成员分配、模型权限、基本预算、成员预算和 TPM/RPM，团队管理员可编辑范围仍由原设置决定                                                             |
| 保留 | 新增成员默认 User，可选择 Admin。编辑成员保留 Admin/User、模型范围、预算、周期、临时预算及到期时间、TPM/RPM 和按原许可证开放的单模型预算                               |

成员编辑是共享屏蔽规则的例外，附加字段通过局部解除轻量上下文使用社区完整表单，字段和操作仍受原权限及许可证约束

团队管理员仅管理其担任管理员的团队，不因该角色获得平台用户管理、模型接入、全局日志或系统设置权限。团队设置采用原后端返回的字段白名单，预算、软预算、TPM/RPM、成员默认额度和附加信息均需平台管理员分别授权，提高团队预算另需授权。为其他成员创建密钥需 `create_member_keys`，编辑其他成员密钥预算需 `member_key_budgets`，不会因此开放其他密钥字段。移除成员可被平台禁用，团队管理员不能重置自己的成员花费。普通成员是否可查看全团队用量、管理团队密钥仍由成员接口权限决定，中文显示不改变这些权限规则

模型与访问组的自定义名称、链接和提交值保留原样，系统模型范围标识才使用对应中文名称。成员权限表可能列出轻量版已隐藏功能的后端接口，翻译说明不表示恢复管理页面

主要实现为 [Teams.tsx](src/components/Teams.tsx)、[TeamInfo.tsx](src/components/team/TeamInfo.tsx)、[EditMembership.tsx](src/components/team/EditMembership.tsx)、[TeamsPage](src/components/TeamsPage/)、[团队组件](src/components/team/)、[MemberTable.tsx](src/components/common_components/MemberTable.tsx)、[budgetUtils.ts](src/utils/budgetUtils.ts) 和 [object_permissions_view.tsx](src/components/object_permissions_view.tsx)

### 用户管理与批量邀请

| 类型 | 具体差异                                                                                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 屏蔽 | 用户详情的 MCP 权限、编辑中的 MCP 服务器选择和工具权限，普通编辑不提交 MCP 授权字段                                                                  |
| 屏蔽 | 共享组织和单模型预算字段，受共享表单策略覆盖的位置见共享屏蔽规则                                                                                     |
| 修改 | 创建、详情、编辑、批量编辑、默认用户设置与批量邀请补齐中文，含角色、模型通配选项、预算周期、CSV 校验、预览和结果提示                                 |
| 修改 | 批量编辑全部或选定用户的标题、人数、无邮箱及“不更改”占位按语言显示，选中用户 ID、邮箱和提交范围保持原值                                              |
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

| 类型 | 具体差异                                                                                                                      |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| 屏蔽 | 基础负载均衡页的 Routing Strategy Selector、Tag Filtering 和 Latency Based Configuration 高级配置区                           |
| 修改 | 基础设置、重试、回退和路由分组弹窗的标签、选项、说明和反馈接入中文，显示标签与请求枚举分离                                    |
| 保留 | 基础重试、Routing Groups、Fallbacks、Prompt Caching 和 General 页签，原配置归属和接口提交逻辑，隐藏设置的已有后端效果继续存在 |

路由分组仍可配置其组内模型与策略，不受基础负载均衡页的全局策略选择器屏蔽影响。提示词缓存提供原有 Anthropic 自动缓存、有效期及 OpenAI 系统消息顺序配置，通用参数由原后端返回，这些功能沿用开源实现

主要实现为 [RouterSettingsForm.tsx](src/components/router_settings/RouterSettingsForm.tsx)、[路由设置组件](src/components/router_settings/)、[回退设置](src/components/Settings/RouterSettings/Fallbacks/) 和 [routing_groups](src/components/routing_groups/)。被其他保留界面复用的弹窗补译不表示恢复 Auto Routers 等隐藏页签

### 日志与告警、邮件设置

| 类型 | 具体差异                                                                                                                                           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 屏蔽 | Logging Callbacks、CloudZero、MS Teams Alerts 页签，Region Outage 企业告警                                                                         |
| 屏蔽 | 动态参数表中 `premium_field=true` 的整行，包括控件、说明和升级链接，独立 `PremiumLoggingSettings` 也不展示                                         |
| 屏蔽 | 邮件品牌字段 `EMAIL_LOGO_URL`、`EMAIL_SUPPORT_CONTACT`                                                                                             |
| 修改 | 默认页签从 Logging Callbacks 改为 Alerting Types，SMTP、普通邮件事件、动态告警、参数标签和反馈补齐中文                                             |
| 修改 | 告警地址和测试结果统一使用 Webhook 文案，移除获取 Slack 地址的外链。仍调用原 Slack 兼容告警通道，测试参数保持 `slack`，不新增任意 Webhook 协议适配 |
| 保留 | 普通告警类型与参数、SMTP、测试邮件和普通邮件事件，原始事件 ID、SMTP 键、敏感值遮罩、仅提交修改字段和重置逻辑                                       |

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
| 新增 | MoMA 主题样式与 `MomaBrand`，页头和账户开通默认显示移动云官方完整 Logo，登录页固定显示纯文字“模型服务平台 MoMA”，不显示默认或自定义 Logo，加载页与账户菜单继续显示产品名“MoMA 轻量版”，页面标题保持产品名                    |
| 修改 | 沿用原主题配置接口，管理员可配置普通 Logo、深色 Logo 和浏览器图标的 HTTP(S) 地址。深色 Logo 缺失或失败时回退普通 Logo，自定义图片失败时回退本地移动云 Logo，本地图也失败时回退产品文字，支持实时预览及恢复默认，没有新增上传 |
| 修改 | 浅蓝灰背景、白色侧栏与卡片、蓝紫强调色并保留深色模式，统一页面、详情、控件、卡片、弹窗、表格和分页                                                                                                                           |
| 修改 | 页头高 56px，侧栏宽 208px，内容内边距 20px，区块间距 16px，操作组 8px。模型广场卡片最小 288px、间距 12px、内边距 16px、圆角 12px，字段逐行对齐，手机单列，首页快捷卡片保持原尺寸                                             |
| 修改 | 普通正文、导航、表格和控件为 14px，区块、弹窗标题及桌面品牌为 21px，页面标题与核心指标为 31.5px，47.25px 保留作展示档，按 rem 和默认根字号换算                                                                               |
| 修改 | 桌面普通控件与分页 32px，手机主要控件 40px，抽屉项 44px，表头 36px，数据行上下内边距 8px、行高 20px，多行自然增高                                                                                                            |
| 修改 | 表格工具栏与框内分页统一 12px 留白，单元格采用等宽数字。多选框统一 6px 圆角，标签移除按钮保持 20px，输入组、弹窗和导航补齐 2px 键盘焦点外框，导航分组使用 500 字重                                                           |
| 修改 | 共享实体名称以主色、常显右箭头、悬停背景与下划线提示下钻，键盘焦点有内侧 2px 边框，团队内密钥别名与原 Key ID 打开同一详情                                                                                                    |
| 修改 | 共享用户悬停卡片去除会裁掉焦点边框的额外 overflow，继续保留列宽与省略。分页展示总条数和当前页，完整范围与总页数保留读屏说明                                                                                                  |
| 修改 | 密钥和团队创建弹窗宽 800px，模型参数与默认用户设置使用两列网格，去除重复缩进，动作可换行，窄屏保留内部滚动                                                                                                                   |
| 保留 | 表格原排序、筛选、列宽调整、横向滚动与翻页回调。表格高度随内容结束，窄桌面可能需要横向滚动，不因布局删掉其他可用字段                                                                                                         |

默认完整 Logo 使用[移动云官网](https://ecloud.10086.cn/portal)引用的[官方横版图片](https://ecloud.eos-guangzhou-1.cmecloud.cn/op-portal-static/static/images/home/ecloud-logo.png)，原图保存在 `public/assets/logos/ecloud-brand.png` 并随镜像打包。供应商选项继续使用独立的云形小图标。配置的图片保持原始比例，近方形图片会按页头高度缩小，不拉伸为横版标志。窄屏页头同时受容器宽度约束，避免裁切标志

`ThemeContext.tsx` 忽略用户编辑后迟到的初始配置响应，避免旧 Logo 覆盖实时预览或恢复默认结果。`ui-theme/UIThemeSettings.tsx` 在读取配置与保存期间禁用输入和操作，恢复默认仅在后端确认成功后清空表单与预览，失败时保留原值

默认品牌和主题是本版新增或修改，配置 Logo 的后端能力则来自开源基线。实体下钻样式影响复用单元格的团队、用户、密钥、模型、凭据、健康检查、访问组等列表，不改变目标、权限、真实链接或修饰键行为

页头与侧栏共用的账户菜单将非 Premium 版本标记由开源的 Standard 改为“轻量版 V1.0”，英文为 Lite edition V1.0，徽章和悬停标题使用同一文案。V1.0 是本定制产品版本，不取代开源基线或后端运行时版本，Premium 分支及后端许可证判断保留。移除开源的隐藏新功能标记、隐藏提示、隐藏博客入口、隐藏动态图标四项个人偏好开关，以及同一区块中已屏蔽 Aria 功能的 Premium 条件偏好入口，账户菜单不显示跳动棕榈树，不保留相关状态、回调，不通过 CSS 隐藏控件。账户信息与复制、按登录方式显示的修改密码、退出登录继续保留

社区推广、博客入口及带 Beta 标记的非核心页面和页签继续由轻量版导航、页面及页签策略屏蔽，不依赖这些个人偏好。localStorage 中已有偏好值不清理，开源保留组件仍可能读取原 Hook，轻量版账户菜单不读写这些偏好。没有修改后端权限、许可证、数据库或模型配置

保留页面移除社区文档、反馈和销售外链，保留字段解释与校验。部署健康告警仍展示真实密码、Redis、调试日志和许可证风险，忽略、暂缓、恢复及权限不变，已知文案补译，未知告警原样显示。通知面板保留组件与空状态，但不查询或展示上游版本发布通知

主要实现为 [moma-theme.css](src/app/moma-theme.css)、[MomaBrand.tsx](src/components/MomaBrand.tsx)、[DashboardHeader.tsx](src/components/DashboardHeader.tsx)、[ThemeContext.tsx](src/contexts/ThemeContext.tsx)、[UIThemeSettings.tsx](<src/app/(dashboard)/ui-theme/UIThemeSettings.tsx>)、[shared 组件](src/components/shared/)、[identity_cell.tsx](src/components/shared/table_cells/identity_cell.tsx)、[UserPopoverCell.tsx](src/components/shared/table_cells/UserPopoverCell.tsx)、[TeamVirtualKeysTable.tsx](src/components/team/TeamVirtualKeysTable.tsx)、[DeploymentHealth](src/components/DeploymentHealth/) 和 [SidebarAccountMenu](src/components/SidebarAccountMenu/)。具体样式以 [DESIGN.md](DESIGN.md) 为准，视觉复核范围见 [design-qa.md](design-qa.md)

### 中英文与系统资源显示名

| 类型 | 具体差异                                                                                                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新增 | `LocaleContext`、`LanguageSwitcher`、中文词典和翻译函数，支持 `zh-CN` 与 `en`，默认中文                                                                   |
| 修改 | 语言偏好存于浏览器 `moma.locale`，刷新恢复并同步 HTML `lang`，切换语言不重新挂载页面和表单，不发送语言到后端                                              |
| 修改 | 保留页面的静态说明、菜单、搜索、表头、日期、相对时间、状态、占位、表单、下拉、弹窗、通知、校验、操作反馈和辅助名称接入显示层翻译                          |
| 修改 | 团队预算日期和周期说明按参数传入的语言格式化，不修改全局日期语言或预算计算。共享表格图标提示接入翻译，用户自定义模型名不作为词典键替换                    |
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

主要实现为 [LocaleContext.tsx](src/contexts/LocaleContext.tsx)、[translate.ts](src/i18n/translate.ts)、[zh-CN.json](src/i18n/zh-CN.json)、[LanguageSwitcher.tsx](src/components/LanguageSwitcher.tsx)、[TerminologyContext.tsx](src/contexts/TerminologyContext.tsx)、[systemResourceLabel.ts](src/utils/systemResourceLabel.ts)、[toast.ts](src/lib/toast.ts)、[表格图标操作提示](src/components/common_components/IconActionButton/TableIconActionButtons/TableIconActionButton.tsx)、[ui 公共组件](src/components/ui/) 和 [localize-base-ui.mjs](scripts/localize-base-ui.mjs)。`package.json` 新增 `postinstall` 与 `prebuild`，将 Base UI 版本由范围约束固定为 `1.6.0`

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

| 类型       | 文件，相对仓库根目录                                                                        | 与开源基线的差异                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 修改       | `Dockerfile`                                                                                | 沿用源码完整构建流程，在 `npm ci` 前复制本地化脚本，使 `postinstall` 可执行                              |
| 修改       | `.dockerignore`                                                                             | 保留 Dashboard 已提交的本地依赖归档，避免完整镜像构建遗漏 `vendor/*.tgz`                                 |
| 新增       | `docker/lite-release/`                                                                      | x86_64 镜像安装包的 Compose、空模型配置和安装说明，应用与 PostgreSQL 均使用本地镜像，默认仅绑定本机 4000 |
| 新增       | [docker/Dockerfile.lite-ui](../../docker/Dockerfile.lite-ui)                                | 在 `litellm-lite-runtime:local` 上替换已完成的静态 Dashboard 导出，不重新编译后端                        |
| 新增       | [docker/docker-compose.lite-ui.yml](../../docker/docker-compose.lite-ui.yml)                | 独立应用和 PostgreSQL 服务、数据库卷，默认仅绑定 localhost 4001，密码和主密钥从外部环境提供              |
| 新增       | [docker/lite-ui-preview.yaml](../../docker/lite-ui-preview.yaml)                            | 空 `model_list`，启用原数据库模型管理，仅本机测试关闭泄露密码在线查询                                    |
| 新增       | [docker/lite-ui-preview.md](../../docker/lite-ui-preview.md)                                | 构建、启动、停止与私有配置流程                                                                           |
| 修改       | [根 README](../../README.md)、[Dashboard README](README.md)                                 | 说明轻量版能力、接入和构建入口、上游来源与许可证                                                         |
| 新增或修改 | 本文、[DESIGN.md](DESIGN.md)、[design-qa.md](design-qa.md)、[根 AGENTS.md](../../AGENTS.md) | 定制清单、设计规范、视觉验收与升级维护约定，`eslint-suppressions.json` 的规则豁免数量收紧                |

镜像不内置账户、密钥、演示模型记录或供应商库存，新数据库通过原生管理配置。环境文件、备份、上游凭据与具体测试账户由部署方私有维护，不加入源码或镜像。已有本机数据库中的演示记录也不构成仓库默认数据

本机走查报告、模型库存清单与验收截图保存在仓库外。`.gitignore` 排除 `usage-page-audit-*.md`、`docker/moma-model-catalog.md` 和 Dashboard 的 `design/` 目录，当前源码不保留私人走查记录。忽略规则与文件删除不清除已有 Git 历史

静态 UI 镜像使用 `npm run build` 导出的前端产物，沿用基础镜像中的 Python、Rust 和 Prisma 运行层。仅替换静态 UI 不会更新后端源码或运行时版本

2026-11-06 的 V1.0 x86_64 安装包使用 `34a581c46200d1c35a5813b61b7076bbd3f6a74a` 的应用源码与本次修复后的根 Docker 构建文件，完整构建后端和静态 UI。安装包内的 `manifest.txt` 分别记录应用源码提交、发布配置提交、构建文件哈希和镜像 ID，不包含数据库或私有环境文件

本次已通过 `linux/amd64` 完整构建、Rust 扩展加载、镜像导出和导入、Compose 配置校验、私有配置生成及拒绝覆盖检查、新数据库初始化、存活与就绪检查、管理员登录、控制台 HTML 与 JavaScript 资源访问、应用重启后的就绪检查，以及发布改动的格式、ESLint 和规则预算检查。运行验证使用 ARM64 宿主的 amd64 模拟环境，未在实体 x86_64 机器验证，未验证真实上游调用、计费、角色权限、负载或现有部署升级

预览的 `password_policy_check_breached_passwords: false` 仅关闭本机测试的在线查询，至少 12 位及其他强度规则沿用原策略，不改变后端默认值，也不应作为生产配置模板

## 共享屏蔽规则与数据保留

### 隐藏页签

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

集中策略仍对员工上下文的 `models-and-endpoints` 隐藏 `add`、`llm-credentials`、`health`、`retry-settings`、`raw`。当前员工不能进入模型管理路由，此处保留的是共享控件策略，不表示员工拥有管理入口。该表不替代原角色校验，Key 详情隐藏同名页签也不影响用户详情中的节省和自动路由统计

### 隐藏字段

以下是集中策略的精确字段名，按生效范围列出。独立区块还可能通过 `LiteUiMask` 隐藏，具体范围见上文各模块

| 生效范围                     | 屏蔽字段                                                                                                                                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 所有使用共享字段策略的位置   | `organization_id`、`organization_ids`、`secret_manager_settings`、`model_max_budget`、`team_member_model_max_budget`、`allowed_passthrough_routes`、`logging_settings`、`disable_global_guardrails`                                                                             |
| 保留页面的非模型资源授权     | `allowed_mcp_servers_and_groups`、`mcp_servers_and_groups`、`mcp_tool_permissions`、`allowed_agents_and_groups`、`agents_and_groups`、`allowed_skills`、`skills`、`object_permission_search_tools`、`object_permission_skills`、`vector_stores`、`allowed_vector_store_ids`     |
| Key 和模型的资源扩展         | `project_id`、`metadata`、`tags`、`guardrails`、`policies`、`prompts`、`vector_store_ids`、`allowed_routes`                                                                                                                                                                     |
| Key 和模型的高级预算、限流   | `soft_budget`、`budget_windows`、`budget_fallbacks`、`end_user_budget_id`、`tpd_limit`、`tpm_limit_type`、`rpm_limit_type`、`model_tpm_limit`、`model_rpm_limit`、`throttle_on_budget_exceeded`、`default_estimated_output_tokens`、`default_estimated_output_tokens_per_model` |
| Key 和模型的缓存、路由、成本 | `enable_prompt_caching`、`use_in_pass_through`、`kubernetes_pod_discovery`、`cache_control`、`cache_control_injection_points`、`litellm_extra_params`、`model_info_params`、`ptu_count`、`cost_per_ptu_per_hour`、`ptu_effective_from`、`ptu_effective_to`                      |

`max_budget`、`budget_duration`、`tpm_limit`、`rpm_limit`、`team_id`、`access_group_ids`、`model_access_group`、模型选择及供应商 `api_key` 等认证字段不在此屏蔽集合中。共享 `ModelMaxBudgetField` 还会隐藏 Key、用户、团队和默认成员预算中的整个单模型预算区块，成员编辑的完整表单是例外，仍受原许可证约束

### 隐藏列与筛选

| 生效范围            | 隐藏内容                                                                        |
| ------------------- | ------------------------------------------------------------------------------- |
| 共享表格            | `organization_id`、`organization_alias` 列                                      |
| Key、模型和日志表格 | 另隐藏 `project_id`、`request_tags`、`tags`、`end_user` 列                      |
| 员工 Key 表格       | 另隐藏 `user_id`、`user`、`user_email` 列                                       |
| 员工模型表格        | 另隐藏 `litellm_credential_name`、`input_cost`、`actions` 列                    |
| 共享筛选抽屉        | Organization 筛选                                                               |
| Key、模型和日志筛选 | 另隐藏 Project、End User、Tags、Cache、Credential、Span Type、Request Type 筛选 |

列在建立表格实例前被过滤，不能从显示列菜单恢复。筛选按原始英文标签匹配，再翻译显示标签

### 隐藏与保存的边界

`LiteUiMask` 及共享字段通常使用 `hidden` 与 `display:none`，保留子组件挂载和原表单状态。页签内容、资源权限概览及部分目录控件采用不渲染，两种处理不能混为源码删除或接口停用

`MountedFormField` 对声明为必填的字段及当前校验错误保留显示保护，`FormField` 保留当前错误字段显示，模型必需团队作用域另在可见区保留。隐藏值可能继续按原表单提交，或由原 diff 逻辑省略，不能统一声称所有隐藏字段都不发送

团队、Key 和用户的资源授权保存另有显式保护，普通编辑不重算或覆盖隐藏授权。访问组编辑也保留已有隐藏授权。需要停用旧配置时，应另行评估和授权后端或数据操作，不能通过清空隐藏表单实现

主要实现为 [FormField.tsx](src/components/shared/form/FormField.tsx)、[MountedFormField.tsx](src/components/common_components/MountedFormField.tsx)、[ModelMaxBudgetEditor.tsx](src/components/key_team_helpers/ModelMaxBudgetEditor.tsx)、[DataTable.tsx](src/components/shared/DataTable/DataTable.tsx)、[DataTableFilterDrawer.tsx](src/components/shared/DataTable/DataTableFilterDrawer.tsx) 及对应模块组件
