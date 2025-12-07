import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { ObjectStore, toRefTypeName } from "../../src/scan/store";
import { ComplexObjectStore } from "../../src/scan/storeComplex";
import { BodyScanner } from "../../src/scan/body";
import { FixtureScanner } from "../../src/scan/fixture";
import { DynamicTreeNodeScanner } from "../../src/scan/treeNode";
import { DynamicTreePairScanner } from "../../src/scan/treePair";
import { DynamicTreeScanner } from "../../src/scan/tree";
import { DynamicTreeBroadPhaseScanner } from "../../src/scan/broadPhase";
import { ContactEdgeScanner } from "../../src/scan/contactEdge";
import { ContactScanner } from "../../src/scan/contact";
import { ContactManagerScanner } from "../../src/scan/contactManager";
import { WorldScanner } from "../../src/scan/world";
import { Vec2Serializer } from "../../src/serialize/vec2";
import { Mat22Serializer } from "../../src/serialize/mat22";
import { TransformSerializer } from "../../src/serialize/transform";
import { SweepSerializer } from "../../src/serialize/sweep";
import { BodySerializer, bodyType } from "../../src/serialize/body";
import { CircleShapeSerializer, PolygonShapeSerializer, ShapeSerializer } from "../../src/serialize/shape";
import { FilterDataSerializer } from "../../src/serialize/filterData";
import { FixtureSerializer, fixtureType } from "../../src/serialize/fixture";
import { AABBSerializer } from "../../src/serialize/aabb";
import { DynamicTreeNodeSerializer, dynamicTreeNodeType } from "../../src/serialize/treeNode";
import { DynamicTreePairSerializer, dynamicTreePairType } from "../../src/serialize/treePair";
import { DynamicTreeSerializer } from "../../src/serialize/tree";
import { DynamicTreeBroadPhaseSerializer } from "../../src/serialize/broadPhase";
import { FeaturesSerializer } from "../../src/serialize/features";
import { ContactIDSerializer } from "../../src/serialize/contactID";
import { ManifoldPointSerializer } from "../../src/serialize/manifoldPoint";
import { ManifoldSerializer } from "../../src/serialize/manifold";
import { ContactSerializer, contactTypes, resolveContactTypeName } from "../../src/serialize/contact";
import { ContactEdgeSerializer, contactEdgeType } from "../../src/serialize/contactEdge";
import { ContactManagerSerializer } from "../../src/serialize/contactManager";
import { WorldSerializer } from "../../src/serialize/world";
import { ReferredStoreSerializer } from "../../src/serialize/referred";
import { UnresolverChecker } from "../../src/deserialize/checker";
import { ObjectResolver } from "../../src/deserialize/resolver";
import { ComplexObjectResolver } from "../../src/deserialize/resolverComplex";
import { Vec2Deserializer } from "../../src/deserialize/vec2";
import { Mat22Deserializer } from "../../src/deserialize/mat22";
import { TransformDeserializer } from "../../src/deserialize/transform";
import { SweepDeserializer } from "../../src/deserialize/sweep";
import { BodyDeserializedPayload, BodyDeserializer } from "../../src/deserialize/body";
import { CircleShapeDeserializer, PolygonShapeDeserializer, ShapeDeserializer } from "../../src/deserialize/shape";
import { FilterDataDeserializer } from "../../src/deserialize/filterData";
import { FixtureDeserializedPayload, FixtureDeserializer } from "../../src/deserialize/fixture";
import { AABBDeserializer } from "../../src/deserialize/aabb";
import { DynamicTreeNodeDeserializedPayload, DynamicTreeNodeDeserializer } from "../../src/deserialize/treeNode";
import { DynamicTreePairDeserializer } from "../../src/deserialize/treePair";
import { DynamicTreeDeserializer } from "../../src/deserialize/tree";
import { DynamicTreeBroadPhaseDeserializer } from "../../src/deserialize/broadPhase";
import { FeaturesDeserializer } from "../../src/deserialize/features";
import { ContactIDDeserializer } from "../../src/deserialize/contactID";
import { ManifoldPointDeserializer } from "../../src/deserialize/manifoldPoint";
import { ManifoldDeserializer } from "../../src/deserialize/manifold";
import { ContactDeserializedPayload, ContactDeserializer } from "../../src/deserialize/contact";
import { ContactEdgeDeserializedPayload, ContactEdgeDeserializer } from "../../src/deserialize/contactEdge";
import { ContactManagerMerger } from "../../src/merge/contactManager";
import { WorldMerger } from "../../src/merge/world";
import { ReferredStoreDeserializer } from "../../src/deserialize/referred";

export const createBox2DWebSerializers = () => {
    const stores = {
        body: new ObjectStore<Box2DWeb.Dynamics.b2Body>(bodyType),
        fixture: new ObjectStore<Box2DWeb.Dynamics.b2Fixture>(fixtureType),
        node: new ObjectStore<Box2DWeb.Collision.b2DynamicTreeNode>(dynamicTreeNodeType),
        pair: new ObjectStore<Box2DWeb.Collision.b2DynamicTreePair>(dynamicTreePairType),
        contact: new ComplexObjectStore<Box2DWeb.Dynamics.Contacts.b2Contact>([...contactTypes], resolveContactTypeName),
        contactEdge: new ObjectStore<Box2DWeb.Dynamics.Contacts.b2ContactEdge>(contactEdgeType),
    };
    const scanners = (() => {
        const body: BodyScanner = new BodyScanner({ self: stores.body, fixture: () => fixture, contactEdge: () => contactEdge });
        const fixture: FixtureScanner = new FixtureScanner({ self: stores.fixture, body, proxy: () => node });
        const node = new DynamicTreeNodeScanner({ self: stores.node, fixture });
        const pair = new DynamicTreePairScanner({ self: stores.pair, node });
        const tree = new DynamicTreeScanner({ node });
        const broadPhase = new DynamicTreeBroadPhaseScanner({ tree, pair, node });
        const contactEdge: ContactEdgeScanner = new ContactEdgeScanner({ self: stores.contactEdge, body, contact: () => contact });
        const contact = new ContactScanner({ self: stores.contact, node: contactEdge, fixture });
        const contactManager = new ContactManagerScanner({ broadPhase, contact });
        const world = new WorldScanner({ body, contactManager, contact });
        return {
            body, fixture, node, pair, tree, broadPhase, contactEdge, contact, contactManager, world,
        };
    })();
    const serializers = (() => {
        const vec2 = new Vec2Serializer();
        const mat22 = new Mat22Serializer({ vec2 });
        const transform = new TransformSerializer({ vec2, mat22 });
        const sweep = new SweepSerializer({ vec2 });
        const body = new BodySerializer({ vec2, sweep, transform, self: stores.body, fixture: stores.fixture, contactEdge: stores.contactEdge });
        const circle = new CircleShapeSerializer();
        const polygon = new PolygonShapeSerializer({ vec2 });
        const shape = new ShapeSerializer({ circle, polygon });
        const filterData = new FilterDataSerializer();
        const aabb = new AABBSerializer({ vec2 });
        const fixture = new FixtureSerializer({ aabb, filterData, shape, self: stores.fixture, body: stores.body, node: stores.node });
        const node = new DynamicTreeNodeSerializer({ aabb, self: stores.node, fixture: stores.fixture });
        const pair = new DynamicTreePairSerializer({ node: stores.node });
        const tree = new DynamicTreeSerializer({ node: stores.node });
        const broadPhase = new DynamicTreeBroadPhaseSerializer({ tree, pair, node: stores.node });
        const features = new FeaturesSerializer();
        const contactID = new ContactIDSerializer({ features });
        const manifoldPoint = new ManifoldPointSerializer({ contactID, vec2 });
        const manifold = new ManifoldSerializer({ vec2, manifoldPoint });
        const contact = new ContactSerializer({ manifold, self: stores.contact, node: stores.contactEdge, fixture: stores.fixture });
        const contactEdge = new ContactEdgeSerializer({ self: stores.contactEdge, body: stores.body, contact: stores.contact });
        const contactManager = new ContactManagerSerializer({ contact: stores.contact, broadPhase });
        const world = new WorldSerializer({ contactManager, body: stores.body, contact: stores.contact });
        const referred = new ReferredStoreSerializer({ body, fixture, node, contact, contactEdge, bodyStore: stores.body, fixtureStore: stores.fixture, nodeStore: stores.node, contactStore: stores.contact, contactEdgeStore: stores.contactEdge });
        return {
            vec2, mat22, transform, sweep, body, circle, polygon, shape, filterData, aabb, fixture, node, pair, tree, broadPhase, features, contactID, manifoldPoint, manifold, contact, contactEdge, contactManager, world, referred,
        };
    })();
    return {
        stores,
        scanners,
        serializers,
    };
};

export const createEmptyWorld = () => new Box2DWeb.Dynamics.b2World(new Box2DWeb.Common.Math.b2Vec2(), true);

export const createBox2DWebDeserializers = (baseWorld: Box2DWeb.Dynamics.b2World) => {
    const checker = new UnresolverChecker();
    const resolvers = {
        body: new ObjectResolver<BodyDeserializedPayload>(toRefTypeName(bodyType)),
        fixture: new ObjectResolver<FixtureDeserializedPayload>(toRefTypeName(fixtureType)),
        node: new ObjectResolver<DynamicTreeNodeDeserializedPayload>(toRefTypeName(dynamicTreeNodeType)),
        contact: new ComplexObjectResolver<ContactDeserializedPayload>(contactTypes.map(t => toRefTypeName(t))),
        contactEdge: new ObjectResolver<ContactEdgeDeserializedPayload>(toRefTypeName(contactEdgeType)),
    };
    const deserializers = (() => {
        const vec2 = new Vec2Deserializer();
        const mat22 = new Mat22Deserializer({ vec2 });
        const transform = new TransformDeserializer({ vec2, mat22 });
        const sweep = new SweepDeserializer({ vec2 });
        const body = new BodyDeserializer({ checker, world: baseWorld, vec2, sweep, transform, self: resolvers.body, fixture: resolvers.fixture, contactEdge: resolvers.contactEdge });
        const circle = new CircleShapeDeserializer();
        const polygon = new PolygonShapeDeserializer({ vec2 });
        const shape = new ShapeDeserializer({ circle, polygon });
        const filterData = new FilterDataDeserializer();
        const aabb = new AABBDeserializer({ vec2 });
        const fixture = new FixtureDeserializer({ checker, aabb, filterData, shape, self: resolvers.fixture, body: resolvers.body, node: resolvers.node });
        const node = new DynamicTreeNodeDeserializer({ checker, aabb, self: resolvers.node, fixture: resolvers.fixture });
        const pair = new DynamicTreePairDeserializer({ checker, node: resolvers.node });
        const tree = new DynamicTreeDeserializer({ checker, node: resolvers.node });
        const broadPhase = new DynamicTreeBroadPhaseDeserializer({ checker, tree, pair, node: resolvers.node });
        const features = new FeaturesDeserializer({ checker });
        const contactID = new ContactIDDeserializer({ features });
        const manifoldPoint = new ManifoldPointDeserializer({ contactID, vec2 });
        const manifold = new ManifoldDeserializer({ vec2, manifoldPoint });
        const contact = new ContactDeserializer({ checker, manifold, self: resolvers.contact, node: resolvers.contactEdge, fixture: resolvers.fixture });
        const contactEdge = new ContactEdgeDeserializer({ checker, self: resolvers.contactEdge, body: resolvers.body, contact: resolvers.contact });
        const contactManager = new ContactManagerMerger({ checker, contact: resolvers.contact, broadPhase });
        const world = new WorldMerger({ checker, contactManager, body: resolvers.body, contact: resolvers.contact });
        const referred = new ReferredStoreDeserializer({ checker, body, fixture, node, contact, contactEdge, bodyResolver: resolvers.body, fixtureResolver: resolvers.fixture, nodeResolver: resolvers.node, contactResolver: resolvers.contact, contactEdgeResolver: resolvers.contactEdge });
        return {
            vec2, mat22, transform, sweep, body, circle, polygon, shape, filterData, aabb, fixture, node, pair, tree, broadPhase, features, contactID, manifoldPoint, manifold, contact, contactEdge, contactManager, world, referred,
        };
    })();
    return {
        checker,
        resolvers,
        deserializers,
    };
};

export const createDefaultEntityParam = (scene: g.Scene): g.EParameterObject => ({
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

export const expectToNotXOR = (received: any, expected: any) => {
    if (!received) {
        expect(expected).toBeFalsy();
    }
    if (!expected) {
        expect(received).toBeFalsy();
    }
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
    expect(received.GetRestitution()).toBe(expected.GetRestitution());
    expectToNotXOR(received.m_shape, expected.m_shape);
    if (expected.m_shape) {
        expect(received.GetMassData()).toEqual(expected.GetMassData());
        expectToShallowEqualShape(received.m_shape!, expected.m_shape);
        expect(received.GetType()).toEqual(expected.GetType());
    }
    expect(received.GetUserData()).toEqual(expected.GetUserData());
    expect(received.IsSensor()).toBe(expected.IsSensor());
    expectToNotXOR(received.m_body, expected.m_body);
    if (expected.m_body) {
        expectToShallowEqualBody(received.m_body!, expected.m_body, true);
    }
};

export const expectToShallowEqualBody = (received: Box2DWeb.Dynamics.b2Body, expected: Box2DWeb.Dynamics.b2Body, skipsFixtureComparison: boolean = false) => {
    expect(received.GetAngle()).toBe(expected.GetAngle());
    expect(received.GetAngularDamping()).toBe(expected.GetAngularDamping());
    expect(received.GetAngularVelocity()).toEqual(expected.GetAngularVelocity());
    if (!skipsFixtureComparison) {
        let receivedF = received.GetFixtureList();
        let expectedF = expected.GetFixtureList();
        expectToNotXOR(receivedF, expectedF);
        while (receivedF && expectedF) {
            expectToShallowEqualFixture(receivedF, expectedF, true);
            receivedF = receivedF.GetNext();
            expectedF = expectedF.GetNext();
            expectToNotXOR(receivedF, expectedF);
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

export const expectToShallowEqualDynamicTreeNode = (received: Box2DWeb.Collision.b2DynamicTreeNode, expected: Box2DWeb.Collision.b2DynamicTreeNode) => {
    expect(received.aabb).toEqual(expected.aabb);
    expectToNotXOR(received.userData, received.userData);
    if (expected.userData) {
        expectToShallowEqualFixture(received.userData!, expected.userData, true);
    }
    expectToNotXOR(received.child1, received.child1);
    if (expected.child1) {
        expectToShallowEqualDynamicTreeNode(received.child1!, expected.child1);
    }
    expectToNotXOR(received.child2, received.child2);
    if (expected.child2) {
        expectToShallowEqualDynamicTreeNode(received.child2!, expected.child2);
    }
};

export const expectToShallowEqualDynamicTree = (received: Box2DWeb.Collision.b2DynamicTree, expected: Box2DWeb.Collision.b2DynamicTree) => {
    expectToNotXOR(received.m_root, expected.m_root);
    if (expected.m_root) {
        expectToShallowEqualDynamicTreeNode(received.m_root!, expected.m_root);
    }
};

export const expectToShallowEqualDynamicTreeBroadPhase = (received: Box2DWeb.Collision.b2DynamicTreeBroadPhase, expected: Box2DWeb.Collision.b2DynamicTreeBroadPhase) => {
    expectToShallowEqualDynamicTree(received.m_tree, expected.m_tree);
    expect(received.m_proxyCount).toBe(expected.m_proxyCount);
    expect(received.m_pairCount).toBe(expected.m_pairCount);
    expect(received.m_moveBuffer.length).toBe(expected.m_moveBuffer.length);
    for (let i = 0; i < received.m_moveBuffer.length; i++) {
        expectToShallowEqualDynamicTreeNode(received.m_moveBuffer[i], expected.m_moveBuffer[i]);
    }
    expect(received.m_pairBuffer.length).toBe(expected.m_pairBuffer.length);
    for (let i = 0; i < received.m_pairBuffer.length; i++) {
        expectToShallowEqualDynamicTreeNode(received.m_pairBuffer[i].proxyA, expected.m_pairBuffer[i].proxyA);
        expectToShallowEqualDynamicTreeNode(received.m_pairBuffer[i].proxyB, expected.m_pairBuffer[i].proxyB);
    }
};

export const expectToShallowEqualContactManager = (received: Box2DWeb.Dynamics.b2ContactManager, expected: Box2DWeb.Dynamics.b2ContactManager) => {
    expectToShallowEqualDynamicTreeBroadPhase(received.m_broadPhase, expected.m_broadPhase);
    expect(received.m_contactCount).toBe(expected.m_contactCount);
    let receivedContact = received.m_contactList;
    let expectedContact = expected.m_contactList;
    expectToNotXOR(receivedContact, expectedContact);
    while (receivedContact && expectedContact) {
        expectToShallowEqualContact(receivedContact, expectedContact);
        receivedContact = receivedContact.GetNext();
        expectedContact = expectedContact.GetNext();
        expectToNotXOR(receivedContact, expectedContact);
    }
    expect(received.m_allocator).toEqual(expected.m_allocator);
};

export const expectToShallowEqualContactEdge = (received: Box2DWeb.Dynamics.Contacts.b2ContactEdge, expected: Box2DWeb.Dynamics.Contacts.b2ContactEdge) => {
    expectToShallowEqualBody(received.other, expected.other);
};

export const expectToShallowEqualContact = (received: Box2DWeb.Dynamics.Contacts.b2Contact, expected: Box2DWeb.Dynamics.Contacts.b2Contact) => {
    expect(received.GetManifold()).toEqual(expected.GetManifold());
    expect(received.m_oldManifold).toEqual(expected.m_oldManifold);
    expectToShallowEqualFixture(received.GetFixtureA(), expected.GetFixtureA(), true);
    expectToShallowEqualFixture(received.GetFixtureB(), expected.GetFixtureB(), true);
    expectToShallowEqualContactEdge(received.m_nodeA, expected.m_nodeA);
    expectToShallowEqualContactEdge(received.m_nodeB, expected.m_nodeB);
    expect(received.m_flags).toBe(expected.m_flags);
    expect(received.constructor.name).toBe(expected.constructor.name);
};

export const expectToShallowEqualWorld = (received: Box2DWeb.Dynamics.b2World, expected: Box2DWeb.Dynamics.b2World) => {
    expect(received.GetBodyCount()).toBe(expected.GetBodyCount());
    let receivedBody = received.GetBodyList();
    let expectedBody = expected.GetBodyList();
    expectToNotXOR(receivedBody, expectedBody);
    while (receivedBody && expectedBody) {
        expectToShallowEqualBody(receivedBody, expectedBody);
        receivedBody = receivedBody.GetNext();
        expectedBody = expectedBody.GetNext();
        expectToNotXOR(receivedBody, expectedBody);
    }
    expectToShallowEqualContactManager(received.m_contactManager, expected.m_contactManager);
    expect(received.GetContactCount()).toBe(expected.GetContactCount());
    let receivedContact = received.GetContactList();
    let expectedContact = expected.GetContactList();
    expectToNotXOR(receivedContact, expectedContact);
    while (receivedContact && expectedContact) {
        expectToShallowEqualContact(receivedContact, expectedContact);
        receivedContact = receivedContact.GetNext();
        expectedContact = expectedContact.GetNext();
        expectToNotXOR(receivedContact, expectedContact);
    }
    expect(received.m_flags).toBe(expected.m_flags);
    expectToShallowEqualBody(received.m_groundBody, expected.m_groundBody);
};
