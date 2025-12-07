import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { WorldParam } from "../param/world";
import { ObjectStore } from "../scan/store";
import { ComplexObjectStore } from "../scan/storeComplex";
import { Serializable } from "./serializable";
import { ContactManagerSerializer } from "./contactManager";

export const worldType = Box2DWeb.Dynamics.b2World.name;

export interface WorldSerializerParameterObject {
    contactManager: ContactManagerSerializer;
    body: ObjectStore<Box2DWeb.Dynamics.b2Body>;
    contact: ComplexObjectStore<Box2DWeb.Dynamics.Contacts.b2Contact>;
}

export class WorldSerializer implements Serializable<Box2DWeb.Dynamics.b2World, WorldParam> {
    readonly _contactManager: ContactManagerSerializer;
    readonly _body: ObjectStore<Box2DWeb.Dynamics.b2Body>;
    readonly _contact: ComplexObjectStore<Box2DWeb.Dynamics.Contacts.b2Contact>;

    constructor(param: WorldSerializerParameterObject) {
        this._contactManager = param.contactManager;
        this._body = param.body;
        this._contact = param.contact;
    }

    serialize(object: Box2DWeb.Dynamics.b2World): ObjectDef<WorldParam> {
        return {
            type: worldType,
            param: {
                stack: object.s_stack.map(s => s ? this._body.refer(s) : null),
                contactManager: this._contactManager.serialize(object.m_contactManager),
                bodyList: object.m_bodyList ? this._body.refer(object.m_bodyList) : undefined,
                bodyCount: object.m_bodyCount,
                contactList: object.m_contactList ? this._contact.refer(object.m_contactList) : undefined,
                contactCount: object.m_contactCount,
                inv_dt0: object.m_inv_dt0,
                groundBody: this._body.refer(object.m_groundBody),
                flags: object.m_flags,
            },
        };
    }
}
