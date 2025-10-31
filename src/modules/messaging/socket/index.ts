import { endpoint } from '@shared/lib/utils';
import * as messageQueueProcessor from '../lib/messageQueueProcessor';
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
    console.log(`Successfully established WebSocket connection to '${wsUrl}'`);
    reconnectTimeoutMs = 1000;
    messageQueueProcessor.start();
  };

  ws.onmessage = event => {
    const msg = JSON.parse(event.data) as WsMessageChat | WsMessageReact;
    onReceive(msg, ws);
  };

  ws.onclose = e => {
    messageQueueProcessor.stop();
    if (e.code !== 1000) {
      console.log(`Lost connection to '${wsUrl}', retrying...`);
      setTimeout(() => connect(onReceive), reconnectTimeoutMs); // attempt to reconnect
      reconnectTimeoutMs = Math.min(reconnectTimeoutMs * 2, 15000); // exponential backoff
    } else {
      console.log(`Connection to '${wsUrl}' closed normally`);
    }
  };
}

function isOpen(): boolean {
  return ws.readyState === WebSocket.OPEN;
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
  console.log(`Message sent over WebSocket:`, wsMessage);
}

function disconnect() {
  ws?.close(1000, 'Client closed connection normally');
}

export { connect, join, dispatch, isOpen, disconnect };
