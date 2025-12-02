# 权限架构说明（归档）

> **本文已归档。** 请阅读：
>
> - 产品叙事：[概念](./index.md)
> - 权威架构（11 节）：[架构设计](./architecture.md)
> - 用户 FAQ：[常见问题](./faq.md)
> - 身份产品说明：[统一身份与企业 SSO](../product/unified-identity.md)

以下仅保留早期「是否拆独立权限服务 / 是否接第三方」的选型结论，避免与 IAM v2 文档重复。

## 归档结论（仍有效）

| 问题 | 建议 |
|------|------|
| 权限管理是否单独做一个项目？ | **当前不必**。AuthZ 继续内置于 DataTalk（`iam/*` 模块）；身份由生态 Identity 承担。 |
| 是否接入第三方权限中台做业务 ACL？ | **不默认接入**。第三方只做 **AuthN**（OIDC）；BI 资源 ACL 仍由 DataTalk Casbin 管理。 |
| 企业 SSO / 社交登录？ | Connector 配在 IdP（Logto）侧；产品主路径为统一登录。见 [FAQ](./faq.md)。 |

实现与契约以 MetaRepo `spec/contracts/iam-v2.md` 与 DataTalk `spec/development/iam-v2.md` 为准。
