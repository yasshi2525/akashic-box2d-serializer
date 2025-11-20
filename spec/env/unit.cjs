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
    const step = async () => ctx.step();
    return { ctx, client, g: client.g, scene, step };
};

beforeEach(async () => {
    const { ctx, client, g, scene, step } = await setup();
    context = ctx;
    global.g = g;
    global.scene = scene;
    global.client = client;
    const { ctx: targetCtx, client: targetClient, scene: targetScene, step: targetStep } = await setup();
    targetContext = targetCtx;
    global.targetScene = targetScene;
    global.targetClient = targetClient;
    global.step = async () => {
        await step();
        await targetStep();
    };
});

afterEach(async () => {
    if (context) {
        await context.destroy();
    }
    if (targetContext) {
        await targetContext.destroy();
    }
});
