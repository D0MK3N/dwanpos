"use client";

import PricingPage from "@/components/pricing/PricingPage";

export default function PricingRoute() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-900 py-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        <PricingPage />
      </div>
    </div>
  );
}
