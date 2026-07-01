# DataLuminary 与 LuminaryWorks AI 生态

> 用户向说明。工程规格见 MetaRepo [`spec/ecosystem.md`](https://github.com/DataLuminary/DataLuminary-Platform/blob/main/spec/ecosystem.md)。

## 本产品是什么

**DataLuminary** 是 LuminaryWorks 生态中的 AI 数据洞察中枢。它可单独采购、部署和商业化，也可以与兄弟产品组合，为 IoT、远程运维、教育、Agent 等场景提供统一的 BI 看板、数据分析和洞察报告能力。

```text
业务数据 / 设备遥测 / 运维录制 / 教学行为 / Agent 日志
        -> DataLuminary 数据源插件
        -> 数据集与指标治理
        -> 图表、仪表盘与 AI 洞察
        -> 业务决策与生态协同
```

## 在 LuminaryWorks 五项目中的位置

LuminaryWorks 是五个可独立成长、又可组合交付的开源 AI 产品社区：

| 产品 | 角色 | 与 DataLuminary 的关系 |
|------|------|------------------------|
| **DataLuminary（本产品）** | 看见 | 把跨系统数据变成可决策的图表、看板和洞察 |
| VibeEdu / BlockyEdu | 学 | 教学、实验、学习行为与课程运营数据可进入 DataLuminary |
| LuminaryIoTChain | 连 | 设备、遥测、告警和工况数据可形成 IoT 监控大屏 |
| VistaRemote | 控 | 远程运维、录制、审计和效率数据可形成运营报表 |
| AgentSkillMesh / VibeAgent | 赚 | Agent 运行、技能、交易和调用数据可形成 Agent 经济分析 |

## 协同原则

- **独立商业化**：每个产品都能单独部署、单独交付、单独服务客户。
- **松耦合集成**：跨产品协同通过 HTTP、OIDC、SDK 与数据源插件完成，不做运行时强绑定。
- **统一身份可选**：接入 LuminaryWorks 共享登录后，同一账号可跨产品访问；未接入时仍可使用 DataLuminary 本地账号体系。
- **社区共同成长**：不同社区围绕各自行业能力贡献数据源、模板、插件和场景方案。

## 常见组合场景

| 场景 | 组合 | 价值 |
|------|------|------|
| 制造企业 | LuminaryIoTChain + DataLuminary | 设备状态、告警、产线效率与能耗进入统一监控大屏 |
| 运维团队 | VistaRemote + DataLuminary | 远程协助、录制审计、响应效率形成可追踪报表 |
| 教育场景 | VibeEdu + DataLuminary | 学习行为、实验数据、课程运营形成教学质量分析 |
| Agent 平台 | VibeAgent + DataLuminary | Agent 调用、交易、技能热度与收益形成生态看板 |
| 纯 BI 客户 | 仅 DataLuminary | 独立部署，服务经营分析、业务报表与管理驾驶舱 |

## 对用户、开发者和投资者的意义

- 对用户：生态数据可以汇入同一套 BI 工作流，减少系统割裂。
- 对开发者：插件、SDK、身份和契约让跨产品扩展更容易复用。
- 对投资者：多个社区独立增长，同时通过 DataLuminary 汇聚为数据洞察网络，形成复合生态价值。

## 延伸阅读

- [DataLuminary 战略白皮书](./whitepaper.md)
- [LuminaryWorks 生态叙事](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/docs/ecosystem-narrative.md)
- [五项目总体架构](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/docs/architecture-overview.md)
