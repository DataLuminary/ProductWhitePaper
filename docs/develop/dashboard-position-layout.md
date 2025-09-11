# 自由布局大屏：设计与实现

> **状态**：已决议（2026-07）  
> **受众**：前端、全栈、架构评审、AI Agent  
> **产品说明**：[产品决议 · 固定逻辑尺寸](../product/position-layout-fixed-canvas.md)  
> **实现 spec（权威）**：[DataView/spec/development/position-layout-fixed-canvas.md](https://github.com/DataLuminary/DataView/blob/main/spec/development/position-layout-fixed-canvas.md)

## 1. 设计目标

自由布局（`dashboardKind: position`）服务 **指挥大屏、展厅、拼接屏**：

- 设计态与运行态共用 **固定逻辑画布**（宽 × 高，单位 px）；
- 图表以 **绝对定位**（`x/y/w/h/z`）落在画布上；
- 视口通过 **`zoom: fit` 等等比缩放** 映射到物理屏幕；
- **不** 以「内容撑高画布逻辑高度」作为运行时语义。

## 2. 架构模式对比

历史上讨论过三类思路，当前产品只保留前两列中的各一种实现路径：

| 模式 | 画布逻辑尺寸 | 组件定位 | 高度行为 | 典型场景 | DataLuminary |
|------|----------------|----------|----------|----------|----------------|
| **全局等比模式** | 固定宽 × 固定高 | 绝对定位 | 逻辑高度不变，整体 scale | 拼接屏、展厅、指挥大厅 | **`position` 自由布局** |
| **流式内容驱动模式** | 宽随容器，高随内容 | 栅格 / 文档流 | 可纵向滚动、分页增长 | 门户报表、经营看板、分析页 | **`grid` 网格布局** |
| ~~宽固定 + 高自由~~（已否决） | 宽固定，高意图 auto | 绝对定位 | 父级无法被撑开，易错位 | — | **不实现** |

说明：

- 讨论中的「全局模式」指 **整画布统一缩放**，不是逐组件各自响应视口。
- 「内容驱动 / 流式」指文档流或栅格 **把页面撑高**；在绝对定位画布上无法可靠实现，故 **不得** 挂在 `position` 插件上。
- 若 PRD 写成「时间轴叙事大屏」，仍应在 **固定逻辑画布** 内编排组件与动效，而不是扩大逻辑高度或引入整页纵向滚动。

```text
全局等比（position）          流式内容（grid）
┌─────────────────┐          ┌─────────────────┐
│ 固定 1920×1080   │ scale    │ 宽 ≈ 容器       │
│ 组件 (x,y,w,h)   │ ──────►  │ 行高随内容 ↓    │
│ 无纵向滚动       │  物理屏   │ 可纵向滚动      │
└─────────────────┘          └─────────────────┘
```

## 3. 实现要点

### 3.1 代码归属（DataView）

| 路径 | 职责 |
|------|------|
| `src/plugins/dashboard/position/` | 画布、绝对定位、设计器 |
| `src/plugins/dashboard/shared/screenPresets.ts` | 1080p / 2K / 4K 等预设 |
| `src/plugins/dashboard/shared/types.ts` | `PositionPanelLayout`、`DashboardLayoutStyle` |
| `src/pages/dashboard/components/category/ScreenSizeSelector.tsx` | 尺寸选择 UI |

### 3.2 尺寸预设

内置 PC 大屏（16:9）示例：

| 档位 | 逻辑尺寸 |
|------|----------|
| 1080p | 1920 × 1080 |
| 2K | 2560 × 1440 |
| 4K | 3840 × 2160 |

新增分辨率：扩展 `POSITION_WIDTH_PRESETS` / `POSITION_HEIGHT_PRESETS` 与 i18n，**不要** 为 position 主推 `height: "auto"`。

### 3.3 类型与遗留分支

`LayoutDimension = number | "auto"` 及 `viewportHeight` 等主要为 **列表布局** 或历史探索保留；**position 的产品语义仍是固定数值宽高**。重构时勿扩大 `auto` 在 position 下的行为。

## 4. 开发 / AI 禁止项

- 禁止将「position + 高度随内容」作为默认 feature 实现。
- 禁止为拼接屏场景设计自由布局整页纵向滚动。
- 禁止在 issue / 聊天中绕过 spec 直接实现「固定宽 + 自由高」原型。

## 5. 测试与验收建议

- 创建自由布局仪表盘，切换 1080p / 2K / 4K，确认画布逻辑像素与缩放一致。
- 运行态在超宽、超高物理屏上 **无纵向滚动条**，整画布可见。
- 流式滚动场景改用 **网格布局** 验收，不混用 position 语义。

## 6. 相关文档

| 文档 | 位置 |
|------|------|
| 产品决议 | [product/position-layout-fixed-canvas.md](../product/position-layout-fixed-canvas.md) |
| 前端 spec | `DataView/spec/development/position-layout-fixed-canvas.md` |
| MetaRepo 索引 | `spec/development/dashboard-layout-overview.md` |
