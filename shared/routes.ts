import { z } from 'zod';
import { members, bills, insertMemberSchema, insertBillSchema } from './schema';

export const api = {
  bills: {
    list: {
      method: 'GET' as const,
      path: '/api/bills',
      responses: {
        200: z.array(z.custom<typeof bills.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/bills/:id',
      responses: {
        200: z.custom<typeof bills.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    analyze: {
      method: 'GET' as const,
      path: '/api/bills/:id/analyze',
      responses: {
        200: z.custom<{
            bill: typeof bills.$inferSelect;
            whipCount: { yes: number; no: number; swing: number };
            senators: Array<{
                member: typeof members.$inferSelect;
                status: "Loyalist" | "Leaning" | "Swing";
                strategy: string;
            }>
        }>(),
        404: z.object({ message: z.string() }),
      },
    },
    sync: {
       method: 'POST' as const,
       path: '/api/sync',
       responses: {
         200: z.object({ message: z.string() }),
       }
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
