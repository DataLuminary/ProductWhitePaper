# 仪表盘与布局插件：设计与实现

> **状态**：与当前实现同步（2026-07）  
> **受众**：前端、全栈、架构评审、AI Agent  
> **产品说明**：[产品能力 · 仪表盘与布局插件](../product/dashboard-layout-plugins.md)  
> **实现 spec（权威）**：[DataView/spec/development/dashboard-layout-plugins.md](https://github.com/DataLuminary/DataView/blob/main/spec/development/dashboard-layout-plugins.md)

## 1. 设计目标

同时满足：

1. **整页几何家族**可替换（grid / position / list）；  
2. **页内容器**可组合（row / tab / swiper），且嵌套画布与宿主 **同家族**；  
3. **深度编辑**隔离（Focus Mode）：本地草稿 + 显式合并，取消不脏根版本；  
4. **编辑器壳统一**：根侧栏与 Focus 侧栏共用折叠/tabs，插件只交 Config / AdvancePanel 内容。

## 2. 架构分层

```text
DashboardContent (FocusModeProvider)
  └─ dashboard.Panel          // 几何家族
       └─ layout.Panel        // 容器壳（可选）
            ├─ ReadonlyEmbeddedHost   // 查看 / 根上预览
            └─ Focus → EmbeddedDashboardHost + localVersionStore
```

| 层 | `mode` | 职责 | 不负责 |
|----|--------|------|--------|
| 仪表盘插件 | `dashboard` | 画布几何、Edit/View、画布 Config、可选图层 | 容器 tabs/slides 业务 |
| 布局插件 | `layout` | 容器 chrome、槽位、打开 Focus | 另一套几何引擎 |

契约：`Panel` + `Config` + 可选 `AdvancePanel`（见 DataView `src/types/plugins.ts`）。

## 3. 编辑 / 查看

- 各 dashboard `Panel.tsx`：`editable` → lazy `EditPanel`，否则同步 `ViewPanel`。  
- 画布内：`isEditor = editable && renderMode === "design"`。  
- 列表在 Focus 打开（根 `dndSuspended`）时 **仍走 EditPanel 壳**（仅禁用交互），避免设备预览列被 View 通栏撑开导致站位错位；嵌套 Focus 宿主 `hostMode="embedded-focus"` 宽度 **100%** 填满站位。

## 4. Focus Mode 要点

| 环节 | 行为 |
|------|------|
| 打开 | 量测容器 `hostEl` → 站位 `rect`；`ensureEmbeddedData(hostKind)`；建 `localVersionStore` |
| 编辑 | 只改 local；根 `dndSuspended` 冻结外层拖拽 |
| 切 tab/slide | 先 flush 当前槽，再切换；合并时保留已 flush 的嵌套体，防 Config 旧快照冲掉 |
| 保存 | merge 回根 `panels`（`setTabEmbedded` / `setSwiperSlideFromEmbedded` / `setRowEmbedded`） |
| 取消 | 丢弃 local |

侧栏 tabs：

- 根：**画布** + 可选 **图层**  
- Focus：**容器** + **画布** + 可选 **图层**

壳：`EditorSidebarShell`（`variant: root | focus`）。

## 5. 嵌套家族 SSOT

`nestedDashboardKind(host) === host`。新建槽、对齐、Focus 打开/合并均强制宿主家族，禁止陈旧 `dashboardKind` 把网格嵌进自由布局等。

## 6. 技术优势（摘要）

1. Kind 多态加载，宿主无几何 if/else 丛林。  
2. 布局 / 仪表盘职责分离，容器可演进、画布可替换。  
3. Focus 草稿隔离 + 显式 merge，协作与撤销语义清晰。  
4. 侧栏壳复用，根与 Focus UX 一致。  
5. 列表预览与 Focus 站位对齐，移动端编辑所见即所量。

完整路径表、非目标与实现细节以 DataView spec 为准。

## 7. 相关文档

| 文档 | 说明 |
|------|------|
| [产品能力说明](../product/dashboard-layout-plugins.md) | 选型、Focus 体验、交付价值 |
| [自由布局设计与实现](./dashboard-position-layout.md) | position 固定尺寸专题 |
| [交互引擎设计与实现](./dashboard-interact-engine.md) | 筛选 / 联动 / 下钻（正交能力） |
| MetaRepo 索引 | `spec/development/dashboard-layout-overview.md` |
| DataView 权威规格 | `DataView/spec/development/dashboard-layout-plugins.md` |
