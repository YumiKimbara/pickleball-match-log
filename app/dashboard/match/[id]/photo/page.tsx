import PhotoUploadForm from "./PhotoUploadForm";

export default async function MatchPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = parseInt(id);

  return <PhotoUploadForm matchId={matchId} />;
}
