# ymp5078.github.io

基于 Jekyll 构建的个人学术主页，采用 Windows 98 桌面风格（Emu 98 主题）。

基于 Yaoyao Liu 的 [Minimal Light](https://github.com/yaoyao-liu/minimal-light) 主题。

```
        oo
       ████
       █◐█        Emu 98
        ██
       ██
     ▓▓▓▓▓▓
    ▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓     你的桌面伙伴。
   ▓▓▓▓▓▓▓▓▓▓     在任务栏上行走、排便、
    ▓▓▓▓▓▓▓▓▓     种花、回应点击。
      █ █
       █  █
      ██ ██
```

## 项目特点

- Windows 98 风格桌面，包含启动画面、资源管理器窗口、任务栏和开始菜单
- 支持暗色模式（开始菜单切换，自动跟随系统偏好）
- 鸸鹋桌面宠物，在任务栏上行走并具有交互行为
- 便便生命周期：便便 > 扁平 > 草/消失 > 花/干草 > 干花 > 干茎 > 干草 > 消失
- 响应式布局，适配移动端和桌面端
- 论文列表，支持缩略图和链接按钮
- Jekyll + GitHub Pages 自动部署

## 使用此模板

### 1. Fork 并重命名

Fork 此仓库并重命名为 `your-username.github.io`，然后在仓库设置中启用 GitHub Pages。

### 2. 编辑 `_config.yml` 中的个人信息

```yaml
title: 你的名字
position: 你的职位
affiliation: 你的单位
education: "你的学位，你的大学"
email: you (at) example (dot) com

google_scholar: https://scholar.google.com/citations?user=YOUR_ID
github_link: https://github.com/your-username
linkedin: https://www.linkedin.com/in/your-id/

avatar: ./assets/img/avatar.png
```

### 3. 在 `index.md` 中编写个人简介

```markdown
---
layout: homepage
---

## About Me

在此编写你的简介，支持 Markdown 和 HTML。

## Research Interests

- **方向A：** 描述
- **方向B：** 描述
```

### 4. 在 `_data/publications.yml` 中添加论文

```yaml
- title: "论文标题"
  authors: "作者A, <strong>你的名字</strong>, 作者B"
  venue: "会议或期刊名称, 2024"
  paper_url: "https://arxiv.org/abs/..."
  teaser: paper_teaser.png
```

将缩略图放在 `assets/img/` 目录下。

### 5. 更新其他板块

- `_includes/news.md` — 新闻和公告
- `_includes/services.md` — 审稿、委员会等
- `assets/img/` — 替换头像和网站图标

### 6. 部署

推送到 GitHub，你的网站将在 `https://your-username.github.io` 上线。

## 本地开发

安装 [Ruby](https://www.ruby-lang.org/en/) 和 [Jekyll](https://jekyllrb.com/)，然后：

```bash
bundle install
bundle exec jekyll serve --livereload
```

访问 [http://localhost:4000](http://localhost:4000) 预览。

## 许可证

[Creative Commons Zero v1.0 Universal](LICENSE)

## 致谢

- [yaoyao-liu/minimal-light](https://github.com/yaoyao-liu/minimal-light) - 基础主题
- [pages-themes/minimal](https://github.com/pages-themes/minimal)
- [orderedlist/minimal](https://github.com/orderedlist/minimal)
- [al-folio](https://github.com/alshedivat/al-folio)