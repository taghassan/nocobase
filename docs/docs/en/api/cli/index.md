---
title: "NocoBase CLI"
description: "NocoBase CLI (nb command) reference: initialization, environment management, app runtime, source, database, plugins, API, CLI self updates, and Skills management."
keywords: "NocoBase CLI,nb,command line,command reference,environment management,plugin management,API"
---

# NocoBase CLI

| Item | Content |
| --- | --- |
| Description | The root command of the NocoBase CLI for initializing, connecting to, and managing NocoBase apps in a local workspace. |
| Usage | `nb [command]` |

## Description

NocoBase CLI (`nb`) prepares NocoBase environments that coding agents can use directly, and provides day-to-day commands for start, stop, logs, upgrades, env switching, and API calls.

It supports two common setup paths:

- Connect an existing NocoBase app and save it as a CLI env
- Install a new NocoBase app from Docker, npm, or Git, then save it as a CLI env

When creating a new local app, [`nb init`](./init.md) can also install or update NocoBase AI coding skills. Use `--skip-skills` when you want to skip that step.

## Display help text

Show help for the root command:

```bash
nb --help
```

Show help for a command or command group:

```bash
nb init --help
nb app --help
nb api resource --help
```

## Environment variables

The following environment variables affect CLI behavior:

| Variable | Description |
| --- | --- |
| `NB_CLI_ROOT` | Root directory where the CLI stores `.nocobase` config and local app files. Defaults to the current user's home directory. |
| `NB_LOCALE` | Language for CLI prompts and the local setup UI. Supported values are `en-US` and `zh-CN`. |

Example:

```bash
export NB_CLI_ROOT=/your/workspace
export NB_LOCALE=en-US
```

## Configuration files

Default config file:

```text
~/.nocobase/config.json
```

After setting `NB_CLI_ROOT=/your/workspace`, the config file path becomes:

```text
/your/workspace/.nocobase/config.json
```

The CLI also keeps compatibility with legacy project config under the current working directory.

Runtime command cache is stored in:

```text
.nocobase/versions/<hash>/commands.json
```

This file is generated or refreshed by [`nb env update`](./env/update.md) and caches runtime commands synchronized from the target app.

## Core concepts

| Concept | Description |
| --- | --- |
| CLI root | Root directory for `.nocobase` config and local app files. Defaults to the current user's home directory and can be overridden with `NB_CLI_ROOT`. |
| Env | A named NocoBase connection saved by the CLI. In `nb init`, the app name is also the env name. |
| Source | How the local app is obtained: `docker`, `npm`, or `git`. |
| Remote env | An env that only stores an API connection to an existing NocoBase app. |
| Runtime commands | Runtime command metadata synchronized from the target app. |

## Examples

Interactive setup:

```bash
nb init
```

Browser-based setup:

```bash
nb init --ui
```

Create a Docker-based app non-interactively:

```bash
nb init --env app1 --yes --source docker --version alpha
```

Connect an existing app:

```bash
nb env add app1 --api-base-url http://localhost:13000/api
```

Start the app and refresh runtime commands:

```bash
nb app start -e app1
nb env update app1
```

Call an API:

```bash
nb api resource list --resource users -e app1
```

## Subcommands

| Command | Description |
| --- | --- |
| [`nb init`](./init.md) | Set up NocoBase and connect it as a CLI env. |
| [`nb app`](./app/) | Manage app runtimes: start, stop, restart, logs, cleanup, and upgrades. |
| [`nb source`](./source/) | Manage the local source project: download, develop, build, and test. |
| [`nb db`](./db/) | Inspect or manage built-in database runtime status. |
| [`nb env`](./env/) | Manage saved CLI env connections. |
| [`nb api`](./api/) | Call NocoBase APIs from the CLI. |
| [`nb plugin`](./plugin/) | Manage plugins for the selected NocoBase env. |
| [`nb scaffold`](./scaffold/) | Generate plugin and migration scaffolds. |
| [`nb self`](./self/) | Check or update the installed NocoBase CLI. |
| [`nb skills`](./skills/) | Check, install, update, or remove NocoBase AI coding skills. |

## Related links

- [Quick Start](../../ai/quick-start.mdx)
- [Install, Upgrade, and Migration](../../ai/install-upgrade-migration.mdx)
- [Environment Variables](../app/env.md)
- [AI Builder](../../ai-builder/index.md)
- [Plugin Development](../../plugin-development/index.md)
