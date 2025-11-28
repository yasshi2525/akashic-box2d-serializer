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

const expectToShallowEqualVec2 = (received: Box2DWeb.Common.Math.b2Vec2, expected: Box2DWeb.Common.Math.b2Vec2) => {
    // -0 と 0 が混在するため
    expect(received.x === expected.x).toBe(true);
    expect(received.y === expected.y).toBe(true);
};

const expectToShallowEqualShape = (received: Box2DWeb.Collision.Shapes.b2Shape, expected: Box2DWeb.Collision.Shapes.b2Shape) => {
    // -0 と 0 が混在するため
    expect(received.GetType() === expected.GetType()).toBe(true);
};

export const expectToShallowEqualFixture = (received: Box2DWeb.Dynamics.b2Fixture, expected: Box2DWeb.Dynamics.b2Fixture, onlyComparesDefinition: boolean = false) => {
    if (!onlyComparesDefinition) {
        expect(received.GetAABB()).toEqual(expected.GetAABB());
    }
    expect(received.GetDensity()).toBe(expected.GetDensity());
    expect(received.GetFilterData()).toEqual(expected.GetFilterData());
    expect(received.GetFriction()).toBe(expected.GetFriction());
    expect(received.GetMassData()).toEqual(expected.GetMassData());
    expect(received.GetRestitution()).toBe(expected.GetRestitution());
    expectToShallowEqualShape(received.GetShape(), expected.GetShape());
    expect(received.GetType()).toEqual(expected.GetType());
    expect(received.GetUserData()).toEqual(expected.GetUserData());
    expect(received.IsSensor()).toBe(expected.IsSensor());
};

export const expectToShallowEqualBody = (received: Box2DWeb.Dynamics.b2Body, expected: Box2DWeb.Dynamics.b2Body) => {
    expect(received.GetAngle()).toBe(expected.GetAngle());
    expect(received.GetAngularDamping()).toBe(expected.GetAngularDamping());
    expect(received.GetAngularVelocity()).toEqual(expected.GetAngularVelocity());
    expect(received.GetDefinition()).toEqual(expected.GetDefinition());
    let receivedF = received.GetFixtureList();
    let expectedF = expected.GetFixtureList();
    while (receivedF && expectedF) {
        expectToShallowEqualFixture(receivedF, expectedF, true);
        receivedF = receivedF.GetNext();
        expectedF = expectedF.GetNext();
        if (!receivedF) {
            expect(expectedF).toBeFalsy();
        }
        if (!expectedF) {
            expect(receivedF).toBeFalsy();
        }
    }
    expect(received.GetInertia()).toBe(expected.GetInertia());
    expect(received.GetAngle()).toBe(expected.GetAngle());
    expect(received.GetLinearDamping()).toBe(expected.GetLinearDamping());
    expect(received.GetLinearVelocity()).toEqual(expected.GetLinearVelocity());
    expect(received.GetMass()).toBe(expected.GetMass());
    expect(received.GetPosition()).toEqual(expected.GetPosition());
    expect(received.GetTransform()).toEqual(expected.GetTransform());
    expect(received.GetType()).toBe(expected.GetType());
    expect(received.GetUserData()).toBe(expected.GetUserData());
    expect(received.IsActive()).toBe(expected.IsActive());
    expect(received.IsAwake()).toBe(expected.IsAwake());
    expect(received.IsBullet()).toBe(expected.IsBullet());
    expect(received.IsFixedRotation()).toBe(expected.IsFixedRotation());
    expect(received.IsSleepingAllowed()).toBe(expected.IsSleepingAllowed());
};
