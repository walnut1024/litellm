# MoMA 轻量版 Dashboard

基于 Next.js 的控制台，生产构建静态导出后由网关服务提供。角色边界、页面裁剪和合并要求见 [LITE_UI_CUSTOMIZATIONS.md](LITE_UI_CUSTOMIZATIONS.md)，界面规范见 [DESIGN.md](DESIGN.md)

## 开发与构建

在本目录执行，依赖版本以项目配置和锁文件为准

```bash
npm ci --no-audit --no-fund
npm run dev
```

开发页面默认位于 [localhost:3000](http://localhost:3000)。前端需要配套的后端服务及有效登录会话，启动页面不代表业务接口已经配置

```bash
npm run build
```

默认构建输出为 `out`，完整应用与仅替换前端的部署方式见[本地部署说明](../../docker/lite-ui-preview.md)。测试应传入明确的受影响文件，检查范围与限制见[维护指南](LITE_UI_CUSTOMIZATIONS.md#验证记录与限制)

## 页面检查

按[界面验收清单](design-qa.md)检查员工与管理员、保留页面、弹窗、悬停提示、条件显示和屏蔽页回退。测试截图与执行日志保存在部署方的私有资料中，公开说明只维护通用规则与必要的验证边界
