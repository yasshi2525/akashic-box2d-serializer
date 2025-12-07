import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { ContactManagerParam } from "../param/contactManager";
import { ComplexObjectStore } from "../scan/storeComplex";
import { Serializable } from "./serializable";
import { DynamicTreeBroadPhaseSerializer } from "./broadPhase";

export const contactManagerType = Box2DWeb.Dynamics.b2ContactManager.name;

export interface ContactManagerSerializerParameterObject {
    broadPhase: DynamicTreeBroadPhaseSerializer;
    contact: ComplexObjectStore<Box2DWeb.Dynamics.Contacts.b2Contact>;
}

export class ContactManagerSerializer implements Serializable<Box2DWeb.Dynamics.b2ContactManager, ContactManagerParam> {
    readonly _broadPhase: DynamicTreeBroadPhaseSerializer;
    readonly _contact: ComplexObjectStore<Box2DWeb.Dynamics.Contacts.b2Contact>;

    constructor(param: ContactManagerSerializerParameterObject) {
        this._broadPhase = param.broadPhase;
        this._contact = param.contact;
    }

    serialize(object: Box2DWeb.Dynamics.b2ContactManager): ObjectDef<ContactManagerParam> {
        return {
            type: contactManagerType,
            param: {
                broadPhase: this._broadPhase.serialize(object.m_broadPhase),
                contactList: object.m_contactList ? this._contact.refer(object.m_contactList) : undefined,
                contactCount: object.m_contactCount,
                allocator: object.m_allocator,
            },
        };
    }
}
