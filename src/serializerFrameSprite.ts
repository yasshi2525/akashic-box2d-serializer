import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { SpriteParam, SpriteSerializer, SpriteSerializerParameterObject } from "./serializerSprite";

/**
 * g.FrameSprite オブジェクト型の識別子
 */
export const frameSpriteType = g.FrameSprite.constructor.name;

/**
 * g.FrameSprite オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface FrameSpriteParam extends SpriteParam, Required<Omit<g.FrameSpriteParameterObject, keyof g.SpriteParameterObject | "interval">> {
    interval: g.FrameSprite["interval"];
}

/**
 * 直列化した g.FrameSprite のJSONから、対応する g.Surface を作成する関数。
 * @param param 復元対象の g.FrameSprite オブジェクト情報
 * @returns src に設定される g.Surface
 */
export type FrameSpriteSurfaceDeserializer = (param: SpriteParam) => g.Surface;

export interface FrameSpriteSerializerParameterObject extends SpriteSerializerParameterObject {
    /**
     * src が g.Surface の際、 g.FrameSprite 定義に応じて対応する g.Surface を構築する関数
     */
    surfaceDeserializer?: FrameSpriteSurfaceDeserializer;
}

/**
 * g.FrameSprite オブジェクトを直列化・復元可能にします
 */
export class FrameSpriteSerializer extends SpriteSerializer implements ObjectSerializer<g.FrameSprite, FrameSpriteParam> {
    override filter(objectType: string): boolean {
        return objectType === frameSpriteType;
    }

    override serialize(object: g.FrameSprite): ObjectDef<FrameSpriteParam> {
        return {
            type: frameSpriteType,
            param: {
                ...super.serialize(object).param,
                frameNumber: object.frameNumber,
                frames: object.frames,
                interval: object.interval,
                loop: object.loop,
            },
        };
    }

    override deserialize(json: ObjectDef<FrameSpriteParam>): g.FrameSprite {
        const frameSprite = new g.FrameSprite(this._deserializeParameterObject(json.param));
        return frameSprite;
    }

    override _deserializeParameterObject(param: FrameSpriteParam) {
        return {
            ...super._deserializeParameterObject(param),
            frameNumber: param.frameNumber,
            frames: param.frames,
            interval: param.interval,
            loop: param.loop,
        };
    }
}
