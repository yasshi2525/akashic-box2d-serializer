import { Box2D, Box2DWeb, EBody } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { EBodyParam, EBodySerializer } from "./serializerEbody";
import { CircleShapeSerializer } from "./serializerShapeCircle";
import { PolygonShapeSerializer } from "./serializerShapePolygon";
import { ShapeSerializer } from "./serializerShape";
import { FixtureParam, fixtureRefType, FixtureSerializer } from "./serializerFixture";
import { bodyRefType, BodySerializer } from "./serializerBody";
import { EntityParam, EntitySerializer } from "./serializerEntity";
import { FilledRectParam, FilledRectSerializer } from "./serializerFilledRect";
import { ImageAssetSerializer } from "./serializerImageAsset";
import { SpriteParam, SpriteSerializer, SpriteSurfaceDeserializer } from "./serializerSprite";
import { FrameSpriteParam, FrameSpriteSerializer, FrameSpriteSurfaceDeserializer } from "./serializerFrameSprite";
import { LabelFontDeserializer, LabelParam, LabelSerializer } from "./serializerLabel";
import { PaneParam, PaneSerializer, PaneSurfaceDeserializer } from "./serializerPane";
import { FilterDataSerializer } from "./serializerFilterData";
import { Vec2Serializer } from "./serializerVec2";
import { SweepSerializer } from "./serializerSweep";
import { PlainMatrixSerializer } from "./serializerMatrixPlain";
import { Mat22Serializer } from "./serializerMat22";
import { TransformSerializer } from "./serializerTransform";
import { dynamicTreeNodeRefType, DynamicTreeNodeSerializer } from "./serializerTreeNodeDynamic";
import { AABBSerializer } from "./serializerAABB";
import { DynamicTreeParam, DynamicTreeSerializer } from "./serializerTreeDynamic";
import { ObjectMapper } from "./objectMapper";
import { toFixture } from "./converterFixture";
import { ContactParam, ContactSerializer } from "./serializerContact";
import { ContactEdgeParam, contactEdgeRefType, ContactEdgeSerializer, contactEdgeType } from "./serializerContactEdge";
import { ContactObjectMapper } from "./objectMapperContact";
import { ManifoldPointSerializer } from "./serializerManifoldPoint";
import { ManifoldSerializer } from "./serializerManifold";
import { ContactIDSerializer } from "./serializerContactID";
import { FeaturesSerializer } from "./serializerFeatures";

/**
 * Box2D の EBody を復元可能な形式で直列化したJSONです。
 */
export interface Box2DBodiesParam {
    bodies: ObjectDef<EBodyParam>[];
    fixtures: ObjectDef<FixtureParam>[];
    contactManager: {
        broadPhase: {
            tree: ObjectDef<DynamicTreeParam>;
        };
    };
    contactList: {
        contacts: ObjectDef<ContactParam>[];
        contactEdges: ObjectDef<ContactEdgeParam>[];
    };
    ebodyCount: number;
}

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
    readonly _fixtureMapper: ObjectMapper<Box2DWeb.Dynamics.b2Fixture>;
    readonly _fixtureDefMapper: ObjectMapper<Box2DWeb.Dynamics.b2FixtureDef>;
    readonly _dynamicTreeNodeMapper: ObjectMapper<Box2DWeb.Collision.b2DynamicTreeNode>;
    readonly _bodyMapper: ObjectMapper<Box2DWeb.Dynamics.b2Body>;
    readonly _contactMapper: ContactObjectMapper;
    readonly _contactEdgeMapper: ObjectMapper<Box2DWeb.Dynamics.Contacts.b2ContactEdge>;
    readonly _circleShapeSerializer: CircleShapeSerializer;
    readonly _vec2serializer: Vec2Serializer;
    readonly _polygonShapeSerializer: PolygonShapeSerializer;
    readonly _shapeSerializer: ShapeSerializer;
    readonly _filterDataSerializer: FilterDataSerializer;
    readonly _AABBSerializer: AABBSerializer;
    readonly _dynamicTreeNodeSerializer: DynamicTreeNodeSerializer;
    readonly _dynamicTreeSerializer: DynamicTreeSerializer;
    readonly _fixtureSerializer: FixtureSerializer;
    readonly _bodySerializer: BodySerializer;
    readonly _plainMatrixSerializer: PlainMatrixSerializer;
    readonly _entitySerializer: EntitySerializer;
    readonly _filledRectSerializer: FilledRectSerializer;
    readonly _imageAssetSerializer: ImageAssetSerializer;
    readonly _spriteSerializer: SpriteSerializer;
    readonly _frameSpriteSerializer: FrameSpriteSerializer;
    readonly _labelSerializer: LabelSerializer;
    readonly _paneSerializer: PaneSerializer;
    readonly _entitySerializers: EntitySerializer[];
    readonly _sweepSerializer: SweepSerializer;
    readonly _mat22Serializer: Mat22Serializer;
    readonly _transformSerializer: TransformSerializer;
    readonly _eBodySerializer: EBodySerializer;
    readonly _featuresSeriazlier: FeaturesSerializer;
    readonly _contactIDSerializer: ContactIDSerializer;
    readonly _manifoldPointSerializer: ManifoldPointSerializer;
    readonly _manifoldSerializer: ManifoldSerializer;
    readonly _contactEdgeSerializer: ContactEdgeSerializer;
    readonly _contactSerializer: ContactSerializer;

    constructor(param: Box2DSerializerParameterObject) {
        this._scene = param.scene;
        this._box2d = param.box2d;
        this._fixtureMapper = new ObjectMapper({
            refTypeName: fixtureRefType,
        });
        this._fixtureDefMapper = new ObjectMapper({
            refTypeName: fixtureRefType,
        });
        this._dynamicTreeNodeMapper = new ObjectMapper({
            refTypeName: dynamicTreeNodeRefType,
        });
        this._bodyMapper = new ObjectMapper({
            refTypeName: bodyRefType,
        });
        this._contactMapper = new ContactObjectMapper();
        this._contactEdgeMapper = new ObjectMapper({
            refTypeName: contactEdgeRefType,
        });
        this._circleShapeSerializer = new CircleShapeSerializer();
        this._vec2serializer = new Vec2Serializer();
        this._polygonShapeSerializer = new PolygonShapeSerializer({
            vec2Serializer: this._vec2serializer,
        });
        this._shapeSerializer = new ShapeSerializer({
            circleShapeSerializer: this._circleShapeSerializer,
            polygonShapeSerializer: this._polygonShapeSerializer,
        });
        this._filterDataSerializer = new FilterDataSerializer();
        this._AABBSerializer = new AABBSerializer({
            vec2Serializer: this._vec2serializer,
        });
        this._dynamicTreeNodeSerializer = new DynamicTreeNodeSerializer({
            aabbSerializer: this._AABBSerializer,
            selfMapper: this._dynamicTreeNodeMapper,
            userDataMapper: this._fixtureMapper,
        });
        this._dynamicTreeSerializer = new DynamicTreeSerializer({
            nodeSerializer: this._dynamicTreeNodeSerializer,
            nodeMapper: this._dynamicTreeNodeMapper,
        });
        this._fixtureSerializer = new FixtureSerializer({
            filterDataSerializer: this._filterDataSerializer,
            shapeSerializer: this._shapeSerializer,
            selfMapper: this._fixtureMapper,
        });
        this._bodySerializer = new BodySerializer({
            vec2Serializer: this._vec2serializer,
            fixtureMapper: this._fixtureMapper,
            selfMapper: this._bodyMapper,
        });
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
        this._sweepSerializer = new SweepSerializer({
            vec2Serializer: this._vec2serializer,
        });
        this._mat22Serializer = new Mat22Serializer({
            vec2Serializer: this._vec2serializer,
        });
        this._transformSerializer = new TransformSerializer({
            vec2Serializer: this._vec2serializer,
            mat22Serializer: this._mat22Serializer,
        });
        this._eBodySerializer = new EBodySerializer({
            box2d: this._box2d,
            bodySerializer: this._bodySerializer,
            fixtureSerializer: this._fixtureSerializer,
            sweepSerializer: this._sweepSerializer,
            vec2Serializer: this._vec2serializer,
            transformSerializer: this._transformSerializer,
            entitySerializers: this._entitySerializers,
            fixtureMapper: this._fixtureMapper,
            fixtureDefMapper: this._fixtureDefMapper,
            bodyMapper: this._bodyMapper,
        });
        this._featuresSeriazlier = new FeaturesSerializer();
        this._contactIDSerializer = new ContactIDSerializer({
            featuresSerializer: this._featuresSeriazlier,
        });
        this._manifoldPointSerializer = new ManifoldPointSerializer({
            contactIDSerializer: this._contactIDSerializer,
            vec2Serializer: this._vec2serializer,
        });
        this._manifoldSerializer = new ManifoldSerializer({
            vec2serializer: this._vec2serializer,
            manifoldPointSerializer: this._manifoldPointSerializer,
        });
        this._contactSerializer = new ContactSerializer({
            manifoldSerialilzer: this._manifoldSerializer,
            contactEdgeMapper: this._contactEdgeMapper,
            fixtureMapper: this._fixtureMapper,
            selfMapper: this._contactMapper,
        });
        this._contactEdgeSerializer = new ContactEdgeSerializer({
            contactMapper: this._contactMapper,
            selfMapper: this._contactEdgeMapper,
            bodyMapper: this._bodyMapper,
        });
    }

    /**
     * 登録されたすべての {@link EBody} を復元可能な形式で直列化します。
     * @returns 直列化されたJSON
     */
    serializeBodies(): Box2DBodiesParam {
        const bodies = this._box2d.bodies.map(ebody => this._eBodySerializer.serialize(ebody));
        const tree = this._dynamicTreeSerializer.serialize(this._box2d.world.m_contactManager.m_broadPhase.m_tree);
        const fixtures = this._fixtureMapper.objects().map(f => this._fixtureSerializer.serialize(f));
        const contacts: ObjectDef<ContactParam>[] = [];
        for (let c = this._box2d.world.GetContactList(); c; c = c.GetNext()) {
            contacts.push(this._contactSerializer.serialize(c));
        }
        const contactEdges = this._contactEdgeMapper.objects().map(e => this._contactEdgeSerializer.serialize(e));
        const result: Box2DBodiesParam = {
            bodies,
            fixtures,
            contactManager: {
                broadPhase: {
                    tree,
                },
            },
            contactList: {
                contacts,
                contactEdges,
            },
            ebodyCount: (this._box2d as any)._createBodyCount,
        };
        this._cleanup();
        return result;
    }

    /**
     * 直列化したJSONから {@link EBody} に復元します。
     * b2body, entity はそれぞれ b2World, シーン(親エンティティ) に登録された状態で返却されます。
     * @param json 直列化したJSON
     * @returns 復元された {@link EBody}
     */
    desrializeBodies(json: Box2DBodiesParam): EBody[] {
        for (const def of json.fixtures) {
            const f = this._fixtureSerializer.deserialize(def);
            this._fixtureDefMapper.referStrict(def.param.self.param.id, f);
        }
        const bodies = json.bodies.map(obj => this._eBodySerializer.deserialize(obj));
        // m_tree.m_freeList.userData に入っているような fixture は b2body から削除されているため上記では _fixtureMapper に登録されない
        for (const [id, def] of this._fixtureDefMapper._refToObject.entries()) {
            if (!this._fixtureMapper._refToObject.get(id)) {
                this._fixtureMapper.referStrict(id, toFixture(def));
            }
        }
        this._box2d.world.m_contactManager.m_broadPhase.m_tree = this._dynamicTreeSerializer.deserialize(json.contactManager.broadPhase.tree);
        for (const def of json.contactList.contactEdges) {
            const e = this._contactEdgeSerializer.deserialize(def);
            this._contactEdgeMapper.referStrict(def.param.self.param.id, e);
        }
        for (const def of json.contactList.contactEdges) {
            const e = this._contactEdgeMapper.resolve(def.param.self);
            if (def.param.next) {
                e.next = this._contactEdgeMapper.resolve(def.param.next);
            }
            if (def.param.prev) {
                e.prev = this._contactEdgeMapper.resolve(def.param.prev);
            }
        }
        for (const def of json.contactList.contacts) {
            const c = this._contactSerializer.deserialize(def);
            c.m_nodeA.contact = c;
            c.m_nodeB.contact = c;
            this._contactMapper.referStrict(def.param.self.param.id, c);
        }
        for (const def of json.contactList.contacts) {
            const c = this._contactMapper.resolve(def.param.self);
            if (def.param.next) {
                c.m_next = this._contactMapper.resolve(def.param.next);
            }
            if (def.param.prev) {
                c.m_prev = this._contactMapper.resolve(def.param.prev);
            }
        }
        this._box2d.world.m_contactCount = json.contactList.contacts.length;
        (this._box2d as any)._createBodyCount = json.ebodyCount;
        this._cleanup();
        return bodies;
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
     * 繰り返し serialize/deserialize すると、前回の参照が残ってしまって削除された要素を参照する可能性がある。
     * そのため、 serialize/deserialize ごとにキャッシュを削除する。
     */
    _cleanup(): void {
        this._fixtureMapper.clear();
        this._fixtureDefMapper.clear();
        this._dynamicTreeNodeMapper.clear();
        this._bodyMapper.clear();
        this._contactMapper.clear();
        this._contactEdgeMapper.clear();
    }
}
