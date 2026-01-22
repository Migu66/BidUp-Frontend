import { Metadata } from "next";
import { AuctionDetailClient } from "@/app/components/auction";

interface AuctionDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AuctionDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Subasta - BidUp`,
    description: `Detalles de la subasta ${resolvedParams.id}`,
  };
}

export default async function AuctionDetailPage({ params }: AuctionDetailPageProps) {
  const resolvedParams = await params;
  
  return <AuctionDetailClient auctionId={resolvedParams.id} />;
}
