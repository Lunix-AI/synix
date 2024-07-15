import { useEffect } from "react";
import { Tldraw } from "tldraw";
import { useYjsStore } from "../store/useYjsStore";
import { HOST_URL } from "./TldrawComponent";
import { NameEditor } from "./NameEditor";

export function TldrawComponent({
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
export const HOST_URL =
	import.meta.env.MODE === "development"
		? "ws://localhost:1234"
		: "wss://your-production-url.com";
