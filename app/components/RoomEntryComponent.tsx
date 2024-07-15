import { RoomEntry } from "./RoomEntry";

export function RoomEntryComponent({
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
