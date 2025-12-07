import { ObjectDef, RefParam } from "../serializerObject";
import { AABBParam } from "./aabb";
import { FilterDataParam } from "./filterData";
import { ShapeParam } from "./shape";

export interface FixtureParam {
    aabb: ObjectDef<AABBParam>;
    density: number;
    filter: ObjectDef<FilterDataParam>;
    friction: number;
    isSensor: boolean;
    restitution: number;
    /**
     * m_freeList の場合、shape が null
     */
    shape?: ObjectDef<ShapeParam>;
    userData: any;
    /**
     * ref b2Body
     */
    body?: ObjectDef<RefParam>;
    /**
     * ref b2Fixture
     */
    next?: ObjectDef<RefParam>;
    /**
     * ref b2DynamicTreeNode
     * つねに相互参照ではない点に注意（DestoryProxy すると fixture → node への参照が一方的に切られる）
     */
    proxy?: ObjectDef<RefParam>;
}
