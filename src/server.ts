import * as Y from "yjs";
import { setupWSConnection, setPersistence } from "y-websocket/bin/utils";
import { LeveldbPersistence } from "y-leveldb";
import ws from "ws";
import http from "node:http";

const abortController = new AbortController();
const abortSignal = abortController.signal;

try {
	const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 1234;
	const host = process.env.HOST || "localhost";

	const server = http.createServer((request, response) => {
		response.writeHead(200, { "Content-Type": "text/plain" });
		response.end("okay");
	});

	abortSignal.addEventListener("abort", () => {
		console.log("Aborting server");
		server.close();
	});

	const rooms = new Map<string, { doc: Y.Doc; password?: string }>();

	const verifyRoom = (
		url: URL,
		remoteAddress: string,
	): { isValid: boolean; room?: { doc: Y.Doc; password?: string } } => {
		const password = url.searchParams.get("password") || "";
		const roomName = url.pathname.split("/").pop() || "default";

		let room = rooms.get(roomName);

		if (!room) {
			const doc = new Y.Doc();
			room = { doc, password };
			rooms.set(roomName, room);
		} else if (password !== room.password) {
			console.log(
				`Invalid password for room ${roomName} by user ${remoteAddress}, was ${JSON.stringify(password)} but should be ${JSON.stringify(room.password)}.`,
			);
			return { isValid: false };
		}

		console.log(`Valid password for room ${roomName} by user ${remoteAddress}`);
		return { isValid: true, room };
	};

	const wss = new ws.Server({
		noServer: true,
		verifyClient: (info, cb) => {
			const url = new URL(info.req.url || "", `ws://${host}:${port}`);
			const { isValid, room } = verifyRoom(
				url,
				info.req.socket.remoteAddress || "",
			);

			if (!isValid) {
				cb(false, 401, "Unauthorized", {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Credentials": "true",
					"Access-Control-Allow-Headers": "Content-Type, Authorization",
					"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				});
				return;
			}

			cb(true);
		},
	});

	abortSignal.addEventListener("abort", () => {
		console.log("Aborting wss");
		wss.close();
	});

	const ldb = new LeveldbPersistence("./storage-location");

	abortSignal.addEventListener("abort", () => {
		console.log("Aborting leveldb");
		ldb.destroy();
	});

	setPersistence({
		provider: ldb,
		bindState: async (docName, ydoc) => {
			const persistedYdoc = await ldb.getYDoc(docName);
			const newUpdates = Y.encodeStateAsUpdate(ydoc);
			ldb.storeUpdate(docName, newUpdates);
			Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
			ydoc.on("update", (update) => {
				ldb.storeUpdate(docName, update);
			});
		},
		writeState: () => Promise.resolve(),
	});

	wss.on("connection", (conn, req) => {
		const url = new URL(req.url || "", `ws://${host}:${port}`);
		const roomName = url.pathname.split("/").pop() || "default";

		console.log(`Connection established for room ${roomName}`);
		setupWSConnection(conn, req, { docName: roomName });
	});

	server.on("upgrade", (request, socket, head) => {
		console.log("Upgrade connection");
		const result = verifyRoom(
			new URL(request.url || "", `ws://${host}:${port}`),
			request.socket.remoteAddress || "",
		);
		if (!result.isValid) {
			socket.write(
				`HTTP/1.1 401 Unauthorized
	Content-Type: application/json
	Connection: close
	
	${JSON.stringify({ error: "Unauthorized: Invalid password for room" })}`,
				(err) => {
					if (err) {
						console.error("Error writing to socket", err);
					}
					socket.end();
				},
			);
			return;
		}

		wss.handleUpgrade(request, socket, head, (ws) => {
			console.log("Upgrade connection");
			const result = verifyRoom(
				new URL(request.url || "", `ws://${host}:${port}`),
				request.socket.remoteAddress || "",
			);
			if (result.isValid) {
				wss.emit("connection", ws, request);
			} else {
				ws.close(4000, "authentication failed");
			}
		});
	});

	server.listen(port, host, () => {
		console.log(`WebSocket server running at http://${host}:${port}`);
	});
} catch (error) {
	console.error("Error starting server", error);
}

if (import.meta.hot) {
	const dispose = () => {
		abortController.abort();
	};

	import.meta.hot.accept();
	import.meta.hot.dispose(dispose);
	import.meta.hot.on("vite:beforeFullReload", () => {
		console.log("Full reload");
		dispose();
	});
}
