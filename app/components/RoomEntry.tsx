import { useState, useCallback, type FormEvent, type ChangeEvent } from "react";

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
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label
					htmlFor="roomId"
					className="block text-sm font-medium text-gray-700"
				>
					Room Name
				</label>
				<input
					type="text"
					id="roomId"
					value={roomId}
					onChange={handleRoomIdChange}
					autoComplete="off"
					required
					className="mt-1 block w-full rounded-md border-gray-3000 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				/>
			</div>
			<div>
				<label
					htmlFor="password"
					className="block text-sm font-medium text-gray-700"
				>
					Password (optional)
				</label>
				<input
					type="password"
					id="password"
					value={password}
					onChange={handlePasswordChange}
					autoComplete="off"
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				/>
			</div>
			{error && <div className="text-red-500">{error}</div>}
			<button
				type="submit"
				className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
			>
				Join Room
			</button>
		</form>
	);
};
