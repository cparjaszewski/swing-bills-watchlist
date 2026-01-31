import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { getSessionId } from "@/lib/session";
import type { Topic, UserPreferences } from "@shared/schema";

export function useTopics() {
  return useQuery<Topic[]>({
    queryKey: [api.topics.list.path],
    queryFn: async () => {
      const res = await fetch(api.topics.list.path);
      if (!res.ok) throw new Error("Failed to fetch topics");
      return res.json();
    },
  });
}

export function usePreferences() {
  return useQuery<UserPreferences | null>({
    queryKey: [api.preferences.get.path],
    queryFn: async () => {
      const res = await fetch(api.preferences.get.path, {
        headers: { 'x-session-id': getSessionId() },
      });
      if (!res.ok) throw new Error("Failed to fetch preferences");
      return res.json();
    },
  });
}

export function useSavePreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      selectedTopics: string[]; 
      customInterests?: string;
      votePreference?: string; 
      onboardingComplete?: boolean;
    }) => {
      const res = await fetch(api.preferences.save.path, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-session-id': getSessionId(),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save preferences");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.preferences.get.path] });
    },
  });
}
