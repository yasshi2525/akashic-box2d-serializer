import * as path from "node:path";
import { GameClient, GameContext } from "@akashic/headless-akashic";
import { expectShallowEqualsBodies } from "./utils";

describe("e2e", () => {
    let context: GameContext<3>;
    let activeInstance: GameClient<3>;

    beforeEach(async () => {
        context = new GameContext<3>({ gameJsonPath: path.join(__dirname, "project", "game.json") });
        activeInstance = await context.getGameClient();
        await activeInstance.advanceUntil(() => activeInstance.game.scene()?.name === "main");
    });

    it("should have box2d instance in init state", () => {
        expect(activeInstance.game.vars.usesSnapshot).toBeFalsy();
        expect(activeInstance.game.vars.tick).toBe(0);
        expect(activeInstance.game.vars.bodies).toHaveLength(0);
        expect(activeInstance.game.vars.requestSnapshotCount).toBe(0);
    });

    it("should count up snapshot after few mintues", async () => {
        await context.advance(60000);
        expect(activeInstance.game.vars.requestSnapshotCount).toBeGreaterThan(0);
    });

    it("restore by snapshot (just after snapshot)", async () => {
        await context.advance(10000);
        expect(activeInstance.game.vars.requestSnapshotCount).toBeGreaterThan(0);
        const passiveInstance = await context.createPassiveGameClient({ player: { id: "pid1", name: "player-1" } });
        await passiveInstance.advanceUntil(() => passiveInstance.game.scene()?.name === "main");
        expect(passiveInstance.game.vars.usesSnapshot).toBe(true);
        expect(passiveInstance.game.vars.tick).toBe(activeInstance.game.vars.tick);
        expect(passiveInstance.game.vars.requestSnapshotCount).toBe(0);
        expectShallowEqualsBodies(
            passiveInstance.game.vars.bodies,
            activeInstance.game.vars.bodies
        );
    });

    it("restore by snapshot (litte after snapshot)", async () => {
        await context.advance(15000);
        expect(activeInstance.game.vars.requestSnapshotCount).toBeGreaterThan(0);
        const passiveInstance = await context.createPassiveGameClient();
        await passiveInstance.advanceUntil(() => passiveInstance.game.scene()?.name === "main");
        expect(activeInstance.game.isSkipping).toBe(false);
        expect(passiveInstance.game.isSkipping).toBe(false);
        expect(passiveInstance.game.vars.usesSnapshot).toBe(true);
        while (activeInstance.game.vars.tick !== passiveInstance.game.vars.tick) {
            await context.step();
        }
        expect(passiveInstance.game.vars.tick).toBe(activeInstance.game.vars.tick);
        expect(passiveInstance.game.vars.requestSnapshotCount).toBe(0);
        expectShallowEqualsBodies(
            passiveInstance.game.vars.bodies,
            activeInstance.game.vars.bodies
        );
    });

    it("synchronize all clients (without snapshot)", async () => {
        const passiveInstance = await context.createPassiveGameClient({ player: { id: "pid1", name: "player-1" } });
        await passiveInstance.advanceUntil(() => passiveInstance.game.scene()?.name === "main");
        expect(activeInstance.game.vars.tick).toBe(passiveInstance.game.vars.tick);
        await context.advance(60000);
        expect(activeInstance.game.vars.tick).toBe(passiveInstance.game.vars.tick);
        expectShallowEqualsBodies(
            passiveInstance.game.vars.bodies,
            activeInstance.game.vars.bodies
        );
    });

    it("synchronize all clients (with snapshot)", async () => {
        await context.advance(15000);
        expect(activeInstance.game.vars.requestSnapshotCount).toBeGreaterThan(0);
        const passiveInstance = await context.createPassiveGameClient({ player: { id: "pid1", name: "player-1" } });
        await passiveInstance.advanceUntil(() => passiveInstance.game.scene()?.name === "main");
        while (activeInstance.game.vars.tick !== passiveInstance.game.vars.tick) {
            await context.step();
        }
        expect(activeInstance.game.vars.tick).toBe(passiveInstance.game.vars.tick);
        await context.advance(60000);
        expect(activeInstance.game.vars.tick).toBe(passiveInstance.game.vars.tick);
        expectShallowEqualsBodies(
            passiveInstance.game.vars.bodies,
            activeInstance.game.vars.bodies
        );
    });

    afterEach(async () => {
        // TODO: https://github.com/akashic-games/headless-akashic/issues/120
        await context.step();
        await context.destroy();
    });
});
