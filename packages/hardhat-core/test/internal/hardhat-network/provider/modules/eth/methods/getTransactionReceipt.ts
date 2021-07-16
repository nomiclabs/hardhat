import { assert } from "chai";
import { BN, bufferToHex, toBuffer } from "ethereumjs-util";

import {
  numberToRpcQuantity,
  rpcQuantityToNumber,
} from "../../../../../../../internal/core/jsonrpc/types/base-types";
import { TransactionParams } from "../../../../../../../internal/hardhat-network/provider/node-types";
import {
  RpcBlockOutput,
  RpcReceiptOutput,
} from "../../../../../../../internal/hardhat-network/provider/output";
import { workaroundWindowsCiFailures } from "../../../../../../utils/workaround-windows-ci-failures";
import {
  assertQuantity,
  assertTransactionFailure,
} from "../../../../helpers/assertions";
import { EXAMPLE_CONTRACT } from "../../../../helpers/contracts";
import { setCWD } from "../../../../helpers/cwd";
import {
  DEFAULT_ACCOUNTS_ADDRESSES,
  PROVIDERS,
} from "../../../../helpers/providers";
import { retrieveForkBlockNumber } from "../../../../helpers/retrieveForkBlockNumber";
import {
  deployContract,
  getSignedTxHash,
} from "../../../../helpers/transactions";

describe("Eth module", function () {
  PROVIDERS.forEach(({ name, useProvider, isFork }) => {
    if (isFork) {
      this.timeout(50000);
    }

    workaroundWindowsCiFailures.call(this, { isFork });

    describe(`${name} provider`, function () {
      setCWD();
      useProvider();

      const getFirstBlock = async () =>
        isFork ? retrieveForkBlockNumber(this.ctx.hardhatNetworkProvider) : 0;

      describe("eth_getTransactionReceipt", async function () {
        it("should return null for unknown txs", async function () {
          const receipt = await this.provider.send(
            "eth_getTransactionReceipt",
            [
              "0x1234567876543234567876543456765434567aeaeaed67616732632762762373",
            ]
          );

          assert.isNull(receipt);
        });

        it("should return the right tx index and gas used", async function () {
          const firstBlock = await getFirstBlock();
          const contractAddress = await deployContract(
            this.provider,
            `0x${EXAMPLE_CONTRACT.bytecode.object}`
          );

          await this.provider.send("evm_setAutomine", [false]);

          const txHash1 = await this.provider.send("eth_sendTransaction", [
            {
              to: contractAddress,
              from: DEFAULT_ACCOUNTS_ADDRESSES[0],
              data: `${EXAMPLE_CONTRACT.selectors.modifiesState}000000000000000000000000000000000000000000000000000000000000000a`,
              gas: numberToRpcQuantity(150_000),
            },
          ]);
          const txHash2 = await this.provider.send("eth_sendTransaction", [
            {
              to: contractAddress,
              from: DEFAULT_ACCOUNTS_ADDRESSES[0],
              data: `${EXAMPLE_CONTRACT.selectors.modifiesState}000000000000000000000000000000000000000000000000000000000000000a`,
              gas: numberToRpcQuantity(150_000),
            },
          ]);

          await this.provider.send("evm_mine", []);
          const block: RpcBlockOutput = await this.provider.send(
            "eth_getBlockByNumber",
            [numberToRpcQuantity(firstBlock + 2), false]
          );

          assert.equal(block.transactions.length, 2);

          const receipt1: RpcReceiptOutput = await this.provider.send(
            "eth_getTransactionReceipt",
            [txHash1]
          );
          const receipt2: RpcReceiptOutput = await this.provider.send(
            "eth_getTransactionReceipt",
            [txHash2]
          );

          const gasUsed1 = rpcQuantityToNumber(receipt1.gasUsed);
          const gasUsed2 = rpcQuantityToNumber(receipt2.gasUsed);
          const cumulativeGasUsed1 = rpcQuantityToNumber(
            receipt1.cumulativeGasUsed
          );
          const cumulativeGasUsed2 = rpcQuantityToNumber(
            receipt2.cumulativeGasUsed
          );

          assert.equal(cumulativeGasUsed1, gasUsed1);
          assert.lengthOf(receipt1.logs, 1);
          assert.equal(receipt1.logs[0].logIndex, "0x0");

          assert.equal(cumulativeGasUsed2, cumulativeGasUsed1 + gasUsed2);
          assert.lengthOf(receipt2.logs, 1);
          assert.equal(receipt2.logs[0].logIndex!, "0x1");
        });

        it("should return the right values for successful txs", async function () {
          const firstBlock = await getFirstBlock();
          const contractAddress = await deployContract(
            this.provider,
            `0x${EXAMPLE_CONTRACT.bytecode.object}`
          );

          const txHash = await this.provider.send("eth_sendTransaction", [
            {
              to: contractAddress,
              from: DEFAULT_ACCOUNTS_ADDRESSES[0],
              data: `${EXAMPLE_CONTRACT.selectors.modifiesState}000000000000000000000000000000000000000000000000000000000000000a`,
            },
          ]);

          const block: RpcBlockOutput = await this.provider.send(
            "eth_getBlockByNumber",
            [numberToRpcQuantity(firstBlock + 2), false]
          );

          const receipt: RpcReceiptOutput = await this.provider.send(
            "eth_getTransactionReceipt",
            [txHash]
          );

          assert.equal(receipt.blockHash, block.hash);
          assertQuantity(receipt.blockNumber, firstBlock + 2);
          assert.isNull(receipt.contractAddress);
          assert.equal(receipt.cumulativeGasUsed, receipt.gasUsed);
          assert.equal(receipt.from, DEFAULT_ACCOUNTS_ADDRESSES[0]);
          assertQuantity(receipt.status, 1);
          assert.equal(receipt.logs.length, 1);
          assert.equal(receipt.to, contractAddress);
          assert.equal(receipt.transactionHash, txHash);
          assertQuantity(receipt.transactionIndex, 0);

          const log = receipt.logs[0];

          assert.isFalse(log.removed);
          assertQuantity(log.logIndex, 0);
          assertQuantity(log.transactionIndex, 0);
          assert.equal(log.transactionHash, txHash);
          assert.equal(log.blockHash, block.hash);
          assertQuantity(log.blockNumber, firstBlock + 2);
          assert.equal(log.address, contractAddress);

          // The new value of i is not indexed
          assert.equal(
            log.data,
            "0x000000000000000000000000000000000000000000000000000000000000000a"
          );

          assert.deepEqual(log.topics, [
            EXAMPLE_CONTRACT.topics.StateModified[0],
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ]);
        });

        it("should return the receipt for txs that were executed and failed", async function () {
          const txParams: TransactionParams = {
            to: undefined,
            from: toBuffer(DEFAULT_ACCOUNTS_ADDRESSES[1]),
            data: toBuffer("0x60006000fd"),
            nonce: new BN(0),
            value: new BN(123),
            gasLimit: new BN(250000),
            gasPrice: new BN(23912),
          };

          const txHash = await getSignedTxHash(
            this.hardhatNetworkProvider,
            txParams,
            1
          );

          // Revert. This is a deployment transaction that immediately reverts without a reason
          await assertTransactionFailure(
            this.provider,
            {
              from: bufferToHex(txParams.from),
              data: bufferToHex(txParams.data),
              nonce: numberToRpcQuantity(txParams.nonce),
              value: numberToRpcQuantity(txParams.value),
              gas: numberToRpcQuantity(txParams.gasLimit),
              gasPrice: numberToRpcQuantity(txParams.gasPrice),
            },
            "Transaction reverted without a reason"
          );

          const receipt = await this.provider.send(
            "eth_getTransactionReceipt",
            [txHash]
          );

          assert.isNotNull(receipt);
        });

        it("should return a new object every time", async function () {
          const txHash = await this.provider.send("eth_sendTransaction", [
            {
              from: DEFAULT_ACCOUNTS_ADDRESSES[0],
              to: DEFAULT_ACCOUNTS_ADDRESSES[1],
              value: numberToRpcQuantity(1),
              gas: numberToRpcQuantity(21000),
              gasPrice: numberToRpcQuantity(1),
            },
          ]);

          const receipt1: RpcReceiptOutput = await this.provider.send(
            "eth_getTransactionReceipt",
            [txHash]
          );

          receipt1.blockHash = "changed";

          const receipt2: RpcReceiptOutput = await this.provider.send(
            "eth_getTransactionReceipt",
            [txHash]
          );

          assert.notEqual(receipt1, receipt2);
          assert.notEqual(receipt2.blockHash, "changed");
        });
      });
    });
  });
});
