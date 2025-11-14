import { EntityParam, EntitySerializer, EntitySerializerParameterObject } from "./serializerEntity";
import { ImageAssetParam, ImageAssetSerializer } from "./serializerImageAsset";
import { ObjectDef, ObjectSerializer } from "./serializerObject";

/**
 * g.Sprite オブジェクト型の識別子
 */
export const spriteType = g.Sprite.name;

/**
 * g.Sprite オブジェクトを復元可能な形式で直列化したJSONです。
 * src は g.ImageAsset の場合のみ直列化します。
 * src が g.Surface の場合は直列化されず、ユーザー自身で復元処理を定義する必要があります。
 */
export interface SpriteParam extends EntityParam, Required<Omit<g.SpriteParameterObject, keyof g.EParameterObject | "src">> {
    src: ObjectDef<ImageAssetParam> | undefined;
}

/**
 * 直列化した g.Sprite のJSONから、対応する g.Surface を作成する関数。
 * @param param 復元対象の g.Sprite オブジェクト情報
 * @returns src に設定される g.Surface
 */
export type SpriteSurfaceDeserializer = (param: SpriteParam) => g.Surface;

export interface SpriteSerializerParameterObject extends EntitySerializerParameterObject {
    imageAssetSerializer: ImageAssetSerializer;
    /**
     * src が g.Surface の際、 g.Sprite 定義に応じて対応する g.Surface を構築する関数
     */
    surfaceDeserializer?: SpriteSurfaceDeserializer;
}

/**
 * g.Sprite オブジェクトを直列化・復元可能にします
 */
export class SpriteSerializer extends EntitySerializer implements ObjectSerializer<g.Sprite, SpriteParam> {
    readonly _imageAssetSerializer: ImageAssetSerializer;
    readonly _surfaceDeserializer?: SpriteSurfaceDeserializer;

    constructor(param: SpriteSerializerParameterObject) {
        super(param);
        this._imageAssetSerializer = param.imageAssetSerializer;
        this._surfaceDeserializer = param.surfaceDeserializer;
    }

    override filter(objectType: string): boolean {
        return objectType === spriteType;
    }

    /**
     * src は g.ImageAsset の場合のみ直列化します。
     * @inheritdoc
     */
    override serialize(object: g.Sprite): ObjectDef<SpriteParam> {
        return {
            type: spriteType,
            param: {
                ...super.serialize(object).param,
                src: this._serializeSrc(object.src),
                srcX: object.srcX,
                srcY: object.srcY,
                srcWidth: object.srcWidth,
                srcHeight: object.srcHeight,
            },
        };
    }

    /**
     * src が g.Surface の場合、 {@link _surfaceDeserializer} を使って復元します。
     * @inheritdoc
     */
    override deserialize(json: ObjectDef<SpriteParam>): g.Sprite {
        const sprite = new g.Sprite(this._deserializeParameterObject(json.param));
        return sprite;
    }

    _serializeSrc(src: g.Sprite["src"]): ObjectDef<ImageAssetParam> | undefined {
        if ("type" in src) {
            return this._imageAssetSerializer.serialize(src);
        }
        else {
            return undefined;
        }
    }

    override _deserializeParameterObject(param: SpriteParam) {
        return {
            ...super._deserializeParameterObject(param),
            src: this._deserializeSrc(param),
            srcX: param.srcX,
            srcY: param.srcY,
            srcWidth: param.srcWidth,
            srcHeight: param.srcHeight,
        };
    }

    _deserializeSrc(param: SpriteParam): g.Sprite["src"] {
        if (param.src) {
            return this._imageAssetSerializer.deserialize(param.src);
        }
        else if (this._surfaceDeserializer) {
            return this._surfaceDeserializer(param);
        }
        else {
            throw new Error(`no surface deserializer was defined. (entity id = ${param.id})`);
        }
    }
}
