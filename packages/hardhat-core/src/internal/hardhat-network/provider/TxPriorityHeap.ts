import { BN } from "ethereumjs-util";
import { MaxHeap } from "mnemonist/heap";

import { OrderedTransaction } from "./PoolState";
import { TxHeap } from "./TxHeap";

function compareTransactions(
  left: OrderedTransaction,
  right: OrderedTransaction
) {
  // TODO: remove these `as any`
  const cmp = new BN((left.data as any).gasPrice).cmp(
    new BN((right.data as any).gasPrice)
  );
  return cmp === 0 ? right.orderId - left.orderId : cmp;
}

export class TxPriorityHeap extends TxHeap {
  constructor(pendingTransactions: Map<string, OrderedTransaction[]>) {
    super(
      pendingTransactions,
      new MaxHeap<OrderedTransaction>(compareTransactions)
    );
  }
}
