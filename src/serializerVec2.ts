import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";

/**
 * B2Vec2 オブジェクト型の識別子。
 */
export const vec2Type = Box2DWeb.Common.Math.b2Vec2.name;

/**
 * B2Vec2 オブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface Vec2Param extends Pick<Box2DWeb.Common.Math.b2Vec2, "x" | "y"> {

}

/**
 * B2Vecオブジェクトを直列化・復元可能にします
 */
export class Vec2Serializer implements ObjectSerializer<Box2DWeb.Common.Math.b2Vec2, Vec2Param> {
    filter(objectType: string): boolean {
        return objectType === vec2Type;
    }

    serialize(object: Box2DWeb.Common.Math.b2Vec2): ObjectDef<Vec2Param> {
        return {
            type: vec2Type,
            param: {
                x: object.x,
                y: object.y,
            },
        };
    }

    deserialize(json: ObjectDef<Vec2Param>): Box2DWeb.Common.Math.b2Vec2 {
        return new Box2DWeb.Common.Math.b2Vec2(json.param.x, json.param.y);
    }
}
