import { ObjectDef, RefParam } from "../serializerObject";
import { DynamicTreeParam } from "./tree";
import { DynamicTreePairParam } from "./treePair";

export interface DynamicTreeBroadPhaseParam {
    tree: ObjectDef<DynamicTreeParam>;
    /**
     * ref b2DynamicTreeNode
     */
    moveBuffer: ObjectDef<RefParam>[];
    pairBuffer: ObjectDef<DynamicTreePairParam>[];
    proxyCount: number;
    pairCount: number;
}
