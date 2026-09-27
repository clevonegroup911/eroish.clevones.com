"use client";

import { useState } from "react";

import { attemptPublish } from "@/app/admin/actions";

export function PublishButton({ entity, id }: { entity: string; id: string }) {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        className="border border-ink px-3 py-1 text-[0.7rem] uppercase tracking-[0.12em]"
        onClick={async () => {
          const result = await attemptPublish(entity, id);
          setMessage(result.ok ? "Published" : `Blocked: ${result.reasons.join(", ")}`);
        }}
      >
        Publish
      </button>
      {message ? (
        <p className="mt-2 text-sm" data-testid="publish-result">
          {message}
        </p>
      ) : null}
    </div>
  );
}
