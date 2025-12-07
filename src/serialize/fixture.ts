import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, RefParam } from "../serializerObject";
import { FixtureParam } from "../param/fixture";
import { ObjectStore } from "../scan/store";
import { ReferableObjectDef, ReferableSerializable } from "./serializable";
import { FilterDataSerializer } from "./filterData";
import { ShapeSerializer } from "./shape";
import { AABBSerializer } from "./aabb";

export const fixtureType = Box2DWeb.Dynamics.b2Fixture.name;

export interface FixtureSerializerParameterObject {
    aabb: AABBSerializer;
    filterData: FilterDataSerializer;
    shape: ShapeSerializer;
    self: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;
    body: ObjectStore<Box2DWeb.Dynamics.b2Body>;
    node: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;
}

export class FixtureSerializer implements ReferableSerializable<Box2DWeb.Dynamics.b2Fixture, FixtureParam> {
    readonly _aabb: AABBSerializer;
    readonly _filterData: FilterDataSerializer;
    readonly _shape: ShapeSerializer;
    readonly _self: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;
    readonly _body: ObjectStore<Box2DWeb.Dynamics.b2Body>;
    readonly _node: ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>;

    constructor(param: FixtureSerializerParameterObject) {
        this._aabb = param.aabb;
        this._filterData = param.filterData;
        this._shape = param.shape;
        this._self = param.self;
        this._body = param.body;
        this._node = param.node;
    }

    serialize(object: Box2DWeb.Dynamics.b2Fixture, ref: ObjectDef<RefParam>): ReferableObjectDef<FixtureParam> {
        return {
            type: fixtureType,
            ref,
            param: {
                aabb: this._aabb.serialize(object.m_aabb),
                density: object.m_density,
                filter: this._filterData.serialize(object.m_filter),
                friction: object.m_friction,
                isSensor: object.m_isSensor,
                restitution: object.m_restitution,
                shape: object.m_shape ? this._shape.serialize(object.m_shape) : undefined,
                userData: object.m_userData,
                body: object.m_body ? this._body.refer(object.m_body) : undefined,
                next: object.m_next ? this._self.refer(object.m_next) : undefined,
                proxy: object.m_proxy ? this._node.refer(object.m_proxy) : undefined,
            },
        };
    }
}
