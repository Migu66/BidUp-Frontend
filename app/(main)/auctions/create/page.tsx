"use client";

import { CreateAuctionForm } from "@/app/components/auction";
import { useAuth } from "@/app/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateAuctionPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Crear Nueva Subasta</h1>
          <p className="text-gray-400">
            Completa la información para publicar tu subasta
          </p>
        </div>

        <CreateAuctionForm />
      </div>
    </div>
  );
}
