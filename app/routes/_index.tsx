import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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

export const loader: LoaderFunction = async () => {
	return json({
		ENV: {
			HOST_URL: process.env.HOST_URL ?? "http://localhost:1234",
		},
	});
};

export default function Index() {
	const {
		ENV: { HOST_URL },
	} = useLoaderData<typeof loader>();
	return (
		<div style={{ position: "fixed", inset: 0 }}>
			<YjsExample hostUrl={HOST_URL} />
		</div>
	);
}
