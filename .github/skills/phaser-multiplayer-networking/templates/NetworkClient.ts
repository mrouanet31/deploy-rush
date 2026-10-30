export type ServerMessage = { type: 'snapshot'; tick: number; players: Array<{ id: string; x: number; y: number }> };
export type ClientMessage = { type: 'input'; seq: number; left: boolean; right: boolean; up: boolean; down: boolean };

export class NetworkClient {
  private ws: WebSocket;
  onSnapshot?: (msg: ServerMessage) => void;
  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.ws.onmessage = e => {
      const msg = JSON.parse(e.data) as ServerMessage;
      if (msg.type === 'snapshot') this.onSnapshot?.(msg);
    };
  }
  send(msg: ClientMessage) { if (this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg)); }
}
