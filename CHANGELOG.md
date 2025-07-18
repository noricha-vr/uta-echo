# Changelog

## [1.0.0] - 2025-01-18

### 追加
- プロジェクト初期セットアップ
- Vite + React + TypeScript環境構築
- TailwindCSS導入
- Docker + Caddy によるHTTPS開発環境
- 音声入力とマイクアクセス機能
- Web Audio APIを使用した音声処理エンジン
- リアルタイムリバーブエフェクト
- エフェクト強度制御（0-100%）
- 録音機能（webm/opus形式）
- IndexedDB（Dexie.js）によるデータ永続化
- 録音履歴の表示・管理
- 録音の再生機能
- MP3形式でのダウンロード（lamejs使用）
- 録音の削除機能
- ストレージ使用量監視（100MB制限）
- 包括的なエラーハンドリング
- レスポンシブUIデザイン

### 技術詳細
- Web Audio APIのConvolverNodeでリバーブ実装
- MediaRecorder APIで録音処理
- Dry/Wetミックスによるエフェクト強度調整
- 人工的なインパルスレスポンス生成
- 録音時のメタデータ保存（日時、時間、エフェクト設定）