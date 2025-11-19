import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { Vec2Param, Vec2Serializer } from "./serializerVec2";

/**
 * B2AABB オブジェクト型の識別子
 */
export const AABBType = Box2DWeb.Collision.b2AABB.name;

/**
 * B2AABB オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface AABBParam {
    lowerBound: ObjectDef<Vec2Param>;
    upperBound: ObjectDef<Vec2Param>;
}

export interface AABBSerializerParameterObject {
    vec2Serializer: Vec2Serializer;
}

/**
 * B2AABB オブジェクトを直列化・復元可能にします
 */
export class AABBSerializer implements ObjectSerializer<Box2DWeb.Collision.b2AABB, AABBParam> {
    readonly _vec2Serializer: Vec2Serializer;

    constructor(param: AABBSerializerParameterObject) {
        this._vec2Serializer = param.vec2Serializer;
    }

    filter(objectType: string): boolean {
        return objectType === AABBType;
    }

    serialize(object: Box2DWeb.Collision.b2AABB): ObjectDef<AABBParam> {
        return {
            type: AABBType,
            param: {
                lowerBound: this._vec2Serializer.serialize(object.lowerBound),
                upperBound: this._vec2Serializer.serialize(object.upperBound),
            },
        };
    }

    deserialize(json: ObjectDef<AABBParam>): Box2DWeb.Collision.b2AABB {
        const aabb = new Box2DWeb.Collision.b2AABB();
        aabb.lowerBound = this._vec2Serializer.deserialize(json.param.lowerBound);
        aabb.upperBound = this._vec2Serializer.deserialize(json.param.upperBound);
        return aabb;
    }
}
