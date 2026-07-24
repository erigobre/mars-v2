import { useQuery } from '@tanstack/react-query';
import { getCurrentCampaignCycles, getCurrentCampaignRanking, getCurrentCycleRanking, getCycleRanking } from '../api/RankingAPI';

export const rankingKeys = {
  all: ['rankings'] as const,
  currentCampaign: () => [...rankingKeys.all, 'current-campaign'] as const,
  currentCycle: () => [...rankingKeys.all, 'current-cycle'] as const,
  campaignCycles: () => [...rankingKeys.all, 'campaign-cycles'] as const,
  cycleRanking: (id: number) => [...rankingKeys.all, 'cycle-ranking', id] as const,
};

export const useCurrentCampaignRanking = () => {
  return useQuery({
    queryKey: rankingKeys.currentCampaign(),
    queryFn: getCurrentCampaignRanking,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

export const useCurrentCycleRanking = () => {
  return useQuery({
    queryKey: rankingKeys.currentCycle(),
    queryFn: getCurrentCycleRanking,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

export const useCurrentCampaignCycles = () => {
  return useQuery({
    queryKey: rankingKeys.campaignCycles(),
    queryFn: getCurrentCampaignCycles,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

export const useCycleRanking = (cycleId: number | "") => {
  return useQuery({
    queryKey: rankingKeys.cycleRanking(Number(cycleId)),
    queryFn: () => getCycleRanking(Number(cycleId)),
    enabled: cycleId !== "",
    staleTime: 1000 * 60 * 5,
  });
};