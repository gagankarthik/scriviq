import Link from "next/link";

export default function ContractNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-4xl mb-4 font-mono text-slate-700">404</p>
      <h2 className="text-xl font-semibold text-slate-300 mb-2">
        Contract not found
      </h2>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        This contract may have been deleted or you may not have access to view
        it.
      </p>
      <Link
        href="/contracts"
        className="text-sm text-indigo-400 hover:underline"
      >
        ← Back to contracts
      </Link>
    </div>
  );
}
