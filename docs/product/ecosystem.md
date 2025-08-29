# DataLuminary 与 LuminaryWorks AI 生态

> 用户向说明。工程规格见 MetaRepo [`spec/ecosystem.md`](https://github.com/dataluminary/platform/blob/main/spec/ecosystem.md)。

## 本产品是什么

**DataLuminary（数据明鉴）** 是 [LuminaryWorks（启明工坊）](https://luminaryworks.dev) 生态中的 AI 数据洞察中枢。它可单独采购、部署和商业化，也可以与兄弟产品组合，为 IoT、远程运维、教育、Agent 等场景提供统一的 BI 看板、数据分析和洞察报告能力。

```text
业务数据 / 设备遥测 / 摄像头事件 / 运维录制 / 教学行为 / Agent 日志
        -> DataLuminary 数据源插件
        -> 数据集与指标治理
        -> 图表、仪表盘与 AI 洞察
        -> 业务决策与生态协同
```

## 在 LuminaryWorks 六产品中的位置

| 产品 | 角色 | 官网 | 与 DataLuminary 的关系 |
|------|------|------|------------------------|
| [LuminaryWorks](https://luminaryworks.dev) | 启明工坊 | [luminaryworks.dev](https://luminaryworks.dev) | 生态编排、统一身份与共享库 |
| **DataLuminary（本产品）** | 看见 | [dataluminary.dev](https://dataluminary.dev) | 把跨系统数据变成可决策的图表、看板和洞察 |
| [BlockyEdu](https://blockyedu.com) | 学 | [blockyedu.com](https://blockyedu.com) | 教学、实验、学习行为与课程运营数据 |
| [SyncroBrain](https://syncrobrain.com) | 连 | [syncrobrain.com](https://syncrobrain.com) | 设备、遥测、告警和工况数据 |
| [VistaCast](https://vistacast.dev) | 视 | [vistacast.dev](https://vistacast.dev) | 摄像头 AI 告警与客流分析 |
| [VistaRemote](https://remote.vistacast.dev) | 控 | [remote.vistacast.dev](https://remote.vistacast.dev) | 远程运维、录制、审计和效率数据 |
| [DoerFlow](https://doerflow.dev) | 赚 | [doerflow.dev](https://doerflow.dev) | Agent 运行、技能、交易和调用数据 |

## 协同原则

- **独立商业化**：每个产品都能单独部署、单独交付、单独服务客户。
- **松耦合集成**：跨产品协同通过 HTTP、OIDC、SDK 与数据源插件完成，不做运行时强绑定。
- **统一身份可选**：接入 LuminaryWorks 共享登录后，同一账号可跨产品访问；未接入时仍可使用 DataLuminary 本地账号体系。
- **社区共同成长**：不同社区围绕各自行业能力贡献数据源、模板、插件和场景方案。

## 常见组合场景

| 场景 | 组合 | 价值 |
|------|------|------|
| 制造企业 | SyncroBrain + DataLuminary | 设备状态、告警、产线效率与能耗进入统一监控大屏 |
| 连锁零售 | VistaCast + DataLuminary | 摄像头客流与告警事件汇入经营分析大屏 |
| 运维团队 | VistaRemote + DataLuminary | 远程协助、录制审计、响应效率形成可追踪报表 |
| 教育场景 | BlockyEdu + DataLuminary | 学习行为、实验数据、课程运营形成教学质量分析 |
| Agent 平台 | DoerFlow + DataLuminary | Agent 调用、交易、技能热度与收益形成生态看板 |
| 纯 BI 客户 | 仅 DataLuminary | 独立部署，服务经营分析、业务报表与管理驾驶舱 |

## 延伸阅读

- [DataLuminary 战略白皮书](./whitepaper.md)
- [LuminaryWorks 宣传站](https://luminaryworks.dev)
- [LuminaryWorks 域名与品牌](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/domain-and-branding.md)
