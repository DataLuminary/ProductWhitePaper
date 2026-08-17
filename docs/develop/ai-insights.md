# AI 洞察：设计与实现

> **状态**：MVP 已落地（DL-M0～M5 主路径）  
> **受众**：后端、前端、全栈、架构评审、AI Agent  
> **产品说明**：[AI 洞察](../product/ai-insights.md)  
> **路线图**：[plan/ai-insights-roadmap.md](https://github.com/DataLuminary/DataLuminary/blob/main/plan/ai-insights-roadmap.md)  
> **契约**：[spec/contracts/ai-chat.md](https://github.com/DataLuminary/DataLuminary/blob/main/spec/contracts/ai-chat.md) 等  
> **生态网关**：[LuminaryWorks AI Platform](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/ai-platform.md)

## 1. 目标

在不改变 Free 传统 BI UX 的前提下，为 Pro 提供统一 DataInsight：

- 一个对话框（不是 Copilot 配置 + 洞察两套服务）
- 问数 / 洞察证据 / ChartIntent → 原生 Panel + Dashboard
- Logto → Entitlement `ai.analysis` → Casbin；AI **不**拥有 ACL

## 2. 架构

```text
DataView AiInsightHost（AuthenticatedShell）
  → POST /api/ai/chat
    → DataTalk AiModule / AiOrchestrator
      → Entitlement + Casbin（每次工具）
      → Semantic / AnalysisEngine / QueryService
      → ChartIntentAdapter → DashboardService / PanelService / VersionService
      → AiProviderAdapter（本地 BYOK 或 LUMINARY_AI_BASE_URL）
```

| 层 | 归属 |
|----|------|
| FloatButton / 对话面板 / 空间 AI 设置 | `DataView/src/features/ai-insight/`、`pages/space/settings/ai/` |
| 编排、Vault、Provider、工具、分析、制品 | `DataTalk/src/modules/ai/` |
| 跨仓 DTO | MetaRepo `spec/contracts/ai-*.md` |
| 模型网关 / 计量（后期中央服务） | LuminaryWorks `spec/ai-*.md` |

## 3. 后端要点（DataTalk）

| 路径 | 职责 |
|------|------|
| `modules/ai/AiModule.ts` | 模块装配 |
| `vault/AiVaultService` | AES-256-GCM；`AI_VAULT_MASTER_KEY` |
| `providers/AiProviderAdapter` | DeepSeek / 豆包方舟 / OpenAI 兼容 / Anthropic / Gemini；可选中央转发 |
| `settings/*` | 空间级 Provider 连接；密钥只写不读 |
| `orchestrator/AiOrchestrator` | 意图 → 权限 → 查询/分析/创建资产 |
| `analysis/AnalysisEngine` | 趋势 / 环比 / 同比 / TopN / 贡献 / z-score |
| `artifacts/ChartIntentAdapter` | ChartIntent → 内置插件 Panel + version layouts |
| `migrations/1730000000020-*` | `ai_provider_connection` 等表 |

### API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/ai/chat` | 同步对话；`@RequireEntitlement(ai.analysis)` |
| GET | `/api/ai/conversations` | 会话列表 |
| GET/PUT | `/api/ai/settings/:spaceUid` | 读公开配置 / 写 Provider |
| POST | `/api/ai/settings/:spaceUid/test` | 连通测试（可用 ephemeral secret） |

### 安全红线

- QueryService DataPolicy 必须传真实 `userId` / `orgUid`（见 `QueryActor`）。
- LLM 禁止原始 SQL、HTML、数据源密码、编造关键数字。
- 图表只走数据集 → QueryService builder 模式。
- 不自动删除资产；创建走既有 Dashboard/Panel 服务。

### 环境变量

```bash
AI_VAULT_MASTER_KEY=   # 32 字节：64 hex 或 base64；缺失则无法保存密钥
LUMINARY_AI_BASE_URL=  # 可选；设置后走中央 AI Platform
```

**不要**把用户 BYOK key 写进 `.env.example` 或提交到 Git。

## 4. 前端要点（DataView）

| 路径 | 职责 |
|------|------|
| `features/ai-insight/AiInsightHost.tsx` | FloatButton；无权益 → upsell |
| `features/ai-insight/AiChatPanel.tsx` | 固定对话面板（品牌蓝） |
| `features/ai-insight/executeActions.ts` | navigate / upgrade 等白名单动作 |
| `pages/space/settings/ai/` | Provider 表单 |
| `router/index.tsx` AuthenticatedShell | 挂载 Host；embed/share/render 不挂 |

i18n 键：`ai.*`、`space.settings.ai*`（`common.json`）。

## 5. ChartIntent → 插件

| ChartIntent.kind | 插件 kind |
|------------------|-----------|
| line / bar / pie / number-panel / table / scatter | 同名内置插件 |

查询一律 `mode: "builder"`。网格默认 `w=12, h=10`（24 列）。

## 6. 本地验证

```bash
# DataTalk
pnpm migration:run
# 配置 AI_VAULT_MASTER_KEY 后重启
pnpm exec rstest src/modules/ai

# DataView：登录空间 → 右下角 AI → 空间设置配置 DeepSeek / 智谱兼容接口
```

提供商连通可先用空间设置「测试连通」；未配模型时编排器仍可走启发式意图 + QueryService。

## 7. 相关文档

| 文档 | 说明 |
|------|------|
| MetaRepo `spec/development/ai-insights-overview.md` | 索引 |
| DataTalk `spec/development/ai-domain.md` | 后端规格 |
| DataView `spec/development/ai-workspace.md` | 前端规格 |
| LuminaryWorks `spec/ai-platform.md` | 六产品网关边界 |
