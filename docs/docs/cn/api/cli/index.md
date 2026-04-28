---
title: "NocoBase CLI"
description: "NocoBase CLI（nb 命令）参考：初始化、环境管理、应用运行、源码、数据库、插件、API、CLI 自更新和 Skills 管理。"
keywords: "NocoBase CLI,nb,命令行,命令参考,环境管理,插件管理,API"
---

# NocoBase CLI

| 项目 | 内容 |
| --- | --- |
| 描述 | NocoBase CLI 的根命令，用于在本地工作区初始化、连接和管理 NocoBase 应用。 |
| 用法 | `nb [command]` |

## 描述

NocoBase CLI（`nb`）用于准备 coding agent 可直接使用的 NocoBase 环境，并提供日常管理命令，例如启动、停止、日志、升级、环境切换和 API 调用。

它支持两种常见初始化路径：

- 连接已有的 NocoBase 应用，并保存为 CLI env
- 通过 Docker、npm 或 Git 安装新的 NocoBase 应用，再保存为 CLI env

创建新的本地应用时，[`nb init`](./init.md) 也可以安装或更新 NocoBase AI coding skills。需要跳过这一步时，可以使用 `--skip-skills`。

## 显示帮助

查看根命令帮助：

```bash
nb --help
```

查看某个命令或命令组的帮助：

```bash
nb init --help
nb app --help
nb api resource --help
```

## 环境变量

下列环境变量会影响 CLI 的行为：

| 变量 | 说明 |
| --- | --- |
| `NB_CLI_ROOT` | CLI 保存 `.nocobase` 配置和本地应用文件的根目录。默认是当前用户主目录。 |
| `NB_LOCALE` | CLI 提示语言和本地初始化 UI 语言，支持 `en-US` 和 `zh-CN`。 |

示例：

```bash
export NB_CLI_ROOT=/your/workspace
export NB_LOCALE=zh-CN
```

## 配置文件

默认配置文件：

```text
~/.nocobase/config.json
```

设置 `NB_CLI_ROOT=/your/workspace` 后，配置文件路径会变为：

```text
/your/workspace/.nocobase/config.json
```

CLI 也兼容读取当前工作目录下的旧 project 配置。

运行时命令缓存保存在：

```text
.nocobase/versions/<hash>/commands.json
```

这个文件由 [`nb env update`](./env/update.md) 生成或刷新，用于缓存从目标应用同步出来的运行时命令。

## 核心概念

| 概念 | 说明 |
| --- | --- |
| CLI root | 保存 `.nocobase` 配置和本地应用文件的根目录，默认是当前用户主目录，可通过 `NB_CLI_ROOT` 覆盖。 |
| Env | CLI 保存的一个 NocoBase 连接配置；在 `nb init` 中，app name 也是 env name。 |
| Source | 本地应用来源，支持 `docker`、`npm` 和 `git`。 |
| Remote env | 只保存已有 NocoBase 应用 API 连接的 env。 |
| Runtime commands | 从目标应用同步生成的运行时命令元数据。 |

## 示例

交互式初始化：

```bash
nb init
```

使用浏览器表单初始化：

```bash
nb init --ui
```

非交互方式创建一个 Docker 应用：

```bash
nb init --env app1 --yes --source docker --version alpha
```

连接已有应用：

```bash
nb env add app1 --api-base-url http://localhost:13000/api
```

启动应用并刷新运行时命令：

```bash
nb app start -e app1
nb env update app1
```

调用 API：

```bash
nb api resource list --resource users -e app1
```

## 子命令

| 命令 | 说明 |
| --- | --- |
| [`nb init`](./init.md) | 初始化 NocoBase，并连接为 CLI env。 |
| [`nb app`](./app/) | 管理应用运行态：启动、停止、重启、日志、清理和升级。 |
| [`nb source`](./source/) | 管理本地源码工程：下载、开发、构建和测试。 |
| [`nb db`](./db/) | 查看或管理内置数据库运行状态。 |
| [`nb env`](./env/) | 管理已保存的 CLI env 连接。 |
| [`nb api`](./api/) | 通过 CLI 调用 NocoBase API。 |
| [`nb plugin`](./plugin/) | 管理选中 NocoBase env 的插件。 |
| [`nb scaffold`](./scaffold/) | 生成插件和迁移脚本脚手架。 |
| [`nb self`](./self/) | 检查或更新已安装的 NocoBase CLI。 |
| [`nb skills`](./skills/) | 检查、安装、更新或移除 NocoBase AI coding skills。 |

## 相关链接

- [快速开始](../../ai/quick-start.mdx)
- [安装、升级与迁移](../../ai/install-upgrade-migration.mdx)
- [全局环境变量](../app/env.md)
- [AI 搭建](../../ai-builder/index.md)
- [插件开发](../../plugin-development/index.md)
