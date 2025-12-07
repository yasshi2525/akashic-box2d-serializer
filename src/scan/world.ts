import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { SingleReferredScanner } from "./scannable";
import { BodyScanner } from "./body";
import { ContactScanner } from "./contact";
import { ContactManagerScanner } from "./contactManager";

export interface WorldScannerParameterObject {
    body: BodyScanner;
    contactManager: ContactManagerScanner;
    contact: ContactScanner;
}

export class WorldScanner extends SingleReferredScanner<Box2DWeb.Dynamics.b2World> {
    readonly _body: BodyScanner;
    readonly _contactManager: ContactManagerScanner;
    readonly _contact: ContactScanner;

    constructor(param: WorldScannerParameterObject) {
        super();
        this._body = param.body;
        this._contactManager = param.contactManager;
        this._contact = param.contact;
    }

    scan(object: Box2DWeb.Dynamics.b2World): void {
        for (const stack of object.s_stack) {
            if (stack) {
                this._body.scan(stack);
            }
        }
        this._contactManager.scan(object.m_contactManager);
        if (object.m_bodyList) {
            this._body.scan(object.m_bodyList);
        }
        if (object.m_contactList) {
            this._contact.scan(object.m_contactList);
        }
        this._body.scan(object.m_groundBody);
    }
}
