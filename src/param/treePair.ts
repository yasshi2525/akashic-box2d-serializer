import { ObjectDef, RefParam } from "../serializerObject";

export interface DynamicTreePairParam {
    /**
     * ref b2DynamicTreeNode
     */
    proxyA: ObjectDef<RefParam>;
    /**
     * ref b2DynamicTreeNode
     */
    proxyB: ObjectDef<RefParam>;
}
