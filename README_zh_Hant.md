# ymp5078.github.io

基於 Jekyll 構建的個人學術主頁，採用 Windows 98 桌面風格（Emu 98 主題）。

基於 Yaoyao Liu 的 [Minimal Light](https://github.com/yaoyao-liu/minimal-light) 主題。

```
        oo
       ████
       █◐█        Emu 98
        ██
       ██
     ▓▓▓▓▓▓
    ▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓     你的桌面夥伴。
   ▓▓▓▓▓▓▓▓▓▓     在工作列上行走、排便、
    ▓▓▓▓▓▓▓▓▓     種花、回應點擊。
      █ █
       █  █
      ██ ██
```

## 項目特點

- Windows 98 風格桌面，包含啟動畫面、檔案總管視窗、工作列和開始功能表
- 支援暗色模式（開始功能表切換，自動跟隨系統偏好）
- 鴯鶓桌面寵物，在工作列上行走並具有互動行為
- 便便生命週期：便便 > 扁平 > 草/消失 > 花/乾草 > 乾花 > 乾莖 > 乾草 > 消失
- 響應式佈局，適配行動裝置和桌面端
- 論文列表，支援縮圖和連結按鈕
- Jekyll + GitHub Pages 自動部署

## 使用此模板

### 1. Fork 並重新命名

Fork 此倉庫並重新命名為 `your-username.github.io`，然後在倉庫設定中啟用 GitHub Pages。

### 2. 編輯 `_config.yml` 中的個人資訊

```yaml
title: 你的名字
position: 你的職位
affiliation: 你的單位
education: "你的學位，你的大學"
email: you (at) example (dot) com

google_scholar: https://scholar.google.com/citations?user=YOUR_ID
github_link: https://github.com/your-username
linkedin: https://www.linkedin.com/in/your-id/

avatar: ./assets/img/avatar.png
```

### 3. 在 `index.md` 中撰寫個人簡介

```markdown
---
layout: homepage
---

## About Me

在此撰寫你的簡介，支援 Markdown 和 HTML。

## Research Interests

- **方向A：** 描述
- **方向B：** 描述
```

### 4. 在 `_data/publications.yml` 中新增論文

```yaml
- title: "論文標題"
  authors: "作者A, <strong>你的名字</strong>, 作者B"
  venue: "會議或期刊名稱, 2024"
  paper_url: "https://arxiv.org/abs/..."
  teaser: paper_teaser.png
```

將縮圖放在 `assets/img/` 目錄下。

### 5. 更新其他板塊

- `_includes/news.md` — 新聞和公告
- `_includes/services.md` — 審稿、委員會等
- `assets/img/` — 替換頭像和網站圖示

### 6. 部署

推送到 GitHub，你的網站將在 `https://your-username.github.io` 上線。

## 本地開發

安裝 [Ruby](https://www.ruby-lang.org/en/) 和 [Jekyll](https://jekyllrb.com/)，然後：

```bash
bundle install
bundle exec jekyll serve --livereload
```

訪問 [http://localhost:4000](http://localhost:4000) 預覽。

## 授權

[Creative Commons Zero v1.0 Universal](LICENSE)

## 致謝

- [yaoyao-liu/minimal-light](https://github.com/yaoyao-liu/minimal-light) - 基礎主題
- [pages-themes/minimal](https://github.com/pages-themes/minimal)
- [orderedlist/minimal](https://github.com/orderedlist/minimal)
- [al-folio](https://github.com/alshedivat/al-folio)