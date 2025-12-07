import { ObjectDef, RefParam } from "../serializerObject";
import { ManifoldParam } from "./manifold";

export interface ContactParam {
    /**
     * ref b2ContactEdge
     */
    nodeA: ObjectDef<RefParam>;
    /**
     * ref b2ContactEdge
     */
    nodeB: ObjectDef<RefParam>;
    manifold: ObjectDef<ManifoldParam>;
    oldManifold: ObjectDef<ManifoldParam>;
    flags: number;
    /**
     * ref b2Fixture
     */
    fixtureA: ObjectDef<RefParam>;
    /**
     * ref b2Fixture
     */
    fixtureB: ObjectDef<RefParam>;
    /**
     * ref b2Contact
     */
    prev?: ObjectDef<RefParam>;
    /**
     * ref b2Contact
     */
    next?: ObjectDef<RefParam>;
}
