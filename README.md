# きろく — 感情記録 Web アプリ

スマホ向けのミニマルな感情記録アプリ（ローカル動作）。

## 起動方法

**npm が入っていない場合（推奨）**

```bash
cd "/Users/endokanjin/Desktop/で基礎"
chmod +x start.sh
./start.sh
```

初回は Node.js を自動ダウンロードし、依存関係をインストールしてからサーバーを起動します。

**npm が入っている場合**

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開く。iPhone サイズは DevTools のモバイル表示か実機で確認。

> サーバーが止まっているとページは開けません。ターミナルで `./start.sh` を実行したままにしてください。

## 機能

- 色を選んで記録（6色）
- タグを 1〜3 個選択
- 投稿に時刻表示
- 他人の投稿（サンプル）＋自分の投稿一覧
- いいねなし
- 自分の投稿は `localStorage` に保存

## ビルド

```bash
npm run build
npm run preview
```
