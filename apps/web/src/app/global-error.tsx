"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function GlobalError() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center text-center justify-center h-full space-y-8">
      <p className="font-primary uppercase text-3xl">Error Occurred</p>
      <Button intent="tertiary" onClick={() => router.push("/")}>
        Return to home page
      </Button>
    </main>
  );
}
