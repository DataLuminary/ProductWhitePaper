# 插件开发说明

## 三类（五模式）插件

| 文档 | Mode | 说明 |
|------|------|------|
| [数据源](./datasource.md) | `datasource` | 连接配置 |
| [图表](./panel.md) | `panel` | 可视化 / Widget |
| [面板](./dashboard.md) | `dashboard` + `layout` | 整页几何 + 页内容器 |
| （代码）`src/plugins/actions/` | `action` | 交互控件 |

## 生态分工

```text
数据源插件 ──配置──► DataTalk Connect
                         │
数据集 / QueryService ◄──┘
                         │
图表 panel ◄──查询结果───┘
                         │
仪表盘 / 布局插件 ──编排整页──► 分享 / 嵌入 / 订阅
```

- **图表插件**：`Panel` 渲染 + `Config` 配置 + `package.json` / meta。  
- **数据源插件**：`Config` / 表单组件；**无**图表侧 `query()` 实例调用。  
- **仪表盘插件**：`grid` | `position` | `list`。  
- **布局插件**：`row` | `tab` | `swiper`。

## 目录结构（DataView）

内置插件静态打包进 DataView，大致如下：

```text
DataView/src/plugins/
  datasource/{mysql,postgresql,sql-server,excel,click-house}/
  panels/{line,bar,pie,...,rich-text,image,video}/
  actions/{inputer,radio,selector,time-picker,time-ranger}/
  dashboard/{grid,position,list,shared}/
  layout/{row,tab,swiper,placeholder,shared}/

DataView/src/store/plugins.tsx     # Zustand 注册表
DataView/src/hooks/useGetPlugins.tsx
DataView/src/types/plugins.ts
```

每个插件目录通常包含：入口模块、`package.json`（kind / mode / 名称）、UI 组件、可选 logo。

元数据示例：

```json
{
  "name": "MySQL",
  "kind": "mysql",
  "mode": "datasource",
  "build_in": true
}
```

## 加载机制（当前）

**不是** SystemJS / Vuex。

1. 各类 `index.ts` **静态 import** 内置插件，写入 `*BuildIn` 映射。  
2. `usePluginsStore.getPlugin(kind, category)` 优先返回内置，否则查缓存 Map。  
3. 非内置可走远程拉取接口（规划 / 按需）；日常内置插件不依赖远程加载。  
4. 状态在 **Zustand**，与编辑器、交互状态同一套 React 栈。

```typescript
import { usePluginsStore } from "@/store/plugins";

const plugin = usePluginsStore.getState().getPlugin("line", "panel");
// → { Panel, Config, meta, ... }
```

图表侧使用示例（示意）：

```typescript
const { Panel, Config } = await resolvePanelPlugin("line");
// 宿主负责 query；Panel 只接收 data / config props
```

## 图表数据约定

- `PanelModel` 持有 `dataset` / `datasetUid` 与 `query`，**不**持有可执行 datasource 实例。  
- 宿主 `usePanelQueryController` → `POST /query/panel`。  
- 插件内建议把「查询结果 → 图表库 options」收进 hooks，便于替换 G2 / ECharts 等实现。

返回结构与接口说明见 [API · Panel](/api/Charts)、[API · Query](/api/Query)。

## 相关规格（工程）

| 主题 | 位置 |
|------|------|
| 仪表盘 / 布局插件 | DataView `spec/development/dashboard-layout-plugins.md` |
| 数据源插件 | DataView `spec/development/datasource-plugins.md` |
| 混合查询 | DataView `spec/development/hybrid-query-architecture.md` |
| 富文本 | DataView `spec/development/rich-text-panel.md` |
