# 仪表盘交互引擎：设计与实现

> **状态**：已实现（2026-07）  
> **受众**：前端、全栈、架构评审、AI Agent  
> **产品说明**：[完整产品能力 · 状态驱动交互引擎](../product/features.md)  
> **实现 spec（权威）**：[DataView/spec/development/dashboard-interact-engine.md](https://github.com/DataLuminary/DataView/blob/main/spec/development/dashboard-interact-engine.md)

## 1. 设计目标

仪表盘交互需要同时支持：

- **交互组件（Action）**：下拉、输入、时间等控件筛选多张图表；
- **图表联动（Linkage）**：点击主图，从图表按维度过滤；
- **图表下钻（Drill-down）**：单图层级探索，可回退。

设计目标是：**高性能、单向数据流、可测试、可 URL 恢复**，避免事件网失控。

## 2. 架构模式对比

历史上常见三类做法，DataLuminary 只采用第三列：

| 模式 | 核心思路 | 优点 | 缺点 | DataLuminary |
|------|----------|------|------|--------------|
| **全局共享模式** | 所有图表读同一个大 `filters` 对象 | 实现简单 | 任一条件变化易触发全盘重算/重渲染 | **不采用** |
| **事件驱动模式** | `emit` / `on` 图表互抛事件 | 局部改动快 | 流向隐式、难调试、难做 URL 状态恢复，易成“意大利面条” | **不采用** |
| **状态驱动 + 派生订阅** | 最小运行时状态 + 纯函数引擎按图派生条件 | 单向流、细粒度订阅、可测、可序列化 | 需维护 FilterEngine 规则 | **采用** |

```text
全局共享模式                 事件驱动模式                 状态驱动 + 派生订阅
┌──────────────┐           A ──emit──► B              Action/Click
│ filters 大对象 │           │           │                   │
│ 全图订阅广播  │           └──emit──► C              Runtime Store
└──────────────┘           （隐式网状）                     │
                                                     FilterEngine（纯函数）
                                                            │
                                                     仅受影响图表刷新
```

说明：

- 「全局模式」指 **共享可变过滤大对象**，不是“全局配置文件”。
- 「事件驱动」指图表之间 **直接 pub/sub**，状态靠事件累积，不利于分享链接还原。
- 「状态驱动」把交互写成 **可序列化状态**，由引擎 **声明式** 算出每张图的附加条件。

## 3. 实现要点

### 3.1 代码归属（DataView）

| 路径 | 职责 |
|------|------|
| `src/types/interact.ts` | Action Scope、Linkage 配置类型 |
| `src/store/dashboardRuntime.ts` | `actionValues` / `linkValues` / `drillStates` |
| `src/utils/filterEngine.ts` | `computeForPanel` 纯函数派生 |
| `src/components/wrapper/panel-wrapper/` | 订阅派生条件、点击上抛、下钻面包屑 |
| `src/plugins/actions/selector/` | 下拉选择器 |
| `src/plugins/actions/shared/ActionChooseRange.tsx` | 作用域配置 |
| `src/pages/dashboard/editor/.../LinkageEditor.tsx` | 联动配置侧栏 |

### 3.2 数据流

1. 用户操作写入 `DashboardRuntimeStore`（不直接改其他图表）。
2. 各图表通过 Zustand selector 调用 `FilterEngine.computeForPanel`。
3. 仅当本图 `extraWheres` / `sqlVariables` 实质变化时，`useGetData` 重新请求。
4. UI 模式合并 `where`；SQL 模式传递 `sqlVariables`（`{{flag}}`）。

### 3.3 配置面

- **Action**：画布拖入交互组件 → 右侧配置 Flag、选项、作用域（数据集 + 字段 + 图表范围）。
- **Linkage**：编辑器「交互配置」侧栏 → 主图、触发维度、从图表与过滤字段。
- **Drill-down**：图表查询配置 `isDrilled` / `drillDown`；标题区面包屑回退。

### 3.4 图表点击与 URL

- G2 图表在 `useRenderG2Chart` 统一绑定 `element:click`，经 `onPlotClick` 写入 Runtime Store。
- 运行态查询参数 `av`（JSON）同步 `actionValues`，支持筛选状态分享；离开页面重置运行时状态。

## 4. 开发 / AI 禁止项

- 禁止在图表插件内直接监听其他图表事件做联动。
- 禁止用全局大 `filters` 对象让全部图表无差别订阅。
- 新增交互能力时扩展 Runtime Store + FilterEngine，保持纯函数边界。

## 5. 相关文档

| 文档 | 位置 |
|------|------|
| 产品优势 | [product/features.md](../product/features.md) |
| 前端实现 spec | `DataView/spec/development/dashboard-interact-engine.md` |
| MetaRepo 索引 | `spec/development/dashboard-interact-overview.md` |
