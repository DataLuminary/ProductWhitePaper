# 图表插件

图表（panel）插件负责 **某一类可视化或 Widget** 的渲染与属性配置。数据由平台按数据集查询后注入，插件不连接数据库。

富文本（`rich-text`）为半依赖查询的文本 Widget：MDX + `<BIMetric />` 指标胶囊。见 [富文本图表](./rich-text.md)。

## 插件组成

| 部件 | 职责 |
|------|------|
| **Panel** | 根据 `data` + `config` 渲染视图 |
| **Config** | 右侧 / 抽屉配置表单（系列、轴、样式等） |
| **meta** | `kind`、名称、图标、是否依赖查询等 |

定义方式（示意）：

```typescript
import { definePanelPlugin } from "@/plugins/panels/shared";

export default definePanelPlugin({
  kind: "line",
  Panel: LineChartPanel,
  Config: LineChartConfig,
  // AdvancePanel?: 可选高级面板
});
```

## 目录示例

```text
DataView/src/plugins/panels/line/
  index.ts
  package.json
  components/Panel.tsx
  components/Config.tsx
  img/logo.svg
```

## 数据与配置

- **查询绑定**：`panel.dataset` + `panel.query`（由宿主查询控制器执行）。  
- **图表专属配置**：落在 `panel.config`（由 Config 表单维护）。  
- **画布级样式**（标题显隐、边框等）：由编辑器壳统一字段承载，插件不必重复发明。

```typescript
// 宿主传给 Panel 的核心输入（概念）
type PanelRenderProps = {
  config: Record<string, unknown>;
  data: { columns: Column[]; rows: Row[] } | null;
  loading: boolean;
  error?: string;
};
```

建议将「查询结果 → 具体图表库 option」封装为 hooks，便于同一 kind 切换 G2 / ECharts 等实现。

## 内置类型

见 [图表类型一览](./panelTypes.md)。

## 开发注意

1. **只渲染、不取数**：禁止在 Panel 内直接打外部 JDBC/HTTP 绕过 QueryService（除明确的纯前端 Widget，如 `image` / `video`）。  
2. **插件间不互调**：联动与筛选由仪表盘交互引擎根据状态派生。  
3. **仪表盘上的可视块都应是 panel / action / layout**：保持资源模型一致，便于权限与分享。  
4. 返回字段约定见 [API · Panel](/api/Charts)。
