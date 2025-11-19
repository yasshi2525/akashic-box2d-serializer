import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { Vec2Param, Vec2Serializer } from "./serializerVec2";
import { Mat22Param, Mat22Serializer } from "./serializerMat22";

/**
 * B2Transform オブジェクト型の識別子
 */
export const transformType = Box2DWeb.Common.Math.b2Transform.name;

/**
 * B2Transform オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface TransformParam {
    position: ObjectDef<Vec2Param>;
    R: ObjectDef<Mat22Param>;
}

export interface TransformSerializerParameterObject {
    vec2Serializer: Vec2Serializer;
    mat22Serializer: Mat22Serializer;
}

/**
 * B2Transform オブジェクトを直列化・復元可能にします
 */
export class TransformSerializer implements ObjectSerializer<Box2DWeb.Common.Math.b2Transform, TransformParam> {
    readonly _vec2Serializer: Vec2Serializer;
    readonly _mat22Serializer: Mat22Serializer;

    constructor(param: TransformSerializerParameterObject) {
        this._vec2Serializer = param.vec2Serializer;
        this._mat22Serializer = param.mat22Serializer;
    }

    filter(objectType: string): boolean {
        return objectType === transformType;
    }

    serialize(object: Box2DWeb.Common.Math.b2Transform): ObjectDef<TransformParam> {
        return {
            type: transformType,
            param: {
                position: this._vec2Serializer.serialize(object.position),
                R: this._mat22Serializer.serialize(object.R),
            },
        };
    }

    deserialize(json: ObjectDef<TransformParam>): Box2DWeb.Common.Math.b2Transform {
        const transform = new Box2DWeb.Common.Math.b2Transform(
            this._vec2Serializer.deserialize(json.param.position),
            this._mat22Serializer.deserialize(json.param.R)
        );
        return transform;
    }
}
