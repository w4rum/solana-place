import * as React from "react";
import {useClusterConfig} from "../providers/server/clusterConfig";
import {useBoardState} from "../providers/board/boardState";
import {useBoardConfig, useSetBoardConfig} from "../providers/board/boardConfig";
import {useWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import Draggable from "react-draggable"
import {changePixels} from "request/changePixels";
import {useActiveUsers, useIsOnline} from "../providers/server/webSocket";
import {useBoardHistory} from "../providers/board/boardHistory";
import {useHighlightPixel} from "../providers/board/highlightedPixel";
import {getColorByIndex} from "../utils/colorUtils";
import SolanaExplorerLogo from '../styles/icons/dark-solana-logo.svg';
import {displayTimestamp} from "../utils/date";
import {ClipLoader} from "react-spinners";
import ReactTooltip from "react-tooltip";
import {useSetAbout} from "../providers/about/about";
import {
  Squares2X2Icon,
  InformationCircleIcon,
  ClockIcon as HistoryIconNotChecked,
  MagnifyingGlassIcon,
  WifiIcon
} from '@heroicons/react/24/outline'
import {useSetPendingTransaction} from "../providers/transactions/pendingTransaction";

type DashboardProps = {
  zoom: number,
  onMouseDown: () => void
}

export function Dashboard({zoom, onMouseDown}: DashboardProps) {
  const {showHistory} = useBoardConfig();

  return (
    <Draggable onMouseDown={onMouseDown} cancel=".dashboard-cancel-draggable">
      <div className="dashboard">
        <div className="dashboard-row">
          <SendActionButton/>
          <ShowGridToggle/>
          <ShowHistoryToggle/>
          <ShowZoom zoom={zoom}/>
          <OnlineStatus/>
          <ShowAbout/>
        </div>
        {showHistory && <div className="dashboard-row">
          <div className="dashboard-item">
            <BoardHistoryTable/>
          </div>
        </div>}
      </div>
    </Draggable>
  );
}

function SendActionButton() {
  const boardState = useBoardState();
  const changedPixels = boardState?.changed ?? [];
  const wallet = useWallet();
  const isPendingTransaction = boardState && boardState.pendingTransaction !== null;
  const isDisabled = !boardState || boardState.changed.length === 0 || isPendingTransaction;
  const setPendingTransaction = useSetPendingTransaction();

  return <div className="dashboard-item">
    <div
      data-tip={true}
      data-for="action-button-tooltip-id"
      className="dashboard-cancel-draggable"
    >
      {!wallet.connected && <WalletMultiButton className="action-button"/>}
      {wallet.connected
        && <button
          className="action-button"
          disabled={isDisabled}
          onClick={() => {
            changePixels(changedPixels, wallet)
              .then(setPendingTransaction)
              .catch(console.error);
          }}>
          {
            isPendingTransaction
              ? `Sending ${changedPixels.length}...`
              : isDisabled ? 'Send' : `Send (${changedPixels.length})`
          }
        </button>
      }
    </div>
    <ReactTooltip
      className="dashboard-tooltip"
      id="action-button-tooltip-id"
      type="info"
      effect="solid"
    >Change colors of pixels</ReactTooltip>
  </div>;
}

function ShowGridToggle() {
  const boardConfig = useBoardConfig();
  const setBoardConfig = useSetBoardConfig();
  const isChecked = boardConfig.showGrid;
  const onClick = React.useCallback(() => {
    setBoardConfig((prevConfig) => ({
      ...prevConfig,
      showGrid: !isChecked
    }))
  }, [isChecked, setBoardConfig]);
  return (
    <div className="dashboard-item">
      <div
        className={`dashboard-cancel-draggable dashboard-icon-holder ${isChecked ? "checked-toggle" : ""}`}
        data-tip={true}
        data-for="grid-tooltip-id"
      >
        <Squares2X2Icon
          className="grid-icon"
          onClick={onClick}
        />
      </div>
      <ReactTooltip
        className="dashboard-tooltip"
        id="grid-tooltip-id"
        type="info"
        effect="solid"
      >Show grid
      </ReactTooltip>
    </div>

  );
}

type ShowZoomProps = { zoom: number };
function ShowZoom({zoom}: ShowZoomProps) {
  const zoomString = zoom * 100;
  return (
    <div className="dashboard-item">
      <div
        className={`dashboard-cancel-draggable dashboard-icon-holder`}
        data-tip={true}
        data-for="zoom-tooltip-id"
      >
        <MagnifyingGlassIcon className="show-zoom-icon"/>
      </div>
      <ReactTooltip
        className="dashboard-tooltip"
        id="zoom-tooltip-id"
        type="info"
        effect="solid"
      >Use mouse wheel or +/- keys to zoom in/out
      </ReactTooltip>
      {zoomString}%
    </div>
  );
}


function ShowHistoryToggle() {
  const boardConfig = useBoardConfig();
  const setBoardConfig = useSetBoardConfig();
  const isChecked = boardConfig.showHistory;
  const onClick = React.useCallback(() => {
    setBoardConfig((prevConfig) => ({
      ...prevConfig,
      showHistory: !isChecked
    }))
  }, [isChecked, setBoardConfig]);
  return (
    <div className="dashboard-item">
      <div
        className={`dashboard-cancel-draggable dashboard-icon-holder ${isChecked ? "checked-toggle" : ""}`}
        data-tip={true}
        data-for="history-tooltip-id"
      >
        <HistoryIconNotChecked
          className="history-icon"
          onClick={onClick}
        />
      </div>
      <ReactTooltip
        className="dashboard-tooltip"
        id="history-tooltip-id"
        type="info"
        effect="solid"
      >Show history of changes
      </ReactTooltip>
    </div>
  );
}

function OnlineStatus() {
  const isOnline = useIsOnline();
  const activeUsers = useActiveUsers();

  return (
    <div className="dashboard-item">
      <div
        className={`dashboard-cancel-draggable dashboard-icon-holder`}
        data-tip={true}
        data-for="online-status-tooltip-id"
      >
        {isOnline
          ? <WifiIcon className="online-status-icon"/>
          : <ClipLoader size="1.5rem" speedMultiplier={0.5}/>
        }
      </div>
      <ReactTooltip
        class={`dashboard-tooltip online-status-tooltip online-status-tooltip-${isOnline ? "success" : "connecting"}`}
        id="online-status-tooltip-id"
        type={isOnline ? "success" : "info"}
        effect="solid"
      >
        {isOnline
          ? <>Connected<br/>Users online: {activeUsers}</>
          : <>You are connecting to the server...</>
        }
      </ReactTooltip>
    </div>
  );
}

function ShowAbout() {
  const setAbout = useSetAbout();
  return <div className="dashboard-item">
    <InformationCircleIcon
      className={`dashboard-cancel-draggable show-zoom-icon`}
      onClick={() => setAbout(prevState => ({...prevState, showAboutModal: true}))}
    />
  </div>;
}

function BoardHistoryExplorerLink({signature}: { signature: string }) {
  const clusterParam = useClusterParam();
  const explorerLink = (path: string) => `https://explorer.solana.com/${path}?${clusterParam}`;
  return <div className="board-history-cell">
    <a
      href={explorerLink("tx/" + signature)}
      target="_blank"
      rel="noopener noreferrer"
      title="Open in Explorer"
    >
      <img
        className="board-history-explorer-link"
        src={SolanaExplorerLogo}
        alt="Solana Explorer"
      />
    </a>
  </div>;
}

function BoardHistoryTable() {
  const boardHistory = useBoardHistory();
  const highlightPixel = useHighlightPixel();

  if (!boardHistory) {
    return null;
  }

  return <div className="board-history">
    <table className="board-history-table">
      <thead>
      <tr>
        <th>Change</th>
        <th>Cluster time</th>
        <th>Tx</th>
        <th>Sender</th>
        <th>Links</th>
      </tr>
      </thead>
      <tbody>
      {boardHistory.events.map(({event, transactionDetails}) => (
        <tr
          key={transactionDetails.signature + event.row + event.column}
          className="board-history-row"
          onMouseOut={() => highlightPixel(undefined)}
          onMouseOver={() => highlightPixel({
            pixelCoordinates: {
              row: event.row,
              column: event.column
            }
          })}
        >
          <td><BoardHistoryChangeArrow oldColor={event.oldColor} newColor={event.newColor}/></td>
          <td>{formatTime(transactionDetails.timestamp)}</td>
          <td>{transactionDetails.signature.slice(0, 7)}…</td>
          <td>{transactionDetails.sender.slice(0, 7)}…</td>
          <td><BoardHistoryExplorerLink signature={transactionDetails.signature}/></td>
        </tr>
      ))}
      </tbody>
    </table>
  </div>;
}

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * 60;
const SECONDS_PER_DAY = 24 * 60 * 60;

const timeRanges: [number, string][] = [
  [10, "10 sec"],
  [SECONDS_PER_MINUTE, "1 min"],
  [5 * SECONDS_PER_MINUTE, "5 min"],
  [10 * SECONDS_PER_MINUTE, "10 min"],
  [30 * SECONDS_PER_MINUTE, "30 min"],
  [SECONDS_PER_HOUR, "1 hour"],
  [2 * SECONDS_PER_HOUR, "2 hours"],
  [3 * SECONDS_PER_HOUR, "3 hours"],
  [6 * SECONDS_PER_HOUR, "6 hours"],
  [12 * SECONDS_PER_HOUR, "12 hours"],
  [SECONDS_PER_DAY, "1 day"],
  [2 * SECONDS_PER_DAY, "2 days"],
  [3 * SECONDS_PER_DAY, "3 days"]
]

function formatTime(timestamp: number): string {
  const date = new Date();
  const elapsedSeconds = Math.abs(Math.floor(date.getTime() / 1000) - timestamp);
  for (const [time, timeString] of timeRanges) {
    if (elapsedSeconds < time) {
      return "< " + timeString + " ago";
    }
  }
  return displayTimestamp(timestamp * 1000);
}

function BoardHistoryChangeArrow({oldColor, newColor}: { oldColor: number, newColor: number }) {
  const oldColorString = getColorByIndex(oldColor) ?? "white";
  const newColorString = getColorByIndex(newColor) ?? "white";
  return (
    <div className="board-history-cell">
      <div className="board-history-pixel-plate"
           style={{background: oldColorString}}
      />
      <span className="board-history-change-arrow-symbol">→</span>
      <div className="board-history-pixel-plate"
           style={{background: newColorString}}
      />
    </div>
  );
}

function useClusterParam(): string | undefined {
  const clusterConfig = useClusterConfig();
  if (!clusterConfig) {
    return undefined;
  }
  const cluster = clusterConfig.cluster;
  switch (cluster) {
    case "mainnet-beta":
      return "";
    case "devnet":
      return "cluster=devnet"
    case "testnet":
      return "cluster=testnet"
    case "custom":
      return "cluster=custom&customUrl=http://localhost:8899"
  }
}