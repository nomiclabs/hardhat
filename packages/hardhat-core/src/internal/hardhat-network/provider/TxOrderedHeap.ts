import { MaxHeap } from "mnemonist/heap";

import { OrderedTransaction } from "./PoolState";
import { TxHeap } from "./TxHeap";

function compareTransactions(
  left: OrderedTransaction,
  right: OrderedTransaction
) {
  return right.orderId - left.orderId;
}

export class TxOrderedHeap extends TxHeap {
  constructor(pendingTransactions: Map<string, OrderedTransaction[]>) {
    super(
      pendingTransactions,
      new MaxHeap<OrderedTransaction>(compareTransactions)
    );
  }
}
