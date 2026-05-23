"use client";

import { use, useState } from "react";
import { cancelByToken } from "@/lib/api";

type Props = { params: Promise<{ token: string }> };

export default function CancelPage({ params }: Props) {
  const { token } = use(params);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      await cancelByToken(token);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancellation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-calendlyBg flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 max-w-md w-full p-8 text-center">
        {done ? (
          <>
            <h1 className="text-2xl font-bold text-calendlyText mb-2">
              Meeting cancelled
            </h1>
            <p className="text-calendlyGrayText">
              You and the host have been notified.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-calendlyText mb-4">
              Cancel this meeting?
            </h1>
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-semibold disabled:opacity-60"
            >
              {loading ? "Cancelling…" : "Confirm cancellation"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
