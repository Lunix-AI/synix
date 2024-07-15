import { useState, useCallback, type FormEvent, type ChangeEvent } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

interface RoomEntryProps {
	onJoinRoom: (roomId: string, password: string) => void;
	error: string | null;
	roomData: { roomId: string; password: string } | null;
}

export const RoomEntry = ({ onJoinRoom, error, roomData }: RoomEntryProps) => {
	const [roomId, setRoomId] = useState(roomData?.roomId || "");
	const [password, setPassword] = useState(roomData?.password || "");

	const handleSubmit = useCallback(
		(e: FormEvent) => {
			e.preventDefault();
			onJoinRoom(roomId, password);
		},
		[onJoinRoom, roomId, password],
	);

	const handleRoomIdChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setRoomId(e.target.value);
	}, []);

	const handlePasswordChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setPassword(e.target.value);
		},
		[],
	);

	return (
		<form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
			<div className="space-y-2">
				<Label htmlFor="roomId">Room Name</Label>
				<Input
					id="roomId"
					value={roomId}
					onChange={handleRoomIdChange}
					required
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="password">Password (optional)</Label>
				<Input
					id="password"
					type="password"
					value={password}
					onChange={handlePasswordChange}
				/>
			</div>
			{error && <div className="text-red-500">{error}</div>}
			<Button type="submit" className="w-full">
				Join Room
			</Button>
		</form>
	);
};
