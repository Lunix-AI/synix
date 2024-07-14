import type { MetaFunction } from "@remix-run/node";
import { useMemo } from "react";
import {
	type TLUiOverrides,
	Tldraw,
	StateNode,
	type TLEventHandlers,
	useEditor,
	track,
} from "tldraw";
import "tldraw/tldraw.css";
import { useYjsStore } from "../store/useYjsStore";

const HOST_URL =
	import.meta.env.MODE === "development"
		? "ws://localhost:1234"
		: "wss://demos.yjs.dev";

function YjsExample() {
	const store = useYjsStore({
		roomId: "example17",
		hostUrl: HOST_URL,
	});

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
