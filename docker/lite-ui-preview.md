# 轻量版本地部署

本说明用于从源码部署隔离的本地预览环境。应用和 PostgreSQL 由 [docker-compose.lite-ui.yml](docker-compose.lite-ui.yml) 启动，网关与控制台共用应用服务，默认只绑定本机 4001 端口。模型、账户、密钥和请求记录保存在数据库中，不随源码或镜像分发

## 构建完整镜像

在仓库根目录执行，运行前确认使用需要部署的分支和已提交版本

```bash
git status --short --branch
git rev-parse HEAD
docker build -t litellm-moma:local .
```

根 [Dockerfile](../Dockerfile) 构建 Python、Rust、Prisma 和 Dashboard。源码版本与镜像 ID 应记录在部署方自己的发布清单中。仅更改文档不需要重建镜像，Python 或 Rust 变更后需要完整构建运行层

## 准备私有配置

选择仓库外的持久目录，将下面的占位路径替换为实际目录。环境文件应和数据库配套保留，不要放进源码、镜像、截图或公开工单

```bash
MOMA_DEPLOY_DIR=/absolute/path/to/moma-deployment
MOMA_PREVIEW_PROJECT=moma-preview
mkdir -p "$MOMA_DEPLOY_DIR"
chmod 700 "$MOMA_DEPLOY_DIR"
(
  set -e
  set -o noclobber
  umask 077
  {
    printf 'LITELLM_PREVIEW_MASTER_KEY=sk-%s\n' "$(openssl rand -hex 24)"
    printf 'LITELLM_PREVIEW_SALT_KEY=sk-%s\n' "$(openssl rand -hex 24)"
    printf 'LITELLM_PREVIEW_PASSWORD=%s\n' "$(openssl rand -hex 24)"
    printf 'LITELLM_PREVIEW_DB_PASSWORD=%s\n' "$(openssl rand -hex 24)"
  } > "$MOMA_DEPLOY_DIR/preview.env"
  cat > "$MOMA_DEPLOY_DIR/compose.override.yml" <<'YAML'
services:
  litellm:
    image: litellm-moma:local
YAML
)
```

这段配置生成命令只用于新环境。已有环境直接使用原文件，不要覆盖主密钥、数据库密码或加密 salt，否则可能无法读取已有数据

[lite-ui-preview.yaml](lite-ui-preview.yaml) 的模型列表为空，开启数据库模型配置。该预览文件关闭了泄露密码校验，其他密码强度要求仍沿用后端策略。它仅用于本机测试，向其他环境部署前必须核对密码策略、访问范围和完整部署要求

## 启动与检查

保留前一步的目录和项目变量。覆盖文件指定完整镜像，`--no-build` 避免触发 Compose 中的静态 UI 叠加构建

```bash
docker compose -p "$MOMA_PREVIEW_PROJECT" \
  --env-file "$MOMA_DEPLOY_DIR/preview.env" \
  -f docker/docker-compose.lite-ui.yml \
  -f "$MOMA_DEPLOY_DIR/compose.override.yml" config --quiet
docker compose -p "$MOMA_PREVIEW_PROJECT" \
  --env-file "$MOMA_DEPLOY_DIR/preview.env" \
  -f docker/docker-compose.lite-ui.yml \
  -f "$MOMA_DEPLOY_DIR/compose.override.yml" up -d --no-build
curl --fail http://127.0.0.1:4001/health/liveliness
```

打开 [控制台](http://127.0.0.1:4001/ui/)，使用 `admin` 和私有环境文件中的管理员密码登录。通过模型广场配置供应商、模型和凭据，再通过用户管理创建员工并配置模型、团队及预算权限。新环境没有预置供应商凭据或员工账户

供应商适配器、上游模型 ID 和地址应按实际服务配置。接入 DeepSeek 官方服务时使用原生 DeepSeek 供应商，模型 ID 以接入时官方可用目录为准。供应商凭据直接通过管理界面保存，不写入本说明或版本库。直接填入模型的凭据与独立命名的供应商凭据记录不同，前者不会自动出现在凭据列表中

登录与健康检查仅证明应用可访问。接入后应使用限定模型范围的测试密钥检查普通请求、需要的流式请求、权限拒绝和日志记录，并核对实际计价。公开文档不记录测试账户、调用费用、私有库存或真实凭据

## 更新与停止

更新完整镜像后，沿用原项目名、环境文件和覆盖文件执行上面的启动命令。数据库卷与加密 salt 必须配套保留，旧客户端需使用该环境有效的密钥，浏览器可能需要强制刷新静态资源

停止环境使用同一组参数，默认保留数据库卷

```bash
docker compose -p "$MOMA_PREVIEW_PROJECT" \
  --env-file "$MOMA_DEPLOY_DIR/preview.env" \
  -f docker/docker-compose.lite-ui.yml \
  -f "$MOMA_DEPLOY_DIR/compose.override.yml" down
```

日常更新与停止不要删除数据卷。迁移前应另外备份数据库和私有配置，不能把应用镜像当作数据备份

## 仅更新前端

[Dockerfile.lite-ui](Dockerfile.lite-ui) 提供可选的静态 UI 叠加构建，依赖已有的 `litellm-lite-runtime:local` 源码运行时。先在 `ui/litellm-dashboard` 完成 `npm ci --no-audit --no-fund` 和 `npm run build`，再通过示例 Compose 的 `--build` 构建前端覆盖层。不要将该流程与上述完整镜像覆盖文件混用

该方式只更新导出的控制台资源。Python 或 Rust 变更后应先重建运行层。镜像发布 revision、UI 源码 revision 和运行源码 revision 应分别核对

## 维护边界

角色、页面、字段与品牌差异见[维护指南](../ui/litellm-dashboard/LITE_UI_CUSTOMIZATIONS.md)，样式规范见 [DESIGN.md](../ui/litellm-dashboard/DESIGN.md)，页面检查范围见[界面验收清单](../ui/litellm-dashboard/design-qa.md)。前端屏蔽不改变后端 API 授权，局部验收不能替代生产部署、完整计费或负载验证
