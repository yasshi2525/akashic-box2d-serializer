const { GameContext } = require("@akashic/headless-akashic");

global.g = require("@akashic/akashic-engine");

/** @type {import("@akashic/headless-akashic").GameContext} */
let context, targetContext;

const setup = async () => {
    const ctx = new GameContext({});
    const client = await ctx.getGameClient();
    client.g.game = client.game;
    await ctx.step();
    const scene = new client.g.Scene({ game: client.game, name: "__test__" });
    client.game.pushScene(scene);
    await client.advanceUntil(() => client.game.scene() === scene);
    return { ctx, g: client.g, scene };
};

beforeEach(async () => {
    const { ctx, g, scene } = await setup();
    context = ctx;
    global.g = g;
    global.scene = scene;
    const { ctx: targetCtx, scene: targetScene } = await setup();
    targetContext = targetCtx;
    global.targetScene = targetScene;
});

afterEach(async () => {
    if (context) {
        await context.destroy();
    }
    if (targetContext) {
        await targetContext.destroy();
    }
});
