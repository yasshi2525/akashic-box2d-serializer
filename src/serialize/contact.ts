import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef, RefParam } from "../serializerObject";
import { ContactParam } from "../param/contact";
import { ObjectStore } from "../scan/store";
import { ComplexObjectStore } from "../scan/storeComplex";
import { ReferableObjectDef, ReferableSerializable } from "./serializable";
import { ManifoldSerializer } from "./manifold";

export const contactType = Box2DWeb.Dynamics.Contacts.b2Contact.name;
export const circleContactType = Box2DWeb.Dynamics.Contacts.b2CircleContact.name;
export const edgeAndCircleContactType = Box2DWeb.Dynamics.Contacts.b2EdgeAndCircleContact.name;
export const nullContactType = Box2DWeb.Dynamics.Contacts.b2NullContact.name;
export const polyAndCircleContactType = Box2DWeb.Dynamics.Contacts.b2PolyAndCircleContact.name;
export const polyAndEdgeContactType = Box2DWeb.Dynamics.Contacts.b2PolyAndEdgeContact.name;
export const polygonContactType = Box2DWeb.Dynamics.Contacts.b2PolygonContact.name;

export const contactTypes = [
    circleContactType,
    edgeAndCircleContactType,
    nullContactType,
    polyAndCircleContactType,
    polyAndEdgeContactType,
    polygonContactType,
    contactType,
] as const;

export type ContactType = typeof contactTypes[number];

export const resolveContactTypeName = (object: Box2DWeb.Dynamics.Contacts.b2Contact): ContactType => {
    if (object instanceof Box2DWeb.Dynamics.Contacts.b2CircleContact) {
        return circleContactType;
    }
    if (object instanceof Box2DWeb.Dynamics.Contacts.b2EdgeAndCircleContact) {
        return edgeAndCircleContactType;
    }
    if (object instanceof Box2DWeb.Dynamics.Contacts.b2NullContact) {
        return nullContactType;
    }
    if (object instanceof Box2DWeb.Dynamics.Contacts.b2PolyAndCircleContact) {
        return polyAndCircleContactType;
    }
    if (object instanceof Box2DWeb.Dynamics.Contacts.b2PolyAndEdgeContact) {
        return polyAndEdgeContactType;
    }
    if (object instanceof Box2DWeb.Dynamics.Contacts.b2PolygonContact) {
        return polygonContactType;
    }
    if (object instanceof Box2DWeb.Dynamics.Contacts.b2Contact) {
        return contactType;
    }
    throw new Error(`unsupported contact class. (object = ${(object as Object)?.toString()})`);
};

export interface ContactSerializerParameterObject {
    manifold: ManifoldSerializer;
    self: ComplexObjectStore<Box2DWeb.Dynamics.Contacts.b2Contact>;
    node: ObjectStore<Box2DWeb.Dynamics.Contacts.b2ContactEdge>;
    fixture: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;
}

export class ContactSerializer implements ReferableSerializable<Box2DWeb.Dynamics.Contacts.b2Contact, ContactParam> {
    readonly _manifold: ManifoldSerializer;
    readonly _self: ComplexObjectStore<Box2DWeb.Dynamics.Contacts.b2Contact>;
    readonly _node: ObjectStore<Box2DWeb.Dynamics.Contacts.b2ContactEdge>;
    readonly _fixture: ObjectStore<Box2DWeb.Dynamics.b2Fixture>;

    constructor(param: ContactSerializerParameterObject) {
        this._manifold = param.manifold;
        this._self = param.self;
        this._node = param.node;
        this._fixture = param.fixture;
    }

    serialize(object: Box2DWeb.Dynamics.Contacts.b2Contact, ref: ObjectDef<RefParam>): ReferableObjectDef<ContactParam> {
        return {
            type: resolveContactTypeName(object),
            ref,
            param: {
                nodeA: this._node.refer(object.m_nodeA),
                nodeB: this._node.refer(object.m_nodeB),
                manifold: this._manifold.serialize(object.m_manifold),
                oldManifold: this._manifold.serialize(object.m_oldManifold),
                flags: object.m_flags,
                fixtureA: this._fixture.refer(object.m_fixtureA),
                fixtureB: this._fixture.refer(object.m_fixtureB),
                prev: object.m_prev ? this._self.refer(object.m_prev) : undefined,
                next: object.m_next ? this._self.refer(object.m_next) : undefined,
            },
        };
    }
}
