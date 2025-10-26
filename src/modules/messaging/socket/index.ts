import { endpoint } from '@shared/lib/utils';
import type {
  WsMessage,
  WsMessageChat,
  WsMessageJoin,
  WsMessageReact,
  WsPayloadJoin,
} from '../types';

let ws: WebSocket;
let reconnectTimeoutMs = 1000; // 1 second intitially

function connect(
  onReceive: (
    data: WsMessageChat | WsMessageReact,
    connection: WebSocket,
  ) => void,
) {
  const wsUrl = endpoint('/messaging/ws', { protocol: 'ws' });
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log(`successfully established WebSocket connection to '${wsUrl}'`);
    reconnectTimeoutMs = 1000;
  };

  ws.onmessage = event => {
    const msg = JSON.parse(event.data) as WsMessageChat | WsMessageReact;
    onReceive(msg, ws);
  };

  ws.onclose = e => {
    if (e.code !== 1000) {
      console.log(`lost connection to '${wsUrl}', retrying...`);
      setTimeout(() => connect(onReceive), reconnectTimeoutMs); // attempt to reconnect
      reconnectTimeoutMs = Math.min(reconnectTimeoutMs * 2, 15000); // exponential backoff
    } else {
      console.log(`connection to '${wsUrl}' closed normally.`);
    }
  };
}

function isOpen(): boolean {
  return ws.readyState === WebSocket.OPEN;
}

function join(
  payload: WsPayloadJoin,
  callbacks?: { onError: (error: Error) => void },
) {
  try {
    const wsMessage: WsMessageJoin = {
      type: 'join',
      payload,
    };
    ws.send(JSON.stringify(wsMessage));
  } catch (err) {
    callbacks?.onError?.(err as Error);
  }
}

function dispatch(
  wsMessage: WsMessage,
  callbacks?: { onError: (error: Error) => void },
) {
  try {
    ws.send(JSON.stringify(wsMessage));
    console.log(`message sent over WebSocket:`, wsMessage);
  } catch (err) {
    callbacks?.onError?.(err as Error);
  }
}

function disconnect() {
  ws?.close(1000, 'Client closed connection normally');
}

export { connect, join, dispatch, isOpen, disconnect };
