module.exports = () => {
    const { execSync } = require("node:child_process");
    const fs = require("node:fs");
    const path = require("node:path");

    const projectDir = "spec/e2e/project";

    execSync("npm run clean");
    execSync("npm run build");

    execSync(`tsc --project ${projectDir}`);

    /** @type {import("@akashic/game-configuration")} */
    const gameJson = {
        width: 1280,
        height: 720,
        fps: 60,
        main: "./script/main.js",
        assets: {},
        environment: {
            "sandbox-runtime": "3",
            "nicolive": {
                supportedModes: [
                    "multi_admission",
                ],
            },
        },
    };
    fs.writeFileSync(
        path.join(projectDir, "game.json"),
        JSON.stringify(gameJson, null, 4),
        { encoding: "utf-8" },
    );
    execSync(`akashic scan asset --cwd ${projectDir}`);
    execSync(`akashic scan globalScripts --cwd ${projectDir}`);
};
