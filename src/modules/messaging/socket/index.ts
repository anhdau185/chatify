import { endpoint } from '@shared/lib/utils';
import * as messageQueueProcessor from '../lib/messageQueueProcessor';
import { useConnectivityStore } from '../store/connectivityStore';
import type {
  WsMessage,
  WsMessageComms,
  WsMessageJoin,
  WsPayloadJoin,
} from '../types';

let ws: WebSocket;
let reconnectTimeoutMs = 1000; // 1 second intitially

function connect(
  onReceive: (data: WsMessageComms, connection: WebSocket) => void,
) {
  const wsUrl = endpoint('/messaging/ws', { protocol: 'ws' });
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log(`Successfully established WebSocket connection to '${wsUrl}'`); // eslint-disable-line no-console
    reconnectTimeoutMs = 1000;

    // On socket open: mark socket state in connectivity store as open
    useConnectivityStore.getState().setSocketOpen(true);
  };

  ws.onmessage = event => {
    const msg = JSON.parse(event.data) as WsMessageComms;
    onReceive(msg, ws);
  };

  ws.onclose = e => {
    // On connectivity lost - socket close:
    // Stop queue processing immediately and mark socket state in connectivity store as close
    messageQueueProcessor.stop();
    useConnectivityStore.getState().setSocketOpen(false);

    if (e.code !== 1000) {
      console.log(`Lost connection to '${wsUrl}', retrying...`); // eslint-disable-line no-console
      window.setTimeout(() => connect(onReceive), reconnectTimeoutMs); // attempt to reconnect
      reconnectTimeoutMs = Math.min(reconnectTimeoutMs * 2, 12000); // exponential backoff
    } else {
      console.log(`Connection to '${wsUrl}' closed normally`); // eslint-disable-line no-console
    }
  };
}

function join(payload: WsPayloadJoin) {
  return new Promise<{
    success: boolean;
    data: {
      roomIds: string[];
      participantId: number;
    };
  }>((resolve, reject) => {
    try {
      if (ws.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket connection is not open');
      }

      const wsMsg: WsMessageJoin = {
        type: 'join',
        payload,
      };
      ws.send(JSON.stringify(wsMsg));

      resolve({
        success: true,
        data: {
          roomIds: wsMsg.payload.roomIds,
          participantId: wsMsg.payload.senderId,
        },
      });
    } catch (err) {
      reject(err);
    }
  });
}

function dispatch(wsMessage: WsMessage) {
  ws.send(JSON.stringify(wsMessage));
  console.log(`Message sent over WebSocket:`, wsMessage); // eslint-disable-line no-console
}

function disconnect() {
  ws?.close(1000, 'Client closed connection normally');
}

export { connect, join, dispatch, disconnect };
