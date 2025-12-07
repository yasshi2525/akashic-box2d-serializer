import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { SingleReferredScanner } from "./scannable";
import { DynamicTreeBroadPhaseScanner } from "./broadPhase";
import { ContactScanner } from "./contact";

export interface ContactManagerScannerParameterObject {
    broadPhase: DynamicTreeBroadPhaseScanner;
    contact: ContactScanner;
}

export class ContactManagerScanner extends SingleReferredScanner<Box2DWeb.Dynamics.b2ContactManager> {
    readonly _broadPhase: DynamicTreeBroadPhaseScanner;
    readonly _contact: ContactScanner;

    constructor(param: ContactManagerScannerParameterObject) {
        super();
        this._broadPhase = param.broadPhase;
        this._contact = param.contact;
    }

    scan(object: Box2DWeb.Dynamics.b2ContactManager): void {
        this._broadPhase.scan(object.m_broadPhase);
        if (object.m_contactList) {
            this._contact.scan(object.m_contactList);
        }
    }
}
