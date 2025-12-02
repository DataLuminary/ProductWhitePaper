# 权限与商业能力：产品叙事

> 面向产品、售前与投资者。工程细节见 [架构设计](./architecture.md)；开发者对接见 [Develop · 权限对接](../develop/iam-private-deploy.md)。

DataLuminary 把「谁能登录」「买了什么能力」「能操作哪张看板」拆成三层，避免把企业身份、订阅套餐和 BI 资源 ACL 揉进同一套 JWT。

架构总图、核心概念展开、数据模型 ER 与授权决策管线（RBAC → Feature → Quota）见 **[架构设计](./architecture.md)**。

## 为什么是三层

| 层 | 回答的问题 | 谁负责 |
|----|------------|--------|
| **Organization（组织）** | 租户是谁、谁在计费、成员属于哪个公司/团队 | 组织与会员关系 |
| **Space（空间）** | 同一组织内如何协作隔离（项目 / 业务线） | 空间成员与空间角色 |
| **Resource（资源）** | 某张仪表盘、数据集能否查看 / 编辑 / 分享 | Casbin ACL + 可选直授 |

身份认证（AuthN）落在 **LuminaryWorks Identity（Logto / 企业 IdP）**：只证明「你是谁」。  
资源授权（AuthZ）落在 **DataTalk Casbin**：证明「你能碰哪张看板」。  
商业能力落在 **Subscription / Entitlement / License**：证明「组织买到了哪些功能与配额」。

三者正交：换 IdP 不改看板 ACL；升套餐不改角色矩阵；改成员角色不改计费主体。

## Organization → Space → Resource

```text
Organization（租户 / 计费）
  └─ Space（协作 / ACL 边界）
       └─ Dashboard / Dataset / Datasource / Share …
```

- **Organization**：1:1 对应 Logto Organization（或私有化下的 License 绑定主体）。成员关系是 `user × organization`。
- **Space**：业务协作单元，必须属于某个组织。没有空间访问权时，其下仪表盘、图表、数据集一律不可见。
- **Resource**：看板等对象上的动作（`view` / `edit` / `delete` / `share` …）。可被角色继承，也可对用户做资源级直授。

Tenant **不是**独立实体：Tenant ≡ Organization。

## 内置角色（摘要）

权限码格式为 `resource:action`（如 `dashboard:edit`）。内置角色按作用域分层：

| 作用域 | 角色码 | 产品语义 |
|--------|--------|----------|
| platform | `platform_admin` · `it_support` | 平台运维：组织开通、用户治理 |
| org | `org_owner` · `org_admin` · `org_billing` · `org_member` · `org_guest` | 组织所有者 / 管理员 / 计费 / 普通成员 / 访客 |
| space | `space_owner` · `space_admin` · `space_editor` · `space_viewer` | 空间内从「全权」到「只读」 |

组织可创建自定义角色并配置权限矩阵；内置角色只读，保证基线语义稳定。

社交登录或统一账号首次进入产品时，用户会自动加入**默认组织**，呈现为 `org_member`（详见 [FAQ](./faq.md)）。企业租户由平台管理员开通并指定 `org_owner`。

**如何申请加入别人的空间、管理员在哪里审批**：见操作指南 **[申请与审批](./usage.md)**（含「空间设置 → 访问申请」逐步路径）。

## Subscription · Entitlement · License 如何协同

用产品语言理解三者：

| 概念 | 一句话 | 典型场景 |
|------|--------|----------|
| **Subscription（订阅）** | 组织与套餐的商业关系（Trial / 正式版 / 席位） | SaaS 购买、续费、席位变更 |
| **Entitlement（权益）** | 组织「此刻」可用的 Feature 开关与 Quota 用量 | 能否 AI 分析、能否导出、看板数量上限 |
| **License（许可）** | 私有化离线/气隙环境的签名权益包（JWS） | 客户机房部署、中台不可达时的商业能力注入 |

协作方式：

1. **SaaS / 中台模式**：订阅变更 → 中央 Entitlement 下发 Feature / Quota 快照 → DataTalk 按组织解析。
2. **私有化**：交付方签发 License JWS → 组织管理员上传 → 本地 License 解析器注入同等 Feature / Quota；**不**绕过 Casbin ACL。
3. **决策顺序始终是**：先有资源权限（RBAC），再看是否购买了功能（Feature），再看是否超过配额（Quota）。不会在「没权限」时先提示「请升级」。

前端用 `PermissionGate` / `FeatureGate` / `QuotaGate` / `AccessGate` 把拒绝原因呈现为「无权限」或「需升级」，避免用户误解。

## 分享可见范围（产品收敛）

新建分享时可选三种可见范围：

| 模式 | 含义 |
|------|------|
| **邀请码** | 持码者可打开公开查看页 |
| **第三方嵌入** | 经登记的外部应用 + Embed Token 嵌入 |
| **完全公开** | 审核通过并发布后，匿名可直接打开（无需邀请码） |

详见 [FAQ · 分享可见范围](./faq.md#分享三种可见范围)。

## 延伸阅读

- [申请与审批（操作指南）](./usage.md)
- [架构设计（11 节）](./architecture.md)
- [常见问题](./faq.md)
- [统一身份与企业 SSO](../product/unified-identity.md)
- 开发者：[私有化对接](../develop/iam-private-deploy.md) · [企业 SSO](../develop/iam-enterprise-sso.md) · [嵌入对接](../develop/embed-integration.md)
