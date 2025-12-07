export {};

declare module "@akashic-extension/akashic-box2d" {
    /**
     * 直列化・復元に必要な非公開パラメタを公開する
     */
    module Box2DWeb {
        module Collision {
            interface b2DynamicTreeNode {
                aabb: b2AABB;
                userData?: Dynamics.b2Fixture;
                parent?: b2DynamicTreeNode;
                child1?: b2DynamicTreeNode;
                child2?: b2DynamicTreeNode;
            }

            interface b2DynamicTree {
                m_root: b2DynamicTreeNode | null;
                m_freeList: b2DynamicTreeNode | null;
                m_path: number;
                m_insertionCount: number;
            }
            interface b2DynamicTreeBroadPhase {
                m_tree: b2DynamicTree;
                m_moveBuffer: b2DynamicTreeNode[];
                m_pairBuffer: b2DynamicTreePair[];
                m_pairCount: number;
                m_proxyCount: number; // 常に NaN で実質機能してない
            }
            class b2DynamicTreePair {
                proxyA: b2DynamicTreeNode;
                proxyB: b2DynamicTreeNode;
            }
            interface b2ManifoldPoint {
                // https://github.com/akashic-games/akashic-box2d/issues/102
                m_localPoint: Common.Math.b2Vec2;
            }
            interface Features {
                _m_id: b2ContactID;
                _flip: number;
                _incidentEdge: number;
                _incidentVertex: number;
                _referenceEdge: number;
            }
            interface b2ContactID {
                _key?: number;
            }
        }
        module Dynamics {
            module Contacts {
                class b2ContactConstraint {
                    // TODO impl
                }

                class b2ContactFactory {
                    // TODO impl
                }
                class b2ContactSolver {
                    m_step: Dynamics.b2TimeStep;
                    m_constraints: b2ContactConstraint[];
                    // TODO declare methods
                }
                interface b2Contact {
                    m_nodeA: b2ContactEdge;
                    m_nodeB: b2ContactEdge;
                    m_manifold: Collision.b2Manifold;
                    m_oldManifold: Collision.b2Manifold;
                    m_flags: number;
                    m_fixtureA: b2Fixture;
                    m_fixtureB: b2Fixture;
                    m_prev?: b2Contact;
                    m_next?: b2Contact;
                }
                class b2CircleContact extends b2Contact {
                }
                class b2EdgeAndCircleContact extends b2Contact {
                }
                class b2NullContact extends b2Contact {
                }
                class b2PolyAndCircleContact extends b2Contact {
                }
                class b2PolyAndEdgeContact extends b2Contact {
                }
                class b2PolygonContact extends b2Contact {
                }
            }

            class b2TimeStep {
                // TODO impl
            }

            class b2ContactManager {
                m_world: b2World;
                m_broadPhase: Collision.b2DynamicTreeBroadPhase;
                m_contactList?: Contacts.b2Contact;
                m_contactCount: number;
                m_contactFilter: b2ContactFilter;
                m_contactListener: b2ContactListener;
                m_constactFactory: Dynamics.Contacts.b2ContactFactory;
                m_allocator: null; // 未使用
                // TODO declare methods
            }

            class b2Island {
                m_bodies: b2Body[];
                m_contacts: [];
                m_joints: [];
                m_bodyCapacity: number;
                m_contactCapacity: number;
                m_jointCapacity: number;
                m_bodyCount: number;
                m_contactCount: number;
                m_jointCount: number;
                m_allocator: null; // 未使用
                m_listener: b2ContactListener;
                m_contactSolver: Contacts.b2ContactSolver;
                // TODO declare methods
            }

            interface b2World {
                s_stack: (b2Body | null)[];
                m_contactManager: b2ContactManager;
                m_contactSolver: Contacts.b2ContactSolver;
                m_island: b2Island;
                m_destructionListener: b2DestructionListener;
                m_debugDraw: b2DebugDraw;
                m_bodyList: b2Body | null;
                m_contactList: Contacts.b2Contact | null;
                m_jointList: Joints.b2Joint | null;
                m_controllerList: Controllers.b2Controller | null;
                m_bodyCount: number;
                m_contactCount: number;
                m_jointCount: number;
                m_controllerCount: number;
                m_allowSleep: boolean;
                m_gravity: Common.Math.b2Vec2;
                m_inv_dt0: number;
                m_groundBody: b2Body;
                m_flags: number;
            }
            interface b2Fixture {
                m_density: number;
                m_friction: number;
                m_restitution: number;
                m_aabb: Collision.b2AABB;
                m_userData: any;
                m_isSensor: boolean;
                m_filter: b2FilterData;
                m_next?: b2Fixture;
                m_shape?: Collision.Shapes.b2Shape;
                m_body: b2Body | null;
                m_proxy?: Collision.b2DynamicTreeNode;
            }
            interface b2Body {
                m_xf: Common.Math.b2Transform;
                m_sweep: Common.Math.b2Sweep;
                m_linearVelocity: Common.Math.b2Vec2;
                m_force: Common.Math.b2Vec2;
                m_flags: number;
                m_world: b2World;
                m_jointList: Joints.b2Joint | null;
                m_controllerList: Controllers.b2Controller | null;
                m_contactList: Contacts.b2ContactEdge | null;
                m_controllerCount: number;
                m_prev: b2Body | null;
                m_next: b2Body | null;
                m_angularVelocity: number;
                m_linearDamping: number;
                m_angularDamping: number;
                m_torque: number;
                m_sleepTime: number;
                m_type: number;
                m_mass: number;
                m_invMass: number;
                m_I: number;
                m_invI: number;
                m_inertiaScale: number;
                m_userData: any;
                m_fixtureList: b2Fixture | null;
                m_fixtureCount: number;
                m_islandIndex?: number;
            }
        }
    }
}
