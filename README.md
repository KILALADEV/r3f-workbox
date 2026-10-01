# React Three Fiber ハンズオン：03-replace-with-glb

React Three Fiber（R3F）を使って、クリックすると開くギフトボックスを作るハンズオン教材です。

このSTEPでは、Geometryで作ったギフトボックスをGLBモデルへ差し替え、これまでに作った開閉ロジックを適用します。

## 必要な環境

- Node.js 22.12.0以上
- npm（Node.jsに付属するもの）
- WebGLに対応したPCブラウザ（Google Chrome推奨）

## 起動方法

初回のみ、必要なパッケージをインストールします。

```bash
npm install
```

開発サーバーを起動します。

```bash
npm run dev
```

ターミナルに表示されたURL（通常は `http://localhost:4321`）をブラウザで開いてください。

開発サーバーを終了するときは、ターミナルで `Ctrl + C` を押します。

## このSTEPで用意されているもの

- R3Fの`Canvas`
- 固定カメラ
- ライト
- 地面
- GLBモデルのギフトボックス
  - Body：箱本体
  - Lid：蓋・リボン・結び目をまとめたGroup
- R3FのGeometryで作ったPresent
- クリックによる開閉状態の切り替え
- LidとPresentのアニメーション

箱をクリックすると、Bodyは動かず、LidとPresentが上方向へ動きます。もう一度クリックすると、どちらも元の位置へ戻ります。

## 主に編集するファイル

```text
src/
├─ pages/
│  └─ index.astro
├─ components/
│  └─ GiftScene.tsx
└─ styles/
   └─ global.css
```

ハンズオンで主に編集するのは、`src/components/GiftScene.tsx`です。

このファイルには、R3Fのシーンと`GiftBox`コンポーネントが書かれています。GLBのBodyとLidに、R3FのGeometryで作ったPresentを組み合わせています。

Astro側の設定や`index.astro`は準備済みのため、基本的に変更する必要はありません。

## ハンズオンの流れ

```text
00-start
↓
01-click-open
↓
02-add-present
↓
03-replace-with-glb
```

ここまでがハンズオン本編です。

1. **01-click-open**  
   クリックをきっかけに箱の状態を変更し、Lidを上方向へアニメーションさせます。

2. **02-add-present**  
   箱の中身を追加し、開閉状態に合わせて中身もアニメーションさせます。

3. **03-replace-with-glb**  
   Geometryで作った箱をGLBモデルへ差し替え、同じ開閉ロジックを適用します。

### BONUS：Customize（任意）

`bonus-customize`は、早く終わった人や時間に余裕がある人向けの自由なカスタマイズです。
すべてを行う必要はありません。詳しいアイデアとHintは[HANDSON.md](./HANDSON.md)を参照してください。

## 使用技術

- Astro
- React
- React Three Fiber
- drei
- three.js
- TypeScript

外部アニメーションライブラリは使用せず、R3FとReactの機能を使って実装します。

## このハンズオンで体験すること

このハンズオンでは、まずシンプルなGeometryでインタラクションを作り、その後GLBモデルへ差し替えて見た目を仕上げます。

最初から完成形を作るのではなく、**シンプルな形でロジックを作り、あとから表現を発展させる**R3Fでの制作の流れを体験してみましょう。
