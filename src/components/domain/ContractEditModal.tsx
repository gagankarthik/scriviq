"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Pencil } from "lucide-react";

interface ContractEditModalProps {
  contractId: string;
  initial: {
    title: string;
    clientName: string;
    contractValue?: number;
    expiryDate?: string;
  };
}

export function ContractEditModal({ contractId, initial }: ContractEditModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initial.title);
  const [clientName, setClientName] = useState(initial.clientName);
  const [contractValue, setContractValue] = useState(
    initial.contractValue != null ? String(initial.contractValue) : ""
  );
  const [expiryDate, setExpiryDate] = useState(
    initial.expiryDate ? initial.expiryDate.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function openModal() {
    setTitle(initial.title);
    setClientName(initial.clientName);
    setContractValue(initial.contractValue != null ? String(initial.contractValue) : "");
    setExpiryDate(initial.expiryDate ? initial.expiryDate.slice(0, 10) : "");
    setError("");
    setOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/contracts/${contractId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          clientName: clientName.trim(),
          ...(contractValue ? { contractValue: parseFloat(contractValue) } : {}),
          ...(expiryDate ? { expiryDate } : { expiryDate: null }),
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5] focus:ring-2 focus:ring-[#0072E5]/20 transition-all";
  const labelCls =
    "block text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-1.5";

  return (
    <>
      <button
        onClick={openModal}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] text-sm font-medium transition-all"
      >
        <Pencil size={13} />
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[var(--fg-primary)]">Edit Contract</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Contract Value (USD)</label>
                <input
                  type="number"
                  value={contractValue}
                  onChange={(e) => setContractValue(e.target.value)}
                  placeholder="e.g. 75000"
                  min="0"
                  step="any"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim() || !clientName.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold btn-brand disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
