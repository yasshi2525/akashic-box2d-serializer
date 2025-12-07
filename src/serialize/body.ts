import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, RefParam } from "../serializerObject";
import { BodyParam } from "../param/body";
import { ObjectStore } from "../scan/store";
import { ReferableObjectDef, ReferableSerializable } from "./serializable";
import { Vec2Serializer } from "./vec2";
import { SweepSerializer } from "./sweep";
import { TransformSerializer } from "./transform";

export const bodyType = Box2DWeb.Dynamics.b2Body.name;

export interface BodySerializerParameterObject {
    vec2: Vec2Serializer;
    sweep: SweepSerializer;
    transform: TransformSerializer;
    self: ObjectStore<Box2DWeb.Dynamics.b2Body>;
    fixture: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;
    contactEdge: ObjectStore<Box2DWeb.Dynamics.Contacts.b2ContactEdge>;
}

export class BodySerializer implements ReferableSerializable<Box2DWeb.Dynamics.b2Body, BodyParam> {
    readonly _vec2: Vec2Serializer;
    readonly _sweep: SweepSerializer;
    readonly _transform: TransformSerializer;
    readonly _self: ObjectStore<Box2DWeb.Dynamics.b2Body>;
    readonly _fixture: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;
    readonly _contactEdge: ObjectStore<Box2DWeb.Dynamics.Contacts.b2ContactEdge>;

    constructor(param: BodySerializerParameterObject) {
        this._vec2 = param.vec2;
        this._sweep = param.sweep;
        this._transform = param.transform;
        this._self = param.self;
        this._fixture = param.fixture;
        this._contactEdge = param.contactEdge;
    }

    serialize(object: Box2DWeb.Dynamics.b2Body, ref: ObjectDef<RefParam>): ReferableObjectDef<BodyParam> {
        return {
            type: bodyType,
            ref,
            param: {
                angularDamping: object.m_angularDamping,
                angularVelocity: object.m_angularVelocity,
                contactList: object.m_contactList ? this._contactEdge.refer(object.m_contactList) : undefined,
                fixtureCount: object.m_fixtureCount,
                fixtureList: object.m_fixtureList ? this._fixture.refer(object.m_fixtureList) : undefined,
                flags: object.m_flags,
                force: this._vec2.serialize(object.m_force),
                I: object.m_I,
                inertiaScale: object.m_inertiaScale,
                invI: object.m_invI,
                invMass: object.m_invMass,
                linearDamping: object.m_linearDamping,
                linearVelocity: this._vec2.serialize(object.m_linearVelocity),
                mass: object.m_mass,
                next: object.m_next ? this._self.refer(object.m_next) : undefined,
                prev: object.m_prev ? this._self.refer(object.m_prev) : undefined,
                sleepTime: object.m_sleepTime,
                sweep: this._sweep.serialize(object.m_sweep),
                torque: object.m_torque,
                type: object.m_type,
                userData: object.m_userData,
                xf: this._transform.serialize(object.m_xf),
            },
        };
    }
}
