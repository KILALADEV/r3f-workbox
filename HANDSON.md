# React Three Fiber ハンズオン

シンプルなギフトボックスに、クリック操作とアニメーションを追加していきます。

## 全体の流れ

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

この資料はSTEPごとに追記していきます。今回は`01-click-open`を進めます。

---

## STEP 01：Click & Open

### このSTEPでやること

ギフトボックスをクリックして、Lidを開閉できるようにします。

最初に、クリックによってReactのstateを切り替えます。次に、stateに合わせてLidの位置を変えます。最後に、その動きをなめらかなアニメーションへ変更します。

```text
クリック
↓
stateが変わる
↓
Lidの目標位置が変わる
↓
Lidが動く
```

### このSTEPで使うもの

- `useState`：箱が開いているかを記録する
- `onClick`：3Dオブジェクトのクリックを受け取る
- `useRef`：Lidの`mesh`を参照する
- `useFrame`：3Dシーンが描画されるフレームごとに処理を実行する
- `THREE.MathUtils.lerp`：現在の位置を目標位置へ少しずつ近づける

これらを一度に追加する必要はありません。必要になった順番に、1つずつ使います。

### 準備

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザでページを開き、ギフトボックスが表示されることを確認してください。

このSTEPで編集するファイルは`src/components/GiftScene.tsx`です。

---

### 1. クリックで状態を切り替える

#### 1. やること

箱が開いているかをReactのstateで記録します。箱をクリックするたびに、stateを切り替えます。

この段階では、Lidはまだ動きません。

#### 2. 追加・変更するコード

ファイルの先頭に`useState`のimportを追加します。

```tsx
import { useState } from 'react';
```

`GiftBox`関数の先頭に、`opened`というstateを追加します。もともとある`return`より上に書いてください。

```tsx
const [opened, setOpened] = useState(false);
```

`false`は閉じている状態です。`true`は開いている状態です。

次に、`GiftBox`内の`group`へ`onClick`を追加します。

```tsx
<group onClick={() => setOpened(!opened)}>
```

確認しやすくしたい場合は、stateの下へ一時的に次のコードを追加します。

```tsx
console.log('opened:', opened);
```

#### 3. コードの意味

`useState(false)`は、最初の状態を「閉じている」にします。

箱をクリックすると、`setOpened(!opened)`が実行されます。`false`は`true`へ、`true`は`false`へ切り替わります。

`onClick`を`group`へ付けることで、BodyとLidのどちらをクリックしても同じ処理が動きます。

#### 4. ブラウザで確認

1. 箱をクリックします。
2. もう一度クリックします。
3. `console.log`を追加した場合は、コンソールで`true`と`false`が交互に表示されることを確認します。

この段階では、箱の見た目が変わらなくても成功です。

確認できたら、一時的に追加した`console.log`は削除してください。

---

### 2. Lidの位置を変える

#### 1. やること

`opened`の値に合わせて、LidのY座標を切り替えます。

クリックから見た目の変化までがつながります。

```text
クリック → state変更 → position変更 → Lidが移動
```

#### 2. 追加・変更するコード

import文の下に、閉じた位置と開いた位置を追加します。

```tsx
const CLOSED_Y = 1.65;
const OPEN_Y = 3;
```

Lidの`mesh`にある`position`を変更します。

```tsx
<mesh
  name="Lid"
  position={[0, opened ? OPEN_Y : CLOSED_Y, 0]}
  castShadow
>
```

#### 3. コードの意味

`opened`が`true`なら`OPEN_Y`を使います。`false`なら`CLOSED_Y`を使います。

変更するのはLidのY座標だけです。Bodyの位置は変わりません。

#### 4. ブラウザで確認

1. 箱をクリックします。
2. Lidが上へ移動することを確認します。
3. もう一度クリックします。
4. Lidが元の位置へ戻ることを確認します。

ここでは、Lidが一瞬で上下するのが正しい状態です。

次は、この急な変化をなめらかにします。

---

### 3. なめらかに動かす

#### 1. やること

Lidの現在位置を、3Dシーンが描画されるフレームごとに更新します。現在位置を目標位置へ少しずつ近づけることで、なめらかな動きにします。

ここで初めて`useRef`、`useFrame`、`lerp`を使います。

#### 2. 追加・変更するコード

ファイル先頭のimportを変更します。

```tsx
import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
```

`GiftBox`内で、`useState`の下にLidを参照するための`ref`を追加します。

```tsx
const [opened, setOpened] = useState(false);
const lidRef = useRef<THREE.Mesh>(null);
```

その下に`useFrame`を追加します。

```tsx
useFrame(() => {
  if (!lidRef.current) return;

  const targetY = opened ? OPEN_Y : CLOSED_Y;

  lidRef.current.position.y = THREE.MathUtils.lerp(
    lidRef.current.position.y,
    targetY,
    0.1,
  );
});
```

最後に、Lidの`mesh`へ`ref`を渡します。`position`は最初の位置である`CLOSED_Y`へ戻します。

```tsx
<mesh
  ref={lidRef}
  name="Lid"
  position={[0, CLOSED_Y, 0]}
  castShadow
>
```

#### 3. コードの意味

`useRef`を使うと、Lidの`mesh`を`lidRef.current`から参照できます。

`useFrame`の中は、3Dシーンが描画されるフレームごとに実行されます。

`targetY`はLidの目標位置です。箱が開いていれば`OPEN_Y`、閉じていれば`CLOSED_Y`になります。

`lerp`は、現在の値を目標の値へ少しずつ近づけます。

最後の`0.1`は、現在位置から目標位置までの差を、毎フレーム10%ずつ縮めることを表します。

動きを確認したら、最後の値を変更して違いを試してみましょう。

- `0.03`：ゆっくり動く
- `0.1`：現在の速さ
- `0.3`：すばやく動く

確認後は、値を`0.1`へ戻します。この値の変更は、BONUSの「アニメーションの速度を変える」にもつながります。

#### 4. ブラウザで確認

1. 箱をクリックします。
2. Lidだけがなめらかに上へ動くことを確認します。
3. Bodyが動いていないことを確認します。
4. もう一度クリックします。
5. Lidがなめらかに元の位置へ戻ることを確認します。

これで`01-click-open`は完成です。

---

### 01-click-openの完成コード

途中で分からなくなった場合は、`GiftScene.tsx`の先頭から`GiftBox`までを次のコードと比較してください。

```tsx
import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CLOSED_Y = 1.65;
const OPEN_Y = 3;

function GiftBox() {
  const [opened, setOpened] = useState(false);
  const lidRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!lidRef.current) return;

    const targetY = opened ? OPEN_Y : CLOSED_Y;

    lidRef.current.position.y = THREE.MathUtils.lerp(
      lidRef.current.position.y,
      targetY,
      0.1,
    );
  });

  return (
    <group onClick={() => setOpened(!opened)}>
      {/* Body */}
      <mesh name="Body" position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color="#d95763" />
      </mesh>

      {/* Lid */}
      <mesh
        ref={lidRef}
        name="Lid"
        position={[0, CLOSED_Y, 0]}
        castShadow
      >
        <boxGeometry args={[2.2, 0.3, 2.2]} />
        <meshStandardMaterial color="#b83b4b" />
      </mesh>
    </group>
  );
}
```

### このSTEPで体験したこと

```text
3Dオブジェクトをクリックする
↓
Reactのstateが変わる
↓
目標のpositionが変わる
↓
3Dシーンの描画フレームごとにpositionを更新する
↓
Lidがなめらかに動く
```

最初は一瞬で位置を変更しました。その後、必要になったタイミングで毎フレームの更新を追加しました。

---

## STEP 02：Add Present

箱の中身と、そのアニメーションを追加します。

手順は後ほど追加します。

---

## STEP 03：Replace with GLB

Geometryで作った箱をGLBモデルへ差し替え、同じ開閉ロジックを適用します。

手順は後ほど追加します。

---

## BONUS：Customize

色、アニメーションの速度や移動量、中身などを自由に変更します。

手順は後ほど追加します。
