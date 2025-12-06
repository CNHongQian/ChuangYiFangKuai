# 创艺方块项目结构说明

## 📁 项目文件夹结构

```
ChuangYiFangKuaiPro/
├── pages/                  # HTML页面文件
│   ├── index.html         # 首页
│   ├── buildings.html     # 建筑页面
│   ├── tools.html         # 工具页面
│   └── about.html         # 关于页面
├── css/                   # 样式文件
│   └── styles.css         # 主样式文件
├── js/                    # JavaScript文件
│   ├── script.js          # 公共脚本
│   ├── home.js            # 首页专用脚本
│   ├── buildings.js       # 建筑页面专用脚本
│   ├── tools.js           # 工具页面专用脚本
│   └── about.js           # 关于页面专用脚本
├── images/                # 图片资源文件夹
├── data/                  # 数据存储文件夹
│   └── sample_data.json   # 示例数据
├── buildings/             # 建筑文件存储
├── tools/                 # 工具文件存储
│   └── upload_tool.py     # Python上传工具
└── index.html             # 原始首页（保留）
```

## 🚀 使用方法

### 访问网站
- 首页：`pages/index.html`
- 建筑页面：`pages/buildings.html`
- 工具页面：`pages/tools.html`
- 关于页面：`pages/about.html`

### 使用上传工具
```bash
cd tools
python upload_tool.py
```

## 🎨 主要功能

### 导航功能
- 所有页面间导航正常工作
- 当前页面高亮显示
- 响应式导航设计

### 搜索和过滤
- 首页：显示所有类型，支持分类过滤
- 建筑页面：只显示建筑作品，分类包括现代、中世纪、像素、奇幻
- 工具页面：只显示工具，分类包括编辑器、生成器、红石、实用工具

### 随机刷新
- 每个页面都有独立的随机刷新按钮
- 点击后随机重新排序当前页面的内容

### 首页介绍
- 添加了平台介绍部分
- 包含特色功能说明
- 响应式设计适配

### Python上传工具
- 支持文件分类上传到对应文件夹
- 自动创建目录结构
- 保存草稿和数据文件

## 📱 移动端适配
- 完全响应式设计
- 支持手机、平板、桌面设备
- 优化的触摸交互

## 🔄 数据流程
1. 用户通过上传工具提交作品
2. 文件自动分类存储到对应文件夹
3. 数据信息保存到data文件夹
4. 网页通过JavaScript读取和显示数据

## 🎯 下一步优化
- 集成真实数据库
- 添加用户系统
- 实现评论和评分功能
- 添加下载统计