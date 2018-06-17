export type ClientConnectHandler = (ws: WebSocket) => void;

export function createClientConnectHandler(): ClientConnectHandler {
	// tslint:disable-next-line:no-empty
	return function clientConnectHandler(ws: WebSocket): void {};
}
