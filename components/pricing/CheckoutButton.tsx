import React, { useState } from "react";

type CheckoutButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<true | string | void> | void;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  style?: string;
};

export default function CheckoutButton({
  onClick,
  disabled = false,
  label = "Bayar Sekarang (Tripay)",
  loadingLabel = "Memproses...",
  successMessage = "Pembayaran berhasil!",
  errorMessage = "Terjadi kesalahan. Silakan coba lagi.",
  style = ""
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (disabled || loading) return;
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const result = await onClick?.(e);
      if (result === true) {
        setSuccess(true);
      } else if (typeof result === "string") {
        setError(result);
      }
    } catch (err) {
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style}>
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className={`btn btn-primary flex items-center justify-center gap-2 ${loading ? "opacity-60 cursor-wait" : ""}`}
        aria-busy={loading}
        aria-live="polite"
      >
        {loading ? (
          <>
            <span className="loader border-white border-t-blue-500 mr-2"></span>
            {loadingLabel}
          </>
        ) : (
          label
        )}
      </button>
      {success && (
        <div className="text-green-600 text-xs mt-2" role="status">{successMessage}</div>
      )}
      {error && (
        <div className="text-red-500 text-xs mt-2" role="alert">{error}</div>
      )}
    </div>
  );
}
