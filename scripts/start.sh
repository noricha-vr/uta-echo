#!/bin/bash

echo "🎤 うたエコー開発環境を起動します..."

# Docker環境のクリーンアップ
echo "既存のコンテナを停止しています..."
docker compose down

# Docker環境の起動
echo "Docker環境を起動しています..."
docker compose up --build -d

echo "✅ 開発環境が起動しました！"
echo ""
echo "📍 アクセスURL:"
echo "   HTTPS: https://localhost"
echo "   HTTP:  http://localhost:5173"
echo ""
echo "📝 ログを確認するには: docker compose logs -f"
echo "🛑 停止するには: docker compose down"