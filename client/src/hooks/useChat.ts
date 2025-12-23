import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ChatMessage } from "@shared/types";
import { v4 as uuidv4 } from "uuid";

export function useChat(sessionId?: string) {
  const queryClient = useQueryClient();
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);

  const messagesQuery = useQuery({
    queryKey: ["chat", "messages", currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return [];
      const response = await api.chat.getMessages(currentSessionId);
      return response.data || [];
    },
    enabled: !!currentSessionId,
  });

  const sessionsQuery = useQuery({
    queryKey: ["chat", "sessions"],
    queryFn: async () => {
      const response = await api.chat.getSessions();
      return response.data || [];
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await api.chat.createSession();
      if (!response.success) throw new Error(response.error);
      return response.data!;
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.sessionId);
      queryClient.invalidateQueries({ queryKey: ["chat", "sessions"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      let sid = currentSessionId;
      if (!sid) {
        const sessionResult = await api.chat.createSession();
        if (!sessionResult.success) throw new Error(sessionResult.error);
        sid = sessionResult.data!.sessionId;
        setCurrentSessionId(sid);
      }

      const optimisticMessage: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ChatMessage[]>(
        ["chat", "messages", sid],
        (old) => [...(old || []), optimisticMessage]
      );

      const response = await api.chat.sendMessage(sid, content);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", currentSessionId],
      });
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", currentSessionId],
      });
    },
  });

  const approvePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await api.plans.approve(planId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", currentSessionId],
      });
    },
  });

  const dryRunMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await api.plans.dryRun(planId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await api.plans.rollback(planId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", currentSessionId],
      });
    },
  });

  const sendMessage = useCallback(
    (content: string) => {
      sendMessageMutation.mutate(content);
    },
    [sendMessageMutation]
  );

  const approvePlan = useCallback(
    (planId: string) => {
      approvePlanMutation.mutate(planId);
    },
    [approvePlanMutation]
  );

  const dryRunPlan = useCallback(
    (planId: string) => {
      dryRunMutation.mutate(planId);
    },
    [dryRunMutation]
  );

  const rollbackPlan = useCallback(
    (planId: string) => {
      rollbackMutation.mutate(planId);
    },
    [rollbackMutation]
  );

  const createSession = useCallback(() => {
    createSessionMutation.mutate();
  }, [createSessionMutation]);

  const selectSession = useCallback((id: string) => {
    setCurrentSessionId(id);
  }, []);

  return {
    messages: messagesQuery.data || [],
    sessions: sessionsQuery.data || [],
    currentSessionId,
    isLoading: sendMessageMutation.isPending,
    isLoadingMessages: messagesQuery.isLoading,
    sendMessage,
    approvePlan,
    dryRunPlan,
    rollbackPlan,
    createSession,
    selectSession,
  };
}
