import { ObjectDef, RefParam } from "../serializerObject";
import { AABBParam } from "./aabb";

export interface DynamicTreeNodeParam {
    aabb: ObjectDef<AABBParam>;
    parent?: ObjectDef<RefParam>;
    /**
     * ref b2DynamicTreeNode
     */
    child1?: ObjectDef<RefParam>;
    /**
     * ref b2DynamicTreeNode
     */
    child2?: ObjectDef<RefParam>;
    /**
     * ref b2Fixture
     */
    userData?: ObjectDef<RefParam>;
}
