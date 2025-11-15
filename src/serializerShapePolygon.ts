import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, ObjectSerializer } from "./serializerObject";
import { Vec2Param, Vec2Serializer } from "./serializerVec2";

/**
 * Polygon Shapeオブジェクト型の識別子。
 */
export const polygonShapeType = Box2DWeb.Collision.Shapes.b2PolygonShape.name;

/**
 * Polygon Shapeオブジェクトを復元可能な形式で直列化したJSONです。
 */
export interface PolygonShapeParam {
    /**
     * 各頂点の座標リスト。座標系は box2d (m) であり、Akashicのエンティティ系 (px) ではない。
     */
    vertices: ObjectDef<Vec2Param>[];
}

export interface PolygonShapeParameterObject {
    vec2Serializer: Vec2Serializer;
}

/**
 * Polygon Shape定義を直列化・復元可能にします
 */
export class PolygonShapeSerializer implements ObjectSerializer<Box2DWeb.Collision.Shapes.b2PolygonShape, PolygonShapeParam> {
    readonly _vec2Serailizer: Vec2Serializer;

    constructor(param: PolygonShapeParameterObject) {
        this._vec2Serailizer = param.vec2Serializer;
    }

    filter(objectType: string): boolean {
        return objectType === polygonShapeType;
    }

    serialize(object: Box2DWeb.Collision.Shapes.b2PolygonShape): ObjectDef<PolygonShapeParam> {
        return {
            type: polygonShapeType,
            param: {
                vertices: object.GetVertices().map(v => this._vec2Serailizer.serialize(v)),
            },
        };
    }

    deserialize(json: ObjectDef<PolygonShapeParam>): Box2DWeb.Collision.Shapes.b2PolygonShape {
        const shape = new Box2DWeb.Collision.Shapes.b2PolygonShape();
        shape.SetAsArray(
            json.param.vertices.map(p => this._vec2Serailizer.deserialize(p)),
            json.param.vertices.length
        );
        return shape;
    }
}
