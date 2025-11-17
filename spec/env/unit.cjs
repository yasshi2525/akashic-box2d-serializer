const { GameContext } = require("@akashic/headless-akashic");

global.g = require("@akashic/akashic-engine");

/** @type {import("@akashic/headless-akashic").GameContext} */
let context;

beforeEach(async () => {
    context = new GameContext({});
    const client = await context.getGameClient();
    global.g = client.g;
    global.g.game = client.game;
    await context.step();
    const scene = new client.g.Scene({ game: client.game, name: "__test__" });
    client.game.pushScene(scene);
    await client.advanceUntil(() => client.game.scene()?.name === "__test__");
});

afterEach(async () => {
    if (context) {
        await context.destroy();
    }
});
