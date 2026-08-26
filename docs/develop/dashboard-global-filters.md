# 仪表盘全局过滤：设计与实现

> **状态**：v1 已实现（2026-07）  
> **受众**：产品、前端、全栈、AI Agent  
> **产品说明**：[完整产品能力 · 仪表盘全局过滤](../product/features.md)  
> **实现权威**：  
> - 契约：[dashboard-global-filters](https://github.com/DataLuminary/DataLuminary-Platform/blob/main/spec/contracts/dashboard-global-filters.md)  
> - 后端：[DataTalk spec](https://github.com/DataLuminary/DataTalk/blob/main/spec/development/dashboard-global-filters.md)  
> - 前端：[DataView spec](https://github.com/DataLuminary/DataView/blob/main/spec/development/dashboard-global-filters.md)

## 1. 设计目标

为仪表盘提供**编辑态配置、运行时自动生效**的数据集级过滤规则：

- 不改图表查询定义（图表走已发布语义模型，无 SQL 模式）；
- 不把数据约束逻辑下沉到每个图表；
- 由查询引擎按语义维度 ID 统一注入，便于后续对接租户 / 行级权限。

## 2. 与「交互筛选」的区别

| | 全局过滤（本能力） | 交互引擎（Action / 联动 / 下钻） |
|--|-------------------|----------------------------------|
| 谁配置 | 仪表盘编辑者 | 编辑者配置 + 查看者操作 |
| 何时生效 | 打开仪表盘即生效 | 用户交互后生效 |
| 执行位置 | **服务端** QueryService | 客户端 FilterEngine 再请求 |
| 典型用途 | 租户、业务线、固定范围约束 | 临时探索、联动分析 |

二者可同时存在：服务端先应用全局规则，客户端再叠加交互条件。

## 3. v1 行为摘要

1. 编辑页 Header「过滤」打开管理 Drawer。
2. 规则按「数据集 + 语义维度 + 运算符 + 常量值」保存到平台库。
3. 可视化查询图表自动带上规则；媒体面板不查询、不注入。
4. 复制仪表盘时一并复制规则。

## 4. 文档索引

| 文档 | 说明 |
|------|------|
| [产品能力](../product/features.md) | 用户可见能力描述 |
| [交互引擎](./dashboard-interact-engine.md) | 查看态筛选 / 联动 / 下钻 |
| MetaRepo 总览 | `spec/development/dashboard-global-filters-overview.md` |
