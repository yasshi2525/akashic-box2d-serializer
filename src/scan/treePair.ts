import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { BaseScanner, BaseScannerParameterObject } from "./scannable";
import { DynamicTreeNodeScanner } from "./treeNode";

export interface DynamicTreePairScannerParameterObject extends BaseScannerParameterObject<Box2DWeb.Collision.b2DynamicTreePair> {
    node: DynamicTreeNodeScanner;
}

export class DynamicTreePairScanner extends BaseScanner<Box2DWeb.Collision.b2DynamicTreePair> {
    readonly _node: DynamicTreeNodeScanner;

    constructor(param: DynamicTreePairScannerParameterObject) {
        super(param);
        this._node = param.node;
    }

    scan(object: Box2DWeb.Collision.b2DynamicTreePair): void {
        this._node.scan(object.proxyA);
        this._node.scan(object.proxyB);
    }
}
