import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { SingleReferredScanner } from "./scannable";
import { DynamicTreeNodeScanner } from "./treeNode";
import { DynamicTreePairScanner } from "./treePair";
import { DynamicTreeScanner } from "./tree";

export interface DynamicTreeBroadPhaseScannerParameterObject {
    tree: DynamicTreeScanner;
    pair: DynamicTreePairScanner;
    node: DynamicTreeNodeScanner;
}

export class DynamicTreeBroadPhaseScanner extends SingleReferredScanner<Box2DWeb.Collision.b2DynamicTreeBroadPhase> {
    readonly _tree: DynamicTreeScanner;
    readonly _pair: DynamicTreePairScanner;
    readonly _node: DynamicTreeNodeScanner;

    constructor(param: DynamicTreeBroadPhaseScannerParameterObject) {
        super();
        this._tree = param.tree;
        this._node = param.node;
        this._pair = param.pair;
    }

    scan(object: Box2DWeb.Collision.b2DynamicTreeBroadPhase): void {
        this._tree.scan(object.m_tree);
        for (const n of object.m_moveBuffer) {
            this._node.scan(n);
        }
        for (const p of object.m_pairBuffer) {
            this._pair.scan(p);
        }
    }
}
