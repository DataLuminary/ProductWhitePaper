# DataLuminary 战略白皮书

> 面向产品、售前、合作伙伴与投资沟通的战略说明。工程实现见 MetaRepo `spec/` 与 [LuminaryWorks 统一登录文档](https://github.com/LuminaryWorks/docs/blob/main/docs/develop/unified-login.md)。

## 1. 定位

**DataLuminary（数据明鉴）** 是面向 AI 时代的开源 BI 与数据洞察平台：把数据源、数据集、指标治理、图表、仪表盘、权限协作与 AI 洞察串成一条可私有化交付的完整链路。

一句话：

**全链路 BI + AI 数据洞察 + 插件化生态 + 私有化交付。**

它既可独立商用，也是 [LuminaryWorks](https://luminaryworks.dev) 生态中的「看」——跨 IoT、视觉、教育、Agent 等产品线的统一可视化与决策层。

## 2. 市场判断

- 企业数据在增加，但「能看图」不等于「能决策」：缺治理、缺权限、缺可解释 AI。
- 下一代 BI 必须同时支持拖拽分析、AI 分步协作、自然语言生成，且三者共享同一套数据资产与权限体系。
- AI 时代**账号与身份**本身成为生态资产：统一账号降低 B2B 采购摩擦，支撑交叉销售与用户画像沉淀。

## 3. 统一账号与企业 SSO（战略必选项）

### 3.1 为什么默认统一账号

| 维度 | 说明 |
|------|------|
| **B2B / 私有化销售** | 企业采购最反感「又一套密码」。要求对接 AD、飞书、钉钉、企微、Azure AD 时，标准 OIDC/SAML 是竞标加分项乃至硬门槛。 |
| **研发效能** | 重置密码、验证码、社交登录、2FA、风控交给 IdP；DataLuminary 专注 BI 与洞察。 |
| **生态互通** | 用户在任意 LuminaryWorks 产品注册后，可免密进入 DataView；沉淀跨产品用户主体。 |

**默认交付心智**：SaaS / 标准部署使用 **LuminaryWorks 统一账号**；企业私有化采购使用 **企业账号登录（SSO）**。本地用户名密码仅开发/应急回退，不作为生产默认。

### 3.2 架构边界（身份 ≠ 权限 ≠ 权益）

```text
              Logto / 企业 IdP
                      |
             Luminary Auth Gateway
                      |
                 DataView SPA
                      |
                  DataTalk API
                      |
         +------------+------------+
         |                         |
   Casbin 资源 ACL            中央 Entitlement
   （空间/看板/数据集）        （Trial / 套餐 / License）
```

| 层级 | 谁负责 | DataLuminary 做什么 |
|------|--------|---------------------|
| **AuthN 身份** | LuminaryWorks Identity（Logto）+ Auth Gateway | OIDC 登录；`sub` → 本地 `user_id` |
| **Entitlement 商业权益** | 中央 Entitlement 服务 | 查询套餐/配额；**不写进 JWT** |
| **AuthZ 资源权限** | DataTalk Casbin / RBAC | 空间、仪表盘、数据集等细粒度 ACL |

产品**不直绑**某一家 IdP 厂商 SDK。经 Auth Gateway 暴露标准 OIDC；未来换 Auth0 / Keycloak / Cognito，或私有化接客户 IdP，**业务代码无需改动**。

### 3.3 企业私有化怎么接

| 客户现状 | 做法 |
|----------|------|
| 已有 Azure AD / Okta / 蓝鲸 / IDaaS（OIDC） | Gateway `UPSTREAM_ISSUER` 或产品 issuer 指向企业 IdP |
| 需要 SAML / LDAP / AD | 自托管 Logto + Connector；产品仍走 OIDC |
| 飞书 / 钉钉 / 企微 | IdP 侧 Connector；登录体验可按产品品牌定制 |

关闭本地账密：DataView `VITE_ALLOW_LOCAL_LOGIN=false`，DataTalk `AUTH_MODE=sso`。

### 3.4 业务剥离与数据主权

- 每个产品独立 Application / Audience；DataTalk 库保留 `user_id` 映射 Logto `sub`。
- **不把**核心 BI 业务表与全局用户表强耦合，便于按 `user_id` 集合导出、剥离或转售。
- 全局角色可放在 IdP；看板编辑权、数据范围等**必须**留在产品内，避免 IdP 僵化。

产品向说明另见：[统一身份与登录](./unified-identity.md)。开发者接入见 [LuminaryWorks · 统一登录](https://github.com/LuminaryWorks/docs/blob/main/docs/develop/unified-login.md) 与 [Auth Gateway](https://github.com/LuminaryWorks/docs/blob/main/docs/develop/auth-gateway.md)。

## 4. 产品能力主线

1. **数据接入** — 库表、文件、API、遥测与事件  
2. **数据集与指标治理** — 创建即自动发布语义层，默认托管分析存储  
3. **图表与仪表盘** — 拖拽 / AI 配图 / 布局与交互引擎  
4. **分享与协作** — 嵌入、订阅推送、审核与审计  
5. **权限与空间** — Casbin 资源 ACL + 组织协作  
6. **私有化交付** — 从试点到企业级数据规模  

完整能力矩阵见 [完整产品能力](./features.md)。

## 5. 生态协同

DataLuminary 可单独售卖，也可与 SyncroBrain、VistaCast、VistaRemote、BlockyEdu、DoerFlow 组合。协同靠 **统一身份 + HTTP/OIDC/数据源插件**，不做运行时强绑定。

详见 [LuminaryWorks AI 生态](./ecosystem.md)。

## 6. 开源与商业

核心采用 Polyform Noncommercial（以各仓 LICENSE 为准）：非商业学习与私有化评估友好；商业授权按产品独立洽谈。统一账号与企业 SSO 降低私有化交付与续费谈判成本，是商业化路径的基础设施，而非可选项。

## 7. 延伸阅读

| 文档 | 读者 |
|------|------|
| [统一身份与企业 SSO](./unified-identity.md) | 产品 / 售前 / 私有化交付 |
| [完整产品能力](./features.md) | 产品 / 售前 |
| [数据集与分析存储](./dataset-modeling.md) | 产品 / 售前 / 交付 |
| [数据集零配置供给](../develop/dataset-provisioning.md) | 研发 |
| [产品愿景](./vision.md) | 战略 / 投资 |
| [权限架构](../permission/architecture.md) | 架构 / 交付 |
| [LuminaryWorks 统一登录](https://github.com/LuminaryWorks/docs/blob/main/docs/develop/unified-login.md) | 研发 |
