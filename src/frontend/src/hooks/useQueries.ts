import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProduct(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["product", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useFixtures() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["fixtures"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFixtures();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFixture(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["fixture", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getFixture(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useLeaderboard(fixtureId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leaderboard", fixtureId?.toString()],
    queryFn: async () => {
      if (!actor || !fixtureId) return [];
      return actor.listLeaderboardByFixture(fixtureId);
    },
    enabled: !!actor && !isFetching && fixtureId !== null,
  });
}

export function useOffersByProduct(productId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["offers-by-product", productId?.toString()],
    queryFn: async () => {
      if (!actor || !productId) return [];
      return actor.listOffersByProduct(productId);
    },
    enabled: !!actor && !isFetching && productId !== null,
  });
}

export function useMyOffers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["my-offers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyOffers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyIntents() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["my-intents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyIntents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyMatches() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["my-matches"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyMatches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMatchesForSeller() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["seller-matches"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMatchesForSeller();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminUsers(role: string | null = null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin-users", role],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListUsers(role);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAllOffers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListAllOffers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAllIntents() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin-intents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListAllIntents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAllMatches() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin-matches"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListAllMatches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminApproveUser(userId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useSetUserActive() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      active,
    }: { userId: bigint; active: boolean }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminSetUserActive(userId, active);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}
