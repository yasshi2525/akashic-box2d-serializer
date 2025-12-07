import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectDef } from "../serializerObject";
import { ContactDeserializedPayload } from "../deserialize/contact";
import { DynamicTreeBroadPhaseDeserializer } from "../deserialize/broadPhase";
import { ComplexObjectResolver } from "../deserialize/resolverComplex";
import { ContactManagerParam } from "../param/contactManager";
import { contactManagerType } from "../serialize/contactManager";
import { ResolvingBaseMerger, ResolvingBaseMergerParameterObject, ResolvingMergedPayload } from "./mergable";

export interface ContactManagerMergedPayload extends ResolvingMergedPayload {
}

export interface ContactManagerMergerParameterObject extends ResolvingBaseMergerParameterObject {
    broadPhase: DynamicTreeBroadPhaseDeserializer;
    contact: ComplexObjectResolver<ContactDeserializedPayload>;
}

export class ContactManagerMerger extends ResolvingBaseMerger<ContactManagerParam, Box2DWeb.Dynamics.b2ContactManager, ContactManagerMergedPayload> {
    readonly _broadPhase: DynamicTreeBroadPhaseDeserializer;
    readonly _contact: ComplexObjectResolver<ContactDeserializedPayload>;

    constructor(param: ContactManagerMergerParameterObject) {
        super(contactManagerType, param);
        this._broadPhase = param.broadPhase;
        this._contact = param.contact;
    }

    merge(json: ObjectDef<ContactManagerParam>, contactManager: Box2DWeb.Dynamics.b2ContactManager): ContactManagerMergedPayload {
        const { value, resolveAfter } = this._broadPhase.deserialize(json.param.broadPhase);
        contactManager.m_broadPhase = value;
        contactManager.m_contactCount = json.param.contactCount;
        contactManager.m_allocator = json.param.allocator;
        return {
            resolveAfter: () => {
                resolveAfter();
                if (json.param.contactList) {
                    contactManager.m_contactList = this._contact.resolve(json.param.contactList);
                }
            },
        };
    }
}
