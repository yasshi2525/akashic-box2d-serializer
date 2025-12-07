import { BodyType, Box2D } from "@akashic-extension/akashic-box2d";
import { Box2DBodiesParam, Box2DSerializer } from "@yasshi2525/akashic-box2d-serializer";

export = (param: g.GameMainParameterObject): void => {
    g.game.vars.requestSnapshotCount = 0;
    g.game.vars.tick = 0;
    if (param.snapshot) {
        g.game.vars.usesSnapshot = true;
    }
    const scene = new g.Scene({
        game: g.game,
        name: "main",
        assetIds: ["bullet"],
        assetPaths: ["/assets/**/*"],
    });
    scene.onLoad.add(() => {
        const box2d = new Box2D({
            gravity: [0, -9.8],
            scale: 10,
        });
        g.game.vars.world = box2d.world;
        g.game.vars.bodies = box2d.bodies;
        const serializer = new Box2DSerializer({
            scene,
            box2d,
        });
        if (param.snapshot) {
            g.game.vars.tick = param.snapshot.tick;
            serializer.desrializeBodies((param.snapshot as Box2DBodiesParam));
        }

        scene.onUpdate.add(() => {
            if (g.game.vars.tick % 1000 === 100) {
                for (const ebody of box2d.bodies) {
                    ebody.b2Body.ApplyForce(
                        box2d.vec2(
                            g.game.random.generate() * 100,
                            g.game.random.generate() * 100
                        ),
                        box2d.vec2(0, 0)
                    );
                }
            }
            if (g.game.vars.tick % 1000 === 600) {
                for (const ebody of box2d.bodies) {
                    ebody.b2Body.ApplyImpulse(
                        box2d.vec2(
                            g.game.random.generate() * 100,
                            g.game.random.generate() * 100
                        ),
                        box2d.vec2(0, 0)
                    );
                }
            }
            if (g.game.vars.tick % 10000 === 0) {
                box2d.createBody(
                    new g.Sprite({
                        scene,
                        parent: scene,
                        src: scene.asset.getImageById("bullet"),
                        x: g.game.random.generate() * g.game.width,
                        y: g.game.random.generate() * g.game.height,
                    }),
                    box2d.createBodyDef({ type: BodyType.Dynamic }),
                    box2d.createFixtureDef({ shape: box2d.createCircleShape(10) })
                );
                box2d.createBody(
                    new g.Sprite({
                        scene,
                        parent: scene,
                        src: scene.asset.getImage("/assets/foo/bullet.png"),
                        x: g.game.random.generate() * g.game.width,
                        y: g.game.random.generate() * g.game.height,
                    }),
                    box2d.createBodyDef({ type: BodyType.Dynamic }),
                    box2d.createFixtureDef({ shape: box2d.createCircleShape(10) })
                );
            }
            if (g.game.vars.tick % 20000 === 2) {
                if (box2d.bodies.length > 0) {
                    const rand = g.game.random.generate();
                    const del = box2d.bodies[Math.floor(rand * box2d.bodies.length)];
                    box2d.removeBody(del);
                    del.entity.destroy();
                }
            }
            g.game.vars.tick++;
            box2d.step(1000 / g.game.fps);
        });

        scene.setInterval(() => {
            g.game.requestSaveSnapshot(() => {
                g.game.vars.requestSnapshotCount++;
                return {
                    snapshot: {
                        tick: g.game.vars.tick,
                        ...serializer.serializeBodies(),
                    },
                };
            });
        }, 10000);
    });
    g.game.pushScene(scene);
};
