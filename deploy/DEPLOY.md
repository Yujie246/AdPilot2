# AdPilot 公网部署

## 1. 服务器准备

需要一台有公网 IP 的 Linux 服务器，并放通安全组端口：

- `22`：SSH 登录
- `80`：HTTP，用于首次访问和证书签发
- `443`：HTTPS

如果服务器在中国大陆，域名通常需要完成备案后才能稳定绑定到 Web 服务。

## 2. DNS 解析

在火山引擎域名控制台添加解析：

- 主机记录：`@`
- 记录类型：`A`
- 记录值：服务器公网 IP

如需 `www.sustechyujie.top`，再添加一条：

- 主机记录：`www`
- 记录类型：`CNAME`
- 记录值：`sustechyujie.top`

## 3. 上传项目

在服务器上安装 Docker 和 Docker Compose，然后把项目上传到服务器，例如：

```bash
scp -r "/Users/liuyujie/Documents/New project" root@服务器公网IP:/opt/adpilot
```

## 4. 配置环境变量

```bash
cd /opt/adpilot
cp deploy/env.production.example .env
vim .env
```

至少需要修改：

```bash
SITE_ADDRESS=sustechyujie.top
DASHSCOPE_API_KEY=你的真实百炼Key
CORS_ORIGINS=https://sustechyujie.top,http://sustechyujie.top
```

## 5. 启动

```bash
docker compose up -d --build
docker compose ps
```

访问：

- `https://sustechyujie.top`
- `https://sustechyujie.top/health`

## 6. 日志和更新

查看日志：

```bash
docker compose logs -f
```

更新代码后重启：

```bash
docker compose up -d --build
```
