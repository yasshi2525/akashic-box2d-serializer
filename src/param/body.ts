import { ObjectDef, RefParam } from "../serializerObject";
import { SweepParam } from "./sweep";
import { TransformParam } from "./transform";
import { Vec2Param } from "./vec2";

/**
 * b2Joint, b2Controller は直列化対象外です
 */
export interface BodyParam {
    angularDamping: number;
    angularVelocity: number;
    /**
     * ref to b2ContactEdge
     */
    contactList?: ObjectDef<RefParam>;
    fixtureCount: number;
    /**
     * ref to b2Fixture
     */
    fixtureList?: ObjectDef<RefParam>;
    flags: number;
    force: ObjectDef<Vec2Param>;
    I: number;
    inertiaScale: number;
    invI: number;
    invMass: number;
    linearDamping: number;
    linearVelocity: ObjectDef<Vec2Param>;
    mass: number;
    /**
     * ref to b2Body
     */
    next?: ObjectDef<RefParam>;
    /**
     * ref to b2Body
     */
    prev?: ObjectDef<RefParam>;
    sleepTime: number;
    sweep: ObjectDef<SweepParam>;
    torque: number;
    type: number;
    userData: any;
    xf: ObjectDef<TransformParam>;
}
