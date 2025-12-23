import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useConnections() {
  const queryClient = useQueryClient();

  const connectionsQuery = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const response = await api.connections.list();
      return response.data || [];
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await api.connections.connect(provider);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await api.connections.disconnect(connectionId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await api.connections.upgrade(connectionId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });

  return {
    connections: connectionsQuery.data || [],
    isLoading: connectionsQuery.isLoading,
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    upgrade: upgradeMutation.mutate,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isUpgrading: upgradeMutation.isPending,
  };
}
