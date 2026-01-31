import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// --- Types derived from schema via api definition ---
type Bill = z.infer<typeof api.bills.list.responses[200]>[number];
type BillAnalysis = z.infer<typeof api.bills.analyze.responses[200]>;

export function useBills() {
  return useQuery({
    queryKey: [api.bills.list.path],
    queryFn: async () => {
      const res = await fetch(api.bills.list.path);
      if (!res.ok) throw new Error("Failed to fetch bills");
      return api.bills.list.responses[200].parse(await res.json());
    },
  });
}

export function useBill(id: string) {
  return useQuery({
    queryKey: [api.bills.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.bills.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch bill");
      return api.bills.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useBillAnalysis(id: string) {
  return useQuery({
    queryKey: [api.bills.analyze.path, id],
    queryFn: async () => {
      const url = buildUrl(api.bills.analyze.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch analysis");
      return api.bills.analyze.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useSyncBills() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.bills.sync.path, {
        method: api.bills.sync.method,
      });
      if (!res.ok) throw new Error("Failed to sync bills");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bills.list.path] });
    },
  });
}
