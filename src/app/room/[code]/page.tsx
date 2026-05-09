interface RoomPageProps {
  params: {
    code: string;
  };
}

export default function RoomPage({
  params,
}: RoomPageProps) {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">
        Room: {params.code}
      </h1>
    </main>
  );
}