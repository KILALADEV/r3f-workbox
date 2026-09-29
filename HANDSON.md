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

この資料では、STEPごとにコードを追加しながらギフトボックスを完成させていきます。

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

### このSTEPでやること

箱の中へPresentを追加します。箱を開くとPresentが上へ出て、閉じると箱の中へ戻るようにします。

STEP 01で使った`opened`、`useRef`、`useFrame`、`lerp`を再利用します。新しいstateは追加しません。

```text
1つのopened state
├─ Lidの目標位置を決める
└─ Presentの目標位置を決める
```

### このSTEPで使うもの

- `sphereGeometry`：Presentの形を作る
- `useRef`：Presentの`mesh`を参照する
- `opened`：LidとPresentで同じ開閉状態を使う
- `useFrame`と`lerp`：Presentを目標位置へ少しずつ近づける

---

### 1. Presentを追加する

#### 1. やること

球体のPresentを1つ追加します。

最初は追加したことを確認しやすいように、箱の上へ一時的に表示します。

#### 2. 追加・変更するコード

`GiftBox`内のBodyとLidの間へ、次の`mesh`を追加します。

```tsx
{/* Present */}
<mesh name="Present" position={[0, 2.2, 0]} castShadow>
  <sphereGeometry args={[0.45, 32, 32]} />
  <meshStandardMaterial color="#f4c542" />
</mesh>
```

#### 3. コードの意味

`sphereGeometry`で半径`0.45`の球体を作ります。

箱と区別しやすいように、Presentは黄色にしています。

`position`のY座標`2.2`は、確認用の一時的な位置です。次の手順で箱の中へ移動します。

#### 4. ブラウザで確認

1. 箱の上に黄色い球体が表示されることを確認します。
2. Presentが新しい`mesh`として追加されたことを確認します。

この時点では、Presentはまだ動かなくてOKです。

---

### 2. Presentをopenedと連動させる

#### 1. やること

STEP 01でLidに行った処理を、Presentにも追加します。

同じ`opened`を使い、箱を開くとPresentが出て、閉じると箱の中へ戻るようにします。

#### 2. 追加・変更するコード

Lidの位置を表す定数の下へ、Presentの位置を追加します。

```tsx
const PRESENT_CLOSED_Y = 0.8;
const PRESENT_OPEN_Y = 2.2;
```

`GiftBox`内で、`lidRef`の下にPresent用の`ref`を追加します。

```tsx
const presentRef = useRef<THREE.Mesh>(null);
```

既存の`useFrame`を次のように変更します。

```tsx
useFrame(() => {
  if (!lidRef.current || !presentRef.current) return;

  const lidTargetY = opened ? OPEN_Y : CLOSED_Y;
  const presentTargetY = opened ? PRESENT_OPEN_Y : PRESENT_CLOSED_Y;

  lidRef.current.position.y = THREE.MathUtils.lerp(
    lidRef.current.position.y,
    lidTargetY,
    0.1,
  );

  presentRef.current.position.y = THREE.MathUtils.lerp(
    presentRef.current.position.y,
    presentTargetY,
    0.1,
  );
});
```

最後に、先ほど追加したPresentの`mesh`へ`ref`を渡し、最初の位置を箱の中へ変更します。

```tsx
{/* Present */}
<mesh
  ref={presentRef}
  name="Present"
  position={[0, PRESENT_CLOSED_Y, 0]}
  castShadow
>
  <sphereGeometry args={[0.45, 32, 32]} />
  <meshStandardMaterial color="#f4c542" />
</mesh>
```

#### 3. コードの意味

`presentRef`を使うと、Presentの`mesh`を参照できます。

LidとPresentは、どちらも同じ`opened`から目標位置を決めています。新しいstateは必要ありません。

`presentTargetY`がPresentの目標位置です。`lerp`を使い、現在のY座標から目標のY座標へ少しずつ近づけます。

#### 4. ブラウザで確認

1. 最初はPresentが箱の中に隠れていることを確認します。
2. 箱をクリックします。
3. Lidが開き、Presentが上方向へ出てくることを確認します。
4. Bodyが動いていないことを確認します。
5. もう一度クリックします。
6. LidとPresentが元の位置へ戻ることを確認します。

これで`02-add-present`は完成です。

### このSTEPで体験したこと

STEP 01で使った仕組みを、Presentにも再利用しました。

```text
クリック
↓
1つのopened stateが変わる
↓
LidとPresent、それぞれの目標位置が変わる
↓
2つのオブジェクトが連動して動く
```

**1つのstateを使って、複数の3Dオブジェクトを連動させることができます。**

---

## STEP 03：Replace with GLB

### このSTEPでやること

Geometryで作ったBodyとLidを、Blenderで作ったGLBモデルへ差し替えます。

見た目は大きく変わりますが、`opened`、`useFrame`、`lerp`を使った開閉の仕組みはそのまま再利用します。PresentもSTEP 02のGeometryを残します。

```text
Geometryで作ったBody / Lid
↓
Blenderで作ったGLB
```

### このSTEPで使うもの

- `useGLTF`：GLBを読み込む
- `nodes.Lid`：GLB内のLidを取得する
- `primitive`：読み込んだ3DモデルをR3Fのシーンへ表示する

今回使用するGLBは、すでに`public/models/gift_box_handson.glb`へ配置されています。

---

### 1. GLBを読み込む

#### 1. やること

`useGLTF`を使って、GLBを`GiftBox`コンポーネントへ読み込みます。

#### 2. 追加・変更するコード

ファイルの先頭に`useGLTF`のimportを追加します。

```tsx
import { useGLTF } from '@react-three/drei';
```

`GiftBox`関数の先頭に、次のコードを追加します。

```tsx
const { scene, nodes } = useGLTF('/models/gift_box_handson.glb');
```

#### 3. コードの意味

`useGLTF`は、指定したパスからGLBを読み込みます。

`scene`にはGLB全体が入ります。`nodes`からは、GLB内の名前付きノードを取得できます。

#### 4. ブラウザで確認

この時点では、表示はまだGeometry版のままです。ブラウザにエラーが出ていなければ成功です。

---

### 2. Geometry版の箱をGLBへ差し替える

#### 1. やること

Geometry版のBodyとLidを削除し、読み込んだGLB全体を表示します。

Presentの`mesh`は削除しません。

#### 2. 追加・変更するコード

`GiftBox`内から、Bodyの`mesh`を削除します。

```tsx
{/* Body */}
<mesh name="Body" position={[0, 0.75, 0]} castShadow>
  <boxGeometry args={[2, 1.5, 2]} />
  <meshStandardMaterial color="#d95763" />
</mesh>
```

同じように、Geometry版のLidの`mesh`も削除します。

Bodyがあった位置へ、次のコードを追加します。

```tsx
<primitive object={scene} />
```

#### 3. コードの意味

`primitive`を使うと、読み込んだGLB全体をR3Fのシーンへ表示できます。

GLBにはBodyとLidが含まれています。Presentは含まれていないため、STEP 02の`sphereGeometry`をそのまま使います。

#### 4. ブラウザで確認

1. Geometry版の箱がGLBモデルへ変わったことを確認します。
2. 蓋にリボンと結び目が表示されていることを確認します。
3. Presentの`mesh`がコードに残っていることを確認します。

この時点では、GLBの表示だけを確認します。

Lidの開閉処理はまだGeometry版のLidを参照しているため、次の手順でGLBのLidへつなぎ直します。

---

### 3. GLBのLidに開閉ロジックを適用する

#### 1. やること

GLB内のLidを取得し、STEP 01から使っている開閉ロジックを適用します。

#### 2. 追加・変更するコード

`useGLTF`の下で、Lidを取得します。

```text
gift_box_handson.glb
└─ GiftBox
   ├─ Body
   └─ Lid ← nodes.Lidで取得
```

```tsx
const { scene, nodes } = useGLTF('/models/gift_box_handson.glb');
const lid = nodes.Lid;
```

今回のLidは、蓋・リボン・結び目など複数のパーツをまとめたGroupです。Lidを動かすと、すべてのパーツが一緒に動きます。

Geometry版のLidで使っていた`lidRef`を削除します。

```tsx
const lidRef = useRef<THREE.Mesh>(null);
```

`useFrame`の先頭を変更します。

```tsx
if (!presentRef.current) return;
```

Lidの位置を更新している部分を変更します。

```tsx
lid.position.y = THREE.MathUtils.lerp(
  lid.position.y,
  lidTargetY,
  0.1,
);
```

`opened`、`lidTargetY`、`CLOSED_Y`、`OPEN_Y`は変更しません。Presentのアニメーションもそのまま残します。

#### 3. コードの意味

`nodes.Lid`で、GLB内の`Lid`という名前のノードを取得しています。

動かす対象は`lidRef.current`から`lid`へ変わりました。しかし、`opened`から目標位置を決め、`lerp`で現在位置を近づける仕組みは同じです。

#### 4. ブラウザで確認

1. 箱をクリックします。
2. Lidとリボンが一緒に上へ動くことを確認します。
3. Presentも従来どおり上へ動くことを確認します。
4. Bodyが動いていないことを確認します。
5. もう一度クリックします。
6. LidとPresentが元の位置へ戻ることを確認します。

これで`03-replace-with-glb`は完成です。

### このSTEPで体験したこと

Geometry版からGLBへ変わったのは、ギフトボックスの見た目です。

```text
opened
↓
目標位置を決める
↓
useFrame
↓
lerp
↓
Lidを動かす
```

この仕組みはSTEP 01から変わっていません。

**シンプルなGeometryでロジックを作っておけば、そのロジックを残したまま、見た目をGLBモデルへ発展させることができます。**

---

## BONUS：Customize

色、アニメーションの速度や移動量、中身などを自由に変更します。

手順は後ほど追加します。
