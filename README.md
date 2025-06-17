# 蓝桥杯新闻速递

本项目是一个 Node.js TypeScript 应用，用于定时从蓝桥杯官网拉取最新的新闻资讯，并通过 Bark 推送给用户。

## 功能

- 每分钟轮询一次蓝桥杯官网的新闻接口。
- 检查是否有新的新闻发布（根据 `nnid` > 1800 且大于上次已处理的 `nnid`）。
- 如果发现新新闻，通过 Bark 发送通知。

## 技术栈

- Node.js
- TypeScript
- Axios (用于 HTTP 请求)
- Yarn (包管理器)

## 环境要求

- Node.js >= 18.0.0
- Yarn

## 安装

1. 克隆仓库 (如果适用) 或下载代码。
2. 进入项目目录：
   ```bash
   cd fetch-lanqiao-news
   ```
3. 安装依赖：
   ```bash
   yarn install
   ```

## 配置

Bark 推送地址通过环境变量 `BARK_URL` 进行配置。你也可以直接修改 `src/index.ts` 文件中的 `BARK_URL` 常量作为备选方案。

**推荐方式：使用环境变量**

在运行应用前设置 `BARK_URL` 环境变量：
```bash
export BARK_URL="https://api.day.app/YOUR_BARK_KEY_HERE"
```
或者，你可以将此行添加到你的 shell 配置文件中（例如 `.bashrc` 或 `.zshrc`），或者在运行命令时直接提供：
```bash
BARK_URL="https://api.day.app/YOUR_BARK_KEY_HERE" yarn start
```
也支持直接放在 `.env` 文件中
```
BARK_URL="https://api.day.app/YOUR_BARK_KEY_HERE"
```

## 运行

### 开发模式 (使用 nodemon 自动重启)

```bash
yarn dev
```

### 生产模式

构建 TypeScript 代码并运行构建后的 JavaScript 代码：
   ```bash
   yarn start
   ```

## 注意事项

- 初始 `lastProcessedNnid` 设置为 `1800`。这意味着程序首次运行时，会推送所有 `nnid` 大于 `1800` 的新闻。之后，它会记录并推送此后更新的新闻。
- 请确保你的 Bark 服务配置正确并且网络通畅。