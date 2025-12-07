import { ObjectDef, RefParam } from "../serializerObject";
import { DynamicTreeBroadPhaseParam } from "./broadPhase";

export interface ContactManagerParam {
    broadPhase: ObjectDef<DynamicTreeBroadPhaseParam>;
    /**
     * ref b2Contact
     */
    contactList?: ObjectDef<RefParam>;
    contactCount: number;
    allocator: null;
}
