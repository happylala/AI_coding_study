# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Bash命令

- npm run build: 构建项目
- npm run typecheck: 运行类型检查

# 代码风格
- 使用ES模块(import/export)语法，而不是CommonJS(require)
- 尽可能使用解构导入(例如 import { foo } from 'bar')
- 代码加上中文注释

# 工作流程
- 在完成一系列代码更改后务必进行类型检查
- 为了性能考虑，优先运行单个测试，而不是整个测试套件
