import { assert } from "chai";
import { JsonRpcProvider } from "ethers/providers";

import { EthersProviderWrapper } from "../src/ethers-provider-wrapper";

import { useEnvironment } from "./helpers";

describe("Ethers provider wrapper", function () {
  let realProvider: JsonRpcProvider;
  let wrapper: EthersProviderWrapper;

  useEnvironment(__dirname);

  beforeEach(function () {
    realProvider = new JsonRpcProvider();
    wrapper = new EthersProviderWrapper(this.env.network.provider);
  });

  it("Should return the same as the real provider", async function () {
    const response = await realProvider.send("eth_accounts", []);
    const response2 = await wrapper.send("eth_accounts", []);

    assert.deepEqual(response, response2);
  });

  it("Should return the same error", async function () {
    // We disable this test for RskJ
    // See: https://github.com/rsksmart/rskj/issues/876
    const version = await this.env.network.provider.send("web3_clientVersion");
    if (version.includes("RskJ")) {
      this.skip();
    }

    try {
      await realProvider.send("error_please", []);
      assert.fail("Ethers provider should have failed");
    } catch (err) {
      try {
        await wrapper.send("error_please", []);
        assert.fail("Wrapped provider should have failed");
      } catch (err2) {
        assert.deepEqual(err2.message, err.message);
      }
    }
  });
});