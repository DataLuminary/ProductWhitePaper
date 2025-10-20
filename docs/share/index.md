# 共享方案

DataLuminary 将可视化能力做成可嵌入的原子资源：仪表盘可通过多种方式嵌入第三方系统，同时微前端插件体系也支持跨框架组合。

## 微前端

我们通过自研微前端方案，为前端插件提供 Vue2/3、React、Solid、Svelte 等开发模板，并支持用户按需组合插件。同一套方案也可让第三方平台按需嵌入 DataView 资源。

> 关于微前端，推荐阅读：
>
> - [微前端学习笔记（1）：微前端总体架构概述](https://www.zhoulujun.cn/html/webfront/engineer/Architecture/9029.html)
> - [微前端学习笔记(2): 无界方案分析](https://www.zhoulujun.cn/html/webfront/engineer/Architecture/9052.html)
> - [微前端学习笔记(3):前端沙箱之 JavaScript sandbox](https://www.zhoulujun.cn/html/webfront/engineer/Architecture/9055.html)
> - [微前端学习笔记(4):从微前端到微模块之 EMP 与 hel-micro](https://www.zhoulujun.cn/html/webfront/engineer/Architecture/9063.html)
> - [微前端学习笔记(5)：从 import-html-entry 发微 DOM/JS/CSS 隔离](https://www.zhoulujun.cn/html/webfront/engineer/Architecture/9066.html)

当然我们不局限于微前端。

![DataView如何分享可视化资源：分享方式对比](./images/1.png)

用户可以按需选择自己的嵌入方案。

![2.png](./images/2.png)

为此，我们的功能都能原子化共享：

![3.png](./images/3.png)

## 仪表盘嵌入（产品能力）

在空间内进入 **分享 → 仪表盘嵌入管理**，可创建嵌入配置并生成代码。当前支持：

| 方式 | 说明 | 跨域 |
|------|------|------|
| **iframe** | 原生 iframe 指向公开嵌入页，隔离强、接入快 | 一般无需额外配置 |
| **JS SDK（CDN）** | `window.Luminary.embed` 在宿主容器内创建 iframe 并挂载嵌入页 | 需反向代理（或后续域名 CORS） |
| **Micro App** | 以京东 Micro App 子应用加载嵌入页 | 需反向代理（或后续域名 CORS） |
| **无界 Wujie** | 以 Wujie 微前端加载嵌入页 | 需反向代理（或后续域名 CORS） |
| React 组件 | 规划中 | — |
| Veaury 桥接 | 规划中 | — |

图表（Panel）嵌入与访问日志本期未开放。

### 跨域设置

除 iframe 外，宿主页与 DataTalk API 不同源时需要跨域方案：

1. **反向代理（推荐，已支持）**  
   在贵司网关 / Nginx / Ingress 上将 DataLuminary 官方域名（例如 `*.dataluminary.dev`，含 DataView 前端与 DataTalk API）反向代理到自有同源路径。浏览器请求与页面同源后即可免 CORS。嵌入代码中的 `proxy` 填写代理后的 DataTalk 基址，例如 `https://your-domain.com/datatalk`。

2. **跨域域名设置（规划中）**  
   按空间在 Fastify 侧动态设置 `Access-Control-Allow-Origin`。域名与空间绑定，因此在后端做拦截，而不采用 Cloudflare Workers 边缘动态 CORS 或 Nginx Lua 动态 CORS。

### JS SDK（CDN）

先提供 CDN 脚本（随 DataView 静态资源发布，生产可映射为 `https://cdn.dataluminary.dev/sdk.js` → `/sdk/luminary.js`）。TypeScript 包 `@dataluminary/sdk`（`LuminaryClient`）为后续规划。

```html
<div id="dashboard" style="width:100%;min-height:640px;"></div>
<script src="https://cdn.dataluminary.dev/sdk.js"></script>
<script>
  window.Luminary.embed({
    container: "#dashboard",
    // 用户反向代理后的 DataTalk 基址
    proxy: "https://proxy.demo.dev/datatalk",
    token: "xxx",
    dashboard: "share-uid",
    appOrigin: "https://app.dataluminary.dev",
  });
</script>
```

说明：

- `dashboard`：分享配置的 uid（非仪表盘业务 id）。
- `token`：该分享的公开访问令牌。
- `proxy`：可选；嵌入页会用其作为 API `baseURL` 请求 DataTalk。
- `appOrigin`：DataView 应用源站；省略时取 SDK 脚本所在 origin。

规划中的 npm 用法示意：

```js
import { LuminaryClient } from "@dataluminary/sdk";

const client = new LuminaryClient({
  container: "#dashboard",
  proxy: "https://proxy.demo.dev/datatalk",
  token: "xxx",
  dashboard: "share-uid",
});
```

打包时请保证请求后台（DataTalk）走 `proxy`（或更清晰的命名如 `apiBase`）所指向的地址。

### 公开嵌入地址

嵌入页路由：`#/embed/share/:shareUid?token=...&proxy=...`  
后端公开接口：

- `GET /share/public/:token` — 解析元数据  
- `POST /share/public/:token/session` — 换取短期只读 JWT，用于加载仪表盘与查询
