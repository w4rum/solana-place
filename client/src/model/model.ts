import {GameEvent} from "./gameEvent";
import {TransactionDetails} from "./transactionDetails";

export type EventWithTransactionDetails = {
  event: GameEvent,
  transactionDetails: TransactionDetails
}

export type EventsHistory = {
  events: EventWithTransactionDetails[];
}

export type BoardHistory = EventsHistory;

export const BOARD_HISTORY_MAX_LENGTH = 100;