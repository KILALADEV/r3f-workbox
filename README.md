# React Three Fiber ハンズオン：01-click-open

React Three Fiber（R3F）を使って、クリックすると開くギフトボックスを作るハンズオン教材です。

このSTEPでは、クリックをきっかけにReactのstateを変更し、ギフトボックスのLidをなめらかに開閉します。

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
- R3FのGeometryで作ったギフトボックス
  - Body：箱本体
  - Lid：箱の蓋
- クリックによる開閉状態の切り替え
- Lidの開閉アニメーション

BodyとLidは別々のオブジェクトです。箱をクリックすると、Bodyは動かず、Lidだけが上方向へ動きます。もう一度クリックすると閉じます。

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

このファイルには、R3Fのシーンと`GiftBox`コンポーネントが書かれています。`GiftBox`の中では、BodyとLidがそれぞれ独立した`mesh`として配置されています。

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
↓
bonus-customize
```

1. **01-click-open**  
   クリックをきっかけに箱の状態を変更し、Lidを上方向へアニメーションさせます。

2. **02-add-present**  
   箱の中身を追加し、開閉状態に合わせて中身もアニメーションさせます。

3. **03-replace-with-glb**  
   Geometryで作った箱をGLBモデルへ差し替え、同じ開閉ロジックを適用します。

4. **bonus-customize**  
   色、アニメーションの速度や移動量、中身などを自由に変更します。

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
