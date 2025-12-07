import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { ManifoldParam } from "../param/manifold";
import { manifoldType } from "../serialize/manifold";
import { BaseDeserializer, DeserializedPayload } from "./deserializable";
import { Vec2Deserializer } from "./vec2";
import { ManifoldPointDeserializer } from "./manifoldPoint";

export interface ManifoldDeserializedPayload extends DeserializedPayload<Box2DWeb.Collision.b2Manifold> {
}

export interface ManifoldDeserializerParameterObject {
    vec2: Vec2Deserializer;
    manifoldPoint: ManifoldPointDeserializer;
}

export class ManifoldDeserializer extends BaseDeserializer<ManifoldParam, ManifoldDeserializedPayload> {
    readonly _vec2: Vec2Deserializer;
    readonly _manifoldPoint: ManifoldPointDeserializer;

    constructor(param: ManifoldDeserializerParameterObject) {
        super(manifoldType);
        this._vec2 = param.vec2;
        this._manifoldPoint = param.manifoldPoint;
    }

    deserialize(json: ObjectDef<ManifoldParam>): ManifoldDeserializedPayload {
        const manifold = new Box2DWeb.Collision.b2Manifold();
        manifold.m_localPlaneNormal = this._vec2.deserialize(json.param.m_localPlaneNormal).value;
        manifold.m_localPoint = this._vec2.deserialize(json.param.m_localPoint).value;
        manifold.m_pointCount = json.param.m_pointCount;
        manifold.m_points = json.param.m_points.map(p => this._manifoldPoint.deserialize(p).value);
        manifold.m_type = json.param.m_type;
        return {
            value: manifold,
        };
    }
}
