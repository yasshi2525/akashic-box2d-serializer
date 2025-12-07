import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { BaseScannerParameterObject, BaseScanner } from "./scannable";
import { FixtureScanner } from "./fixture";
import { ContactEdgeScanner } from "./contactEdge";

export interface BodyScannerParameterObject extends BaseScannerParameterObject<Box2DWeb.Dynamics.b2Body> {
    /**
     * body, fixture は相互依存関係のため
     */
    fixture: () => FixtureScanner;
    /**
     * body, contactEdge は相互依存関係のため
     */
    contactEdge: () => ContactEdgeScanner;
}

export class BodyScanner extends BaseScanner<Box2DWeb.Dynamics.b2Body> {
    readonly _fixture: () => FixtureScanner;
    readonly _contactEdge: () => ContactEdgeScanner;

    constructor(param: BodyScannerParameterObject) {
        super(param);
        this._fixture = param.fixture;
        this._contactEdge = param.contactEdge;
    }

    scan(object: Box2DWeb.Dynamics.b2Body): void {
        this._self.add(object);
        if (object.m_fixtureList) {
            this._fixture().scan(object.m_fixtureList);
        }
        if (object.m_contactList) {
            this._contactEdge().scan(object.m_contactList);
        }
        if (object.m_prev) {
            this.scan(object.m_prev);
        }
        if (object.m_next) {
            this.scan(object.m_next);
        }
    }
}
