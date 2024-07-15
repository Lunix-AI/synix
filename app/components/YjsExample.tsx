import { useState, useCallback } from "react";
import { RoomEntryComponent } from "./RoomEntryComponent";
import { TldrawComponent } from "./TldrawComponent";

export function YjsExample() {
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
