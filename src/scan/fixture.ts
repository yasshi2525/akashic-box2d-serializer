import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { BaseScannerParameterObject, BaseScanner } from "./scannable";
import { DynamicTreeNodeScanner } from "./treeNode";
import { BodyScanner } from "./body";

export interface FixtureScannerParameterObject extends BaseScannerParameterObject<Box2DWeb.Dynamics.b2Fixture> {
    body: BodyScanner;
    /**
     * fixture, node は相互依存関係のため
     */
    proxy: () => DynamicTreeNodeScanner;
}

export class FixtureScanner extends BaseScanner<Box2DWeb.Dynamics.b2Fixture> {
    readonly _body: BodyScanner;
    readonly _proxy: () => DynamicTreeNodeScanner;

    constructor(param: FixtureScannerParameterObject) {
        super(param);
        this._body = param.body;
        this._proxy = param.proxy;
    }

    scan(object: Box2DWeb.Dynamics.b2Fixture): void {
        this._self.add(object);
        if (object.m_body) {
            this._body.scan(object.m_body);
        }
        if (object.m_next) {
            this.scan(object.m_next);
        }
        if (object.m_proxy) {
            this._proxy().scan(object.m_proxy);
        }
    }
}
