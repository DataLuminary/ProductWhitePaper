# 企业线上接入：OIDC / SSO 与组织开通

> 受众：SaaS / 专有云集成方。私有化 License 见 [私有化对接](./iam-private-deploy.md)；产品话术见 [统一身份与企业 SSO](../product/unified-identity.md)。

## 分层提醒

```text
身份认证（谁）     →  LuminaryWorks Identity / 企业 IdP（经 Auth Gateway）
商业权益（买了啥） →  中央 Entitlement（Trial / 套餐）
资源权限（能碰啥） →  DataTalk Casbin
```

JWT **不含**细粒度 ACL 与套餐明细。

## 1. OIDC 对接步骤

1. **登记应用**  
   在 Logto / Auth Gateway（或企业 IdP）创建 OIDC 应用：Authorization Code + PKCE。  
   Redirect URI：DataView `https://<app-host>/auth/callback`。

2. **API Resource**  
   Audience 与 DataTalk `IDP_AUDIENCE` 一致；启用 JWT 访问令牌。

3. **角色 Claim**  
   配置 Access Token 自定义声明，输出角色数组；DataTalk 用 `SSO_ROLES_CLAIM`（默认 `roles`）读取。

4. **DataTalk 环境**

   ```dotenv
   AUTH_MODE=sso
   IDP_MODE=logto          # 企业直连可为 external_oidc
   IDP_ISSUER=https://<issuer>/oidc
   IDP_AUDIENCE=https://api.<your-product>
   SSO_ROLES_CLAIM=roles
   ```

5. **DataView 环境**  
   `VITE_IDP_*` 或 `VITE_AUTH_GATEWAY_URL`；`VITE_ALLOW_LOCAL_LOGIN=false`。

6. **换票**  
   前端 OIDC 完成后调用 `POST /api/auth/sso/login`（body 含 IdP `accessToken`）。  
   DataTalk JWKS 验签 → 映射 / 创建本地用户 → `ensureDefaultOrgMembership`（默认组织会员）→ 外部角色映射 → 签发产品 JWT。

7. **上下文**  
   业务请求通过 `X-Org-Uid` / `X-Space-Uid`（或 query）进入组织 / 空间作用域；`GET /api/auth/me` 返回加法字段 `organizations` / `entitlements` 等。

## 2. 外部角色映射

| IdP 角色（示例） | 产品侧效果 |
|------------------|------------|
| `super_admin` / `platform_admin` | 平台管理（组织开通、用户治理、跨空间嵌入应用等） |
| `dataluminary_admin` | 映射为平台管理角色（与生态约定一致时） |
| `guest` / 无特殊角色 | 普通用户；默认组织下呈现 `org_member` |
| 产品域自定义码 | 按 `external_role_mapping` 表配置 |

映射表由 seed 初始化，可在运行期维护。组织内角色（`org_admin`、`space_editor` 等）通常由组织管理员在产品内授予，而不全部塞进 IdP。

## 3. 组织开通（Provisioning）

| 场景 | 行为 |
|------|------|
| 个人 / 自助首次登录 | 自动加入**默认组织**会员（`org_member` 语义） |
| 企业租户开通 | **平台管理员**创建组织并指定所有者 |

创建组织 API：

```http
POST /api/admin/orgs
Authorization: Bearer <platform-admin-jwt>
Content-Type: application/json

{
  "name": "Acme Analytics",
  "slug": "acme",
  "type": "enterprise",
  "ownerEmail": "owner@acme.com"
}
```

- `slug` 可省略（服务端生成，需唯一）。
- `type`：`personal` \| `enterprise`（默认企业语义由实现决定）。
- `ownerEmail` 命中已有用户时：写入 `membership` + 组织域 `org_owner`，并 reload Casbin。
- 审计：`admin.org.create`。
- 前端入口：`#/settings/admin/organizations`（创建组织表单）。

列表 / 停用：`GET /api/admin/orgs`、`PATCH /api/admin/orgs/:uid`（`status: active|suspended`）。

## 4. Entitlement 中台模式

线上 SaaS 推荐走中央权益，而不是 License 文件。

```dotenv
ENTITLEMENT_MODE=enforce          # 上线前可先 shadow_read
ENTITLEMENT_BASE_URL=https://entitlement.example
ENTITLEMENT_SERVICE_API_KEY=...
PRODUCT_CODE=dataluminary
DEPLOY_MODE=saas                  # 与解析器选择配合
```

| 模式 | 用途 |
|------|------|
| `shadow_read` | 双读对比，本地仍生效；适合灰度 |
| `enforce` | 中央权威；不确定 fail closed |
| `off` | 不调用中央（本地开发 / 纯 License 私有化） |

组织侧：

- `GET /api/membership`：当前 subject 权益快照  
- `POST /api/membership/trial/ensure`：入口幂等 Trial  
- 决策管线仍为 **RBAC → Feature → Quota**（见 [架构 §8](../permission/architecture.md#8-permission-判断流程)）

私有化气隙改走 [License 上传](./iam-private-deploy.md#4-license-上传)。

## 5. 验收清单

- [ ] OIDC 登录闭环，`/api/auth/me` 含 `user` 与 `organizations`
- [ ] IdP 角色映射符合预期；无角色用户不能进平台设置
- [ ] `POST /api/admin/orgs` 可创建企业组织并绑定 owner
- [ ] `ENTITLEMENT_MODE=enforce` 下未购买 Feature 返回升级类错误，且 RBAC 拒绝不泄露套餐
- [ ] 分享三种可见范围与嵌入流程按产品文档可用

## 6. 相关文档

- [私有化对接](./iam-private-deploy.md)
- [第三方嵌入对接](./embed-integration.md)
- [权限架构](../permission/architecture.md)
