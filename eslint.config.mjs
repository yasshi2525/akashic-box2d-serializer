import stylistic from "@stylistic/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/** @type {import("eslint").Linter.Config} */
export default [
    {
        ignores: ["lib/**/*.js", "coverage"],
    },
    {
        files: ["**/*.[c|m]js"],
        ...stylistic.configs.customize({
            indent: 4,
            quotes: "double",
            semi: true,
        }),
    },
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 6,
        },
        ...stylistic.configs.customize({
            indent: 4,
            quotes: "double",
            semi: true,
        }),
    },
];
