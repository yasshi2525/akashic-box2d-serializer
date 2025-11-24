import { createDefaultPreset } from "ts-jest"

/**
 * @type {import("@jest/types").Config.ProjectConfig}
 */
const unitConfig = {
  displayName: "unit",
  testMatch: ["<rootDir>/spec/unit/**/*.spec.ts"],
  setupFilesAfterEnv: ["<rootDir>/spec/env/unit.cjs"],
  ...createDefaultPreset({
    tsconfig: "<rootDir>/spec/unit/tsconfig.json"
  }),
}

/**
 * @type {import("@jest/types").Config.ProjectConfig}
 */
const e2eConfig = {
  displayName: "e2e",
  testMatch: ["<rootDir>/spec/e2e/**/*.spec.ts"],
  testPathIgnorePatterns: ["<rootDir>/spec/e2e/project"],
  globalSetup: "<rootDir>/spec/env/e2e-setup.cjs",
  ...createDefaultPreset({
    tsconfig: "<rootDir>/spec/e2e/tsconfig.json"
  }),
}

/**
 * @type {import("jest").Config}
 */
export default {
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov"],
  projects: [
    unitConfig,
    e2eConfig
  ]
}
