import * as ethers from "ethers";
import "hardhat/types/runtime";

import type {
  FactoryOptions as FactoryOptionsT,
  getContractFactory as getContractFactoryT,
  HardhatEthers,
  Libraries as LibrariesT,
} from "../types";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    // We omit the ethers field because it is redundant.
    ethers: Omit<typeof ethers, "ethers"> & HardhatEthers;
  }

  // Beware, adding new types to any hardhat type submodule is not a good practice in a Hardhat plugin.
  // Doing so increases the risk of a type clash with another plugin.
  // Removing any of these three types is a breaking change.
  type Libraries = LibrariesT;
  type FactoryOptions = FactoryOptionsT;
  // tslint:disable-next-line: naming-convention
  type getContractFactory = typeof getContractFactoryT;
}