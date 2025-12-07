import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { FixtureParam } from "../param/fixture";
import { fixtureType } from "../serialize/fixture";
import { ResolvingSiblingBaseDeserializer, ResolvingSiblingBaseDeserializerParameterObject, ResolvingSiblingDeserializedPayload } from "./deserializable";
import { ObjectResolver } from "./resolver";
import { FilterDataDeserializer } from "./filterData";
import { ShapeDeserializer } from "./shape";
import { BodyDeserializedPayload } from "./body";
import { AABBDeserializer } from "./aabb";
import { DynamicTreeNodeDeserializedPayload } from "./treeNode";

export interface FixtureDeserializedPayload extends ResolvingSiblingDeserializedPayload<Box2DWeb.Dynamics.b2Fixture> {
    resolve?: (proxy: Box2DWeb.Collision.b2DynamicTreeNode) => void;
    resolveAfter: () => void;
}

export interface FixtureDeserializerParameterObject extends ResolvingSiblingBaseDeserializerParameterObject {
    aabb: AABBDeserializer;
    filterData: FilterDataDeserializer;
    shape: ShapeDeserializer;
    self: ObjectResolver<FixtureDeserializedPayload>;
    body: ObjectResolver<BodyDeserializedPayload>;
    node: ObjectResolver<DynamicTreeNodeDeserializedPayload>;
}

export class FixtureDeserializer extends ResolvingSiblingBaseDeserializer<FixtureParam, FixtureDeserializedPayload> {
    readonly _aabb: AABBDeserializer;
    readonly _filterData: FilterDataDeserializer;
    readonly _shape: ShapeDeserializer;
    readonly _self: ObjectResolver<FixtureDeserializedPayload>;
    readonly _body: ObjectResolver<BodyDeserializedPayload>;
    readonly _node: ObjectResolver<DynamicTreeNodeDeserializedPayload>;

    constructor(param: FixtureDeserializerParameterObject) {
        super(fixtureType, param);
        this._aabb = param.aabb;
        this._filterData = param.filterData;
        this._shape = param.shape;
        this._self = param.self;
        this._body = param.body;
        this._node = param.node;
    }

    deserialize(json: ObjectDef<FixtureParam>): FixtureDeserializedPayload {
        const fixture = new Box2DWeb.Dynamics.b2Fixture();
        fixture.m_aabb = this._aabb.deserialize(json.param.aabb).value;
        fixture.m_density = json.param.density;
        fixture.m_filter = this._filterData.deserialize(json.param.filter).value;
        fixture.m_friction = json.param.friction;
        fixture.m_restitution = json.param.restitution;
        fixture.m_isSensor = json.param.isSensor;
        fixture.m_userData = json.param.userData;
        if (json.param.shape) {
            fixture.m_shape = this._shape.deserialize(json.param.shape).value;
        }
        const result: FixtureDeserializedPayload = {
            value: fixture,
            resolveSibling: () => {
                if (json.param.next) {
                    const { value } = this._self.resolvePayload(json.param.next);
                    fixture.m_next = value;
                }
            },
            resolveAfter: () => {
                if (json.param.body) {
                    fixture.m_body = this._body.resolve(json.param.body);
                }
                // node.userData がありながら、m_proxy = null の場合があるため、そのまま解決
                if (json.param.proxy) {
                    fixture.m_proxy = this._node.resolve(json.param.proxy);
                }
            },
        };
        return result;
    }
}
