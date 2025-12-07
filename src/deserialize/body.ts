import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { BodyParam } from "../param/body";
import { bodyType } from "../serialize/body";
import { ResolvingSiblingBaseDeserializer, ResolvingSiblingBaseDeserializerParameterObject, ResolvingSiblingDeserializedPayload } from "./deserializable";
import { ObjectResolver } from "./resolver";
import { FixtureDeserializedPayload } from "./fixture";
import { Vec2Deserializer } from "./vec2";
import { SweepDeserializer } from "./sweep";
import { TransformDeserializer } from "./transform";
import { ContactEdgeDeserializedPayload } from "./contactEdge";

export interface BodyDeserializedPayload extends ResolvingSiblingDeserializedPayload<Box2DWeb.Dynamics.b2Body> {
    resolveAfter: () => void;
}

export interface BodyDeserializerParameterObject extends ResolvingSiblingBaseDeserializerParameterObject {
    world: Box2DWeb.Dynamics.b2World;
    vec2: Vec2Deserializer;
    sweep: SweepDeserializer;
    transform: TransformDeserializer;
    self: ObjectResolver<BodyDeserializedPayload>;
    fixture: ObjectResolver<FixtureDeserializedPayload>;
    contactEdge: ObjectResolver<ContactEdgeDeserializedPayload>;
}

export class BodyDeserializer extends ResolvingSiblingBaseDeserializer<BodyParam, BodyDeserializedPayload> {
    readonly _world: Box2DWeb.Dynamics.b2World;
    readonly _vec2: Vec2Deserializer;
    readonly _sweep: SweepDeserializer;
    readonly _transform: TransformDeserializer;
    readonly _self: ObjectResolver<BodyDeserializedPayload>;
    readonly _fixture: ObjectResolver<FixtureDeserializedPayload>;
    readonly _contactEdge: ObjectResolver<ContactEdgeDeserializedPayload>;

    constructor(param: BodyDeserializerParameterObject) {
        super(bodyType, param);
        this._world = param.world;
        this._vec2 = param.vec2;
        this._sweep = param.sweep;
        this._transform = param.transform;
        this._self = param.self;
        this._fixture = param.fixture;
        this._contactEdge = param.contactEdge;
    }

    deserialize(json: ObjectDef<BodyParam>): BodyDeserializedPayload {
        const bodyDef = new Box2DWeb.Dynamics.b2BodyDef();
        bodyDef.angularDamping = json.param.angularDamping;
        bodyDef.angularVelocity = json.param.angularVelocity;
        bodyDef.inertiaScale = json.param.inertiaScale;
        bodyDef.linearDamping = json.param.linearDamping;
        bodyDef.linearVelocity = this._vec2.deserialize(json.param.linearVelocity).value;
        bodyDef.type = json.param.type;
        bodyDef.userData = json.param.userData;
        const body = new Box2DWeb.Dynamics.b2Body(bodyDef, this._world);
        body.m_fixtureCount = json.param.fixtureCount;
        body.m_flags = json.param.flags;
        body.m_force = this._vec2.deserialize(json.param.force).value;
        body.m_I = json.param.I;
        body.m_invI = json.param.invI;
        body.m_invMass = json.param.invMass;
        body.m_mass = json.param.mass;
        body.m_sweep = this._sweep.deserialize(json.param.sweep).value;
        body.m_torque = json.param.torque;
        body.m_sleepTime = json.param.sleepTime;
        body.m_xf = this._transform.deserialize(json.param.xf).value;
        return {
            value: body,
            resolveSibling: () => {
                if (json.param.prev) {
                    const { value } = this._self.resolvePayload(json.param.prev);
                    body.m_prev = value;
                }
                if (json.param.next) {
                    const { value } = this._self.resolvePayload(json.param.next);
                    body.m_next = value;
                }
            },
            resolveAfter: () => {
                if (json.param.fixtureList) {
                    body.m_fixtureList = this._fixture.resolve(json.param.fixtureList);
                }
                if (json.param.contactList) {
                    body.m_contactList = this._contactEdge.resolve(json.param.contactList);
                }
            },
        };
    }
}
