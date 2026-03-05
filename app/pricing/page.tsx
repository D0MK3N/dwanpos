"use client";

import PricingPage from "@/components/pricing/PricingPage";

export default function PricingRoute() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-blue-950 py-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        <PricingPage />
      </div>
    </div>
  );
}
