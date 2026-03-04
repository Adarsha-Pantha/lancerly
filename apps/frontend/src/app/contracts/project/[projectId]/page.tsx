"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { get } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function ContractByProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const projectId = params.projectId as string;

  useEffect(() => {
    if (!token || !projectId) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        const contract = await get<{ id: string }>(`/contracts/project/${projectId}`, token);
        if (contract?.id) {
          router.replace(`/contracts/${contract.id}`);
        } else {
          router.replace("/contracts/me");
        }
      } catch {
        router.replace("/contracts/me");
      }
    })();
  }, [token, projectId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );
}
