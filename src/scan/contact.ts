import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { BaseScannerParameterObject, BaseScanner } from "./scannable";
import { ContactEdgeScanner } from "./contactEdge";
import { FixtureScanner } from "./fixture";

export interface ContactScannerParameterObject extends BaseScannerParameterObject<Box2DWeb.Dynamics.Contacts.b2Contact> {
    node: ContactEdgeScanner;
    fixture: FixtureScanner;
}

export class ContactScanner extends BaseScanner<Box2DWeb.Dynamics.Contacts.b2Contact> {
    readonly _node: ContactEdgeScanner;
    readonly _fixture: FixtureScanner;

    constructor(param: ContactScannerParameterObject) {
        super(param);
        this._node = param.node;
        this._fixture = param.fixture;
    }

    scan(object: Box2DWeb.Dynamics.Contacts.b2Contact): void {
        this._self.add(object);
        this._node.scan(object.m_nodeA);
        this._node.scan(object.m_nodeB);
        this._fixture.scan(object.m_fixtureA);
        this._fixture.scan(object.m_fixtureB);
        if (object.m_prev) {
            this.scan(object.m_prev);
        }
        if (object.m_next) {
            this.scan(object.m_next);
        }
    }
}
