import { ObjectDef, RefParam } from "../serializerObject";

export interface DynamicTreeParam {
    /**
     * ref b2DynamicTreeNode
     */
    root?: ObjectDef<RefParam>;
    /**
     * ref b2DynamicTreeNode
     */
    freeList?: ObjectDef<RefParam>;
    path: number;
    insertionCount: number;
}
