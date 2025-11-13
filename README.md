# akashic-box2d-serializer (experimental)

[@akashic-extension/akashic-box2d](https://github.com/akashic-games/akashic-box2d/) にシリアライズ機能を追加するプラグインです。
Box2Dオブジェクトを [Akashic Engine](https://akashic-games.github.io/) のスナップショットに格納できるようにします。
また、スナップショットからBox2Dオブジェクトを復元できます。

> [!WARNING]
> Box2Dの全機能に対応していません

## シリアライズ可能な要素

* `b2PolygonShape`
* `b2CircleShape`
* `b2FixtureDef`
* `b2BodyDef`
* `b2Controller`

> [!WARNING]
> `b2World` の設定値 (`b2Joint`など) の直列化機能はすべて未実装です。

> [!CAUTION]
> `userData` にシリアライズできない値を格納しないでください。

## 適用方法

作成した `Box2D` インスタンスに `patchBox2DSerialize(box2d)` を適用します。

```typescript
import { Box2D } from "@akashic-extension/akashic-box2d";
import { patchBox2DSerializer } from "@yasshi2525/akashic-box2d-serializer"

const box2d = new Box2D({ /* ... */ });
patchBox2DSerializer(box2d);
```

`tsconfig.json` の `compilerOptions.types` に `@yasshi2525/akashic-box2d-serializer` を追加し、追加された Box2D のAPIの型情報を TypeScript が認識できるようにします。

```json
{
  "compilerOptions": {
    "types": ["@yasshi2525/akashic-box2d-serializer", /* ... */]
  }
}
```

### 派生 g.E クラスのシリアライズ方法

`createEntitySerializer()` を使って派生クラスのシリアライザを定義し、
`Box2D#addObjectSerializer()` で登録してください。

> [!WARNING]
> `g.E` の以下パラメタはシリアライズ対象外です。復元時にユーザー側で作成してください。
>
> * `onMessage`
> * `onPointDown`
> * `onPointMove`
> * `onPointUp`
> * `onUpdate`
> * `shaderProgram`


> [!CAUTION]
> `tag` にシリアライズできない値を格納しないでください。
> 親子関係を生成後に変更すると、復元できない場合があります。

## License

* MIT License

## Author

* yasshi2525 (X)[https://x.com/yasshi2525]
