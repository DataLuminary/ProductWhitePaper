# 第三方嵌入对接

> 受众：宿主系统后端与前端集成方。产品侧分享说明另见 [仪表盘嵌入分享](../share/embed.md)。

## 流程总览

```text
1. 创建 / 登记外部应用（clientId + clientSecret，仅创建/轮换时回明文 Secret）
2. 宿主后端 S2S：POST /api/embed/token/exchange  → 短期 embed token
3. 浏览器 / iframe：POST /api/embed/session      → 只读 embed-view JWT
4. 携带 JWT 加载嵌入查看页并查询数据
```

Client Secret **禁止**写入浏览器持久化存储；换票必须在服务端完成。

## 1. 管理端入口

| 入口 | 路径 | 能力 |
|------|------|------|
| **平台管理** | `#/settings/admin/applications` | 跨空间应用列表、创建（选空间 + 仪表盘白名单 + 来源域）、轮换密钥、禁用、token 吊销、审计时间线 |
| **空间分享** | `#/<spaceUid>/settings/sharing` | 空间内嵌入应用与分享配置（保留） |

后端检索：`POST /api/embed/applications/search`。平台管理员可省略 `spaceUid` 做跨空间查询；非平台管理员必须带 `spaceUid`。

创建时登记：

- `allowedOrigins`：允许的浏览器 Origin（session 校验）
- `allowedDashboardUids`：可嵌入的仪表盘白名单
- `spaceUid`：所属空间

## 2. S2S 换票

```http
POST /api/embed/token/exchange
Content-Type: application/json

{
  "clientId": "app_xxx",
  "clientSecret": "***",
  "dashboardUid": "dash_xxx",
  "audience": "optional-host-label",
  "dynamicParams": { "region": "cn-east" },
  "expiresInSeconds": 900
}
```

| 字段 | 说明 |
|------|------|
| `clientId` / `clientSecret` | 应用凭证；Secret 仅服务端持有 |
| `dashboardUid` | 必须落在应用的 `allowedDashboardUids` |
| `audience` | 可选业务侧标识 |
| `dynamicParams` | 可选动态参数（字符串 / 数字 / 布尔） |
| `expiresInSeconds` | 可选；服务端钳制，默认约 15 分钟，最大 1 小时（60–3600） |

成功返回短期 **embed token**（明文只出现一次；库中只存哈希）。过期或吊销后不可再换 session。

## 3. 浏览器建立 Session

在 iframe 或宿主页（Origin 必须命中 `allowedOrigins`）：

```http
POST /api/embed/session
Content-Type: application/json
Origin: https://host.example.com

{
  "token": "<embed-token-from-exchange>",
  "origin": "https://host.example.com"
}
```

- `origin` 可省略，此时使用请求头 `Origin`。
- 成功返回 `accessToken`（`scope: embed-view`）、`expiresIn`、`dashboardUid`、`spaceUid`、`dynamicParams` 等。
- `expiresIn` 对齐 embed token 剩余寿命（至少 60 秒语义由服务端保证）。

随后前端以该 JWT 调用只读查询接口；分享可见范围为 `third_party_embed` 的链路走嵌入管线，而不是邀请码公开页。

## 4. 代码示例（宿主后端 + iframe）

```ts
// Node 宿主后端（示意）
async function mintEmbedAccess(dashboardUid: string) {
  const exchange = await fetch("https://api.example.com/api/embed/token/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: process.env.DL_EMBED_CLIENT_ID,
      clientSecret: process.env.DL_EMBED_CLIENT_SECRET,
      dashboardUid,
      expiresInSeconds: 900,
    }),
  }).then((r) => r.json());

  // 将 exchange.token 交给前端一次性换 session；勿把 clientSecret 下发浏览器
  return exchange.token as string;
}
```

```ts
// 浏览器（示意）
async function openEmbed(embedToken: string) {
  const session = await fetch("https://api.example.com/api/embed/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: embedToken,
      origin: window.location.origin,
    }),
  }).then((r) => r.json());

  // 使用 session.accessToken 加载嵌入查看页 / API
  return session;
}
```

产品内「嵌入代码」生成器还可输出 iframe / JS SDK / Micro App / Wujie 模板，见 [仪表盘嵌入分享](../share/embed.md)。

## 5. 安全与语义摘要

| 主题 | 规则 |
|------|------|
| 来源域 | Session 校验 `Origin` ⊆ `allowedOrigins` |
| 仪表盘白名单 | Exchange 时 `dashboardUid` ⊆ `allowedDashboardUids` |
| 过期 | Embed token TTL 默认 ~15m、最大 1h；session JWT 对齐剩余 TTL |
| 密钥轮换 | 管理端轮换后旧 Secret 立即失效；已签发未过期 token 可按产品策略吊销 |
| 禁用应用 | `status=disabled` 后拒绝 exchange / session |
| 审计 | `embed_audit_event` + 管理端时间线 |

## 6. 与三种分享可见范围的关系

| 可见范围 | 是否走本文流程 |
|----------|----------------|
| `third_party_embed` | **是** |
| `invite_code` / `public` | 否（公开查看页 / 邀请码 session） |

详见 [FAQ · 分享可见范围](../permission/faq.md#分享三种可见范围)。

## 7. 相关文档

- [仪表盘嵌入分享（产品）](../share/embed.md)
- [私有化对接](./iam-private-deploy.md)
- [权限架构](../permission/architecture.md)
