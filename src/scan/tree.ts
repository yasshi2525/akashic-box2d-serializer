import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { SingleReferredScanner } from "./scannable";
import { DynamicTreeNodeScanner } from "./treeNode";

export interface DynamicTreeScannerParameterObject {
    node: DynamicTreeNodeScanner;
}

export class DynamicTreeScanner extends SingleReferredScanner<Box2DWeb.Collision.b2DynamicTree> {
    readonly _node: DynamicTreeNodeScanner;

    constructor(param: DynamicTreeScannerParameterObject) {
        super();
        this._node = param.node;
    }

    scan(object: Box2DWeb.Collision.b2DynamicTree): void {
        if (object.m_root) {
            this._node.scan(object.m_root);
        }
        if (object.m_freeList) {
            this._node.scan(object.m_freeList);
        }
    }
}
