import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User, UserCatWithDetails, BattleWithDetails, Cat } from "@shared/schema";

export function useUser(userId: number) {
  return useQuery<User>({
    queryKey: [`/api/user/${userId}`],
    enabled: !!userId,
  });
}

export function useUserCats(userId: number) {
  return useQuery<UserCatWithDetails[]>({
    queryKey: [`/api/user/${userId}/cats`],
    enabled: !!userId,
  });
}

export function useActiveCat(userId: number) {
  return useQuery<UserCatWithDetails>({
    queryKey: [`/api/user/${userId}/cats/active`],
    enabled: !!userId,
  });
}

export function useActiveBattle(userId: number) {
  return useQuery<BattleWithDetails>({
    queryKey: [`/api/user/${userId}/battle/active`],
    enabled: !!userId,
    retry: false,
  });
}

export function useAllCats() {
  return useQuery<Cat[]>({
    queryKey: ["/api/cats"],
  });
}

export function useActivateCat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userCatId: number) => {
      const response = await apiRequest("PUT", `/api/user-cat/${userCatId}/activate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0]?.toString().includes('/cats') || false 
      });
    },
  });
}

export function useStartBattle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, playerCatId, opponentCatId }: {
      userId: number;
      playerCatId: number;
      opponentCatId: number;
    }) => {
      const response = await apiRequest("POST", "/api/battle/start", {
        userId,
        playerCatId,
        opponentCatId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });
}

export function useBattleAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ battleId, action, itemId }: {
      battleId: number;
      action: string;
      itemId?: number;
    }) => {
      const response = await apiRequest("POST", `/api/battle/${battleId}/action`, {
        action,
        itemId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, updates }: {
      userId: number;
      updates: Partial<User>;
    }) => {
      const response = await apiRequest("PUT", `/api/user/${userId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });
}
