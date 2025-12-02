# 统一身份与企业 SSO

> 产品 / 售前 / 私有化交付说明。工程细节见 DataView / DataTalk `spec/development/unified-login.md` 与 [LuminaryWorks docs](https://github.com/LuminaryWorks/docs)。

## 默认心智

| 部署形态 | 用户如何登录 |
|----------|----------------|
| **SaaS / 标准私有化包** | **LuminaryWorks 统一账号**（一次注册，生态互通） |
| **企业采购私有化** | **企业账号 SSO**（AD / 飞书 / 钉钉 / 企微 / Azure AD 等） |
| 本地开发 | 统一登录为主；可选折叠「本地开发账号」 |

DataView 登录页主按钮为「使用统一账号登录」；本地用户名密码不是生产默认路径。

## 为什么重要

1. **扫清 B2B 障碍** — 企业反感数据孤岛与新密码；标准 OIDC/SAML 是采购加分项。  
2. **研发不重复造轮子** — 验证码、找回、2FA、社交登录、风控归 IdP。  
3. **生态交叉销售** — 同一 `sub` 进入 DataLuminary、BlockyEdu、VistaRemote 等，免密体验。

## 分层（售前话术可复用）

```text
身份认证（谁）     →  LuminaryWorks Identity / 企业 IdP（经 Auth Gateway）
商业权益（买了啥） →  中央 Entitlement（Trial / 套餐 / License）
资源权限（能碰啥） →  DataTalk Casbin（空间、看板、数据集…）
```

- **Logto / 企业 IdP 只管身份**，不管某个仪表盘能不能编辑。  
- **JWT 不含**商业套餐与细粒度 ACL，避免僵化与泄露。  
- 产品库保留 `user_id ↔ IdP sub`，便于审计与业务剥离。

## Auth Gateway（对客户怎么说）

客户或集成商看到的是标准 OIDC 入口，而不是「必须用 Logto」。

- 今天上游可以是 Logto，明天可以是 Auth0 / Keycloak / Cognito / 客户自有 IdP。  
- **换 IdP 改配置，不改 DataLuminary 业务代码。**  
- 企业 Connector（SAML、LDAP、飞书等）配置在 IdP 侧完成。

## 私有化检查清单

- [ ] Identity / 企业 IdP 可达，OIDC discovery 正常  
- [ ] DataView：`VITE_IDP_*` 或 `VITE_AUTH_GATEWAY_URL`；`VITE_ALLOW_LOCAL_LOGIN=false`  
- [ ] DataTalk：`IDP_ISSUER` / `IDP_AUDIENCE`；`AUTH_MODE=sso`  
- [ ] 回调 URI 与 IdP 应用登记一致（默认 `http(s)://<host>/auth/callback`）  
- [ ] 若需企业 SSO：在 IdP 配置 Connector，产品侧无需改代码  

## 与权限文档的关系

资源级授权、空间隔离、第三方角色映射见 [权限架构设计](../permission/architecture.md)；产品叙事见 [权限概念](../permission/index.md)。  
战略背景见 [战略白皮书 · §3](./whitepaper.md#3-统一账号与企业-sso战略必选项)。
