import { BodyType, Box2D, Box2DParameter, Box2DWeb } from "@akashic-extension/akashic-box2d";
import { Box2DSerializer } from "../../src/serializerBox2D";
import { toExpectedEntity } from "./utils";

describe("Box2DSerializer", () => {
    let serializer: Box2DSerializer;
    let deserializer: Box2DSerializer;
    let box2d: Box2D;
    let targetBox2D: Box2D;
    let spriteImageBefore: g.ImageAsset;
    let spriteImageAfter: g.ImageAsset;
    let spriteSurfaceBefore: g.Surface;
    let spriteSurfaceAfter: g.Surface;
    let frameSpriteImageBefore: g.ImageAsset;
    let frameSpriteImageAfter: g.ImageAsset;
    let frameSpriteSurfaceBefore: g.Surface;
    let frameSpriteSurfaceAfter: g.Surface;
    let paneImageBefore: g.ImageAsset;
    let paneImageAfter: g.ImageAsset;
    let paneSurfaceBefore: g.Surface;
    let paneSurfaceAfter: g.Surface;
    let fontBefore: g.Font;
    let fontAfter: g.Font;
    let bodyDef: Box2DWeb.Dynamics.b2BodyDef;
    let fixtureDef: Box2DWeb.Dynamics.b2FixtureDef;

    beforeEach(() => {
        const box2dParam: Box2DParameter = {
            gravity: [0, -9.8],
            scale: 10,
        };
        box2d = new Box2D(box2dParam);
        targetBox2D = new Box2D(box2dParam);
        bodyDef = box2d.createBodyDef({ type: BodyType.Kinematic });
        fixtureDef = box2d.createFixtureDef({ shape: box2d.createCircleShape(10) });
        spriteImageBefore = client.createDummyImageAsset({
            width: 100,
            height: 100,
            id: "dummy",
            path: "/dummy",
        });
        spriteImageAfter = targetClient.createDummyImageAsset({
            width: 100,
            height: 100,
            id: "dummy",
            path: "/dummy",
        });
        scene._sceneAssetHolder._assetManager._assets["dummy"] = spriteImageBefore;
        targetScene._sceneAssetHolder._assetManager._assets["dummy"] = spriteImageAfter;
        spriteSurfaceBefore = scene.game.resourceFactory.createSurface(123, 234);
        spriteSurfaceAfter = targetScene.game.resourceFactory.createSurface(123, 234);
        frameSpriteImageBefore = client.createDummyImageAsset({
            width: 200,
            height: 200,
            id: "dummy2",
            path: "/dummy2",
        });
        frameSpriteImageAfter = targetClient.createDummyImageAsset({
            width: 200,
            height: 200,
            id: "dummy2",
            path: "/dummy2",
        });
        scene._sceneAssetHolder._assetManager._assets["dummy2"] = frameSpriteImageBefore;
        targetScene._sceneAssetHolder._assetManager._assets["dummy2"] = frameSpriteImageAfter;
        frameSpriteSurfaceBefore = scene.game.resourceFactory.createSurface(234, 345);
        frameSpriteSurfaceAfter = targetScene.game.resourceFactory.createSurface(234, 345);
        paneImageBefore = client.createDummyImageAsset({
            width: 300,
            height: 300,
            id: "dummy3",
            path: "/dummy",
        });
        paneImageAfter = targetClient.createDummyImageAsset({
            width: 300,
            height: 300,
            id: "dummy3",
            path: "/dummy",
        });
        scene._sceneAssetHolder._assetManager._assets["dummy3"] = paneImageBefore;
        targetScene._sceneAssetHolder._assetManager._assets["dummy3"] = paneImageAfter;
        paneSurfaceBefore = scene.game.resourceFactory.createSurface(345, 456);
        paneSurfaceAfter = targetScene.game.resourceFactory.createSurface(345, 456);
        fontBefore = new g.DynamicFont({
            game: scene.game,
            fontFamily: "sans-serif",
            size: 50,
        });
        fontAfter = new g.DynamicFont({
            game: targetScene.game,
            fontFamily: "sans-serif",
            size: 50,
        });
        serializer = new Box2DSerializer({
            box2d,
            scene,
        });
        deserializer = new Box2DSerializer({
            box2d: targetBox2D,
            scene: targetScene,
            srpiteSurfaceDeserializer: () => spriteSurfaceAfter,
            frameSpriteSurfaceDeserializer: () => frameSpriteSurfaceAfter,
            paneSurfaceDeserializer: () => paneSurfaceAfter,
            labelFontDeserializer: () => fontAfter,
        });
    });

    const expectToShallowEqualFixture = (received: Box2DWeb.Dynamics.b2Fixture, expected: Box2DWeb.Dynamics.b2Fixture) => {
        expect(received.GetAABB()).toEqual(expected.GetAABB());
        expect(received.GetDensity()).toBe(expected.GetDensity());
        expect(received.GetFilterData()).toEqual(expected.GetFilterData());
        expect(received.GetFriction()).toBe(expected.GetFriction());
        expect(received.GetMassData()).toEqual(expected.GetMassData());
        expect(received.GetRestitution()).toBe(expected.GetRestitution());
        expect(received.GetShape()).toEqual(expected.GetShape());
        expect(received.GetType()).toEqual(expected.GetType());
        expect(received.GetUserData()).toEqual(expected.GetUserData());
        expect(received.IsSensor()).toBe(expected.IsSensor());
    };

    const expectToEqualsNode = (received: Box2DWeb.Collision.b2DynamicTreeNode, expected: Box2DWeb.Collision.b2DynamicTreeNode) => {
        expect(received.aabb).toEqual(expected.aabb);
        if (expected.userData) {
            expect(received.userData).toBeTruthy();
            expectToShallowEqualFixture(received.userData!, expected.userData);
        }
        else {
            expect(received.userData).toBeUndefined();
        }
        if (expected.child1) {
            expect(received.child1).toBeTruthy();
            expectToEqualsNode(received.child1!, expected.child1);
        }
        else {
            expect(received.child1).toBeUndefined();
        }
        if (expected.child2) {
            expect(received.child2).toBeTruthy();
            expectToEqualsNode(received.child2!, expected.child2);
        }
        else {
            expect(received.child2).toBeUndefined();
        }
    };

    const expectToEqualsTree = (received: Box2DWeb.Collision.b2DynamicTree, expected: Box2DWeb.Collision.b2DynamicTree) => {
        if (expected.m_root) {
            expect(received.m_root).toBeTruthy();
            expectToEqualsNode(received.m_root!, expected.m_root);
        }
        else {
            expect(received.m_root).toBeNull();
        }
    };

    it("can serialize g.E", () => {
        const entity = new g.E({
            scene,
            parent: scene,
        });
        box2d.createBody(entity, bodyDef, fixtureDef);
        const json = serializer.serializeBodies();
        expect(json.bodies).toHaveLength(1);
        expect(json.fixtures).toHaveLength(1);
        expect(serializer._fixtureMapper.objects()).toHaveLength(0); // check cache is cleared.
        expect(serializer._fixtureDefMapper.objects()).toHaveLength(0); // check cache is cleared.
        expect(json.contactManager.broadPhase.tree).toBeDefined();
        expect(serializer._dynamicTreeNodeMapper.objects()).toHaveLength(0); // check cache is cleared.
    });

    it("can deserialize g.E", () => {
        const entity = new g.E({
            scene,
            parent: scene,
        });
        box2d.createBody(entity, bodyDef, fixtureDef);
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(entity, ebody[0].entity));
        expect(deserializer._fixtureDefMapper.objects()).toHaveLength(0); // check cache is cleared.
        expect(deserializer._fixtureMapper.objects()).toHaveLength(0); // check cache is cleared.
        expect(deserializer._dynamicTreeNodeMapper.objects()).toHaveLength(0); // check cache is cleared.
        expectToEqualsTree(
            targetBox2D.world.m_contactManager.m_broadPhase.m_tree,
            box2d.world.m_contactManager.m_broadPhase.m_tree
        );
    });

    it("can deserialize g.FilledRect", () => {
        const rect = new g.FilledRect({
            scene,
            parent: scene,
            width: 100,
            height: 100,
            cssColor: "blue",
        });
        box2d.createBody(rect, bodyDef, fixtureDef);
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(rect, ebody[0].entity));
    });

    it("can deserialize g.Sprite (src = g.Surface)", () => {
        const sprite = new g.Sprite({
            scene,
            parent: scene,
            src: spriteSurfaceBefore,
        });
        box2d.createBody(sprite, bodyDef, fixtureDef);
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(sprite, ebody[0].entity));
    });

    it("can deserialize g.FrameSprite (src = g.Surface)", () => {
        const frameSprite = new g.FrameSprite({
            scene,
            parent: scene,
            src: frameSpriteSurfaceBefore,
            width: 100,
            height: 100,
        });
        box2d.createBody(frameSprite, bodyDef, fixtureDef);
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(frameSprite, ebody[0].entity));
    });

    it("can deserialize g.Pane (backgroundImage = g.Surface)", () => {
        const pane = new g.Pane({
            scene,
            parent: scene,
            backgroundImage: paneSurfaceBefore,
            width: 100,
            height: 100,
        });
        box2d.createBody(pane, bodyDef, fixtureDef);
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(pane, ebody[0].entity));
    });

    it("can deserialize g.Label", () => {
        const label = new g.Label({
            scene,
            parent: scene,
            font: fontBefore,
            text: "dummy",
        });
        box2d.createBody(label, bodyDef, fixtureDef);
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        const expected = toExpectedEntity(label, ebody[0].entity) as g.Label;
        expected.font = (ebody[0].entity as g.Label).font;
        expect(ebody[0].entity).toEqual(expected);
    });

    it("can deserialize derived g.E class instance (default deserializer)", () => {
        class SimpleE extends g.E {
            readonly input1: string;
            constructor(param: g.EParameterObject & { input1: string }) {
                super(param);
                this.input1 = param.input1;
            }
        }
        const simpleE = new SimpleE({
            scene,
            parent: scene,
            input1: "dummy",
        });
        box2d.createBody(simpleE, bodyDef, fixtureDef);
        serializer.addDerivedEntitySerializer(SimpleE, obj => ({ input1: obj.input1 }));
        deserializer.addDerivedEntitySerializer(SimpleE, obj => ({ input1: obj.input1 }));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simpleE, ebody[0].entity));
    });

    it("can deserialize derived g.E class instance (custom deserializer)", () => {
        class SimpleE extends g.E {
            readonly input1: string;
            constructor(param: g.EParameterObject, input1: string) {
                super(param);
                this.input1 = input1;
            }
        }
        const simpleE = new SimpleE({
            scene,
            parent: scene,
        }, "dummy");
        box2d.createBody(simpleE, bodyDef, fixtureDef);
        serializer.addDerivedEntitySerializer(SimpleE, obj => ({ input1: obj.input1 }), json => new SimpleE(json, json.input1));
        deserializer.addDerivedEntitySerializer(SimpleE, obj => ({ input1: obj.input1 }), json => new SimpleE(json, json.input1));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simpleE, ebody[0].entity));
    });

    it("can deserialize derived g.FilledRect class instance (default deserializer)", () => {
        class SimpleFilledRect extends g.FilledRect {
            readonly input1: string;
            constructor(param: g.FilledRectParameterObject & { input1: string }) {
                super(param);
                this.input1 = param.input1;
            }
        }
        const simpleRect = new SimpleFilledRect({
            scene,
            parent: scene,
            cssColor: "blue",
            width: 100,
            height: 100,
            input1: "dummy",
        });
        box2d.createBody(simpleRect, bodyDef, fixtureDef);
        serializer.addDerivedFilledRectSerializer(SimpleFilledRect, obj => ({ input1: obj.input1 }));
        deserializer.addDerivedFilledRectSerializer(SimpleFilledRect, obj => ({ input1: obj.input1 }));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simpleRect, ebody[0].entity));
    });

    it("can deserialize derived g.FilledRect class instance (custom deserializer)", () => {
        class SimpleFilledRect extends g.FilledRect {
            readonly input1: string;
            constructor(param: g.FilledRectParameterObject, input1: string) {
                super(param);
                this.input1 = input1;
            }
        }
        const simpleRect = new SimpleFilledRect({
            scene,
            parent: scene,
            cssColor: "blue",
            width: 100,
            height: 100,
        }, "dummy");
        box2d.createBody(simpleRect, bodyDef, fixtureDef);
        serializer.addDerivedFilledRectSerializer(SimpleFilledRect, obj => ({ input1: obj.input1 }), json => new SimpleFilledRect(json, json.input1));
        deserializer.addDerivedFilledRectSerializer(SimpleFilledRect, obj => ({ input1: obj.input1 }), json => new SimpleFilledRect(json, json.input1));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simpleRect, ebody[0].entity));
    });

    it("can deserialize derived g.Sprite (src = g.ImageAsset) class instance (default deserializer)", () => {
        class SimpleSprite extends g.Sprite {
            readonly input1: string;
            constructor(param: g.SpriteParameterObject & { input1: string }) {
                super(param);
                this.input1 = param.input1;
            }
        }
        const simpleSprite = new SimpleSprite({
            scene,
            parent: scene,
            src: spriteImageBefore,
            input1: "dummy",
        });
        box2d.createBody(simpleSprite, bodyDef, fixtureDef);
        serializer.addDerivedSpriteSerializer(SimpleSprite, obj => ({ input1: obj.input1 }));
        deserializer.addDerivedSpriteSerializer(SimpleSprite, obj => ({ input1: obj.input1 }));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simpleSprite, ebody[0].entity));
    });

    it("can deserialize derived g.Sprite (src = g.ImageAsset) class instance (custom deserializer)", () => {
        class SimpleSprite extends g.Sprite {
            readonly input1: string;
            constructor(param: g.SpriteParameterObject, input1: string) {
                super(param);
                this.input1 = input1;
            }
        }
        const simpleSprite = new SimpleSprite({
            scene,
            parent: scene,
            src: spriteImageBefore,
        }, "dummy");
        box2d.createBody(simpleSprite, bodyDef, fixtureDef);
        serializer.addDerivedSpriteSerializer(SimpleSprite, obj => ({ input1: obj.input1 }), undefined, json => new SimpleSprite(json, json.input1));
        deserializer.addDerivedSpriteSerializer(SimpleSprite, obj => ({ input1: obj.input1 }), undefined, json => new SimpleSprite(json, json.input1));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simpleSprite, ebody[0].entity));
    });

    it("can deserialize derived g.Sprite (src = g.Surface) class instance (default deserializer)", () => {
        class SimpleSprite extends g.Sprite {
            readonly input1: string;
            constructor(param: g.SpriteParameterObject & { input1: string }) {
                super(param);
                this.input1 = param.input1;
            }
        }
        const simpleSprite = new SimpleSprite({
            scene,
            parent: scene,
            src: spriteSurfaceBefore,
            input1: "dummy",
        });
        box2d.createBody(simpleSprite, bodyDef, fixtureDef);
        serializer.addDerivedSpriteSerializer(SimpleSprite, obj => ({ input1: obj.input1 }));
        deserializer.addDerivedSpriteSerializer(SimpleSprite, obj => ({ input1: obj.input1 }), () => spriteSurfaceAfter);
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simpleSprite, ebody[0].entity));
    });

    it("can deserialize derived g.Sprite (src = g.Surface) class instance (custom deserializer)", () => {
        class SimpleSprite extends g.Sprite {
            readonly input1: string;
            constructor(param: g.SpriteParameterObject, input1: string) {
                super(param);
                this.input1 = input1;
            }
        }
        const simpleSprite = new SimpleSprite({
            scene,
            parent: scene,
            src: spriteSurfaceBefore,
        }, "dummy");
        box2d.createBody(simpleSprite, bodyDef, fixtureDef);
        serializer.addDerivedSpriteSerializer(SimpleSprite, obj => ({ input1: obj.input1 }), () => spriteSurfaceBefore, json => new SimpleSprite(json, json.input1));
        deserializer.addDerivedSpriteSerializer(SimpleSprite, obj => ({ input1: obj.input1 }), () => spriteSurfaceBefore, json => new SimpleSprite(json, json.input1));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simpleSprite, ebody[0].entity));
    });

    it("can deserialize derived g.FrameSprite (src = g.ImageAsset) class instance (default deserializer)", () => {
        class SimpleFrameSprite extends g.FrameSprite {
            readonly input1: string;
            constructor(param: g.FrameSpriteParameterObject & { input1: string }) {
                super(param);
                this.input1 = param.input1;
            }
        }
        const simpleFrameSprite = new SimpleFrameSprite({
            scene,
            parent: scene,
            src: frameSpriteImageBefore,
            width: 100,
            height: 100,
            input1: "dummy",
        });
        box2d.createBody(simpleFrameSprite, bodyDef, fixtureDef);
        serializer.addDerivedFrameSpriteSerializer(SimpleFrameSprite, obj => ({ input1: obj.input1 }));
        deserializer.addDerivedFrameSpriteSerializer(SimpleFrameSprite, obj => ({ input1: obj.input1 }));

        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simpleFrameSprite, ebody[0].entity));
    });

    it("can deserialize derived g.FrameSprite (src = g.ImageAsset) class instance (custom deserializer)", () => {
        class SimpleFrameSprite extends g.FrameSprite {
            readonly input1: string;
            constructor(param: g.FrameSpriteParameterObject, input1: string) {
                super(param);
                this.input1 = input1;
            }
        }
        const simpleFrameSprite = new SimpleFrameSprite({
            scene,
            parent: scene,
            width: 100,
            height: 100,
            src: frameSpriteImageBefore,
        }, "dummy");
        box2d.createBody(simpleFrameSprite, bodyDef, fixtureDef);
        serializer.addDerivedFrameSpriteSerializer(SimpleFrameSprite, obj => ({ input1: obj.input1 }), undefined, json => new SimpleFrameSprite(json, json.input1));
        deserializer.addDerivedFrameSpriteSerializer(SimpleFrameSprite, obj => ({ input1: obj.input1 }), undefined, json => new SimpleFrameSprite(json, json.input1));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simpleFrameSprite, ebody[0].entity));
    });

    it("can deserialize derived g.FrameSprite (src = g.Surface) class instance (default deserializer)", () => {
        class SimpleFrameSprite extends g.FrameSprite {
            readonly input1: string;
            constructor(param: g.FrameSpriteParameterObject & { input1: string }) {
                super(param);
                this.input1 = param.input1;
            }
        }
        const simpleFrameSprite = new SimpleFrameSprite({
            scene,
            parent: scene,
            src: frameSpriteSurfaceBefore,
            width: 100,
            height: 100,
            input1: "dummy",
        });
        box2d.createBody(simpleFrameSprite, bodyDef, fixtureDef);
        serializer.addDerivedFrameSpriteSerializer(SimpleFrameSprite, obj => ({ input1: obj.input1 }), () => frameSpriteSurfaceAfter);
        deserializer.addDerivedFrameSpriteSerializer(SimpleFrameSprite, obj => ({ input1: obj.input1 }), () => frameSpriteSurfaceAfter);
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        const expected = toExpectedEntity(simpleFrameSprite, ebody[0].entity) as g.FrameSprite;
        expected.src = frameSpriteSurfaceAfter;
        expect((ebody[0].entity as g.FrameSprite).src).toEqual(frameSpriteSurfaceAfter);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(expected);
    });

    it("can deserialize derived g.FrameSprite (src = g.Surface) class instance (custom deserializer)", () => {
        class SimpleFrameSprite extends g.FrameSprite {
            readonly input1: string;
            constructor(param: g.FrameSpriteParameterObject, input1: string) {
                super(param);
                this.input1 = input1;
            }
        }
        const simpleFrameSprite = new SimpleFrameSprite({
            scene,
            parent: scene,
            src: frameSpriteSurfaceBefore,
            width: 100,
            height: 100,
        }, "dummy");
        box2d.createBody(simpleFrameSprite, bodyDef, fixtureDef);
        serializer.addDerivedFrameSpriteSerializer(SimpleFrameSprite, obj => ({ input1: obj.input1 }), () => frameSpriteSurfaceAfter, json => new SimpleFrameSprite(json, json.input1));
        deserializer.addDerivedFrameSpriteSerializer(SimpleFrameSprite, obj => ({ input1: obj.input1 }), () => frameSpriteSurfaceAfter, json => new SimpleFrameSprite(json, json.input1));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        const expected = toExpectedEntity(simpleFrameSprite, ebody[0].entity) as g.FrameSprite;
        expected.src = frameSpriteSurfaceAfter;
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(expected);
    });

    it("can deserialize derived g.Label class instance (default deserializer)", () => {
        class SimpleLabel extends g.Label {
            readonly input1: string;
            constructor(param: g.LabelParameterObject & { input1: string }) {
                super(param);
                this.input1 = param.input1;
            }
        }
        const simpleLabel = new SimpleLabel({
            scene,
            parent: scene,
            font: fontBefore,
            text: "dummyText",
            input1: "dummy",
        });
        box2d.createBody(simpleLabel, bodyDef, fixtureDef);
        serializer.addDerivedLabelSerializer(SimpleLabel, obj => ({ input1: obj.input1 }), () => fontAfter);
        deserializer.addDerivedLabelSerializer(SimpleLabel, obj => ({ input1: obj.input1 }), () => fontAfter);
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        const expected = toExpectedEntity(simpleLabel, ebody[0].entity) as g.Label;
        expected.font = fontAfter;
        expect(ebody[0].entity).toEqual(expected);
    });

    it("can deserialize derived g.Label class instance (custom deserializer)", () => {
        class SimpleLabel extends g.Label {
            readonly input1: string;
            constructor(param: g.LabelParameterObject, input1: string) {
                super(param);
                this.input1 = input1;
            }
        }
        const simpleLabel = new SimpleLabel({
            scene,
            parent: scene,
            font: fontBefore,
            text: "dummyText",
        }, "dummy");
        box2d.createBody(simpleLabel, bodyDef, fixtureDef);
        serializer.addDerivedLabelSerializer(SimpleLabel, obj => ({ input1: obj.input1 }), () => fontAfter, json => new SimpleLabel(json, json.input1));
        deserializer.addDerivedLabelSerializer(SimpleLabel, obj => ({ input1: obj.input1 }), () => fontAfter, json => new SimpleLabel(json, json.input1));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        const expected = toExpectedEntity(simpleLabel, ebody[0].entity) as g.Label;
        expected.font = fontAfter;
        expect(ebody[0].entity).toEqual(expected);
    });

    it("can deserialize derived g.Pane class instance (default deserializer)", () => {
        class SimplePane extends g.Pane {
            readonly input1: string;
            constructor(param: g.PaneParameterObject & { input1: string }) {
                super(param);
                this.input1 = param.input1;
            }
        }
        const simplePane = new SimplePane({
            scene,
            parent: scene,
            width: 100,
            height: 100,
            input1: "dummy",
        });
        box2d.createBody(simplePane, bodyDef, fixtureDef);
        serializer.addDerivedPaneSerializer(SimplePane, obj => ({ input1: obj.input1 }));
        deserializer.addDerivedPaneSerializer(SimplePane, obj => ({ input1: obj.input1 }));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simplePane, ebody[0].entity));
    });

    it("can deserialize derived g.Pane class instance (custom deserializer)", () => {
        class SimplePane extends g.Pane {
            readonly input1: string;
            constructor(param: g.PaneParameterObject, input1: string) {
                super(param);
                this.input1 = input1;
            }
        }
        const simplePane = new SimplePane({
            scene,
            parent: scene,
            width: 100,
            height: 100,
        }, "dummy");
        box2d.createBody(simplePane, bodyDef, fixtureDef);
        serializer.addDerivedPaneSerializer(SimplePane, obj => ({ input1: obj.input1 }), undefined, json => new SimplePane(json, json.input1));
        deserializer.addDerivedPaneSerializer(SimplePane, obj => ({ input1: obj.input1 }), undefined, json => new SimplePane(json, json.input1));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simplePane, ebody[0].entity));
    });

    it("can deserialize derived g.Pane (backgroundImage = g.ImageAsset) class instance (default deserializer)", () => {
        class SimplePane extends g.Pane {
            readonly input1: string;
            constructor(param: g.PaneParameterObject & { input1: string }) {
                super(param);
                this.input1 = param.input1;
            }
        }
        const simplePane = new SimplePane({
            scene,
            parent: scene,
            backgroundImage: paneImageBefore,
            width: 100,
            height: 100,
            input1: "dummy",
        });
        box2d.createBody(simplePane, bodyDef, fixtureDef);
        serializer.addDerivedPaneSerializer(SimplePane, obj => ({ input1: obj.input1 }));
        deserializer.addDerivedPaneSerializer(SimplePane, obj => ({ input1: obj.input1 }));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simplePane, ebody[0].entity));
    });

    it("can deserialize derived g.Pane (backgroundImage = g.ImageAsset) class instance (custom deserializer)", () => {
        class SimplePane extends g.Pane {
            readonly input1: string;
            constructor(param: g.PaneParameterObject, input1: string) {
                super(param);
                this.input1 = input1;
            }
        }
        const simplePane = new SimplePane({
            scene,
            parent: scene,
            backgroundImage: paneImageBefore,
            width: 100,
            height: 100,
        }, "dummy");
        box2d.createBody(simplePane, bodyDef, fixtureDef);
        serializer.addDerivedPaneSerializer(SimplePane, obj => ({ input1: obj.input1 }), undefined, json => new SimplePane(json, json.input1));
        deserializer.addDerivedPaneSerializer(SimplePane, obj => ({ input1: obj.input1 }), undefined, json => new SimplePane(json, json.input1));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simplePane, ebody[0].entity));
    });

    it("can deserialize derived g.Pane (backgroundImage = g.Surface) class instance (default deserializer)", () => {
        class SimplePane extends g.Pane {
            readonly input1: string;
            constructor(param: g.PaneParameterObject & { input1: string }) {
                super(param);
                this.input1 = param.input1;
            }
        }
        const simplePane = new SimplePane({
            scene,
            parent: scene,
            backgroundImage: paneSurfaceBefore,
            width: 100,
            height: 100,
            input1: "dummy",
        });
        box2d.createBody(simplePane, bodyDef, fixtureDef);
        serializer.addDerivedPaneSerializer(SimplePane, obj => ({ input1: obj.input1 }), () => paneSurfaceAfter);
        deserializer.addDerivedPaneSerializer(SimplePane, obj => ({ input1: obj.input1 }), () => paneSurfaceAfter);
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simplePane, ebody[0].entity));
    });

    it("can deserialize derived g.Pane (backgroundImage = g.Surface) class instance (custom deserializer)", () => {
        class SimplePane extends g.Pane {
            readonly input1: string;
            constructor(param: g.PaneParameterObject, input1: string) {
                super(param);
                this.input1 = input1;
            }
        }
        const simplePane = new SimplePane({
            scene,
            parent: scene,
            backgroundImage: paneSurfaceBefore,
            width: 100,
            height: 100,
        }, "dummy");
        box2d.createBody(simplePane, bodyDef, fixtureDef);
        serializer.addDerivedPaneSerializer(SimplePane, obj => ({ input1: obj.input1 }), () => paneSurfaceAfter, json => new SimplePane(json, json.input1));
        deserializer.addDerivedPaneSerializer(SimplePane, obj => ({ input1: obj.input1 }), () => paneSurfaceAfter, json => new SimplePane(json, json.input1));
        const json = serializer.serializeBodies();
        const ebody = deserializer.desrializeBodies(json);
        expect(ebody).toHaveLength(1);
        expect(ebody[0].entity).toEqual(toExpectedEntity(simplePane, ebody[0].entity));
    });
});
