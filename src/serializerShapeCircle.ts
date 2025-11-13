import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";

/**
 * Circle Shapeオブジェクト型の識別子。
 */
export const circleShapeType = Box2DWeb.Collision.Shapes.b2CircleShape.constructor.name;

/**
 * Circle Shapeオブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface CircleShapeParam {
    /**
     * 半径。座標系は box2d (m) であり、Akashicのエンティティ系 (px) ではない。
     */
    radius: number;
}

/**
 * Circle Shape定義を直列化・復元可能にします
 */
export class CircleShapeSerializer implements ObjectSerializer<Box2DWeb.Collision.Shapes.b2CircleShape, CircleShapeParam> {
    filter(objectType: string): boolean {
        return objectType === circleShapeType;
    }

    serialize(object: Box2DWeb.Collision.Shapes.b2CircleShape): ObjectDef<CircleShapeParam> {
        return {
            type: circleShapeType,
            param: {
                radius: object.GetRadius(),
            },
        };
    }

    deserialize(json: ObjectDef<CircleShapeParam>): Box2DWeb.Collision.Shapes.b2CircleShape {
        const shape = new Box2DWeb.Collision.Shapes.b2CircleShape(json.param.radius);
        return shape;
    }
}
