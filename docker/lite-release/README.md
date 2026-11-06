# MoMA 轻量版 V1.0 x86_64 镜像安装包

适用于 Linux x86_64，包含应用与 PostgreSQL 16 的 amd64 镜像，不包含 Docker 本身。目标服务器需预先安装 Docker Engine、Docker Compose v2 或更高版本，以及 OpenSSL。镜像导入与容器启动无需拉取镜像，模型调用、外部登录服务和泄露密码检查等功能仍可能需要网络

下载 Release 中的安装包和 `SHA256SUMS`，在同一目录校验并解压

```bash
sha256sum --check SHA256SUMS
tar -xzf moma-lite-v1.0.0-linux-amd64.tar.gz
cd moma-lite-v1.0.0-linux-amd64
docker load --input images.tar.gz
```

首次安装时生成私有配置。下面的命令拒绝覆盖已有 `.env`，已有部署须保留原主密钥、加密 salt、管理员密码和数据库密码

```bash
(
  set -eu
  set -o noclobber
  umask 077
  {
    printf 'LITELLM_MASTER_KEY=sk-%s\n' "$(openssl rand -hex 24)"
    printf 'LITELLM_SALT_KEY=sk-%s\n' "$(openssl rand -hex 24)"
    printf 'UI_PASSWORD=%s\n' "$(openssl rand -hex 24)"
    printf 'POSTGRES_PASSWORD=%s\n' "$(openssl rand -hex 24)"
  } > .env
)
docker compose -p moma-lite config --quiet
docker compose -p moma-lite up -d --no-build
curl --fail http://127.0.0.1:4000/health/liveliness
```

首次启动会初始化数据库，请等待健康检查成功。打开 `http://127.0.0.1:4000/ui/`，账号为 `admin`，密码为 `.env` 中的 `UI_PASSWORD`。通过模型管理接入上游，再创建用户和 API Key。发布包不包含演示模型、供应商凭据或预置员工

默认仅允许服务器本机访问，数据库不对外开放。在个人电脑执行 `ssh -L 4000:127.0.0.1:4000 user@server` 后，可在浏览器打开上述地址。对外部署时由部署方配置 HTTPS 反向代理和访问控制。端口冲突时可在 `.env` 增加 `MOMA_PORT=4003`

查看状态和日志使用 `docker compose -p moma-lite ps` 与 `docker compose -p moma-lite logs --tail 100 litellm`。停止服务使用 `docker compose -p moma-lite down`，不要添加 `-v`。更新前备份数据库、`.env` 和部署配置，始终沿用项目名 `moma-lite` 与原数据库卷，不要将镜像安装包作为数据库备份

源码与镜像标识见同包 `manifest.txt`，许可证见 `LICENSE` 与 `LICENSE_ENTERPRISE`。前端精简不改变后端权限或企业许可证要求，人民币符号仅是显示定制，未提供汇率换算。安装验证不代表真实模型调用、计费、权限或负载验收通过
