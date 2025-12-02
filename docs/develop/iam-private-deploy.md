# 私有化部署：权限与身份对接

> 受众：交付工程师、私有化实施。产品叙事见 [权限概念](../permission/index.md)；平台超管细节摘编自 DataTalk `spec/development/platform-admin-runbook.md`。

## 目标形态

私有化交付默认：

- **AuthN**：企业 IdP 或随包 Logto（`AUTH_MODE=sso`）
- **AuthZ**：DataTalk Casbin（组织 / 空间 / 资源）
- **商业能力**：组织上传 **License JWS**（中台不可达时）

DataLuminary **不提供**生产用本地账密登录 UI；本地密码仅开发回退。

## 1. 关键环境变量

### DataTalk

```dotenv
NODE_ENV=production
AUTH_MODE=sso
ALLOW_LOCAL_LOGIN=false

IDP_MODE=logto                 # 或 external_oidc
IDP_ISSUER=https://login.example.com/oidc
IDP_AUDIENCE=https://api.dataluminary.example
IDP_JWKS_URI=                  # 可选；留空则从 discovery 推导
SSO_ROLES_CLAIM=roles          # Keycloak 等可能是 realm_access.roles

ENTITLEMENT_MODE=off           # 纯 License 私有化可 off；接中台则 shadow_read → enforce
# ENTITLEMENT_LICENSE_PUBLIC_KEYS={"2026-07-key":"-----BEGIN PUBLIC KEY-----\\n...\\n-----END PUBLIC KEY-----"}
```

| 变量 | 说明 |
|------|------|
| `AUTH_MODE` | `sso`（生产必须）\| `local`（仅遗留/应急） |
| `IDP_MODE` | `logto` 或 `external_oidc` |
| `IDP_ISSUER` / `IDP_AUDIENCE` | OIDC 验签与 audience |
| `SSO_ROLES_CLAIM` | Access Token 中角色数组 claim 路径 |
| `ENTITLEMENT_MODE` | `off` \| `shadow_read` \| `enforce` |
| `ENTITLEMENT_LICENSE_*` | License 验签与可选静态 payload |

### DataView

```dotenv
VITE_ALLOW_LOCAL_LOGIN=false
VITE_IDP_ISSUER=https://login.example.com/oidc
VITE_IDP_CLIENT_ID=...
# 或经 Auth Gateway：
# VITE_AUTH_GATEWAY_URL=https://auth.example.com
```

回调 URI 须与 IdP 应用登记一致（通常 `https://<host>/auth/callback`）。

## 2. Logto 与社交 Connector

1. 部署 / 接入 Logto（或 Auth Gateway 上游指向企业 IdP）。
2. 创建 API Resource，audience = `IDP_AUDIENCE`。
3. 配置自定义 JWT，使 Access Token 带上 `roles`（或你设置的 `SSO_ROLES_CLAIM`）。
4. **社交登录（Google / GitHub 等）在 Logto Connector 中启用**——DataView **没有**一等 Google 按钮；用户仍点产品内「统一登录」。
5. 企业 AD / 飞书 / 钉钉 / 企微等同理：在 IdP 侧配 Connector，产品无感。

## 3. 外部角色映射

Seed 会写入 `external_role_mapping` 基线（示例）：

| IdP 角色码 | 本地落地（DataTalk） |
|------------|----------------------|
| `super_admin` | `platform_admin` |
| `platform_admin` | `platform_admin` |
| `dataluminary_admin` | `platform_admin` |
| `guest` / `dataluminary_viewer` | `guest` |
| `dataluminary_space_admin` | `space_admin`（产品域） |

SSO 登录时同步映射角色。可在设置中的「第三方角色映射」查看；验收：

```bash
# 需已登录且具备相应查看权限
GET /api/rbac/external-role-mappings
```

生产 **不要** `SEED_DEV_PERSONAS=true`；`NODE_ENV=production` 时 seed **不**创建弱口令本地用户。

## 4. License 上传

私有化商业能力通过组织 License 注入：

```http
POST /api/org/:orgUid/license
Authorization: Bearer <org-admin-or-owner-jwt>
Content-Type: application/json

{ "jws": "<signed-license-jws>" }
```

- 验签依赖 `ENTITLEMENT_LICENSE_PUBLIC_KEYS`。
- 成功后写入 `license` 表，审计 `org.license.upload`。
- License **只**提供 Feature / Quota，**不能**绕过 Casbin。
- 查询：`GET /api/org/:orgUid/license`、`GET /api/org/:orgUid/billing`。

## 5. 平台管理员开通（Runbook 摘要）

目标：生产超管在 **Identity** 配置，产品通过映射落地，而不是依赖本地 `admin` 密码。

| 步骤 | 操作 |
|------|------|
| 1 | 迁移：`pnpm migration:run`；种子：`pnpm seed`（仅角色目录 + 映射等） |
| 2 | 在生产 Logto 创建用户（如 `ops@your-company.com`） |
| 3 | 创建全局角色 `super_admin`、`platform_admin`，赋给破窗 / 日常平台管理员 |
| 4 | 确认 Access Token 含角色数组（claim = `SSO_ROLES_CLAIM`） |
| 5 | 用该用户 SSO 登录 DataView → 应能进入系统设置 / 平台管理 |
| 6 | 企业租户：平台管理员 `POST /api/admin/orgs` 创建组织（可选 `ownerEmail` 绑定 `org_owner`） |

破窗（仅上线首日、可选）：IdP claim 未就绪时，运维可临时手工绑定一名强密码本地用户为平台角色，**用完删除**；长期仍以 IdP `super_admin` 为准。

验收清单：

- [ ] 映射表含 `super_admin` → 平台最高角色
- [ ] SSO 后 `/api/auth/me` 含平台角色
- [ ] 无 IdP 角色的用户无法进平台设置
- [ ] 生产库无 seed 弱口令用户
- [ ] License 上传后 billing / feature 门闸符合合同

## 6. 相关文档

- [企业线上 SSO 接入](./iam-enterprise-sso.md)
- [第三方嵌入对接](./embed-integration.md)
- [权限架构](../permission/architecture.md)
- DataTalk：`spec/development/platform-admin-runbook.md` · `spec/development/entitlement.md`
