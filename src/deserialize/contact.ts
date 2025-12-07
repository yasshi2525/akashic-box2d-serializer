import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { ContactParam } from "../param/contact";
import { circleContactType, contactType, contactTypes, edgeAndCircleContactType, nullContactType, polyAndCircleContactType, polyAndEdgeContactType, polygonContactType } from "../serialize/contact";
import { ResolvingSiblingBaseDeserializer, ResolvingSiblingBaseDeserializerParameterObject, ResolvingSiblingDeserializedPayload } from "./deserializable";
import { ObjectResolver } from "./resolver";
import { ComplexObjectResolver } from "./resolverComplex";
import { ContactEdgeDeserializedPayload } from "./contactEdge";
import { ManifoldDeserializer } from "./manifold";
import { FixtureDeserializedPayload } from "./fixture";

export const newContactInstance = (json: ObjectDef<ContactParam>): Box2DWeb.Dynamics.Contacts.b2Contact => {
    switch (json.type) {
        case circleContactType:
            return new Box2DWeb.Dynamics.Contacts.b2CircleContact();
        case edgeAndCircleContactType:
            return new Box2DWeb.Dynamics.Contacts.b2EdgeAndCircleContact();
        case nullContactType:
            return new Box2DWeb.Dynamics.Contacts.b2NullContact();
        case polyAndCircleContactType:
            return new Box2DWeb.Dynamics.Contacts.b2PolyAndCircleContact();
        case polyAndEdgeContactType:
            return new Box2DWeb.Dynamics.Contacts.b2PolyAndEdgeContact();
        case polygonContactType:
            return new Box2DWeb.Dynamics.Contacts.b2PolygonContact();
        case contactType:
            return new Box2DWeb.Dynamics.Contacts.b2Contact();
        default:
            throw new Error(`unsupported contact class. (classname = ${json.type})`);
    }
};

export interface ContactDeserializedPayload extends ResolvingSiblingDeserializedPayload<Box2DWeb.Dynamics.Contacts.b2Contact> {
    resolveAfter: () => void;
}

export interface ContactDeserializerParameterObject extends ResolvingSiblingBaseDeserializerParameterObject {
    manifold: ManifoldDeserializer;
    self: ComplexObjectResolver<ContactDeserializedPayload>;
    node: ObjectResolver<ContactEdgeDeserializedPayload>;
    fixture: ObjectResolver<FixtureDeserializedPayload>;
}

export class ContactDeserializer extends ResolvingSiblingBaseDeserializer<ContactParam, ContactDeserializedPayload> {
    readonly _manifold: ManifoldDeserializer;
    readonly _self: ComplexObjectResolver<ContactDeserializedPayload>;
    readonly _node: ObjectResolver<ContactEdgeDeserializedPayload>;
    readonly _fixture: ObjectResolver<FixtureDeserializedPayload>;

    constructor(param: ContactDeserializerParameterObject) {
        super([...contactTypes], param);
        this._manifold = param.manifold;
        this._self = param.self;
        this._node = param.node;
        this._fixture = param.fixture;
    }

    deserialize(json: ObjectDef<ContactParam>): ContactDeserializedPayload {
        const contact = newContactInstance(json);
        contact.m_manifold = this._manifold.deserialize(json.param.manifold).value;
        contact.m_oldManifold = this._manifold.deserialize(json.param.oldManifold).value;
        contact.m_flags = json.param.flags;
        return {
            value: contact,
            resolveSibling: () => {
                if (json.param.prev) {
                    contact.m_prev = this._self.resolve(json.param.prev);
                }
                if (json.param.next) {
                    contact.m_next = this._self.resolve(json.param.next);
                }
            },
            resolveAfter: () => {
                // contactEdge 側から contact の参照を一方的に切られることがあるので、そのまま再現
                contact.m_nodeA = this._node.resolve(json.param.nodeA);
                contact.m_nodeB = this._node.resolve(json.param.nodeB);
                contact.m_fixtureA = this._fixture.resolve(json.param.fixtureA);
                contact.m_fixtureB = this._fixture.resolve(json.param.fixtureB);
            },
        };
    }
}
