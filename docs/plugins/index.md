# 插件：核心概念

DataLuminary 采用 **微内核 + 插件** ：宿主提供编辑器壳、查询通道、权限与状态；场景差异由插件吸收。

当前前端（DataView）内置五类插件模式：

| Mode | 目录 | 职责 |
|------|------|------|
| **datasource** | `src/plugins/datasource/` | 数据源 **连接配置 UI**；调用 DataTalk `/api/connect/*`。**不**向图表直供数据 |
| **panel** | `src/plugins/panels/` | 图表 / Widget：渲染 + 配置；数据由宿主查询后以 props 注入 |
| **action** | `src/plugins/actions/` | 仪表盘交互控件：输入、单选、下拉、时间等 |
| **dashboard** | `src/plugins/dashboard/` | **整页几何**：`grid` / `position` / `list` |
| **layout** | `src/plugins/layout/` | **页内容器**：行分组、标签页、轮播 |

> 历史 bk-vision 文档中的 SystemJS、Vuex、图表直连 `datasource.query()`、`card-panel` / tmagic 等，**已废弃**。请以本文与 DataView `src/plugins/`、`spec/development/` 为准。

## 数据流（与 Grafana / 旧版的关键区别）

许多 BI 让图表直连数据源 QueryEditor。DataLuminary 强制：

```text
数据源插件（配连接）
  → 数据集（语义字段）
  → 图表 panel.dataset + panel.query
  → POST /query/panel（DataTalk QueryService）
  → Chart Panel 只渲染返回数据
```

```mermaid
flowchart LR
  DS[Datasource 插件] --> SET[数据集]
  SET --> Q[Panel.query]
  Q --> API[QueryService]
  API --> CH[Panel 渲染]
  CH --> DB[Dashboard / Layout 编排]
```

## 仪表盘 vs 布局

- **仪表盘插件**：整页怎么排（门户网格、大屏固定画布、移动列表）。  
- **布局插件**：页内如何分组嵌套（分组 / 标签 / 轮播）；槽位内仍是 **同家族** 画布。  
- 深入容器内部编辑使用 **Focus Mode**（保存合并、取消丢弃）。

产品说明：[仪表盘与布局插件](/product/dashboard-layout-plugins) · 本目录：[面板插件](./dashboard.md)

## 图表插件

- 契约：`definePanelPlugin` → `Panel` / `Config`（可选 AdvancePanel）。  
- 内置类型一览：[图表类型](./panelTypes.md)  
- 富文本等特殊 Widget：[富文本](./rich-text.md)  
- 开发说明：[图表插件](./panel.md)

## 数据源插件

- 只负责连接表单与测试；查询由数据集 + QueryService 完成。  
- 内置示例：MySQL、PostgreSQL、SQL Server、ClickHouse、Excel。  
- 详见：[数据源插件](./datasource.md)

## 交互（action）插件

筛选、时间范围等写入仪表盘状态；交互引擎按配置 **派生** 各图表附加条件（状态驱动，而非图表间事件互抛）。产品能力见 [完整产品能力 · 交互引擎](/product/features)；实现见 [交互引擎](/develop/dashboard-interact-engine)。

## 下一步

- [插件开发说明](./design.md) — 注册、目录、加载机制  
- [面板插件](./dashboard.md) · [图表插件](./panel.md) · [数据源插件](./datasource.md)
