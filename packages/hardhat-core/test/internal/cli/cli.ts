import child_process from "child_process";

import { assert } from "chai";

import { getPackageRoot } from "../../../src/internal/util/packageInfo";

import { useTmpDir } from "../../helpers/fs";

describe("command-line interface", function () {
  // The commands exercised in the tests, after project generation, were
  // manually copied from the README.txt that's included in the sample project.
  // Perhaps it would be better if we *generated* that README, and had all of
  // the sample commands listed in their own file, so that we can simply read
  // the commands from that file and execute them here, so that we'll be
  // actually verifying the commands were suggesting, without any risk of the
  // README falling out of sync with what's tested here.

  // It would be better if we had separate, independent tests for each of the
  // suggested commands, but because the project creation takes so long
  // (really it's the dependency installation that's so time consuming) even
  // a single test already has a crazy long run time, so for expediency this
  // is one big complex test.
  this.timeout(120 * 1000);

  useTmpDir("cli");

  describe("basic sample project", function () {
    it("should successfully execute all of the suggested commands in the basic sample project", async function () {
      process.chdir(this.tmpDir);
      try {
        child_process.execSync("yarn init --yes");
        child_process.execSync(`yarn add --dev file:${getPackageRoot()}`);
        child_process.execSync("npx hardhat", {
          env: {
            ...process.env,
            HARDHAT_CREATE_SAMPLE_PROJECT_WITH_DEFAULTS: "true",
          },
        });
        child_process.execSync("npx hardhat compile");
        child_process.execSync("npx hardhat test");
        child_process.execSync("node scripts/sample-script.js");
        child_process.execSync("npx hardhat test");
      } catch (error) {
        assert.fail(
          `error status ${error.status}, message: "${error.message}", stderr: "${error.stderr}", stdout: "${error.stdout}"`
        );
      }
    });
  });

  describe("advanced sample project", function () {
    it("should successfully execute all of the suggested commands in the advanced sample project", async function () {
      process.chdir(this.tmpDir);
      try {
        child_process.execSync("yarn init --yes");
        child_process.execSync(`yarn add --dev file:${getPackageRoot()}`);
        child_process.execSync("npx hardhat", {
          env: {
            ...process.env,
            HARDHAT_CREATE_ADVANCED_SAMPLE_PROJECT_WITH_DEFAULTS: "true",
          },
        });
        child_process.execSync("npx hardhat compile");
        child_process.execSync("npx hardhat test");
        child_process.execSync("node scripts/sample-script.js");
        child_process.execSync("REPORT_GAS=true npx hardhat test");
        child_process.execSync("npx hardhat coverage");
        child_process.execSync("npx eslint '**'");
        child_process.execSync("npx eslint '**' --fix");
        child_process.execSync("npx solhint '**/*.sol'");
        child_process.execSync("npx solhint '**/*.sol' --fix");
      } catch (error) {
        assert.fail(
          `error status ${error.status}, message: "${error.message}", stderr: "${error.stderr}", stdout: "${error.stdout}"`
        );
      }
    });
  });
});
