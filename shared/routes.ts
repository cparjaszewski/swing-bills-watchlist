import { z } from 'zod';
import { members, bills, topics, userPreferences } from './schema';

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
  topics: {
    list: {
      method: 'GET' as const,
      path: '/api/topics',
      responses: {
        200: z.array(z.custom<typeof topics.$inferSelect>()),
      },
    },
  },
  preferences: {
    get: {
      method: 'GET' as const,
      path: '/api/preferences',
      responses: {
        200: z.custom<typeof userPreferences.$inferSelect | null>(),
      },
    },
    save: {
      method: 'POST' as const,
      path: '/api/preferences',
      input: z.object({
        selectedTopics: z.array(z.string()),
        customInterests: z.string().optional(),
        votePreference: z.string().optional(),
        onboardingComplete: z.boolean().optional(),
      }),
      responses: {
        200: z.custom<typeof userPreferences.$inferSelect>(),
      },
    },
  },
  email: {
    draft: {
      method: 'POST' as const,
      path: '/api/email/draft',
      input: z.object({
        senatorId: z.string(),
        billId: z.string(),
        voteIntention: z.enum(["YES", "NO"]),
      }),
      responses: {
        200: z.object({
          subject: z.string(),
          body: z.string(),
          senatorName: z.string(),
          billTitle: z.string(),
        }),
        500: z.object({ message: z.string() }),
      },
    },
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
