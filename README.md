# akashic-box2d-serializer (experimental)

[@akashic-extension/akashic-box2d](https://github.com/akashic-games/akashic-box2d/) にシリアライズ機能を追加するプラグインです。
Box2Dオブジェクトを [Akashic Engine](https://akashic-games.github.io/) のスナップショットに格納できるようにします。
また、スナップショットからBox2Dオブジェクトを復元できます。
これによりマルチプレイゲームにおけるロード時間を削減できます。

> [!WARNING]
> Box2Dの全機能に対応していません

## インストール方法

ゲームプロジェクトフォルダ上で下記コマンドを実行してください。

```sh
akashic install @yasshi2525/akashic-box2d-serializer
```

## シリアライズ可能な要素

> [!WARNING]
> `EBody` の直列化に対応してます。 `b2World` の設定値 (`b2Joint`, `b2Controller` など) は対応していません。

* `EBody` (`g.E`, `Box2DWeb.Dynamics.b2body`)
  * ただし、 `Box2DWeb.Collision.Shapes.b2PolygonShape`, `Box2DWeb.Collision.Shapes.b2CircleShape` で作られたものに限る (`Box2D` の API を使っている限り問題ありません)
* `g.FilledRect`
* `g.Sprite`
* `g.FrameSprite`
* `g.Label`
* `g.Pane`
* `g.E` を継承元とするクラス

> [!CAUTION]
> `tag`, `userData` に、シリアライズできない値を格納しないでください。

> [!WARNING]
> `g.E` の以下パラメタはシリアライズ対象外です。復元時にユーザー側で作成してください。
> * `onMessage`
> * `onPointDown`
> * `onPointMove`
> * `onPointUp`
> * `onUpdate`
> * `shaderProgram`

## 使用方法

`Box2DSerializer` をインスタンス化して使います。
`serializeBodies()` が出力したオブジェクトをスナップショットに登録してください。
ゲーム開始時にスナップショットを受け取った場合、 `desrializeBodies(param.snapshot)` を呼び出すことで復元されます。

### TypeScript の場合

```typescript
import { Box2D } from "@akashic-extension/akashic-box2d";
import { Box2DSerializer } from "@yasshi2525/akashic-box2d-serializer";

export = (param: g.GameMainParameterObject) => {
  const scene = new g.Scene({ game: g.game });
  scene.onLoad.add(() => {
    const box2d = new Box2D({ /* ... */ });
    const serializer = new Box2DSerializer({ scene, box2d });
    // スナップショットが与えられた場合、 EBody を復元する
    if (param.snapshot) {
      serializer.desrializeBodies(param.snapshot);
    }

    // ゲーム本体処理

    // スナップショットを定期的に保存する (例)
    scene.setInterval(() => {
      g.game.requestSaveSnapshot(() => {
        return {
          snapshot: serializer.serializeBodies()
        }
      });
    }, 10000);
  });
  g.game.pushScene(scene);
};
```

### JavaScript の場合

```javascript
const { Box2D } = require("@akashic-extension/akashic-box2d");
const { Box2DSerializer } = require("@yasshi2525/akashic-box2d-serializer");

module.exports = (param) => {
  const scene = new g.Scene({ game: g.game });
  scene.onLoad.add(() => {
    const box2d = new Box2D({ /* ... */ });
    const serializer = new Box2DSerializer({ scene, box2d });
    // スナップショットが与えられた場合、 EBody を復元する
    if (param.snapshot) {
      serializer.desrializeBodies(param.snapshot);
    }

    // ゲーム本体処理

    // スナップショットを定期的に保存する (例)
    scene.setInterval(() => {
      g.game.requestSaveSnapshot(() => {
        return {
          snapshot: serializer.serializeBodies()
        }
      });
    }, 10000);
  });
  g.game.pushScene(scene);
};
```

## カスタマイズ方法

> [!NOTE]
> `Box2D` に登録したエンティティが下記の条件に当てはまる場合、カスタマイズが必要です。

### `g.Surface` を使用している場合

ナインパッチなどで `src`, `backgroundImage` に `g.Surface` を使用している場合、復元されません。
`Box2DSerializer` の初期化時に復元する処理を指定してください。
`tag` などを活用して、対応するエンティティに対応した `g.Surface` を作成してください。

> [!NOTE]
> `g.Surface` を使っているクラスに対応するパラメタに復元処理を定義してください
> * `g.Sprite` の場合: `srpiteSurfaceDeserializer`
> * `g.FrameSprite` の場合: `frameSpriteSurfaceDeserializer`
> * `g.Pane` の場合: `paneSurfaceDeserializer`

```javascript
const someSurface1 = // g.Surface生成処理
box2d.createBody(new g.Sprite({
  // ...
  src: someSurface1, // g.Surface 型
  tag: "sprite1"
}), /* b2Body */, /* b2FixtureDef */);

new Box2DSerializer({
  box2d, scene,
  // g.Sprite の src の g.Surface を復元する場合
  srpiteSurfaceDeserializer: (param) => {
    if (param.tag === "sprite1") {
      const sameSomeSurface1 = // someSurface1 と同じ生成処理（サイズ、ソースなどを揃えてください）
      return sameSomeSurface1;
    }
    if (param.tag === "sprite2") //...
  },
  // g.FrameSprite の src の g.Surface を復元する場合
  frameSpriteSurfaceDeserializer: (param) => {
    // 上記の例を参考にしてください
  },
  // g.Pane の backgroundImage の g.Surface を復元する場合
  paneSurfaceDeserializer: (param) => {
    // 上記の例を参考にしてください
  }
});
```

### `g.Label` を使用している場合

`g.Font` は復元されません。
`Box2DSerializer` の初期化時に復元する処理を指定してください。
`tag` などを活用して、対応するエンティティに対応した `g.Font` を作成してください。

```javascript
const someFont1 = // g.Font生成処理
box2d.createBody(new g.Label({
  // ...
  font: someFont1,
  tag: "label1"
}), /* b2Body */, /* b2FixtureDef */);
new Box2DSerializer({
  box2d, scene,
  labelFontDeserializer: (param) => {
    if (param.tag === "label1") {
      const sameSomeFont1 = // someFont1 と同じ生成処理（フォント設定を揃えてください）
      return sameSomeFont1;
    }
    if (param.tag === "label2") //...
  }
});
```


### `g.E` を継承元とする独自のクラスを使用している場合

下記の対応するAPIを使って、直列化処理と復元処理を登録してください。

* `g.E` 派生クラスの場合: `addDerivedEntitySerializer()`
* `g.FilledRect` 派生クラスの場合: `addDerivedFilledRectSerializer()`
* `g.Sprite` 派生クラスの場合: `addDerivedSpriteSerializer()`
* `g.FrameSprite` 派生クラスの場合: `addDerivedFrameSpriteSerializer()`
* `g.Label` 派生クラスの場合: `addDerivedLabelSerializer()`
* `g.Pane` 派生クラスの場合: `addDerivedPaneSerializer()`

> [!TIP]
> 定義する必要のある直列化処理は **自身が追加したパラメタのみ** です。継承元クラスのパラメタは自動で直列化・復元されます。

#### コンストラクタオブジェクトのパラメタを増やしたのみの場合

> [!TIP]
> Akashic Engine流のコンストラクタ引数を踏襲する場合、独自の復元処理の定義は不要です。

```typescript
class SimpleE extends g.E {
    readonly input1: string;
    constructor(param: g.EParameterObject & { input1: string }) {
        super(param);
        this.input1 = param.input1;
    }
}
box2d.createBody(new SimpleE({
  scene,
  parent: scene,
  input1: "dummy", // 追加パラメタ
}), /* b2Body */, /* b2FixtureDef */);

serializer.addDerivedEntitySerializer(
  SimpleE, // クラス名
  (obj: SimpleE) => ({ input1: obj.input1 }) // 直列化処理。コンストラクタ引数に必要な値を設定してください。
);
```

#### コンストラクタ引数を増やしているなど、独自の初期化処理が必要な場合

```typescript
class SimpleE extends g.E {
    readonly input1: string;
    constructor(param: g.EParameterObject, input1: string) {
        super(param);
        this.input1 = input1;
    }
}
box2d.createBody(new SimpleE({
  scene,
  parent: scene,
}, "dummy" /* 追加パラメタ */), /* b2Body */, /* b2FixtureDef */);

serializer.addDerivedEntitySerializer(
  SimpleE, // クラス名
  (obj: SimpleE) => ({ input1: obj.input1 }), // 直列化処理。復元に必要な情報を定義してください。
  (json) => new SimpleE(json, json.input1) // 復元処理。上記で定義したパラメタが json に設定されます。
);
```

## テスト (developer向け)

セットアップに下記コマンドが必要です

```bash
npm install
npm run test:e2e:setup
```

テスト実行

```bash
npm test
```

## License

* MIT License

## Author

* yasshi2525 (X)[https://x.com/yasshi2525]
