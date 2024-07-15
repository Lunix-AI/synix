import { useEffect, useCallback } from "react";
import { Tldraw } from "tldraw";
import { useYjsStore } from "../store/useYjsStore";
import { NameEditor } from "./NameEditor";

export function TldrawComponent({
	roomData,
	onConnectionFailed,
	hostUrl,
}: {
	roomData: { roomId: string; password: string };
	onConnectionFailed: (error: string) => void;
	hostUrl: string;
}) {
	const store = useYjsStore({
		roomId: roomData.roomId,
		hostUrl,
		password: roomData.password,
	});

	const handleConnectionFailed = useCallback(
		(error: string) => {
			onConnectionFailed(error);
		},
		[onConnectionFailed],
	);

	useEffect(() => {
		if (store.status === "error") {
			console.log(`Store status: ${store.status}`);
			console.log(`Store error: ${store.error}`, store.error);
			handleConnectionFailed(store.error.message);
		}
	}, [store.status, store.error, handleConnectionFailed]);

	if (store.status === "error") {
		return <div>Error: {store.error.message}</div>;
	}

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 bg-gray-100 dark:bg-gray-800">
				<h2 className="text-xl font-semibold">Room: {roomData.roomId}</h2>
			</div>
			<div className="flex-grow">
				<Tldraw
					autoFocus
					store={store}
					components={{
						SharePanel: NameEditor,
					}}
				/>
			</div>
		</div>
	);
}
