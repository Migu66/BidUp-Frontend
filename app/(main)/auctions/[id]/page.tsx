export default function AuctionDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Detalle de Subasta {params.id}</h1>
    </div>
  );
}
