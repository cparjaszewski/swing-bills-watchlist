import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { DraftEmailRequest, DraftEmailResponse } from "@shared/schema";
import { getSessionId } from "@/lib/session";

export function useDraftEmail() {
  return useMutation<DraftEmailResponse, Error, DraftEmailRequest>({
    mutationFn: async (data: DraftEmailRequest) => {
      const res = await fetch(api.email.draft.path, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-session-id': getSessionId(),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate email");
      }
      return res.json();
    },
  });
}
