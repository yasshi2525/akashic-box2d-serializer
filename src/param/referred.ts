import { ReferableObjectDef } from "../serialize/serializable";
import { BodyParam } from "./body";
import { FixtureParam } from "./fixture";
import { DynamicTreeNodeParam } from "./treeNode";
import { ContactParam } from "./contact";
import { ContactEdgeParam } from "./contactEdge";

export interface ReferredStoreParam {
    bodies: ReferableObjectDef<BodyParam>[];
    fixtures: ReferableObjectDef<FixtureParam>[];
    nodes: ReferableObjectDef<DynamicTreeNodeParam>[];
    contacts: ReferableObjectDef<ContactParam>[];
    contactEdges: ReferableObjectDef<ContactEdgeParam>[];
}
