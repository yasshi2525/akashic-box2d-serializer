# CHANGELOG

## v0.2.1

* Bug Fixes
  * `g.FrameSprite` の再生中状態が復元されない問題を修正

## v0.2.0

* Bug Fixes
  * 衝突が発生した後、正しくシリアライズ・デシリアライズされない問題を修正

* Refactor
  * 参照解決方法が複雑になりすぎたため、 `box2dweb` に関するシリアライズ・デシリアライズ処理をリファクタリング
    * `Box2DSerializer` の API に変更なし (ただし、シリアライズスキーマ `Box2DBodiesParam` は大幅に変更)
    * Akashic Engine のエンティティ関係の処理は変更なし
    * `serializer**.ts` → `deserialize`, `merge`, `param`, `scan`, `serialize` に分割
    * `ObjectMapper` → `ObjectStore` (シリアライズ用) と `ObjectResolver` (デシリアライズ用) に分割
    * `RefParam`: `objectMapper.ts` → `serializerObject.ts`
    * Akashic Engine ビルトインクラスの識別用名称変数 `**Type`: `serializer**.ts` → `serialize/entityType.ts`

* Misc
  * シリアライズ環境の Akashic Engine (`g`) が minify されていてもシリアライズされるよう修正

## v0.1.6

* Bug Fixes
  * `b2Contact` 情報がシリアライズされないため、復元後の計算結果が異なる問題を修正

## v0.1.5

* Bug Fixes
  * `g` 系の名前がニコ生クライアントのみで minify されるため、名前のマッチングできない問題を修正

## v0.1.4

* Bug Fixes
  * `b2Body` に複数の `b2Fixture` を定義している場合、逆順に復元してしまう問題を修正
  * `EBody` を削除してしまうと、デシリアライズに失敗する問題を修正 (`v0.1.3`の修正不十分)
  * `EBody#id` が復元されない問題を修正

## v0.1.3

* Bug Fixes
  * `b2Fixture#GetShape()` が `null` を返すとき、シリアライズ・デシリアライズに失敗する問題を修正

## v0.1.2

* Bug Fixes
  * `b2DynamicTree` の `m_freeList` をデシリアライズ出来ない問題を修正

## v0.1.1

* Bug Fixes
  * シリアライズ・デシリアライズ後に要素を削除し、再度シリアライズ・デシリアライズするとエラーが発生する問題を修正
* Others
  * 前提 `@akashic-extension/akashic-box2d` を `3.1.3` 以上に変更

## v0.1.0

* 公開
