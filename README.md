# 两个人的小饭桌

一个为两个人设计的原生微信小程序。两个人都可以挑选今天想吃的菜，把自己的心愿放到公共心愿板；页面会自动区分“我的饭饭心愿”和“TA 的饭饭心愿”，并同步“收到啦”“可以开饭啦”等回应。

> 这是个人非商业项目，不包含下单、支付、配送等商用能力，也不需要自建服务器。

## 功能

- 24 道菜品，包含家常、肉肉、海鲜、主食、甜甜和饮品
- 菜品分类、数量增减和本地原创菜单插画
- 两个微信账号分别保存自己的心愿
- 公共心愿板同时展示双方选择
- 自动根据微信 `openid` 区分“我”和“TA”，不需要固定角色
- 只能回应对方的心愿，支持“收到啦”和“可以开饭啦”
- 约 2.5 秒刷新一次，适合两人轻量使用
- 云函数负责数据校验和读写，前端不直接开放数据库写权限

## 页面流程

```text
选择菜品 → 把我的心愿放上去 → 我们的饭饭心愿
                                  ├─ 我的饭饭心愿
                                  └─ TA 的饭饭心愿 → 收到啦 → 可以开饭啦
```

每个微信账号在云端拥有一份独立心愿。第一个提交和第二个提交的账号组成这张小饭桌；第三个账号不能提交心愿。

## 技术方案

| 部分 | 实现 |
| --- | --- |
| 客户端 | 原生微信小程序（WXML、WXSS、JavaScript） |
| 身份识别 | 云函数中的微信 `openid` |
| 数据同步 | 微信云开发 + 2.5 秒轮询 |
| 数据存储 | 云数据库集合 `meal_wishes` |
| 服务端 | 云函数 `mealWish` |
| 图片 | 本地 JPG 菜品拼图，不依赖外部图片域名 |

项目不需要购买云服务器、域名、HTTPS 证书或接入微信支付。

## 目录结构

```text
.
├── app.js                         # 小程序启动与云能力初始化
├── app.json                       # 小程序页面和全局配置
├── assets/menu/                   # 菜品插画资源
├── cloudfunctions/mealWish/       # 双人心愿云函数
├── config.example.js              # 可复制的非敏感配置模板
├── data/menu.js                   # 24 道菜品数据
├── pages/menu/                    # “今天吃什么”页面
├── pages/wish/                    # “我们的饭饭心愿”页面
├── utils/wish-service.js          # 本地/云端数据访问封装
├── project.config.example.json    # 开发者工具配置模板
└── docs/APPLY_AND_RUN.md          # 注册、部署和体验版操作说明
```

## 快速预览

### 1. 导入项目

安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)，克隆仓库后先创建本机配置：

```bash
cp config.example.js config.js
cp project.config.example.json project.config.json
```

`config.js` 和 `project.config.json` 已被 `.gitignore` 排除，用于保存本机的云环境 ID 和 AppID，不会上传到 GitHub。然后在开发者工具中选择“导入项目”，项目目录选择仓库根目录。

如果只想查看界面：

1. 保持 `config.js` 中的 `dataMode: 'demo'`。
2. 使用测试号或自己的 AppID 导入项目。
3. 点击编译即可在同一设备上体验选菜与“我的心愿”。

`demo` 模式不提供两台手机之间的同步。

### 2. 配置自己的 AppID

在微信公众平台获取小程序 AppID，然后修改本机的 `project.config.json`：

```json
{
  "appid": "wx你的AppID"
}
```

AppID 不是 AppSecret。不要把 AppSecret、登录 token 或带临时凭证的控制台链接提交到仓库。

## 开启双人云同步

### 1. 创建云环境

在微信开发者工具中点击“云开发”，创建一个云环境并复制环境 ID。修改本机的 `config.js`：

```js
module.exports = {
  dataMode: 'cloud',
  cloudEnvId: '你的云环境ID'
}
```

### 2. 部署云函数

在开发者工具中找到 `cloudfunctions/mealWish`，右键选择：

```text
上传并部署：云端安装依赖
```

云函数首次执行时会尝试创建 `meal_wishes` 集合，不需要把数据库设置为“所有用户可读写”。

也可以使用微信开发者工具 CLI：

```bash
/Applications/wechatwebdevtools.app/Contents/MacOS/cli cloud functions deploy \
  --env '你的云环境ID' \
  --paths './cloudfunctions/mealWish' \
  --remote-npm-install \
  --project '.'
```

### 3. 真机测试

1. 账号 A 选择菜品并点击“把我的心愿放上去”。
2. 账号 B 也提交一份自己的心愿。
3. 两边打开“我们的饭饭心愿”，确认分别显示“我的”和“TA 的”。
4. 账号 B 回应账号 A 的心愿，账号 A 应在约 2.5 秒内看到状态变化。

## 上传体验版

1. 在微信公众平台的“成员管理”中添加另一位体验成员。
2. 使用微信开发者工具上传代码。
3. 在“版本管理”中将对应开发版本选为体验版。
4. 把体验二维码发给已添加的体验成员。

更完整的注册与部署步骤见 [docs/APPLY_AND_RUN.md](docs/APPLY_AND_RUN.md)。

## 数据与安全说明

- 前端不会保存或上传 AppSecret。
- 用户身份只在云函数中通过微信上下文获取，客户端不能自行指定 `openid`。
- 云端最多接受两个不同账号提交心愿；每个账号只能覆盖自己的心愿。
- 状态按钮只能修改对方的心愿，不能给自己点“收到啦”。
- 当前实现面向仅有两位体验成员的私用场景，没有配对码、管理员白名单或公开发布所需的完整权限系统。
- 如果准备公开发布，应增加配对关系、成员解绑/重置、数据库安全规则、隐私协议和异常监控。

## 菜单与图片

菜单位于 [`data/menu.js`](data/menu.js)。四张 3×2 菜品拼图是为本项目生成的原创视觉资源，卡片使用定位裁切显示对应菜品：

<p>
  <img src="assets/menu/savory-a.jpg" width="360" alt="菜品插画拼图示例">
  <img src="assets/menu/sweet-d.jpg" width="360" alt="甜品和饮品插画拼图示例">
</p>

小程序使用压缩后的 JPG；高清 PNG 源图通过本机 `project.config.json` 的 `packOptions.ignore` 排除在上传包之外。

## 自定义菜单

在 `data/menu.js` 中增删菜品。每项数据包括：

```js
{
  id: 'tomato-eggs',
  name: '番茄炒蛋',
  category: '家常',
  emoji: '🍅',
  note: '酸酸甜甜，永远不会错'
}
```

如果新增图片，需要同时调整拼图资源及 `spriteLeft`、`spriteTop` 的定位值。

## 已知限制

- 只支持一张两人小饭桌，不支持多组情侣共用同一云环境。
- 第三个账号不能提交；目前没有在小程序内重置成员的入口。
- 同步采用轮询，不是毫秒级推送。
- 本项目未包含正式发布审核、备案、支付或商用类目配置。

## 开发检查

项目不依赖前端 npm 构建。提交前可执行：

```bash
node --check app.js
node --check utils/wish-service.js
node --check pages/menu/index.js
node --check pages/wish/index.js
node --check cloudfunctions/mealWish/index.js
```

云函数依赖由部署时的“云端安装依赖”根据 `cloudfunctions/mealWish/package.json` 安装。
