import type { ApiResponse, ChatMessage, PaginatedResponse } from "@shared/types";

const API_BASE = "/api";

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export const api = {
  chat: {
    sendMessage: async (sessionId: string, content: string) =>
      fetchApi<ChatMessage>("/chat/message", {
        method: "POST",
        body: JSON.stringify({ sessionId, content }),
      }),

    getMessages: async (sessionId: string) =>
      fetchApi<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`),

    createSession: async () =>
      fetchApi<{ sessionId: string }>("/chat/sessions", {
        method: "POST",
      }),

    getSessions: async () =>
      fetchApi<Array<{ id: string; createdAt: string }>>("/chat/sessions"),
  },

  plans: {
    approve: async (planId: string) =>
      fetchApi<{ success: boolean }>(`/plans/${planId}/approve`, {
        method: "POST",
      }),

    dryRun: async (planId: string) =>
      fetchApi<{ result: unknown }>(`/plans/${planId}/dry-run`, {
        method: "POST",
      }),

    rollback: async (planId: string) =>
      fetchApi<{ success: boolean }>(`/plans/${planId}/rollback`, {
        method: "POST",
      }),
  },

  connections: {
    list: async () =>
      fetchApi<
        Array<{
          id: string;
          provider: string;
          accountName: string;
          authLevel: string;
          status: string;
          capabilities: string[];
        }>
      >("/connections"),

    connect: async (provider: string) =>
      fetchApi<{ authUrl: string }>(`/connections/${provider}/connect`, {
        method: "POST",
      }),

    disconnect: async (connectionId: string) =>
      fetchApi<{ success: boolean }>(`/connections/${connectionId}`, {
        method: "DELETE",
      }),

    upgrade: async (connectionId: string) =>
      fetchApi<{ authUrl: string }>(`/connections/${connectionId}/upgrade`, {
        method: "POST",
      }),
  },

  audit: {
    getLogs: async (params?: {
      page?: number;
      pageSize?: number;
      provider?: string;
      action?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
      if (params?.provider) searchParams.set("provider", params.provider);
      if (params?.action) searchParams.set("action", params.action);
      if (params?.startDate) searchParams.set("startDate", params.startDate);
      if (params?.endDate) searchParams.set("endDate", params.endDate);

      const query = searchParams.toString();
      return fetchApi<
        PaginatedResponse<{
          id: string;
          timestamp: string;
          provider: string;
          action: string;
          status: string;
          userId: string;
          details: Record<string, unknown>;
        }>
      >(`/audit${query ? `?${query}` : ""}`);
    },
  },
};
