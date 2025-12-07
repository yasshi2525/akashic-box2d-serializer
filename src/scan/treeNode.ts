import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { BaseScannerParameterObject, BaseScanner } from "./scannable";
import { FixtureScanner } from "./fixture";

export interface DynamicTreeNodeScannerParameterObject extends BaseScannerParameterObject<Box2DWeb.Collision.b2DynamicTreeNode> {
    fixture: FixtureScanner;
}

export class DynamicTreeNodeScanner extends BaseScanner<Box2DWeb.Collision.b2DynamicTreeNode> {
    readonly _fixture: FixtureScanner;

    constructor(param: DynamicTreeNodeScannerParameterObject) {
        super(param);
        this._fixture = param.fixture;
    }

    scan(object: Box2DWeb.Collision.b2DynamicTreeNode): void {
        this._self.add(object);
        if (object.userData) {
            this._fixture.scan(object.userData);
        }
        if (object.child1) {
            this.scan(object.child1);
        }
        if (object.child2) {
            this.scan(object.child2);
        }
        if (object.parent) {
            this.scan(object.parent);
        }
    }
}
