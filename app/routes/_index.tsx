import type { MetaFunction } from "@remix-run/node";
import "tldraw/tldraw.css";
import { YjsExample } from "~/components/YjsExample";

export const meta: MetaFunction = () => {
	return [
		{ title: "Synix AI" },
		{
			name: "description",
			content: "Non-linear conversations right here in your browser.",
		},
	];
};

export default function Index() {
	return (
		<div style={{ position: "fixed", inset: 0 }}>
			<YjsExample />
		</div>
	);
}
