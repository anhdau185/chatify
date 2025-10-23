import { endpoint } from '@shared/lib/utils';
import type {
  WsMessageChat,
  WsMessageJoin,
  WsPayloadChat,
  WsPayloadJoin,
} from '../types';

type WsConnectionCallbackList = {
  onOpen: (connection: WebSocket) => void;
  onReceive: (data: WsPayloadChat, connection: WebSocket) => void;
};

let ws: WebSocket;
let callbacks: WsConnectionCallbackList;
let reconnectTimeoutMs = 1000; // 1 second intitially

function connect({ onOpen, onReceive }: WsConnectionCallbackList) {
  const wsUrl = endpoint('/messaging/ws', { protocol: 'ws' });
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log(`successfully established WebSocket connection to '${wsUrl}'`);
    reconnectTimeoutMs = 1000;
    callbacks = { onOpen, onReceive };
    onOpen(ws);
  };

  ws.onmessage = event => {
    const msg = JSON.parse(event.data) as WsMessageChat;
    onReceive(msg.payload, ws);
  };

  ws.onclose = () => {
    console.log(`lost connection to '${wsUrl}', retrying...`);
    setTimeout(() => connect(callbacks), reconnectTimeoutMs); // attempt to reconnect
    reconnectTimeoutMs = Math.min(reconnectTimeoutMs * 2, 15000); // exponential backoff
  };
}

function join(payload: WsPayloadJoin) {
  const wsMessage: WsMessageJoin = {
    type: 'join',
    payload,
  };
  ws.send(JSON.stringify(wsMessage));
}

function chat(payload: WsPayloadChat) {
  const wsMessage: WsMessageChat = {
    type: 'chat',
    payload,
  };
  ws.send(JSON.stringify(wsMessage));
  console.log(`message sent over WebSocket:`, wsMessage);
}

export { connect, join, chat };
