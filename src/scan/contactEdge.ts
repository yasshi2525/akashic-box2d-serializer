import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { BaseScannerParameterObject, BaseScanner } from "./scannable";
import { BodyScanner } from "./body";
import { ContactScanner } from "./contact";

export interface ContactEdgeScannerParameterObject extends BaseScannerParameterObject<Box2DWeb.Dynamics.Contacts.b2ContactEdge> {
    body: BodyScanner;
    /**
     * contact, contactEdge は相互依存関係のため
     */
    contact: () => ContactScanner;
}

export class ContactEdgeScanner extends BaseScanner<Box2DWeb.Dynamics.Contacts.b2ContactEdge> {
    readonly _body: BodyScanner;
    readonly _contact: () => ContactScanner;

    constructor(param: ContactEdgeScannerParameterObject) {
        super(param);
        this._body = param.body;
        this._contact = param.contact;
    }

    scan(object: Box2DWeb.Dynamics.Contacts.b2ContactEdge): void {
        this._self.add(object);
        if (object.other) {
            this._body.scan(object.other);
        }
        if (object.prev) {
            this.scan(object.prev);
        }
        if (object.next) {
            this.scan(object.next);
        }
        if (object.contact) {
            this._contact().scan(object.contact);
        }
    }
}
