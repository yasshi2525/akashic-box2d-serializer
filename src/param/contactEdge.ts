import { ObjectDef, RefParam } from "../serializerObject";

export interface ContactEdgeParam {
    /**
     * ref b2Contact
     * Reset() すると contactEdge → contact の参照が一方的に切られる。
     */
    contact?: ObjectDef<RefParam>;
    /**
     * ref b2ContactEdge
     */
    next?: ObjectDef<RefParam>;
    /**
     * ref b2Body
     */
    other?: ObjectDef<RefParam>;
    /**
     * ref b2ContactEdge
     */
    prev?: ObjectDef<RefParam>;
}
