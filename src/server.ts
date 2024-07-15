import * as Y from "yjs";
import { setupWSConnection, setPersistence } from "y-websocket/bin/utils";
import { LeveldbPersistence } from "y-leveldb";
import ws from "ws";
import http from "node:http";

const abortController = new AbortController();
const abortSignal = abortController.signal;

try {
	const port = process.env.YJS_PORT
		? Number.parseInt(process.env.YJS_PORT, 10)
		: 1234;
	const host = process.env.HOST || "0.0.0.0";

	const server = http.createServer((request, response) => {
		response.writeHead(200, { "Content-Type": "text/plain" });
		response.end("okay");
	});

	abortSignal.addEventListener("abort", () => {
		console.log("Aborting server");
		server.close();
	});

	const rooms = new Map<string, { doc: Y.Doc; password?: string }>();

	const ldb = new LeveldbPersistence("./storage-location");

	abortSignal.addEventListener("abort", () => {
		console.log("Aborting leveldb");
		ldb.destroy();
	});

	const manageRoomData = async (roomName: string, password = "") => {
		const key = `room:${roomName}`;
		let doc: Y.Doc;

		try {
			doc = await ldb.getYDoc(key);
		} catch {
			console.log(`No existing room data for room ${roomName}?`);
			doc = new Y.Doc();
		}

		const roomData = doc.getMap<string>("roomData");
		const existingPassword = roomData.get("password") ?? "";

		if (!existingPassword && password) {
			roomData.set("password", password);
			await ldb.storeUpdate(key, Y.encodeStateAsUpdate(doc));
			return { password };
		}

		return { password: existingPassword };
	};

	const verifyRoom = async (
		url: URL,
		remoteAddress: string,
	): Promise<{
		isValid: boolean;
		room?: { doc: Y.Doc; password?: string };
	}> => {
		const password = url.searchParams.get("password") || "";
		const roomName = url.pathname.split("/").pop() || "default";

		let room = rooms.get(roomName);

		if (!room) {
			const roomData = await manageRoomData(roomName, password);
			const doc = new Y.Doc();
			room = { doc, password: roomData.password };
			rooms.set(roomName, room);
		} else {
			const roomData = await manageRoomData(roomName);
			if (password !== roomData.password) {
				console.log(
					`Invalid password for room ${roomName} by user ${remoteAddress}, was ${JSON.stringify(password)} but should be ${JSON.stringify(roomData.password)}.`,
				);
				return { isValid: false };
			}
		}

		console.log(`Valid password for room ${roomName} by user ${remoteAddress}`);
		return { isValid: true, room };
	};

	const wss = new ws.Server({
		noServer: true,
	});

	abortSignal.addEventListener("abort", () => {
		console.log("Aborting wss");
		wss.close();
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

	server.on("upgrade", async (request, socket, head) => {
		console.log("Upgrade connection");
		const result = await verifyRoom(
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

		wss.handleUpgrade(request, socket, head, async (ws) => {
			wss.emit("connection", ws, request);
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
