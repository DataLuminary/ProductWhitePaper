## 面板（仪表盘）插件

不同用户、场景需要的 **整页排布** 不同：门户网格、指挥大屏、移动列表等。因此用 **仪表盘插件（`mode: dashboard`）** 表达整页几何家族。

内置三种：

| Kind | 名称 | 典型场景 |
|------|------|----------|
| `grid` | 网格布局 | PC 门户、可滚动报表 |
| `position` | 自由布局 | 大屏、展厅、拼接屏（固定逻辑尺寸 + 等比缩放） |
| `list` | 列表布局 | 移动端单列；编辑态可开手机宽度预览 |

页内再通过 **布局插件（`mode: layout`）** 做分组 / 标签页 / 轮播；槽位内嵌套的仍是 **同家族** 仪表盘画布。深度进入容器内部编辑使用 **Focus Mode**（保存合并、取消丢弃）。

> 概念与产品选型：[仪表盘与布局插件 · 产品说明](/product/dashboard-layout-plugins)  
> 架构与实现：[设计与实现](/develop/dashboard-layout-plugins) · [DataView 规格](https://github.com/DataLuminary/DataView/blob/main/spec/development/dashboard-layout-plugins.md)  
> 自由布局固定尺寸：[产品决议](/product/position-layout-fixed-canvas)

历史文档中的「card-panel / tmagic」等表述已收敛为上表三种 `dashboardKind`；请以当前实现与上述规格为准。
