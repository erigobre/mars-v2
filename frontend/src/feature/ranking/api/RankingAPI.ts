import api from "@/core/api/axios";
import type { ApiResponse } from "@/core/types";
import { safeValidate } from "@/core/utils/zodHelper";
import { CurrentCampaignRankingDataSchema, type CurrentCampaignRankingData, type CurrentCycleRankingData } from "../schemas/ranking";
import { RedemptionCyclesArraySchema, type RedemptionCycle } from "../schemas/redemptionCycle";


export async function getCurrentCampaignRanking() {
    const { data } = await api.get<ApiResponse<CurrentCampaignRankingData>>('/campaigns/current/ranking');
    
    safeValidate(CurrentCampaignRankingDataSchema, data.data)
    return data.data;
}

export async function getCurrentCycleRanking() {
    const { data } = await api.get<ApiResponse<CurrentCycleRankingData>>('/campaigns/current/cycle/current/ranking');
    
    safeValidate(CurrentCampaignRankingDataSchema, data.data)
    return data.data;
}

export async function getCycleRanking(cycleId: number) {
    const { data } = await api.get<ApiResponse<CurrentCycleRankingData>>(`/campaigns/current/cycles/${cycleId}/ranking`);

    safeValidate(CurrentCampaignRankingDataSchema, data.data)
    return data.data;
}

export async function getCurrentCampaignCycles() {
    const { data } = await api.get<ApiResponse<RedemptionCycle[]>>('/campaigns/current/cycles');
    
    safeValidate(RedemptionCyclesArraySchema, data.data);
    return data.data;
}