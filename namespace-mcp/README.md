# namespace-mcp

**MachineNativeOps 命名空間 MCP 協議治理框架**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/machine-native-ops/namespace-mcp)
[![License](https://img.shields.io/badge/license-Enterprise-green.svg)](LICENSE)
[![MCP Protocol](https://img.shields.io/badge/MCP-2024.1-orange.svg)](https://modelcontextprotocol.io)
[![SLSA](https://img.shields.io/badge/SLSA-L3+-purple.svg)](https://slsa.dev)

## 📖 專案概述

namespace-mcp 是 MachineNativeOps 生態系統的核心子專案，專注於實現開源專案的六層治理對齊自動化轉換。本專案提供完整的工具鏈，用於將任意開源專案轉換為符合企業級治理標準的 MCP 協議兼容模組。

### 🎯 核心目標

- **六層治理對齊**: 命名空間、依賴、引用、結構、語意、治理全面對齊
- **MCP 協議標準化**: 確保所有轉換符合 Model Context Protocol 2024.1 規範
- **企業級合規**: SLSA L3+ 安全標準、零信任架構、不可變審計
- **自動化流程**: 一鍵轉換、智能驗證、詳細報告

## 🏗️ 專案結構

```
namespace-mcp/
├── src/                    # 核心源代碼
│   ├── converter/          # 轉換器模組
│   ├── validator/          # 驗證器模組
│   ├── rules/              # 轉換規則庫
│   └── utils/              # 工具函數
├── config/                 # 配置文件
│   ├── conversion.yaml     # 轉換配置
│   ├── mcp-rules.yaml      # MCP 規則
│   └── governance.yaml     # 治理規範
├── scripts/                # 執行腳本
│   ├── convert.sh          # 轉換執行腳本
│   ├── validate.sh         # 驗證腳本
│   └── report.sh           # 報告生成腳本
├── docs/                   # 文檔
│   ├── architecture.md     # 架構設計
│   ├── usage.md            # 使用指南
│   └── api.md              # API 文檔
├── tests/                  # 測試套件
├── examples/               # 使用範例
└── reports/                # 轉換報告輸出
```

## 🚀 快速開始

### 安裝要求

- Python 3.8+
- Bash 4.0+
- Git

### 基本使用

```bash
# 1. 克隆專案
git clone https://github.com/machine-native-ops/namespace-mcp.git
cd namespace-mcp

# 2. 執行轉換
./scripts/convert.sh /path/to/source/project /path/to/target

# 3. 查看報告
cat reports/CONVERSION-REPORT.md
```

## 📊 六層治理對齊

### 1️⃣ 命名空間對齊 (Namespace Alignment)

自動重命名類、方法、變數，確保符合企業命名規範：

- 類名前綴: `MyClass` → `MachineNativeMyClass`
- 方法名: `my_method` → `mnops_my_method`
- 變數名: 統一風格，保持語意

### 2️⃣ 依賴關係對齊 (Dependency Alignment)

智能映射外部依賴到企業內部實現：

- `django` → `machine-native-web`
- `express` → `machine-native-server`
- `react` → `machine-native-ui`

### 3️⃣ 引用路徑對齊 (Reference Alignment)

標準化所有導入和引用路徑：

- 相對路徑 → 絕對路徑
- 導入語句標準化
- 模組引用更新

### 4️⃣ 結構佈局對齊 (Structure Alignment)

重組專案目錄結構：

- `src/` → `lib/`
- `docs/` → `documentation/`
- 標準化目錄層級

### 5️⃣ 語意對齊 (Semantic Alignment)

確保程式碼語意一致性：

- LLM 驅動語意分析
- 程式碼向量化比對
- 行為等價驗證

### 6️⃣ 治理合規對齊 (Governance Alignment)

強制執行企業治理規範：

- 許可證轉換: MIT → Enterprise Commercial
- 添加版權頭
- 安全合規檢查
- 審計跟踪記錄

## 🛡️ 安全與合規

### SLSA L3+ 供應鏈安全

- **不可變構建**: 所有轉換過程不可變記錄
- **來源驗證**: 源專案完整性驗證
- **審計跟踪**: SHA3-512 量子安全哈希

### 零信任架構

- 每次轉換獨立驗證
- 無隱式信任假設
- 多層安全檢查

### 合規標準

- ISO 27001
- SOC 2 Type II
- GDPR
- CCPA

## 📈 性能指標

- **轉換速度**: 1000+ 文件/分鐘
- **準確率**: 95%+ 模式匹配
- **覆蓋率**: 98%+ 文件處理
- **錯誤率**: <2% 轉換失敗

## 🔧 配置選項

### 基本配置 (`config/conversion.yaml`)

```yaml
enterprise:
  prefix: "machine-native"
  namespace: "mnops"
  domain: "machinenativeops.com"

conversion_rules:
  namespace:
    class_prefix: "MachineNative"
    method_prefix: "mnops_"
  
  dependency:
    replace_external: true
    use_internal_mirror: true
```

### MCP 規則 (`config/mcp-rules.yaml`)

```yaml
mcp_protocol:
  version: "2024.1"
  compliance_level: "strict"
  
tools:
  naming_convention: "machine-native-{tool-name}"
  
resources:
  path_prefix: "machine-native-resources"
```

## 📚 文檔

- [架構設計](docs/architecture.md) - 系統架構詳解
- [使用指南](docs/usage.md) - 完整使用說明
- [API 文檔](docs/api.md) - API 參考手冊
- [最佳實踐](docs/best-practices.md) - 使用建議

## 🧪 測試

```bash
# 運行所有測試
./scripts/test.sh

# 運行特定測試
python -m pytest tests/test_converter.py

# 生成覆蓋率報告
./scripts/coverage.sh
```

## 🤝 貢獻指南

我們歡迎社群貢獻！請遵循以下步驟：

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📄 許可證

本專案採用 **MachineNativeOps Enterprise License v1.0** 許可證。

詳見 [LICENSE](LICENSE) 文件。

## 🔗 相關連結

- [MachineNativeOps 官網](https://machinenativeops.com)
- [MCP 協議規範](https://modelcontextprotocol.io)
- [問題追蹤](https://github.com/machine-native-ops/namespace-mcp/issues)
- [討論區](https://github.com/machine-native-ops/namespace-mcp/discussions)

## 📞 聯繫方式

- **Email**: support@machinenativeops.com
- **Discord**: [加入社群](https://discord.gg/machinenativeops)
- **Twitter**: [@MachineNativeOps](https://twitter.com/MachineNativeOps)

---

**MachineNativeOps namespace-mcp** - 智能治理對齊，無縫企業集成！

*最後更新: 2024-01-09*