# AdPilot Vercel 部署

本项目是前后端分离结构，建议在 Vercel 建两个 Project：

- `adpilot-api`：Root Directory 选仓库根目录，用 FastAPI 暴露后端接口。
- `adpilot-web`：Root Directory 选 `frontend`，用 Next.js 部署前端页面。

Vercel 的 monorepo 文档建议每个目录作为独立 Project 导入；FastAPI 文档也支持在根目录通过 `app.py` 零配置暴露名为 `app` 的实例。

## 1. 部署后端 API

在 Vercel Dashboard 新建 Project，导入同一个 Git 仓库：

- Project Name：`adpilot-api`
- Root Directory：仓库根目录，也就是包含 `app.py` 的目录
- Framework Preset：FastAPI；如果没有该选项，就选 Other

后端环境变量：

```bash
DASHSCOPE_API_KEY=你的真实百炼Key
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen3.6-plus
QWEN_TIMEOUT_SECONDS=25
CORS_ORIGINS=https://你的前端域名.vercel.app,http://localhost:3000,http://127.0.0.1:3000
```

如果你还没确定前端域名，先不填 `CORS_ORIGINS` 也能部署；前端若走同源代理模式，浏览器不会直接跨域请求后端。需要开放 Preview 域名直接访问时，可以额外设置：

```bash
CORS_ORIGIN_REGEX=https://.*\.vercel\.app
```

部署成功后先访问：

```text
https://你的后端项目域名.vercel.app/health
```

正常会返回类似：

```json
{"ok":true,"qwen_configured":true,"model":"qwen3.6-plus"}
```

没有配置 `DASHSCOPE_API_KEY` 时，`qwen_configured` 会是 `false`，业务接口会自动走 mock 数据。

## 2. 部署前端 Web

再新建一个 Vercel Project，导入同一个 Git 仓库：

- Project Name：`adpilot-web`
- Root Directory：`frontend`
- Framework Preset：Next.js
- Install Command：默认即可，或 `npm ci`
- Build Command：默认即可，或 `npm run build`

推荐使用同源代理模式，只需要给前端 Project 设置：

```bash
INTERNAL_API_BASE_URL=https://你的后端项目域名.vercel.app
```

此时浏览器请求的是前端同域名下的 `/api/*`，Next.js 会在服务端转发到后端，CORS 问题最少。

如果你希望浏览器直接请求后端域名，也可以设置：

```bash
NEXT_PUBLIC_API_BASE_URL=https://你的后端项目域名.vercel.app
```

这种模式下必须在后端 Project 的 `CORS_ORIGINS` 里加入前端域名。

## 3. 上线验证

前后端都部署完成后，按顺序检查：

```text
https://你的后端项目域名.vercel.app/health
https://你的前端项目域名.vercel.app
https://你的前端项目域名.vercel.app/demo
https://你的前端项目域名.vercel.app/insights
```

在 `/demo` 页面运行一次产品分析。如果能返回插入点、匹配分和痛点/优势列表，就说明前端已经接到公网后端。

## 4. 重要限制

当前 SQLite 数据库在 Vercel 上默认写入 `/tmp/adpilot.db`，适合演示，不适合长期持久化。要做正式生产数据沉淀，建议接 Vercel Postgres、Neon、Supabase 或其他托管数据库，然后把 `database/store.py` 改成对应数据库连接。

Vercel 环境变量修改后不会影响已经发布的部署，需要重新 Redeploy 才会生效。

参考：

- Vercel FastAPI: https://vercel.com/docs/frameworks/backend/fastapi
- Vercel Monorepos: https://vercel.com/docs/monorepos
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
