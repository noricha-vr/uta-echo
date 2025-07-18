# うたエコー (Uta Echo)

リアルタイムカラオケエフェクトアプリケーション

## 概要

うたエコーは、ブラウザベースのカラオケエフェクトアプリケーションです。マイクからの音声入力にリアルタイムでリバーブエフェクトを適用し、録音・再生機能を提供します。

## 機能

- 🎤 リアルタイム音声エフェクト（リバーブ）
- 🎚️ エフェクト強度調整（0-100%）
- 🔴 録音機能（webm形式）
- 💾 録音の保存と管理（IndexedDB）
- 🎵 録音の再生
- 📥 MP3形式でのダウンロード
- 📊 ストレージ使用量の監視（100MB制限）

## 開発環境のセットアップ

### 前提条件

- Node.js 18以上
- Docker & Docker Compose
- Bun（推奨）またはnpm

### インストール

```bash
# 依存関係のインストール
bun install
# または
npm install
```

### 開発サーバーの起動

#### ローカル環境（HTTPのみ）

```bash
bun run dev
# または
npm run dev
```

http://localhost:5173 でアクセス可能

#### Docker環境（HTTPS対応）

```bash
docker compose up
```

https://localhost でアクセス可能（自己署名証明書）

## 本番ビルド

```bash
bun run build
# または
npm run build
```

ビルド成果物は `dist` ディレクトリに生成されます。

## デプロイ

Cloudflare Pages向けの設定：

- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `dist`
- Node.jsバージョン: 18

## 技術スタック

- **フロントエンド**: React + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: TailwindCSS
- **音声処理**: Web Audio API
- **録音**: MediaRecorder API
- **ストレージ**: IndexedDB (Dexie.js)
- **音声変換**: lamejs（MP3エンコーディング）
- **開発環境**: Docker + Caddy（HTTPS）

## ブラウザ要件

- Google Chrome 最新版（推奨）
- HTTPS環境（マイクアクセスに必要）

## 注意事項

- マイクへのアクセス許可が必要です
- HTTPS環境でのみ動作します（開発環境含む）
- ストレージ容量は100MBに制限されています

## ライセンス

MIT