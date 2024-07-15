import { useState, useCallback, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { useMemo } from "react";
import {
	TLUiOverrides,
	Tldraw,
	StateNode,
	type TLEventHandlers,
	useEditor,
	track,
} from "tldraw";
import "tldraw/tldraw.css";
import { useYjsStore } from "../store/useYjsStore";
import { RoomEntry } from "../components/RoomEntry";

const HOST_URL =
	import.meta.env.MODE === "development"
		? "ws://localhost:1234"
		: "wss://your-production-url.com";

function RoomEntryComponent({
	onJoinRoom,
	error,
	roomData,
}: {
	onJoinRoom: (roomId: string, password: string) => void;
	error: string | null;
	roomData: { roomId: string; password: string } | null;
}) {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="max-w-md w-full space-y-8 p-10 bg-white shadow rounded-xl">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Join a Room
				</h2>
				<RoomEntry onJoinRoom={onJoinRoom} error={error} roomData={roomData} />
			</div>
		</div>
	);
}

function TldrawComponent({
	roomData,
	onConnectionFailed,
}: {
	roomData: { roomId: string; password: string };
	onConnectionFailed: (error: string) => void;
}) {
	const store = useYjsStore({
		roomId: roomData.roomId,
		hostUrl: HOST_URL,
		password: roomData.password,
	});

	useEffect(() => {
		if (store.status === "error") {
			console.log(`Store status: ${store.status}`);
			console.log(`Store error: ${store.error}`, store.error);
			onConnectionFailed(store.error.message);
		}
	}, [store.status, store.error, onConnectionFailed]);

	if (store.status === "error") {
		return <div>Error: {store.error.message}</div>;
	}

	return (
		<Tldraw
			autoFocus
			store={store}
			components={{
				SharePanel: NameEditor,
			}}
		/>
	);
}

function YjsExample() {
	const [roomData, setRoomData] = useState<{
		roomId: string;
		password: string;
	} | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleJoinRoom = useCallback((roomId: string, password: string) => {
		setRoomData({ roomId, password });
		setError(null);
	}, []);

	const handleConnectionFailed = useCallback((error: string) => {
		setError(`Failed to connect to room: ${error}`);
	}, []);

	if (roomData && !error) {
		return (
			<TldrawComponent
				roomData={roomData}
				onConnectionFailed={handleConnectionFailed}
			/>
		);
	}

	return (
		<RoomEntryComponent
			onJoinRoom={handleJoinRoom}
			error={error}
			roomData={roomData}
		/>
	);
}

const NameEditor = track(() => {
	const editor = useEditor();

	const { color, name } = editor.user.getUserPreferences();

	return (
		<div style={{ pointerEvents: "all", display: "flex" }}>
			<input
				type="color"
				value={color}
				onChange={(e) => {
					editor.user.updateUserPreferences({
						color: e.currentTarget.value,
					});
				}}
			/>
			<input
				value={name}
				onChange={(e) => {
					editor.user.updateUserPreferences({
						name: e.currentTarget.value,
					});
				}}
			/>
		</div>
	);
});

export const meta: MetaFunction = () => {
	return [
		{ title: "Synix AI" },
		{
			name: "description",
			content: "Non-linear conversations right here in your browser.",
		},
	];
};

class Card extends StateNode {
	static override id = "card";

	onPointerDown: TLEventHandlers["onPointerDown"] = (info) => {
		console.log("hello", info);
	};
}

export default function Index() {
	return (
		<div style={{ position: "fixed", inset: 0 }}>
			<YjsExample />
		</div>
	);
}
