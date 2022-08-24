import {BOARD_HISTORY_MAX_LENGTH, BoardHistory, EventWithTransactionDetails} from "../model/model";

type InitialBoardHistoryAction = {
  type: "initialHistory",
  history: BoardHistory
};

type AddHistoryEntryAction = {
  type: "addHistoryEntry",
  eventWithTransactionDetails: EventWithTransactionDetails
};

export type BoardHistoryAction = InitialBoardHistoryAction | AddHistoryEntryAction;

export type BoardHistoryDispatch = (action: BoardHistoryAction) => void;

export function boardHistoryReducer(state: BoardHistory, action: BoardHistoryAction): BoardHistory {
  switch (action.type) {
    case "initialHistory": {
      return action.history;
    }
    case "addHistoryEntry": {
      const events = state.events;
      const newEvents = [action.eventWithTransactionDetails, ...events].slice(0, BOARD_HISTORY_MAX_LENGTH);
      return {
        events: newEvents
      };
    }
  }
}
