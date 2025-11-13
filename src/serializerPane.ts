import { EntityParam, EntitySerializer, EntitySerializerParameterObject } from "./serializerEntity";
import { ImageAssetParam, ImageAssetSerializer } from "./serializerImageAsset";
import { ObjectDef, ObjectSerializer } from "./serializerObject";

/**
 * g.Pane オブジェクト型の識別子
 */
export const paneType = g.Pane.constructor.name;

/**
 * g.Pane オブジェクトを復元可能な形式で直列化したJSONです。
 * backgroundImage は g.ImageAsset の場合のみ直列化します。
 * backgroundImage が g.Surface の場合は直列化されず、ユーザー自身で復元処理を定義する必要があります。
 * backgroundEffector は非推奨のため直列化しません。
 */
export interface PaneParam extends EntityParam, Required<Omit<g.PaneParameterObject, keyof g.EParameterObject | "backgroundImage" | "backgroundEffector">> {
    backgroundImage: ObjectDef<ImageAssetParam> | undefined;
}

/**
 * 直列化した g.Pane のJSONから、対応する g.Surface を作成する関数。
 * @param param 復元対象の g.Pane オブジェクト情報
 * @returns backgroundImage に設定される g.Surface。不要な場合は undefined
 */
export type PaneSurfaceDeserializer = (param: PaneParam) => g.Surface | undefined;

export interface PaneSerializerParameterObject extends EntitySerializerParameterObject {
    /**
     * backgroundImage が g.ImageAsset の際必要。
     */
    imageAssetSerializer?: ImageAssetSerializer;
    /**
     * backgroundImage が g.Surface の際、 g.Pane 定義に応じて対応する g.Surface を構築する関数
     */
    surfaceDeserializer?: PaneSurfaceDeserializer;
}

/**
 * g.Pane オブジェクトを直列化・復元可能にします
 */
export class PaneSerializer extends EntitySerializer implements ObjectSerializer<g.Pane, PaneParam> {
    readonly _imageAssetSerializer?: ImageAssetSerializer;
    readonly _surfaceDeserializer?: PaneSurfaceDeserializer;

    constructor(param: PaneSerializerParameterObject) {
        super(param);
        this._imageAssetSerializer = param.imageAssetSerializer;
        this._surfaceDeserializer = param.surfaceDeserializer;
    }

    override filter(objectType: string): boolean {
        return objectType === paneType;
    }

    /**
     * backgroundImage は g.ImageAsset の場合のみ直列化します。
     * backgroundEffector は非推奨のため直列化しません。
     * @inheritdoc
     */
    override serialize(object: g.Pane): ObjectDef<PaneParam> {
        return {
            type: paneType,
            param: {
                ...super.serialize(object).param,
                backgroundImage: this._serializeBackgroundImage(object.backgroundImage),
                padding: object.padding,
            },
        };
    }

    _serializeBackgroundImage(backgroundImage: g.Pane["backgroundImage"]): ObjectDef<ImageAssetParam> | undefined {
        if (!backgroundImage) {
            return undefined;
        }
        else if ("type" in backgroundImage) {
            if (this._imageAssetSerializer) {
                return this._imageAssetSerializer.serialize(backgroundImage);
            }
            throw new Error(`no image asset serializer was defined. (asset id = ${backgroundImage.id})`);
        }
        else {
            return undefined;
        }
    }

    /**
     * backgroundImage が g.Surface の場合、 {@link _surfaceDeserializer} を使って復元します。
     * @inheritdoc
     */
    override deserialize(json: ObjectDef<PaneParam>): g.Pane {
        const pane = new g.Pane(this._deserializeParameterObject(json.param));
        return pane;
    }

    override _deserializeParameterObject(param: PaneParam) {
        return {
            ...super._deserializeParameterObject(param),
            backgroundImage: this._deserializeBackgroundImage(param),
            padding: param.padding,
        };
    }

    _deserializeBackgroundImage(param: PaneParam): g.Pane["backgroundImage"] {
        if (param.backgroundImage) {
            if (this._imageAssetSerializer) {
                return this._imageAssetSerializer.deserialize(param.backgroundImage);
            }
            throw new Error(`no image asset deserializer was defined. (entity id = ${param.id}, asset id = ${param.backgroundImage.param.id})`);
        }
        else if (this._surfaceDeserializer) {
            return this._surfaceDeserializer(param);
        }
        else {
            return undefined;
        }
    }
}
