# 数据集零配置供给：设计与实现

> **状态**：原始 / 联表 / AI 创建路径已接入统一编排；活动查询在首次 FULL 成功前保持 Direct  
> **受众**：后端、前端、全栈、架构评审、AI Agent  
> **产品说明**：[数据集、语义模型与分析存储](../product/dataset-modeling.md)  
> **路线图**：[plan/dataset-query-roadmap.md](https://github.com/DataLuminary/DataLuminary-Platform/blob/main/plan/dataset-query-roadmap.md)  
> **Feature**：[spec/features/analytical-engine-semantic-layer.md](https://github.com/DataLuminary/DataLuminary-Platform/blob/main/spec/features/analytical-engine-semantic-layer.md)

## 1. 目标

把「建数据集 → 才能配图」收成一次创建：

- 所有创建入口（原始批量 `POST /dataset`、联表 `POST /dataset/linked`、AI `create_dataset_from_draft`）走同一个 `DatasetProvisioningService`
- 默认 `semantic=auto_publish` + `storageTarget=direct` + `syncMode=full`
- 仅当本部署 `MANAGED_DORIS_ENABLED=true`（本地 `pnpm bootstrap`）时，默认才改为 `managed_analytical`
- 事务内落库数据集与语义模型 v1；Doris / 同步是可重试的外部副作用
- 活动路由保持 Direct，直到首次 FULL **真正完成** 后原子切换 Analytical
- 托管凭据只存在服务端环境变量，不进入普通数据集 UI

**已废止**：创建向导不出现存储/语义选择；默认 Direct 且创建后不自动发布语义模型；把 ClickHouse 当作默认加速底座；把托管 Doris 当作 SaaS 默认供给。

## 2. 架构

```text
DataView 创建向导 / AI 工具
  → POST /api/dataset  或  POST /api/dataset/linked
    → DatasetProvisioningService
      事务：dataset（storageMode=direct）+ SemanticLayer.ensureGeneratedAndPublished
      异步：ensureManagedDorisForSpace → EngineBinding → SyncPipeline FULL
        → 成功：storageMode=analytical + analyticalReady=true
        → 失败：数据集仍可用，provisioningStatus=failed，可 retry
QueryService / Semantic Query
  → Direct：ConnectService（linked 用 compileFromClause）
  → Analytical：仅当 analyticalReady 且 freshness 未过期
```

| 层 | 归属 |
|----|------|
| 创建向导「数据能力」、完成态、详情 tabs | `DataView/src/pages/data-manage/dataset/` |
| 编排 | `DataTalk/src/modules/dataset-provisioning/` |
| 托管 Doris / binding | `DataTalk/src/modules/analytical-engine/` |
| 语义建议与发布 | `DataTalk/src/modules/semantic-layer/` |
| FULL / INCREMENTAL / CDC | `DataTalk/src/modules/sync-pipeline/` |
| 跨仓 DTO | MetaRepo `spec/contracts/{semantic-model,analytical-engine,sync-pipeline}.md` |

## 3. 创建契约

请求可带（均可省略，走默认）：

| 字段 | 默认 | 取值 |
|------|------|------|
| `semantic` | `auto_publish` | `auto_publish` \| `none` |
| `storageTarget` | `direct`（仅 `MANAGED_DORIS_ENABLED=true` 时为 `managed_analytical`） | `managed_analytical` \| `direct` \| `external_analytical` |
| `syncMode` | `full` | `full` \| `incremental` \| `cdc`（linked 非 Direct 时强制 `full`） |

响应每条数据集带 `provisioningStatus`、`provisioningTaskUid`、`provisioningErrorCode`。

持久化（迁移 `1730000000025-DatasetProvisioning`）：`target_storage_mode`、`provisioning_status`、`provisioning_error_code`、`provisioning_task_uid`。初始 `storage_mode=direct`、`analytical_ready=false`。

状态查询 / 重试：

| 方法 | 路径 | 权限 |
|------|------|------|
| GET | `/dataset/:uid/provisioning` | `dataset:view` |
| POST | `/dataset/:uid/provisioning/retry` | `dataset:edit` |

重试不得复用已失败的 idempotency key。

## 4. 语义模型

`suggest-document`：字段分类 → 维度 / 指标；日期维度带 day/week/month/quarter/year；数值默认 SUM；无指标时稳定 `row_count` COUNT。semantic id 稳定且唯一。

`SemanticLayerService.ensureGeneratedAndPublished` 幂等：创建 model、发布 v1、写 `dataset.semanticModelUid`；重复调用不产生无意义版本。

图表只持久化 `SemanticQueryRef`（measure / dimension **id**），跟随最新已发布版本。缺失 id → `SEMANTIC_BINDING_INVALID`；未发布 → `SEMANTIC_MODEL_NOT_PUBLISHED`。无 rawName fallback，无图表 SQL 模式。

## 5. 托管 Doris

`AnalyticalEngineService.ensureManagedDorisForSpace` 读取：

- `MANAGED_DORIS_ENABLED`
- `MANAGED_DORIS_FE_HOST` / `MANAGED_DORIS_QUERY_PORT` / `MANAGED_DORIS_HTTP_PORT`
- `MANAGED_DORIS_USERNAME` / `MANAGED_DORIS_PASSWORD`
- `MANAGED_DORIS_DATABASE_PREFIX`

每个 space 一个隐藏 `provision=managed` 逻辑实例（唯一索引）。namespace / 表名由 space、dataset uid 派生（`dl_s_{space}` / `ds_{dataset}`），禁止用用户输入拼 SQL。

`DatasetStorageService` 在 managed 路径自动完成 binding / database / table / unique key，不要求前端传 `engineInstanceUid + database + tableName`。

公开引擎 API 不得 mint managed 实例；`toPublic` 对普通数据集界面省略 host 与 credential fingerprint。外部引擎路径保留。

本地验证栈：`DataTalk/docker/docker-compose.analytical.yml`（Doris FE/BE）。`pnpm bootstrap` 测完整分析路径；私有化 `pnpm bootstrap -- --skip-analytical`。集成测试：`ANALYTICAL_IT=1`（可选 `ANALYTICAL_IT_SOURCE_MARK`）。

DataLuminary 自营 SaaS 保持 `MANAGED_DORIS_ENABLED=false`：用户自备分析库 + 平台同步；前端托管选项 Tooltip「请联系管理员开通」。

## 6. 同步与激活

- 原始：默认 FULL；能力探测后才允许 incremental / CDC。
- 联表：`JdbcBatchAdapter` 用 `LinkedDatasetService.compileFromClause` 生成受控 JOIN，`SELECT` 投影后 FULL 写入 Doris；禁止浏览器 raw SQL。
- SeaTunnel：提交后轮询到 FULL/INCREMENTAL `FINISHED`（CDC 目前以 `RUNNING` 为可查询，无法等待 snapshot-complete）才 `markReady`。禁止「提交成功即 analyticalReady」。
- 激活后 freshness **fail-closed**（`ANALYTICAL_STALE`），无故障静默回退 Direct。
- 删除数据集：清理/归档 binding、pipeline、semantic model、托管表。切回 Direct：暂停 pipeline，保留可恢复绑定。

## 7. 权益

顺序：**Casbin / RBAC → Entitlement**。

- 能力码 `analytical.storage`（`FEATURE.ANALYTICAL_STORAGE`）
- 用量继续 `storage.bytes`
- `ENTITLEMENT_MODE=off` 时本地放行
- 套餐拒绝或 `MANAGED_DORIS_ENABLED=false`：创建仍成功，语义 v1 已发布，查询 Direct；托管选项禁用并提示联系管理员；用户可改连自备分析库

## 8. 前端要点

- 原始向导：字段步骤与完成步骤之间为 `DatasetCapabilitiesStep`。默认 Direct；托管未开通时 Radio 禁用 + Tooltip「请联系管理员开通」。
- 联表向导：同样默认；同步只暴露 FULL。
- 完成页：语义就绪 / 供给中 / 已切换 / 失败可重试；「立即配图」写入 session 预选刚创建的数据集。
- `AnalyticalStorageTab`：托管未开通时禁用并 Tooltip；外部引擎才收集凭据；同步走 DataLuminary FULL/INCREMENTAL/CDC。
- `SemanticModelTab`：结构化维度/指标编辑，保留多指标与高级公式，不再用冒号分隔 TextArea。
- locale：`public/locales/{en,zh}/dataset.json`，禁止 `t()` 的 `defaultValue`。

## 9. 文档索引

| 文档 | 说明 |
|------|------|
| [产品说明](../product/dataset-modeling.md) | 用户可见行为 |
| [analytical-engine 契约](https://github.com/DataLuminary/DataLuminary-Platform/blob/main/spec/contracts/analytical-engine.md) | 引擎 / 存储 / provisioning API |
| [semantic-model 契约](https://github.com/DataLuminary/DataLuminary-Platform/blob/main/spec/contracts/semantic-model.md) | 文档模型与 auto_publish |
| [sync-pipeline 契约](https://github.com/DataLuminary/DataLuminary-Platform/blob/main/spec/contracts/sync-pipeline.md) | FULL/INCREMENTAL/CDC、linked FULL |
| [DataTalk 实现](https://github.com/DataLuminary/DataTalk/blob/main/spec/development/analytical-engine.md) | 模块、flags、迁移、IT |
| [DataView UI](https://github.com/DataLuminary/DataView/blob/main/spec/development/analytical-storage-ui.md) | 向导与详情 |
| [hybrid-query 总览](https://github.com/DataLuminary/DataLuminary-Platform/blob/main/spec/development/hybrid-query-overview.md) | Direct / Analytical 路由原则 |
