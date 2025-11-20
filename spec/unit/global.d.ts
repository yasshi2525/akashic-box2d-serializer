import { GameClient } from "@akashic/headless-akashic";

export {};

declare global {
    const scene: g.Scene;
    const targetScene: g.Scene;
    const client: GameClient<3>;
    const targetClient: GameClient<3>;
    const step: () => Promise<void>;
}
