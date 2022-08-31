import {BOARD_HISTORY_MAX_LENGTH, BoardHistory, GameEventWithTransactionDetails} from "../model/model";

type InitialBoardHistoryAction = {
  type: "initialHistory",
  history: BoardHistory
};

type AddHistoryEntriesAction = {
  type: "addHistoryEntries",
  gameEventsWithTransactionDetails: GameEventWithTransactionDetails[]
};

export type BoardHistoryAction = InitialBoardHistoryAction | AddHistoryEntriesAction;

export type BoardHistoryDispatch = (action: BoardHistoryAction) => void;

export function boardHistoryReducer(state: BoardHistory, action: BoardHistoryAction): BoardHistory {
  switch (action.type) {
    case "initialHistory": {
      const events = [...action.history.events];
      events.sort((event1, event2) => -compareGameEvent(event1, event2))
      return {events};
    }
    case "addHistoryEntries":
      const events = [...action.gameEventsWithTransactionDetails, ...state.events];
      events.sort((event1, event2) => -compareGameEvent(event1, event2))
      events.splice(BOARD_HISTORY_MAX_LENGTH);
      return {events};
  }
}

function compareNumbers(a: number, b: number): number {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
}

function compareGameEvent(event1: GameEventWithTransactionDetails, event2: GameEventWithTransactionDetails): number {
  const details1 = event1.transactionDetails;
  const details2 = event2.transactionDetails;
  const byTimestamp = compareNumbers(details1.timestamp, details2.timestamp);
  if (byTimestamp !== 0) {
    return byTimestamp
  }
  return compareNumbers(event1.event.state, event2.event.state);
}
