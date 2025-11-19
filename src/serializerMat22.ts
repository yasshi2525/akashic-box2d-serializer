import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { Vec2Param, Vec2Serializer } from "./serializerVec2";

/**
 * B2Mat22 オブジェクト型の識別子
 */
export const mat22Type = Box2DWeb.Common.Math.b2Mat22.name;

/**
 * B2Mat22 オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface Mat22Param {
    col1: ObjectDef<Vec2Param>;
    col2: ObjectDef<Vec2Param>;
}

export interface Mat22SerializerParameterObject {
    vec2Serializer: Vec2Serializer;
}

/**
 * B2Mat22 オブジェクトを直列化・復元可能にします
 */
export class Mat22Serializer implements ObjectSerializer<Box2DWeb.Common.Math.b2Mat22, Mat22Param> {
    readonly _vec2Serializer: Vec2Serializer;

    constructor(param: Mat22SerializerParameterObject) {
        this._vec2Serializer = param.vec2Serializer;
    }

    filter(objectType: string): boolean {
        return objectType === mat22Type;
    }

    serialize(object: Box2DWeb.Common.Math.b2Mat22): ObjectDef<Mat22Param> {
        return {
            type: mat22Type,
            param: {
                col1: this._vec2Serializer.serialize(object.col1),
                col2: this._vec2Serializer.serialize(object.col2),
            },
        };
    }

    deserialize(json: ObjectDef<Mat22Param>): Box2DWeb.Common.Math.b2Mat22 {
        const mat22 = new Box2DWeb.Common.Math.b2Mat22();
        mat22.SetVV(
            this._vec2Serializer.deserialize(json.param.col1),
            this._vec2Serializer.deserialize(json.param.col2),
        );
        return mat22;
    }
}
