# Busybox CLI 参考

本文档描述 Busybox 各 CLI 命令的子命令、参数与典型使用场景。源码入口见 `src/*/command.ts` 与 `src/1-command/`。

---

## 命令总览

| 命令 | 分组 | 说明 |
|------|------|------|
| `assets` | 静态资源 | 元数据管理、diff、同步、远程 push/pull |
| `pm` | 进程运维 | 子进程启停、监控、日志 |
| `build-install` | 构建发布 | 编译 TS、链接全局 bin、打包 dist |
| `tcp-gateway` | 网络服务 | TCP 协议探测与多协议分发 |
| `http-server` | 网络服务 | Koa HTTP 静态服务 |
| `subrepo` | 研发辅助 | 嵌套 Git 仓库（subrepo 清单）同步 |
| `ag` | 研发辅助 | Git 工作流辅助 |
| `db` | 研发辅助 | 数据库表结构查看 |
| `runNodeExport` / `runNodeScript` | 研发辅助 | 导出/运行 Node 脚本（VSCode 调试） |
| `login-to-server` | 运维 | 服务器登录辅助 |
| `io-transparent` | 运维 | IO 透传 |
| `build-sqlite3` | 构建 | 编译 sqlite3 原生模块 |
| `ap` / `nb` | 工具 | Prettier / Notebook 辅助 |

---

## assets — 静态资源元数据

全局选项：`-d, --dir <dir>` — 资源根目录；省略时从当前目录向上查找含 `.meta/` 的目录。

| 子命令 | 语法 | 说明 |
|--------|------|------|
| `init` | `assets init [--force]` | 从磁盘扫描生成 `.meta/local_primary.ts`（含 SHA1 路径树） |
| `diff` | `assets diff [--meta <key>]` | 对比持久化元数据与磁盘文件，输出 added / moved / modified / deleted |
| `add` | `assets add [source] [target] [-y]` | 添加文件到资源目录，或省略 source 时对齐元数据与磁盘 |
| `copy` | `assets copy <source> <target> [-y]` | 在资源目录内复制（更新元数据） |
| `move` | `assets move <source> <target> [-y]` | 在资源目录内移动（更新元数据） |
| `push` | `assets push <target> [-y]` | 先对齐本地元数据，再推送到本地目录或远程 `host[:port]` |
| `pull` | `assets pull <target> [-y]` | 从本地目录或远程 `host[:port]` 拉取资源 |
| `meta-list` | `assets meta-list` | 列出 `.meta/` 下已注册的元数据源（local / sqlite / mysql） |
| `meta-align` | `assets meta-align [-y]` | 在两个元数据源之间同步元数据（需配置多个 source） |

**典型场景**

```bash
# 初始化个人站点的静态资源元数据
assets -d ./site-assets init

# 查看元数据与磁盘差异
assets diff

# 推送到备份服务器
assets push backup.example.com:9090 -y
```

**元数据源**：`.meta/{local|sqlite|mysql}_{description}.{js|ts}`，通过 `priority` 字段选择主数据源。详见 [`src/assets-management/README.md`](../src/assets-management/README.md)。

---

## pm — 进程管理

基于 `process-manager` 库：状态持久化到 `~/.process-management/{id}/`，**无需常驻 daemon**。

| 子命令 | 语法 | 说明 |
|--------|------|------|
| `list` | `pm list [-f all\|running\|dead]` | 列出已注册进程及运行状态 |
| `info` | `pm info [id]` | 查看进程关键信息（getProcKeyInfo） |
| `detail` | `pm detail [id]` | 读取完整持久化信息（readProcInfo） |
| `start` | `pm start [id] [-m detached\|monitored]` | 从 `src/2-cp-script` 配置启动子进程；monitored 模式支持异常自动重启 |
| `stop` | `pm stop [id] [-c]` | 停止进程；`-c` 停止后清理持久化目录 |
| `restart` | `pm restart [id] [-c]` | 先 stop 再 start |
| `clean` | `pm clean [id]` | 停止进程并删除 info / log 文件 |
| `log` | `pm log [id]` | tail -f 跟踪进程 stdout 日志 |

**典型场景**

```bash
pm list
pm start my-http-server -m monitored
pm log my-http-server
pm stop my-http-server
```

详见 [`modules/lib/node/lib/process-manager/README.md`](../modules/lib/node/lib/process-manager/README.md)。

---

## build-install — 编译与全局安装

| 子命令 | 语法 | 说明 |
|--------|------|------|
| `build` | `build-install build` | 编译整个项目及子模块为 `dist/` |
| `link` | `build-install link [linkDir]` | 将 `bin/` 链接到全局 PATH（默认 `~/code/bin`） |
| `all` | `build-install all [linkDir]` | build + link 一步完成 |
| `gz` | `build-install gz` | 打包 `dist/` 为 tar.gz，便于部署到 CentOS 等平台 |

解决 ts-node 每次冷启动编译慢的问题：生产环境使用编译后的 `.js` bin。

---

## tcp-gateway — TCP 协议网关

```bash
tcp-gateway [staticDir] [-e local|elif] [-p <port>] [-u <uploadDir>]
```

在单个 TCP 端口上探测连接协议（HTTP、SOCKS 等），分发到对应处理逻辑。`NODE_ENV` / `-e` 影响配置加载。

---

## http-server — HTTP 静态服务

```bash
http-server [staticDir] [-e local|elif] [-p <port>] [-u <uploadDir>]
```

基于 Koa 启动 HTTP 服务，支持静态目录与上传目录配置。生产环境可配合 `forever` 或 `pm` 使用。

---

## subrepo — 嵌套 Git 仓库

| 子命令 | 语法 | 说明 |
|--------|------|------|
| `pull` | `subrepo pull [repoName]` | 按 manifest 克隆/拉取子仓库；可指定单个 repo |
| `config` | `subrepo config` | 打印 manifest 路径及子仓库列表 |

相比 git submodule：更易增删、可按目录隔离网络、支持每目录不同版本策略。

---

## ag — Git 辅助

| 子命令 | 语法 | 说明 |
|--------|------|------|
| `amend` | `ag amend -d <duration> [--from <rev> --to <rev>]` | 修改 commit 作者/提交者时间：无范围时 amend HEAD；有 `--from/--to` 时批量偏移范围内各 commit 的时间 |

---

## db — 数据库

| 子命令 | 语法 | 说明 |
|--------|------|------|
| `list-tables` | `db list-tables <dbKey>` | 列出数据库中所有表 |
| `desc-tables` | `db desc-tables [dbKey] [tables...]` | 输出表的 CREATE 语句；省略表名时交互选择 |

`dbKey` 由项目数据库配置 shortcuts 解析（Sequelize）。

---

## 其它命令（简要）

| 命令 | 说明 |
|------|------|
| `runNodeExport` | 导出可在 VSCode `launch.json` 中使用的 node 启动命令；支持 `-d` 仅打印、`--swc` 加速 |
| `runNodeScript` | 包装执行 Node/TS 脚本 |
| `login-to-server` | SSH 登录服务器辅助 |
| `io-transparent` | 双向 IO 透传 |
| `build-sqlite3` | 为当前平台编译 sqlite3 原生绑定 |
| `ap` | Prettier 格式化辅助 |
| `nb` | Notebook 相关工具 |

---

## 核心库（无独立 CLI）

以下模块在 `modules/lib/node/lib/` 实现，由上述命令或 Koa 中间件调用：

| 模块 | 能力 |
|------|------|
| `socks` | SOCKS5（RFC 1928）及 VC1 变体，客户端/服务端 |
| `http-proxy` | HTTP / WebSocket 反向代理 |
| `memcached` | Memcached 协议客户端与服务端 |
| `http-body-parser` | multipart、urlencoded 等请求体解析 |
| `http-record` | HTTP 请求/响应录制与回放 |

架构说明见 [`modules/lib/node/README.md`](../modules/lib/node/README.md)。
