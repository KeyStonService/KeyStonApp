# 🏛️ 治理框架 | Governance Framework

## 概述

MachineNativeOps 治理框架是一个**机器可读、自动化就绪**的组织级命名治理和生命周期管理系统。它提供标准化的策略、模板、工具和自动化接入点，支持 CI/CD、机器人和验证工具直接消费。

## 🎯 设计目标

治理框架不仅是文档或 PDF 报告，而是将整个治理架构**产品化为机器可读的结构**：

- ✅ **机器可读**: 所有策略和规范以 YAML/JSON schema 定义
- ✅ **自动化就绪**: CI/CD 可直接验证命名、变更和合规性
- ✅ **标准化**: 统一的资源命名、变更管理和例外处理流程
- ✅ **可观测**: Prometheus 规则、Grafana 仪表板和审计日志
- ✅ **可扩展**: 易于集成到现有工具链和工作流

## 📁 仓库结构

```bash
MachineNativeOps/
├── governance-manifest.yaml        # 治理总纲 (机器 + 人类入口)
├── schemas/                        # 机器可验证的 schema 定义
│   ├── naming-policy.schema.yaml
│   ├── resource-name.schema.yaml
│   ├── change-request.schema.yaml
│   ├── exception-request.schema.yaml
│   ├── metric-definition.schema.yaml
│   └── review-meeting.schema.yaml
├── policies/                       # 实际命名与治理规则
│   ├── naming/
│   │   ├── k8s-deployment-naming.yaml
│   │   ├── api-naming.yaml
│   │   └── pipeline-naming.yaml
│   ├── change-management/
│   │   └── change-policy.yaml
│   ├── exception/
│   │   └── exception-policy.yaml
│   └── security/
│       └── info-security-policy-reference.yaml
├── templates/                      # 样板（CI、表单等）
│   ├── forms/
│   │   ├── change-request.template.yaml
│   │   ├── exception-request.template.yaml
│   │   └── audit-report.template.yaml
│   ├── ci/
│   │   ├── github-actions-naming-check.yml
│   │   ├── gitlab-ci-naming-check.yml
│   │   └── jenkins-naming-check.groovy
│   └── k8s/
│       ├── deployment.template.yaml
│       └── prometheus-rule-naming-alert.template.yaml
├── tools/                          # 实作脚本、CLI
│   ├── bash/
│   │   └── generate_resource_name.sh
│   └── python/
│       └── validate_naming.py
├── examples/                       # 教学 & 情境案例
│   └── governance/
│       ├── naming/
│       ├── change-management/
│       └── exception/
├── docs/governance/                # 人类可读文档
│   ├── README.md
│   ├── 02-org-adoption-lifecycle.md
│   ├── 03-role-based-training.md
│   ├── 04-naming-standards.md
│   ├── 05-change-management.md
│   ├── 06-metrics-and-audit.md
│   ├── 07-exception-handling.md
│   ├── 08-observability-validation.md
│   ├── 09-security-compliance.md
│   └── 10-cross-team-governance.md
└── references/                     # 外部连结索引
    └── references.yaml
```

## 🚀 快速开始

### 1. 查看治理总纲

```bash
# 查看整体治理模块和自动化入口
cat governance-manifest.yaml
```

治理总纲定义了所有治理模块、它们的策略、schema、工具和模板的位置。

### 2. 生成标准化资源名称

```bash
# 使用命名生成工具
./tools/bash/generate_resource_name.sh \
  --environment prod \
  --app payment \
  --resource-type deploy \
  --version v1.0.0

# 输出: prod-payment-deploy-v1.0.0
```

### 3. 验证命名合规性

```python
# 使用 Python 验证器
python tools/python/validate_naming.py \
  --files deployment.yaml \
  --policies policies/naming/ \
  --schemas schemas/ \
  --format text
```

### 4. 集成到 CI/CD

#### GitHub Actions

```yaml
# .github/workflows/naming-check.yml
name: Naming Compliance

on:
  pull_request:
    branches: [main, develop]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Checkout Governance Framework
        uses: actions/checkout@v4
        with:
          repository: MachineNativeOps/MachineNativeOps
          path: governance-framework

      - name: Run Naming Validation
        run: |
          python governance-framework/tools/python/validate_naming.py \
            --changed-files-only \
            --policies governance-framework/policies/naming/ \
            --schemas governance-framework/schemas/
```

#### GitLab CI

```yaml
# .gitlab-ci.yml
include:
  - remote: 'https://raw.githubusercontent.com/MachineNativeOps/MachineNativeOps/main/templates/ci/gitlab-ci-naming-check.yml'
```

### 5. 提交变更请求

```bash
# 1. 复制模板
cp templates/forms/change-request.template.yaml CHG-2025-001.yaml

# 2. 填写变更详情
vim CHG-2025-001.yaml

# 3. 提交审批
git add CHG-2025-001.yaml
git commit -m "chore: add change request CHG-2025-001"
git push origin feature/change-request
```

## 📚 核心模块

### 1️⃣ 命名治理 (Naming Governance)

**目标**: 统一的资源命名规范，支持自动化验证

- **Kubernetes 资源**: `{env}-{app}-{type}-{version}`
  - 示例: `prod-payment-deploy-v1.0.0`
- **API 端点**: `/api/v{version}/{resource}`
  - 示例: `/api/v1/users`
- **Pipeline**: `{repo}-{action}-{target}`
  - 示例: `payment-service-deploy-prod`

**工具**:
- Schema: `schemas/resource-name.schema.yaml`
- 策略: `policies/naming/k8s-deployment-naming.yaml`
- 生成器: `tools/bash/generate_resource_name.sh`
- 验证器: `tools/python/validate_naming.py`

### 2️⃣ 变更管理 (Change Management)

**目标**: 标准化变更请求、审批、实施和回滚流程

**变更类型**:
- **标准变更**: 低风险、预先批准、可自动执行
- **常规变更**: 中等风险、需 CAB 审批
- **紧急变更**: 生产故障修复、简化审批

**流程**:
1. 填写变更请求 (模板: `templates/forms/change-request.template.yaml`)
2. 风险评估 (低/中/高)
3. 审批 (Auto/CAB/Manager)
4. 实施 (按计划步骤)
5. 验证和监控
6. 回滚 (如需要)

**KPI**:
- 变更成功率: > 95%
- 平均交付时间: < 3 天
- 紧急变更比例: < 5%

### 3️⃣ 例外处理 (Exception Handling)

**目标**: 合规例外的申请、审批和追踪流程

**例外类型**:
- 命名规范例外
- 安全策略例外
- 变更管理流程例外
- 文档要求例外

**审批层级** (根据风险):
- 低风险: Team Lead (2 工作日)
- 中风险: Manager + Governance Board (5 工作日)
- 高风险: VP + CISO + Governance Board (10 工作日)

**生命周期**:
```
Draft → Under Review → Approved → Active → (Remediated | Expired | Revoked)
```

### 4️⃣ 指标与审计 (Metrics & Audit)

**关键指标**:
- 命名合规率: > 95%
- 变更成功率: > 98%
- 例外数量: 最小化
- 治理健康分数: > 70

**可观测性**:
- Prometheus 告警规则
- Grafana 仪表板
- 审计日志和报告

### 5️⃣ 安全与合规 (Security & Compliance)

**集成点**:
- 数据分类标签
- 密钥命名规范
- 安全检查点
- 合规性映射 (SOC 2, ISO 27001, GDPR)

## 🛠️ 自动化工具

### 命名验证

```bash
# Bash 生成器
./tools/bash/generate_resource_name.sh --help

# Python 验证器
python tools/python/validate_naming.py --help
```

### CI/CD 模板

- **GitHub Actions**: `templates/ci/github-actions-naming-check.yml`
- **GitLab CI**: `templates/ci/gitlab-ci-naming-check.yml`
- **Jenkins**: `templates/ci/jenkins-naming-check.groovy`

### Kubernetes 集成

- **Deployment 模板**: `templates/k8s/deployment.template.yaml`
- **Prometheus 规则**: `templates/k8s/prometheus-rule-naming-alert.template.yaml`
- **OPA Gatekeeper**: 策略即代码

### 表单模板

- **变更请求**: `templates/forms/change-request.template.yaml`
- **例外申请**: `templates/forms/exception-request.template.yaml`
- **审计报告**: `templates/forms/audit-report.template.yaml`

## 📖 文档

### 人类可读文档

完整文档请查看: [docs/governance/](./docs/governance/)

- [组织采用生命周期](./docs/governance/02-org-adoption-lifecycle.md)
- [角色化培训](./docs/governance/03-role-based-training.md)
- [命名标准](./docs/governance/04-naming-standards.md)
- [变更管理](./docs/governance/05-change-management.md)
- [指标与审计](./docs/governance/06-metrics-and-audit.md)
- [例外处理](./docs/governance/07-exception-handling.md)
- [可观测性](./docs/governance/08-observability-validation.md)
- [安全合规](./docs/governance/09-security-compliance.md)
- [跨团队协作](./docs/governance/10-cross-team-governance.md)

### 机器可读 Schema

所有 schema 定义: [schemas/](./schemas/)

- `naming-policy.schema.yaml` - 命名策略结构
- `resource-name.schema.yaml` - 资源名称验证
- `change-request.schema.yaml` - 变更请求结构
- `exception-request.schema.yaml` - 例外申请结构
- `metric-definition.schema.yaml` - 指标定义
- `audit-report.schema.yaml` - 审计报告

## 🎓 示例

### 良好 vs 不良命名

查看对比示例: [examples/governance/naming/good-vs-bad-naming.yaml](./examples/governance/naming/good-vs-bad-naming.yaml)

✅ 好的示例:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prod-payment-deploy-v1.3.0
  labels:
    app: payment
    environment: prod
    data-classification: confidential
```

❌ 坏的示例:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: production_Payment_Service_1.3.0  # 错误!
```

### 变更请求示例

完整示例: [examples/governance/change-management/CHG-2025-001.yaml](./examples/governance/change-management/CHG-2025-001.yaml)

## 🔗 参考资料

完整参考资料索引: [references/references.yaml](./references/references.yaml)

关键参考:
- [Kubernetes 命名约定](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/)
- [语义化版本](https://semver.org/)
- [RESTful API 设计](https://restfulapi.net/)
- [ITIL 变更管理](https://www.axelos.com/certifications/itil-service-management)
- [Google SRE Book](https://sre.google/sre-book/)

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)

贡献类型:
- 文档改进
- 工具增强
- 新的策略模板
- 示例和最佳实践

## 📞 支持

- **文档**: https://machinenativeops.github.io/docs
- **Issues**: https://github.com/MachineNativeOps/MachineNativeOps/issues
- **Discussions**: https://github.com/MachineNativeOps/MachineNativeOps/discussions
- **Email**: governance@machinenativeops.io

## 📝 许可证

MIT License - 详见 [LICENSE](./LICENSE)

---

**开始您的治理之旅！** 🎯

_治理框架版本: 1.0.0 | 最后更新: 2025-12-17_
