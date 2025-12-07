import { ObjectDef, RefParam } from "../serializerObject";
import { ContactManagerParam } from "./contactManager";

/**
 * B2World オブジェクトを復元可能な形式で直列化したJSONです。
 * b2ContactSolver, b2Island, b2DestructionListener, b2DebugDraw, b2Joint, b2Controller, allowSleep, gravity は直列化対象外です。
 * 一時的な利用と思われ、直列化不要と判断: b2ContactSolver, b2Island
 * ユーザー定義事項のため、直列化不要と判断: b2DestructionListener, b2DebugDraw, b2Controller
 * 対応すべきだが、優先度が低く、ユーザーに復元させるようにしたもの: b2Joint
 * Box2D 初期化時に指定されるため、直列化不要と判断: allowSleep, gravity
 */
export interface WorldParam {
    /**
     * ref b2Body
     */
    stack: (ObjectDef<RefParam> | null)[];
    contactManager: ObjectDef<ContactManagerParam>;
    /**
     * ref b2Body
     */
    bodyList?: ObjectDef<RefParam>;
    bodyCount: number;
    /**
     * ref b2Contact
     */
    contactList?: ObjectDef<RefParam>;
    contactCount: number;
    inv_dt0: number;
    /**
     * ref b2Body
     */
    groundBody: ObjectDef<RefParam>;
    flags: number;
}
