# 创艺方块-ChuangYiFangKuai

一个专注于我的世界建筑分享的平台，提供精美的建筑作品展示、实用工具分享和便捷的资源下载服务。

## 🚀 快速开始

### 网站部分
1. 直接打开 `index.html` 文件即可在浏览器中查看网站
2. 所有依赖都通过CDN加载，无需额外安装
3. 推荐使用本地HTTP服务器运行以避免CORS问题：
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 或使用Node.js
   npx http-server -p 8000
   ```
4. 访问 `http://localhost:8000` 查看网站

## 📁 项目结构

```
ChuangYiFangKuaiPro/
├── index.html          # 主页面
├── pages/              # 子页面
│   ├── buildings.html  # 建筑作品页面
│   ├── tools.html      # 实用工具页面
│   ├── music.html      # 音乐资源页面
│   ├── command.html    # 指令大全页面
│   ├── detail.html     # 作品详情页面
│   └── about.html      # 关于我们页面
├── css/                # 样式文件
│   └── styles.css      # 主样式文件
├── js/                 # JavaScript功能
│   ├── script.js       # 通用脚本
│   ├── home.js         # 首页脚本
│   ├── buildings.js    # 建筑页面脚本
│   ├── tools.js        # 工具页面脚本
│   ├── music.js        # 音乐页面脚本
│   ├── command.js      # 指令页面脚本
│   └── detail.js       # 详情页面脚本
├── data/               # 数据文件
│   ├── content_data.json     # 主要内容数据
│   ├── sample_data.json      # 示例数据
│   ├── building_*.json       # 建筑数据文件
│   └── tags.json            # 标签数据
├── img/                 # 图片资源
│   └── favicon.svg      # 网站图标
├── images/              # 作品图片
├── image/               # 作品预览图
├── tools/               # 上传工具
└── README.md            # 说明文档
```

## 🎯 主要功能

### 网站功能
- **分类浏览**：建筑、工具、音乐、指令四大分类，各自独立展示
- **搜索功能**：支持按标题、作者、描述搜索，实时过滤结果
- **过滤功能**：按类型（建筑/工具/音乐/指令）、分类（现代/中世纪/像素/奇幻等）过滤
- **视图切换**：网格视图和列表视图自由切换
- **作品详情**：点击卡片查看详细信息、统计数据和下载链接
- **加载更多**：分页加载，提升浏览体验
- **响应式设计**：完美适配桌面和移动设备
- **分享功能**：一键分享作品到社交媒体

### 上传工具功能
- **基本信息填写**：作品标题、作者、类型、分类、简介
- **文件上传**：支持多种文件格式
- **图片设置**：预览图和封面上传和预览，强制16:9比例显示
- **实时预览**：上传前预览作品展示效果
- **草稿保存**：保存未完成的上传信息
- **数据验证**：确保必填信息完整
- **自动生成ID**：为每个作品生成唯一标识符

## 🛠️ 支持的文件格式

### 建筑文件
- `.schematic` - WorldEdit schematic文件
- `.litematic` - Litematica schematic文件
- `.nbt` - Minecraft NBT结构文件
- `.mcstructure` - Minecraft结构文件

### 工具文件
- `.zip` - 压缩包文件
- `.jar` - Java程序文件
- `.py` - Python脚本
- `.js` - JavaScript脚本

### 图片文件
- `.jpg/.jpeg` - JPEG图片
- `.png` - PNG图片
- `.gif` - GIF图片

## 🎨 界面设计

### 颜色方案
- 主色调：粉色系（#ff69b4, #ff1493, #c71585）
- 背景色：渐变粉白色
- 文字色：深灰色系

### 动画效果
- 背景渐变动画
- 卡片悬浮效果
- 模态框弹出动画
- 按钮交互动画
- 流畅过渡效果

## ⚙️ 自定义配置

### 修改网站数据
编辑 `js/script.js` 中的 `buildingsData` 数组来修改展示的作品数据。

### 修改样式主题
编辑 `css/styles.css` 文件中的颜色变量和动画参数来自定义界面风格。

### 添加新功能
1. 在 `index.html` 中添加HTML结构
2. 在 `css/styles.css` 中添加样式
3. 在 `js/script.js` 中添加JavaScript逻辑

## 💻 技术栈

### 前端
- **HTML5**：语义化标签，响应式布局
- **CSS3**：现代样式、动画效果、渐变背景、Flexbox/Grid布局
- **JavaScript (ES6+)**：模块化开发、异步数据处理、DOM操作
- **Font Awesome**：图标库，提供丰富的界面图标
- **响应式设计**：移动优先，完美适配各种设备

### 上传工具
- **Python 3.6+**：主要编程语言
- **Tkinter**：GUI框架，跨平台桌面应用
- **Pillow**：图片处理，支持多种格式
- **JSON**：数据存储和交换格式

### 数据存储
- **JSON文件**：轻量级数据存储
- **本地存储**：用户偏好设置和临时数据
- **文件系统**：作品文件和图片资源管理

## 🚀 部署

### GitHub Pages 部署
1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择源分支（通常是 main 或 gh-pages）
4. 访问 `https://yourusername.github.io/ChuangYiFangKuai` 查看部署的网站

### 本地部署
1. 克隆仓库到本地
2. 使用 HTTP 服务器运行：
   ```bash
   python -m http.server 8000
   ```
3. 访问 `http://localhost:8000`

### 服务器部署
1. 将所有文件上传到 Web 服务器
2. 确保服务器支持静态文件服务
3. 配置正确的 MIME 类型（特别是 SVG 图标）

## 🐛 常见问题

### CORS 错误
直接打开 HTML 文件可能会遇到 CORS 错误，建议使用 HTTP 服务器运行。

### 图片显示问题
确保图片路径正确，推荐使用相对路径。

### 数据加载失败
检查 `data/` 目录下的 JSON 文件是否存在且格式正确。

## 📄 许可证

本项目仅供学习和参考使用。

## 🤝 贡献

欢迎提交问题和改进建议！

### 贡献指南
1. Fork 本仓库
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

---

**创艺方块** - 分享创意，构建世界 🎮🏗️

![创艺方块](img/favicon.svg)