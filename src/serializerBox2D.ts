import { Box2D, Box2DWeb, EBody } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { EntityParam, EntitySerializer } from "./serializerEntity";
import { FilledRectParam, FilledRectSerializer } from "./serializerFilledRect";
import { ImageAssetSerializer } from "./serializerImageAsset";
import { SpriteParam, SpriteSerializer, SpriteSurfaceDeserializer } from "./serializerSprite";
import { FrameSpriteParam, FrameSpriteSerializer, FrameSpriteSurfaceDeserializer } from "./serializerFrameSprite";
import { LabelFontDeserializer, LabelParam, LabelSerializer } from "./serializerLabel";
import { PaneParam, PaneSerializer, PaneSurfaceDeserializer } from "./serializerPane";
import { PlainMatrixSerializer } from "./serializerMatrixPlain";
import { ObjectStore, toRefTypeName } from "./scan/store";
import { ComplexObjectStore } from "./scan/storeComplex";
import { BodyScanner } from "./scan/body";
import { FixtureScanner } from "./scan/fixture";
import { DynamicTreeNodeScanner } from "./scan/treeNode";
import { DynamicTreePairScanner } from "./scan/treePair";
import { DynamicTreeScanner } from "./scan/tree";
import { DynamicTreeBroadPhaseScanner } from "./scan/broadPhase";
import { ContactScanner } from "./scan/contact";
import { ContactEdgeScanner } from "./scan/contactEdge";
import { ContactManagerScanner } from "./scan/contactManager";
import { Box2DScanner } from "./scan/box2d";
import { EBodyScanner } from "./scan/ebody";
import { WorldScanner } from "./scan/world";
import { Vec2Serializer } from "./serialize/vec2";
import { Mat22Serializer } from "./serialize/mat22";
import { TransformSerializer } from "./serialize/transform";
import { SweepSerializer } from "./serialize/sweep";
import { BodySerializer, bodyType } from "./serialize/body";
import { CircleShapeSerializer, PolygonShapeSerializer, ShapeSerializer } from "./serialize/shape";
import { FilterDataSerializer } from "./serialize/filterData";
import { AABBSerializer } from "./serialize/aabb";
import { FixtureSerializer, fixtureType } from "./serialize/fixture";
import { DynamicTreeNodeSerializer, dynamicTreeNodeType } from "./serialize/treeNode";
import { DynamicTreePairSerializer, dynamicTreePairType } from "./serialize/treePair";
import { DynamicTreeSerializer } from "./serialize/tree";
import { DynamicTreeBroadPhaseSerializer } from "./serialize/broadPhase";
import { FeaturesSerializer } from "./serialize/features";
import { ContactIDSerializer } from "./serialize/contactID";
import { ManifoldPointSerializer } from "./serialize/manifoldPoint";
import { ManifoldSerializer } from "./serialize/manifold";
import { ContactSerializer, contactTypes, resolveContactTypeName } from "./serialize/contact";
import { ContactEdgeSerializer, contactEdgeType } from "./serialize/contactEdge";
import { ContactManagerSerializer } from "./serialize/contactManager";
import { EBodySerializer } from "./serialize/ebody";
import { WorldSerializer } from "./serialize/world";
import { ReferredStoreSerializer } from "./serialize/referred";
import { BaseBox2DSerializer, box2DType } from "./serialize/box2d";
import { Box2DParam } from "./param/box2d";
import { ObjectResolver } from "./deserialize/resolver";
import { ComplexObjectResolver } from "./deserialize/resolverComplex";
import { UnresolverChecker } from "./deserialize/checker";
import { Vec2Deserializer } from "./deserialize/vec2";
import { Mat22Deserializer } from "./deserialize/mat22";
import { SweepDeserializer } from "./deserialize/sweep";
import { TransformDeserializer } from "./deserialize/transform";
import { BodyDeserializer, BodyDeserializedPayload } from "./deserialize/body";
import { CircleShapeDeserializer, PolygonShapeDeserializer, ShapeDeserializer } from "./deserialize/shape";
import { FilterDataDeserializer } from "./deserialize/filterData";
import { AABBDeserializer } from "./deserialize/aabb";
import { FixtureDeserializer, FixtureDeserializedPayload } from "./deserialize/fixture";
import { DynamicTreeNodeDeserializer, DynamicTreeNodeDeserializedPayload } from "./deserialize/treeNode";
import { DynamicTreePairDeserializer } from "./deserialize/treePair";
import { DynamicTreeDeserializer } from "./deserialize/tree";
import { DynamicTreeBroadPhaseDeserializer } from "./deserialize/broadPhase";
import { FeaturesDeserializer } from "./deserialize/features";
import { ContactIDDeserializer } from "./deserialize/contactID";
import { ManifoldPointDeserializer } from "./deserialize/manifoldPoint";
import { ManifoldDeserializer } from "./deserialize/manifold";
import { ContactDeserializer, ContactDeserializedPayload } from "./deserialize/contact";
import { ContactEdgeDeserializer, ContactEdgeDeserializedPayload } from "./deserialize/contactEdge";
import { EBodyDeserializer } from "./deserialize/ebody";
import { ReferredStoreDeserializer } from "./deserialize/referred";
import { ContactManagerMerger } from "./merge/contactManager";
import { WorldMerger } from "./merge/world";
import { Box2DMerger } from "./merge/box2d";

/**
 * Box2D の EBody を復元可能な形式で直列化したJSONです。
 */
export type Box2DBodiesParam = ObjectDef<Box2DParam>;

export interface Box2DSerializerParameterObject {
    scene: g.Scene;
    box2d: Box2D;
    /**
     * Box2D に登録している g.Sprite の src に g.Surface を設定している場合必要。
     * 直列化したJSONをもとに g.Surface を復元する処理を定義してください。
     */
    srpiteSurfaceDeserializer?: SpriteSurfaceDeserializer;
    /**
     * Box2D に登録している g.FrameSprite の src に g.Surface を設定している場合必要。
     * 直列化したJSONをもとに g.Surface を復元する処理を定義してください。
     */
    frameSpriteSurfaceDeserializer?: FrameSpriteSurfaceDeserializer;
    /**
     * Box2D のエンティティに g.Label が存在する場合必要。
     * 直列化したJSONをもとに g.Font を復元する処理を定義してください。
     */
    labelFontDeserializer?: LabelFontDeserializer;
    /**
     * Box2D に登録している g.Pane の backgroundImage に g.Surface を設定している場合必要。
     * 直列化したJSONをもとに g.Surface を復元する処理を定義してください。
     */
    paneSurfaceDeserializer?: PaneSurfaceDeserializer;
}

/**
 * Box2D オブジェクトを直列化・復元可能にします
 */
export class Box2DSerializer {
    readonly _scene: g.Scene;
    readonly _box2d: Box2D;
    readonly _plainMatrixSerializer: PlainMatrixSerializer;
    readonly _entitySerializer: EntitySerializer;
    readonly _filledRectSerializer: FilledRectSerializer;
    readonly _imageAssetSerializer: ImageAssetSerializer;
    readonly _spriteSerializer: SpriteSerializer;
    readonly _frameSpriteSerializer: FrameSpriteSerializer;
    readonly _labelSerializer: LabelSerializer;
    readonly _paneSerializer: PaneSerializer;
    readonly _entitySerializers: EntitySerializer[];
    readonly _bodyStore: ObjectStore<Box2DWeb.Dynamics.b2Body>;
    readonly _fixtureStore: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;
    readonly _dynamicTreeNodeStore: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;
    readonly _dynamicTreePairStore: ObjectStore<Box2DWeb.Collision.b2DynamicTreePair>;
    readonly _contactStore: ComplexObjectStore<Box2DWeb.Dynamics.Contacts.b2Contact>;
    readonly _contactEdgeStore: ObjectStore<Box2DWeb.Dynamics.Contacts.b2ContactEdge>;
    readonly _bodyScnaner: BodyScanner;
    readonly _fixtureScanner: FixtureScanner;
    readonly _dynamicTreeNodeScanner: DynamicTreeNodeScanner;
    readonly _dynamicTreePairScanner: DynamicTreePairScanner;
    readonly _dynamicTreeScanner: DynamicTreeScanner;
    readonly _dynamicTreeBroadPhaseScanner: DynamicTreeBroadPhaseScanner;
    readonly _contactEdgeScanner: ContactEdgeScanner;
    readonly _contactScanner: ContactScanner;
    readonly _contactManagerScanner: ContactManagerScanner;
    readonly _ebodyScanner: EBodyScanner;
    readonly _worldScanner: WorldScanner;
    readonly _box2dScanner: Box2DScanner;
    readonly _vec2Serializer: Vec2Serializer;
    readonly _mat22Serializer: Mat22Serializer;
    readonly _transformSerializer: TransformSerializer;
    readonly _sweepSerializer: SweepSerializer;
    readonly _bodySerializer: BodySerializer;
    readonly _circleShapeSerializer: CircleShapeSerializer;
    readonly _polygonShapeSerializer: PolygonShapeSerializer;
    readonly _shapeSerializer: ShapeSerializer;
    readonly _filterDataSerializer: FilterDataSerializer;
    readonly _fixtureSerializer: FixtureSerializer;
    readonly _aabbSerializer: AABBSerializer;
    readonly _dynamicTreeNodeSerializer: DynamicTreeNodeSerializer;
    readonly _dynamicTreePairSerializer: DynamicTreePairSerializer;
    readonly _dynamicTreeSerializer: DynamicTreeSerializer;
    readonly _dynamicTreeBroadPhaseSerializer: DynamicTreeBroadPhaseSerializer;
    readonly _featuresSerializer: FeaturesSerializer;
    readonly _contactIDSerializer: ContactIDSerializer;
    readonly _manifoldPointSerializer: ManifoldPointSerializer;
    readonly _manifoldSerializer: ManifoldSerializer;
    readonly _contactSerializer: ContactSerializer;
    readonly _contactEdgeSerializer: ContactEdgeSerializer;
    readonly _contactManagerSerializer: ContactManagerSerializer;
    readonly _ebodySerializer: EBodySerializer;
    readonly _worldSerializer: WorldSerializer;
    readonly _referredStoreSerializer: ReferredStoreSerializer;
    readonly _box2dSerializer: BaseBox2DSerializer;
    readonly _unresolverChecker: UnresolverChecker;
    readonly _bodyResolver: ObjectResolver<BodyDeserializedPayload>;
    readonly _fixtureResolver: ObjectResolver<FixtureDeserializedPayload>;
    readonly _dynamicTreeNodeResolver: ObjectResolver<DynamicTreeNodeDeserializedPayload>;
    readonly _contactResolver: ComplexObjectResolver<ContactDeserializedPayload>;
    readonly _contactEdgeResolver: ObjectResolver<ContactEdgeDeserializedPayload>;
    readonly _vec2Deserializer: Vec2Deserializer;
    readonly _mat22Deserializer: Mat22Deserializer;
    readonly _transformDeserializer: TransformDeserializer;
    readonly _sweepDeserializer: SweepDeserializer;
    readonly _bodyDeserializer: BodyDeserializer;
    readonly _circleShapeDeserializer: CircleShapeDeserializer;
    readonly _polygonShapeDeserializer: PolygonShapeDeserializer;
    readonly _shapeDeserializer: ShapeDeserializer;
    readonly _filterDataDeserializer: FilterDataDeserializer;
    readonly _fixtureDeserializer: FixtureDeserializer;
    readonly _aabbDeserializer: AABBDeserializer;
    readonly _dynamicTreeNodeDeserializer: DynamicTreeNodeDeserializer;
    readonly _dynamicTreePairDeserializer: DynamicTreePairDeserializer;
    readonly _dynamicTreeDeserializer: DynamicTreeDeserializer;
    readonly _dynamicTreeBroadPhaseDeserializer: DynamicTreeBroadPhaseDeserializer;
    readonly _featuresDeserializer: FeaturesDeserializer;
    readonly _contactIDDeserializer: ContactIDDeserializer;
    readonly _manifoldPointDeserializer: ManifoldPointDeserializer;
    readonly _manifoldDeserializer: ManifoldDeserializer;
    readonly _contactDeserializer: ContactDeserializer;
    readonly _contactEdgeDeserializer: ContactEdgeDeserializer;
    readonly _contactManagerMerger: ContactManagerMerger;
    readonly _ebodyDeserializer: EBodyDeserializer;
    readonly _worldMerger: WorldMerger;
    readonly _box2dMerger: Box2DMerger;
    readonly _referredStoreDeserializer: ReferredStoreDeserializer;

    constructor(param: Box2DSerializerParameterObject) {
        this._scene = param.scene;
        this._box2d = param.box2d;
        this._entitySerializers = [];
        this._plainMatrixSerializer = new PlainMatrixSerializer();
        this._entitySerializer = new EntitySerializer({
            scene: this._scene,
            plainMatrixSerializer: this._plainMatrixSerializer,
            entitySerializers: this._entitySerializers,
        });
        this._filledRectSerializer = new FilledRectSerializer({
            scene: this._scene,
            plainMatrixSerializer: this._plainMatrixSerializer,
            entitySerializers: this._entitySerializers,
        });
        this._imageAssetSerializer = new ImageAssetSerializer({
            scene: this._scene,
        });
        this._spriteSerializer = new SpriteSerializer({
            scene: this._scene,
            imageAssetSerializer: this._imageAssetSerializer,
            plainMatrixSerializer: this._plainMatrixSerializer,
            surfaceDeserializer: param.srpiteSurfaceDeserializer,
            entitySerializers: this._entitySerializers,
        });
        this._frameSpriteSerializer = new FrameSpriteSerializer({
            scene: this._scene,
            imageAssetSerializer: this._imageAssetSerializer,
            plainMatrixSerializer: this._plainMatrixSerializer,
            surfaceDeserializer: param.frameSpriteSurfaceDeserializer,
            entitySerializers: this._entitySerializers,
        });
        this._labelSerializer = new LabelSerializer({
            scene: this._scene,
            plainMatrixSerializer: this._plainMatrixSerializer,
            fontDeserializer: param.labelFontDeserializer
                ?? (() => {
                    throw new Error("no fontDeserializer is defined in Box2DSerializer");
                }),
            entitySerializers: this._entitySerializers,
        });
        this._paneSerializer = new PaneSerializer({
            scene: this._scene,
            imageAssetSerializer: this._imageAssetSerializer,
            plainMatrixSerializer: this._plainMatrixSerializer,
            surfaceDeserializer: param.paneSurfaceDeserializer,
            entitySerializers: this._entitySerializers,
        });
        this._entitySerializers.push(this._entitySerializer);
        this._entitySerializers.push(this._filledRectSerializer);
        this._entitySerializers.push(this._spriteSerializer);
        this._entitySerializers.push(this._frameSpriteSerializer);
        this._entitySerializers.push(this._labelSerializer);
        this._entitySerializers.push(this._paneSerializer);
        this._bodyStore = new ObjectStore(bodyType);
        this._fixtureStore = new ObjectStore(fixtureType);
        this._dynamicTreeNodeStore = new ObjectStore(dynamicTreeNodeType);
        this._dynamicTreePairStore = new ObjectStore(dynamicTreePairType);
        this._contactStore = new ComplexObjectStore([...contactTypes], resolveContactTypeName);
        this._contactEdgeStore = new ObjectStore(contactEdgeType);
        this._bodyScnaner = new BodyScanner({
            self: this._bodyStore,
            fixture: () => this._fixtureScanner,
            contactEdge: () => this._contactEdgeScanner,
        });
        this._fixtureScanner = new FixtureScanner({
            self: this._fixtureStore,
            body: this._bodyScnaner,
            proxy: () => this._dynamicTreeNodeScanner,
        });
        this._dynamicTreeNodeScanner = new DynamicTreeNodeScanner({
            self: this._dynamicTreeNodeStore,
            fixture: this._fixtureScanner,
        });
        this._dynamicTreePairScanner = new DynamicTreePairScanner({
            self: this._dynamicTreePairStore,
            node: this._dynamicTreeNodeScanner,
        });
        this._dynamicTreeScanner = new DynamicTreeScanner({
            node: this._dynamicTreeNodeScanner,
        });
        this._dynamicTreeBroadPhaseScanner = new DynamicTreeBroadPhaseScanner({
            tree: this._dynamicTreeScanner,
            pair: this._dynamicTreePairScanner,
            node: this._dynamicTreeNodeScanner,
        });
        this._contactEdgeScanner = new ContactEdgeScanner({
            self: this._contactEdgeStore,
            body: this._bodyScnaner,
            contact: () => this._contactScanner,
        });
        this._contactScanner = new ContactScanner({
            self: this._contactStore,
            node: this._contactEdgeScanner,
            fixture: this._fixtureScanner,
        });
        this._contactManagerScanner = new ContactManagerScanner({
            broadPhase: this._dynamicTreeBroadPhaseScanner,
            contact: this._contactScanner,
        });
        this._ebodyScanner = new EBodyScanner({
            body: this._bodyScnaner,
        });
        this._worldScanner = new WorldScanner({
            body: this._bodyScnaner,
            contactManager: this._contactManagerScanner,
            contact: this._contactScanner,
        });
        this._box2dScanner = new Box2DScanner({
            world: this._worldScanner,
            ebody: this._ebodyScanner,
        });
        this._vec2Serializer = new Vec2Serializer();
        this._mat22Serializer = new Mat22Serializer({
            vec2: this._vec2Serializer,
        });
        this._transformSerializer = new TransformSerializer({
            vec2: this._vec2Serializer,
            mat22: this._mat22Serializer,
        });
        this._sweepSerializer = new SweepSerializer({
            vec2: this._vec2Serializer,
        });
        this._bodySerializer = new BodySerializer({
            vec2: this._vec2Serializer,
            sweep: this._sweepSerializer,
            transform: this._transformSerializer,
            self: this._bodyStore,
            fixture: this._fixtureStore,
            contactEdge: this._contactEdgeStore,
        });
        this._circleShapeSerializer = new CircleShapeSerializer();
        this._polygonShapeSerializer = new PolygonShapeSerializer({
            vec2: this._vec2Serializer,
        });
        this._shapeSerializer = new ShapeSerializer({
            circle: this._circleShapeSerializer,
            polygon: this._polygonShapeSerializer,
        });
        this._filterDataSerializer = new FilterDataSerializer();
        this._aabbSerializer = new AABBSerializer({
            vec2: this._vec2Serializer,
        });
        this._fixtureSerializer = new FixtureSerializer({
            aabb: this._aabbSerializer,
            filterData: this._filterDataSerializer,
            shape: this._shapeSerializer,
            self: this._fixtureStore,
            body: this._bodyStore,
            node: this._dynamicTreeNodeStore,
        });
        this._dynamicTreeNodeSerializer = new DynamicTreeNodeSerializer({
            aabb: this._aabbSerializer,
            self: this._dynamicTreeNodeStore,
            fixture: this._fixtureStore,
        });
        this._dynamicTreePairSerializer = new DynamicTreePairSerializer({
            node: this._dynamicTreeNodeStore,
        });
        this._dynamicTreeSerializer = new DynamicTreeSerializer({
            node: this._dynamicTreeNodeStore,
        });
        this._dynamicTreeBroadPhaseSerializer = new DynamicTreeBroadPhaseSerializer({
            tree: this._dynamicTreeSerializer,
            pair: this._dynamicTreePairSerializer,
            node: this._dynamicTreeNodeStore,
        });
        this._featuresSerializer = new FeaturesSerializer();
        this._contactIDSerializer = new ContactIDSerializer({
            features: this._featuresSerializer,
        });
        this._manifoldPointSerializer = new ManifoldPointSerializer({
            contactID: this._contactIDSerializer,
            vec2: this._vec2Serializer,
        });
        this._manifoldSerializer = new ManifoldSerializer({
            vec2: this._vec2Serializer,
            manifoldPoint: this._manifoldPointSerializer,
        });
        this._contactSerializer = new ContactSerializer({
            manifold: this._manifoldSerializer,
            self: this._contactStore,
            node: this._contactEdgeStore,
            fixture: this._fixtureStore,
        });
        this._contactEdgeSerializer = new ContactEdgeSerializer({
            self: this._contactEdgeStore,
            body: this._bodyStore,
            contact: this._contactStore,
        });
        this._contactManagerSerializer = new ContactManagerSerializer({
            contact: this._contactStore,
            broadPhase: this._dynamicTreeBroadPhaseSerializer,
        });
        this._ebodySerializer = new EBodySerializer({
            entities: this._entitySerializers,
            body: this._bodyStore,
        });
        this._worldSerializer = new WorldSerializer({
            contactManager: this._contactManagerSerializer,
            body: this._bodyStore,
            contact: this._contactStore,
        });
        this._referredStoreSerializer = new ReferredStoreSerializer({
            body: this._bodySerializer,
            fixture: this._fixtureSerializer,
            node: this._dynamicTreeNodeSerializer,
            contact: this._contactSerializer,
            contactEdge: this._contactEdgeSerializer,
            bodyStore: this._bodyStore,
            fixtureStore: this._fixtureStore,
            nodeStore: this._dynamicTreeNodeStore,
            contactStore: this._contactStore,
            contactEdgeStore: this._contactEdgeStore,
        });
        this._box2dSerializer = new BaseBox2DSerializer({
            ebody: this._ebodySerializer,
            world: this._worldSerializer,
            referred: this._referredStoreSerializer,
        });
        this._unresolverChecker = new UnresolverChecker();
        this._bodyResolver = new ObjectResolver(toRefTypeName(bodyType));
        this._fixtureResolver = new ObjectResolver(toRefTypeName(fixtureType));
        this._dynamicTreeNodeResolver = new ObjectResolver(toRefTypeName(dynamicTreeNodeType));
        this._contactResolver = new ComplexObjectResolver(contactTypes.map(t => toRefTypeName(t)));
        this._contactEdgeResolver = new ObjectResolver(toRefTypeName(contactEdgeType));
        this._vec2Deserializer = new Vec2Deserializer();
        this._sweepDeserializer = new SweepDeserializer({
            vec2: this._vec2Deserializer,
        });
        this._mat22Deserializer = new Mat22Deserializer({
            vec2: this._vec2Deserializer,
        });
        this._transformDeserializer = new TransformDeserializer({
            vec2: this._vec2Deserializer,
            mat22: this._mat22Deserializer,
        });
        this._sweepDeserializer = new SweepDeserializer({
            vec2: this._vec2Deserializer,
        });
        this._bodyDeserializer = new BodyDeserializer({
            checker: this._unresolverChecker,
            world: this._box2d.world,
            vec2: this._vec2Deserializer,
            sweep: this._sweepDeserializer,
            transform: this._transformDeserializer,
            self: this._bodyResolver,
            fixture: this._fixtureResolver,
            contactEdge: this._contactEdgeResolver,
        });
        this._circleShapeDeserializer = new CircleShapeDeserializer();
        this._polygonShapeDeserializer = new PolygonShapeDeserializer({
            vec2: this._vec2Deserializer,
        });
        this._shapeDeserializer = new ShapeDeserializer({
            circle: this._circleShapeDeserializer,
            polygon: this._polygonShapeDeserializer,
        });
        this._filterDataDeserializer = new FilterDataDeserializer();
        this._aabbDeserializer = new AABBDeserializer({
            vec2: this._vec2Deserializer,
        });
        this._fixtureDeserializer = new FixtureDeserializer({
            checker: this._unresolverChecker,
            aabb: this._aabbDeserializer,
            filterData: this._filterDataDeserializer,
            self: this._fixtureResolver,
            shape: this._shapeDeserializer,
            body: this._bodyResolver,
            node: this._dynamicTreeNodeResolver,
        });
        this._dynamicTreeNodeDeserializer = new DynamicTreeNodeDeserializer({
            checker: this._unresolverChecker,
            aabb: this._aabbDeserializer,
            self: this._dynamicTreeNodeResolver,
            fixture: this._fixtureResolver,
        });
        this._dynamicTreePairDeserializer = new DynamicTreePairDeserializer({
            checker: this._unresolverChecker,
            node: this._dynamicTreeNodeResolver,
        });
        this._dynamicTreeDeserializer = new DynamicTreeDeserializer({
            checker: this._unresolverChecker,
            node: this._dynamicTreeNodeResolver,
        });
        this._dynamicTreeBroadPhaseDeserializer = new DynamicTreeBroadPhaseDeserializer({
            checker: this._unresolverChecker,
            tree: this._dynamicTreeDeserializer,
            pair: this._dynamicTreePairDeserializer,
            node: this._dynamicTreeNodeResolver,
        });
        this._featuresDeserializer = new FeaturesDeserializer({
            checker: this._unresolverChecker,
        });
        this._contactIDDeserializer = new ContactIDDeserializer({
            features: this._featuresDeserializer,
        });
        this._manifoldPointDeserializer = new ManifoldPointDeserializer({
            contactID: this._contactIDDeserializer,
            vec2: this._vec2Deserializer,
        });
        this._manifoldDeserializer = new ManifoldDeserializer({
            vec2: this._vec2Deserializer,
            manifoldPoint: this._manifoldPointDeserializer,
        });
        this._contactDeserializer = new ContactDeserializer({
            checker: this._unresolverChecker,
            manifold: this._manifoldDeserializer,
            self: this._contactResolver,
            node: this._contactEdgeResolver,
            fixture: this._fixtureResolver,
        });
        this._contactEdgeDeserializer = new ContactEdgeDeserializer({
            checker: this._unresolverChecker,
            self: this._contactEdgeResolver,
            body: this._bodyResolver,
            contact: this._contactResolver,
        });
        this._contactManagerMerger = new ContactManagerMerger({
            checker: this._unresolverChecker,
            broadPhase: this._dynamicTreeBroadPhaseDeserializer,
            contact: this._contactResolver,
        });
        this._ebodyDeserializer = new EBodyDeserializer({
            checker: this._unresolverChecker,
            entities: this._entitySerializers,
            body: this._bodyResolver,
        });
        this._worldMerger = new WorldMerger({
            checker: this._unresolverChecker,
            contactManager: this._contactManagerMerger,
            body: this._bodyResolver,
            contact: this._contactResolver,
        });
        this._box2dMerger = new Box2DMerger({
            checker: this._unresolverChecker,
            world: this._worldMerger,
            ebody: this._ebodyDeserializer,
            body: this._bodyResolver,
        });
        this._referredStoreDeserializer = new ReferredStoreDeserializer({
            checker: this._unresolverChecker,
            body: this._bodyDeserializer,
            fixture: this._fixtureDeserializer,
            node: this._dynamicTreeNodeDeserializer,
            contact: this._contactDeserializer,
            contactEdge: this._contactEdgeDeserializer,
            bodyResolver: this._bodyResolver,
            fixtureResolver: this._fixtureResolver,
            nodeResolver: this._dynamicTreeNodeResolver,
            contactResolver: this._contactResolver,
            contactEdgeResolver: this._contactEdgeResolver,
        });
    }

    /**
     * 登録されたすべての {@link EBody} を復元可能な形式で直列化します。
     * @returns 直列化されたJSON
     */
    serializeBodies(): Box2DBodiesParam {
        this._box2dScanner.scan(this._box2d);
        const result = this._box2dSerializer.serialize(this._box2d);
        this._cleanupStore();
        return result;
    }

    /**
     * 直列化したJSONから {@link EBody} に復元します。
     * b2body, entity はそれぞれ b2World, シーン(親エンティティ) に登録された状態で返却されます。
     * @param json 直列化したJSON
     * @returns 復元された {@link EBody}
     */
    desrializeBodies(json: Box2DBodiesParam): EBody[] {
        if (json.type !== box2DType) {
            throw new Error(`invalid type. (expected = ${box2DType}, actual = ${json.type})`);
        }
        const { resolveAfter } = this._box2dMerger.merge(json, this._box2d);
        this._referredStoreDeserializer.deserialize(json.param.pool);
        resolveAfter();
        this._unresolverChecker.validate();
        this._cleanupResolver();
        return this._box2d.bodies;
    }

    /**
     * 自身で定義したエンティティシリアライザを登録します。
     * @param serializer エンティティシリアライザ
     */
    addEntitySerializer(serializer: EntitySerializer): void {
        this._entitySerializers.push(serializer);
    }

    /**
     * g.Eの派生クラスを直列化したり、復元できるようにします。
     * @template O 直列化対象の派生クラス型
     * @template J 派生クラス固有の直列化に必要な情報の型 (g.Eのパラメタは不要です)
     * @param classType 派生クラス型
     * @param derivedSerializer 派生クラス固有のパラメタをJSONに直列化する関数。g.Eのもつパラメタは直列化不要です。
     * @param derivedDeserializer 直列化されたJSONから派生クラスインスタンスを復元する関数。指定されなかった場合、コンストラクタ引数としてそのまま設定します。
     */
    addDerivedEntitySerializer<O extends g.E, J extends Record<string, unknown>>(
        classType: new (...args: any) => O,
        derivedSerializer: (object: O) => J,
        derivedDeserializer?: (json: J & g.EParameterObject) => O
    ): void {
        const derivedEntityType = classType.name;
        const derivedEntitySerializer = new class extends EntitySerializer implements ObjectSerializer<O, J & EntityParam> {
            override filter(objectType: string): boolean {
                return objectType === derivedEntityType;
            }

            override serialize(object: O): ObjectDef<J & EntityParam> {
                return {
                    type: derivedEntityType,
                    param: {
                        ...super.serialize(object).param,
                        ...derivedSerializer(object),
                    },
                };
            }

            override deserialize(json: ObjectDef<J & EntityParam>): O {
                const baseParamObj = this._deserializeParameterObject(json.param);
                const derivedParamObj = Object.keys(json.param)
                    .filter(key => !(key in baseParamObj))
                    .reduce((obj, key: keyof (J & g.EParameterObject)) => {
                        obj[key] = json.param[key];
                        return obj;
                    }, baseParamObj as J & g.EParameterObject);
                if (derivedDeserializer) {
                    return derivedDeserializer(derivedParamObj);
                }
                else {
                    return new classType(derivedParamObj);
                }
            }
        }({
            scene: this._scene,
            plainMatrixSerializer: this._plainMatrixSerializer,
            entitySerializers: this._entitySerializers,
        });
        this.addEntitySerializer(derivedEntitySerializer);
    }

    /**
     * g.FilledRectの派生クラスを直列化したり、復元できるようにします。
     * @template O 直列化対象の派生クラス型
     * @template J 派生クラス固有の直列化に必要な情報の型 (g.FilledRectのパラメタは不要です)
     * @param classType 派生クラス型
     * @param derivedSerializer 派生クラス固有のパラメタをJSONに直列化する関数。g.FilledRectのもつパラメタは直列化不要です。
     * @param derivedDeserializer 直列化されたJSONから派生クラスインスタンスを復元する関数。指定されなかった場合、コンストラクタ引数としてそのまま設定します。
     */
    addDerivedFilledRectSerializer<O extends g.FilledRect, J extends Record<string, unknown>>(
        classType: new (...args: any) => O,
        derivedSerializer: (object: O) => J,
        derivedDeserializer?: (json: J & g.FilledRectParameterObject) => O
    ): void {
        const derivedFilledRectType = classType.name;
        const derivedFilledRectSerializer = new class extends FilledRectSerializer implements ObjectSerializer<O, J & FilledRectParam> {
            override filter(objectType: string): boolean {
                return objectType === derivedFilledRectType;
            }

            override serialize(object: O): ObjectDef<J & FilledRectParam> {
                return {
                    type: derivedFilledRectType,
                    param: {
                        ...super.serialize(object).param,
                        ...derivedSerializer(object),
                    },
                };
            }

            override deserialize(json: ObjectDef<J & FilledRectParam>): O {
                const baseParamObj = this._deserializeParameterObject(json.param);
                const derivedParamObj = Object.keys(json.param)
                    .filter(key => !(key in baseParamObj))
                    .reduce((obj, key: keyof (J & g.FilledRectParameterObject)) => {
                    // 謎: これをいれないとエラーになる。 J[cssColor] を参照しようとするらしい。
                        if (key === "cssColor") {
                            obj.cssColor = json.param.cssColor;
                        }
                        else {
                            obj[key] = json.param[key];
                        }
                        return obj;
                    }, baseParamObj as J & g.FilledRectParameterObject);
                if (derivedDeserializer) {
                    return derivedDeserializer(derivedParamObj);
                }
                else {
                    return new classType(derivedParamObj);
                }
            }
        }({
            scene: this._scene,
            plainMatrixSerializer: this._plainMatrixSerializer,
            entitySerializers: this._entitySerializers,
        });
        this.addEntitySerializer(derivedFilledRectSerializer);
    }

    /**
     * g.Spriteの派生クラスを直列化したり、復元できるようにします。
     * @template O 直列化対象の派生クラス型
     * @template J 派生クラス固有の直列化に必要な情報の型 (g.Spriteのパラメタは不要です)
     * @param classType 派生クラス型
     * @param derivedSerializer 派生クラス固有のパラメタをJSONに直列化する関数。g.Spriteのもつパラメタは直列化不要です。
     * @param surfaceDeserializer src に g.Surface を設定している場合必要。直列化したJSONをもとに g.Surface を復元する処理を定義してください。
     * @param derivedDeserializer 直列化されたJSONから派生クラスインスタンスを復元する関数。指定されなかった場合、コンストラクタ引数としてそのまま設定します。
     */
    addDerivedSpriteSerializer<O extends g.Sprite, J extends Record<string, unknown>>(
        classType: new (...args: any) => O,
        derivedSerializer: (object: O) => J,
        surfaceDeserializer?: SpriteSurfaceDeserializer,
        derivedDeserializer?: (json: J & g.SpriteParameterObject) => O
    ): void {
        const derivedSpriteType = classType.name;
        const derivedSpriteSerializer = new class extends SpriteSerializer implements ObjectSerializer<O, J & SpriteParam> {
            override filter(objectType: string): boolean {
                return objectType === derivedSpriteType;
            }

            override serialize(object: O): ObjectDef<J & SpriteParam> {
                return {
                    type: derivedSpriteType,
                    param: {
                        ...super.serialize(object).param,
                        ...derivedSerializer(object),
                    },
                };
            }

            override deserialize(json: ObjectDef<J & SpriteParam>): O {
                const baseParamObj = this._deserializeParameterObject(json.param);
                const derivedParamObj = Object.keys(json.param)
                    .filter(key => !(key in baseParamObj))
                    .reduce((obj, key: keyof (J & g.SpriteParameterObject)) => {
                        obj[key] = json.param[key];
                        return obj;
                    }, baseParamObj as J & g.SpriteParameterObject);
                if (derivedDeserializer) {
                    return derivedDeserializer(derivedParamObj);
                }
                else {
                    return new classType(derivedParamObj);
                }
            }
        }({
            scene: this._scene,
            imageAssetSerializer: this._imageAssetSerializer,
            plainMatrixSerializer: this._plainMatrixSerializer,
            surfaceDeserializer,
            entitySerializers: this._entitySerializers,
        });
        this.addEntitySerializer(derivedSpriteSerializer);
    }

    /**
     * g.FrameSpriteの派生クラスを直列化したり、復元できるようにします。
     * @template O 直列化対象の派生クラス型
     * @template J 派生クラス固有の直列化に必要な情報の型 (g.FrameSpriteのパラメタは不要です)
     * @param classType 派生クラス型
     * @param derivedSerializer 派生クラス固有のパラメタをJSONに直列化する関数。g.FrameSpriteのもつパラメタは直列化不要です。
     * @param surfaceDeserializer src に g.Surface を設定している場合必要。直列化したJSONをもとに g.Surface を復元する処理を定義してください。
     * @param derivedDeserializer 直列化されたJSONから派生クラスインスタンスを復元する関数。指定されなかった場合、コンストラクタ引数としてそのまま設定します。
     */
    addDerivedFrameSpriteSerializer<O extends g.FrameSprite, J extends Record<string, unknown>>(
        classType: new (...args: any) => O,
        derivedSerializer: (object: O) => J,
        surfaceDeserializer?: FrameSpriteSurfaceDeserializer,
        derivedDeserializer?: (json: J & g.FrameSpriteParameterObject) => O
    ): void {
        const derivedFrameSpriteType = classType.name;
        const derivedSpriteSerializer = new class extends FrameSpriteSerializer implements ObjectSerializer<O, J & FrameSpriteParam> {
            override filter(objectType: string): boolean {
                return objectType === derivedFrameSpriteType;
            }

            override serialize(object: O): ObjectDef<J & FrameSpriteParam> {
                return {
                    type: derivedFrameSpriteType,
                    param: {
                        ...super.serialize(object).param,
                        ...derivedSerializer(object),
                    },
                };
            }

            override deserialize(json: ObjectDef<J & FrameSpriteParam>): O {
                const baseParamObj = this._deserializeParameterObject(json.param);
                const derivedParamObj = Object.keys(json.param)
                    .filter(key => !(key in baseParamObj))
                    .reduce((obj, key: keyof (J & g.FrameSpriteParameterObject)) => {
                        obj[key] = json.param[key];
                        return obj;
                    }, baseParamObj as J & g.FrameSpriteParameterObject);
                if (derivedDeserializer) {
                    const object = derivedDeserializer(derivedParamObj);
                    if (json.param.hasTimer) {
                        object.start();
                    }
                    return object;
                }
                else {
                    const object = new classType(derivedParamObj);
                    if (json.param.hasTimer) {
                        object.start();
                    }
                    return object;
                }
            }
        }({
            scene: this._scene,
            imageAssetSerializer: this._imageAssetSerializer,
            plainMatrixSerializer: this._plainMatrixSerializer,
            surfaceDeserializer,
            entitySerializers: this._entitySerializers,
        });
        this.addEntitySerializer(derivedSpriteSerializer);
    }

    /**
     * g.Labelの派生クラスを直列化したり、復元できるようにします。
     * @template O 直列化対象の派生クラス型
     * @template J 派生クラス固有の直列化に必要な情報の型 (g.Labelのパラメタは不要です)
     * @param classType 派生クラス型
     * @param derivedSerializer 派生クラス固有のパラメタをJSONに直列化する関数。g.Labelのもつパラメタは直列化不要です。
     * @param fontDeserializer 直列化したJSONをもとに g.Label を復元する処理を定義してください。
     * @param derivedDeserializer 直列化されたJSONから派生クラスインスタンスを復元する関数。指定されなかった場合、コンストラクタ引数としてそのまま設定します。
     */
    addDerivedLabelSerializer<O extends g.Label, J extends Record<string, unknown | Boolean>>(
        classType: new (...args: any) => O,
        derivedSerializer: (object: O) => J,
        fontDeserializer: LabelFontDeserializer,
        derivedDeserializer?: (json: J & g.LabelParameterObject) => O
    ): void {
        const derivedLabelType = classType.name;
        const derivedLabelSerializer = new class extends LabelSerializer implements ObjectSerializer<O, J & LabelParam> {
            override filter(objectType: string): boolean {
                return objectType === derivedLabelType;
            }

            override serialize(object: O): ObjectDef<J & LabelParam> {
                return {
                    type: derivedLabelType,
                    param: {
                        ...super.serialize(object).param,
                        ...derivedSerializer(object),
                    },
                };
            }

            override deserialize(json: ObjectDef<J & LabelParam>): O {
                const baseParamObj = this._deserializeParameterObject(json.param);
                const derivedParamObj = Object.keys(json.param)
                    .filter(key => !(key in baseParamObj))
                    .reduce((obj, key: keyof (J & g.LabelParameterObject)) => {
                        obj[key] = json.param[key];
                        return obj;
                    }, baseParamObj as J & g.LabelParameterObject);
                if (derivedDeserializer) {
                    return derivedDeserializer(derivedParamObj);
                }
                else {
                    return new classType(derivedParamObj);
                }
            }
        }({
            scene: this._scene,
            plainMatrixSerializer: this._plainMatrixSerializer,
            fontDeserializer,
            entitySerializers: this._entitySerializers,
        });
        this.addEntitySerializer(derivedLabelSerializer);
    }

    /**
     * g.Paneの派生クラスを直列化したり、復元できるようにします。
     * @template O 直列化対象の派生クラス型
     * @template J 派生クラス固有の直列化に必要な情報の型 (g.Paneのパラメタは不要です)
     * @param classType 派生クラス型
     * @param derivedSerializer 派生クラス固有のパラメタをJSONに直列化する関数。g.Paneのもつパラメタは直列化不要です。
     * @param surfaceDeserializer backgroundImage に g.Surface を設定している場合必要。直列化したJSONをもとに g.Surface を復元する処理を定義してください。
     * @param derivedDeserializer 直列化されたJSONから派生クラスインスタンスを復元する関数。指定されなかった場合、コンストラクタ引数としてそのまま設定します。
     */
    addDerivedPaneSerializer<O extends g.Pane, J extends Record<string, unknown | Boolean>>(
        classType: new (...args: any) => O,
        derivedSerializer: (object: O) => J,
        surfaceDeserializer?: PaneSurfaceDeserializer,
        derivedDeserializer?: (json: J & g.PaneParameterObject) => O
    ): void {
        const derivedPaneType = classType.name;
        const derivedPaneSerializer = new class extends PaneSerializer implements ObjectSerializer<O, J & PaneParam> {
            override filter(objectType: string): boolean {
                return objectType === derivedPaneType;
            }

            override serialize(object: O): ObjectDef<J & PaneParam> {
                return {
                    type: derivedPaneType,
                    param: {
                        ...super.serialize(object).param,
                        ...derivedSerializer(object),
                    },
                };
            }

            override deserialize(json: ObjectDef<J & PaneParam>): O {
                const baseParamObj = this._deserializeParameterObject(json.param);
                const derivedParamObj = Object.keys(json.param)
                    .filter(key => !(key in baseParamObj))
                    .reduce((obj, key: keyof (J & g.PaneParameterObject)) => {
                        obj[key] = json.param[key];
                        return obj;
                    }, baseParamObj as J & g.PaneParameterObject);
                if (derivedDeserializer) {
                    return derivedDeserializer(derivedParamObj);
                }
                else {
                    return new classType(derivedParamObj);
                }
            }
        }({
            scene: this._scene,
            imageAssetSerializer: this._imageAssetSerializer,
            plainMatrixSerializer: this._plainMatrixSerializer,
            surfaceDeserializer,
            entitySerializers: this._entitySerializers,
        });
        this.addEntitySerializer(derivedPaneSerializer);
    }

    /**
     * 繰り返し serialize すると、前回の参照が残ってしまって削除された要素を参照する可能性がある。
     * そのため、 serialize ごとにキャッシュを削除する。
     */
    _cleanupStore(): void {
        this._bodyStore.clear();
        this._fixtureStore.clear();
        this._dynamicTreeNodeStore.clear();
        this._dynamicTreePairStore.clear();
        this._contactStore.clear();
        this._contactEdgeStore.clear();
        this._dynamicTreeScanner.clear();
        this._dynamicTreeBroadPhaseScanner.clear();
        this._contactManagerScanner.clear();
        this._worldScanner.clear();
        this._box2dScanner.clear();
    }

    /**
     * 繰り返し deserialize すると、前回の参照が残ってしまって削除された要素を参照する可能性がある。
     * そのため、 deserialize ごとにキャッシュを削除する。
     */
    _cleanupResolver(): void {
        this._bodyResolver.clear();
        this._fixtureResolver.clear();
        this._dynamicTreeNodeResolver.clear();
        this._contactResolver.clear();
        this._contactEdgeResolver.clear();
        this._unresolverChecker.clear();
    }
}
