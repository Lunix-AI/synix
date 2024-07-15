import { StateNode, type TLEventHandlers } from "tldraw";

class CardTool extends StateNode {
	static override id = "card";

	onPointerDown: TLEventHandlers["onPointerDown"] = (info) => {
		console.log("hello", info);
	};
}
