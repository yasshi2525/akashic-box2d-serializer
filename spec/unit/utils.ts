import { Box2DWeb } from "@akashic-extension/akashic-box2d";

export const createDefaultEntityParam = (): g.EParameterObject => ({
    scene,
    anchorX: 0,
    anchorY: 0,
    angle: 0,
    compositeOperation: undefined,
    children: undefined,
    height: 0,
    hidden: false,
    local: false,
    opacity: 1,
    parent: undefined,
    scaleX: 1,
    scaleY: 1,
    tag: undefined,
    touchable: false,
    width: 0,
    x: 0,
    y: 0,
});

export const extractSerializedEntityParam = (param: g.EParameterObject, id: number): Partial<g.EParameterObject> => {
    const serializedParam: Partial<typeof param> = param;
    delete serializedParam.scene;
    delete serializedParam.shaderProgram;
    serializedParam.id = id;
    return serializedParam;
};

/**
 * 直列化前のオブジェクトを復元後のあるべきオブジェクトに変換します。
 * original の値を直接書き換えるので注意。
 * @param original 直列化前のオブジェクト
 * @param received 復元後のオブジェクト
 */
export const toExpectedEntity = (original: g.E, received: g.E): g.E => {
    original.scene = received.scene;
    original.parent = received.parent;
    original.state = received.state;
    original._matrix = received._matrix;
    if (original.children && received.children)
        for (const [i, receivedChild] of received.children.entries()) {
            original.children[i] = toExpectedEntity(original.children[i], receivedChild);
        }
    return original;
};

/**
 * 直列化前のオブジェクトを復元後のあるべきオブジェクトに変換します。
 * original の値を直接書き換えるので注意。
 * @param original 直列化前のオブジェクト
 * @param received 復元後のオブジェクト
 */
export const toExpectedBody = (original: Box2DWeb.Dynamics.b2Body, received: Box2DWeb.Dynamics.b2Body): Box2DWeb.Dynamics.b2Body => {
    // worldは差し替わる
    original.m_world = received.m_world;
    original.m_world.m_contactManager.m_world = received.m_world;

    // m_world の m_contactManager.m_broadPhase.m_tree.m_root.aabb は復元するとなぜか変わる。
    // おそらく既存の計算結果のキャッシュであると判断し、動作に問題はないと判断した。
    original.m_world.m_contactManager.m_broadPhase.m_tree.m_root.aabb.lowerBound
        .SetV(received.m_world.m_contactManager.m_broadPhase.m_tree.m_root.aabb.lowerBound);
    original.m_world.m_contactManager.m_broadPhase.m_tree.m_root.aabb.upperBound
        .SetV(received.m_world.m_contactManager.m_broadPhase.m_tree.m_root.aabb.upperBound);
    original.m_world.m_contactManager.m_broadPhase.m_tree.m_root.userData
        = received.m_world.m_contactManager.m_broadPhase.m_tree.m_root.userData;
    // fixture は復元時、直列化時刻の値になる。もとの fixture はオブジェクト生成時の値が保存されているので異なっていても問題なし。
    let originalF = original.GetFixtureList();
    let receivedF = received.GetFixtureList();
    while (receivedF && originalF) {
        originalF.GetAABB().lowerBound.SetV(receivedF.GetAABB().lowerBound);
        originalF.GetAABB().upperBound.SetV(receivedF.GetAABB().upperBound);
        originalF.m_body = receivedF.m_body;
        originalF.m_proxy = receivedF.m_proxy;
        receivedF = receivedF.GetNext();
        originalF = originalF.GetNext();
    }
    return original;
};
