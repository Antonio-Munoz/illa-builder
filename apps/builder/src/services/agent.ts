import { v4 } from "uuid"
import { agentRequest, authCloudRequest } from "@/api/http"
import { Agent, AgentRaw, MarketplaceInfo } from "@/redux/aiAgent/aiAgentState"
import { UploadResponse } from "@/services/users"
import { base642Blob, getFileExtensionFromBase64 } from "@/utils/file"
import { upload } from "@/utils/file/upload"
import { getTeamID } from "@/utils/team"

export interface TeamAgentListData {
  aiAgentList: Agent[]
  totalAIAgentCount: number
}

export enum SortOptions {
  ID = "id",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
}

export const fetchTeamAgentList = (
  sortBy: SortOptions = SortOptions.ID,
  signal?: AbortSignal,
) => {
  return agentRequest<TeamAgentListData>(
    {
      url: `/aiAgent/list/sortBy/${sortBy}`,
      method: "GET",
      signal,
    },
    {
      needTeamID: true,
    },
  )
}

// Search AI Agent By Keywords
export const fetchTeamAgentByKeywords = (
  sortBy: SortOptions = SortOptions.ID,
  keywords: string,
  signal?: AbortSignal,
) => {
  return agentRequest<TeamAgentListData>(
    {
      url: `/aiAgent/list/sortBy/${sortBy}/like`,
      method: "GET",
      params: {
        keywords,
      },
      signal,
    },
    {
      needTeamID: true,
    },
  )
}

export interface AgentProduct {
  aiAgent: Agent
  marketplace: MarketplaceInfo
}

export interface MarketAgentListData {
  products: AgentProduct[]
  total: number
  pageSize: number
  pageIndex: 1
}

export interface ForkAgentResponse {
  aiAgentID: string
}

export const forkAIAgentToTeam = (aiAgentID: string) => {
  const teamID = getTeamID()
  return agentRequest<ForkAgentResponse>({
    url: `/aiAgent/${aiAgentID}/forkTo/teams/${teamID}`,
    method: "POST",
  })
}

export const deleteAiAgent = (aiAgentID: string) => {
  return agentRequest<ForkAgentResponse>(
    {
      url: `/aiAgent/${aiAgentID}`,
      method: "DELETE",
    },
    {
      needTeamID: true,
    },
  )
}

export const fetchAgentDetail = (aiAgentID: string) => {
  return agentRequest<Agent>(
    {
      url: `/aiAgent/${aiAgentID}`,
      method: "GET",
    },
    {
      needTeamID: true,
    },
  )
}

export const putAgentDetail = (aiAgentID: string, agentRaw: AgentRaw) => {
  return agentRequest<Agent, AgentRaw>(
    {
      url: `/aiAgent/${aiAgentID}`,
      method: "PUT",
      data: agentRaw,
    },
    {
      needTeamID: true,
    },
  )
}

export const createAgent = (agentRaw: AgentRaw) => {
  return agentRequest<Agent, AgentRaw>(
    {
      url: `/aiAgent`,
      method: "POST",
      data: agentRaw,
    },
    {
      needTeamID: true,
    },
  )
}

// send raw without variables
export const generateDescription = (prompt: string) => {
  return agentRequest<{ payload: string }, { prompt: string }>(
    {
      url: `/aiAgent/generatePromptDescription`,
      method: "POST",
      data: {
        prompt: prompt,
      },
    },
    {
      needTeamID: true,
    },
  )
}

export const getAIAgentWsAddress = (
  aiAgentID: string,
  signal?: AbortSignal,
) => {
  return agentRequest<{ aiAgentConnectionAddress: string }>(
    {
      url: `/aiAgent/${aiAgentID}/connectionAddress`,
      method: "GET",
      signal,
    },
    {
      needTeamID: true,
    },
  )
}

export const getAIAgentAnonymousAddress = (signal?: AbortSignal) => {
  return agentRequest<{ aiAgentConnectionAddress: string }>(
    {
      url: `/aiAgent/AIAgentAnonymous/connectionAddress`,
      method: "GET",
      signal,
    },
    {
      needTeamID: true,
    },
  )
}

export const uploadAgentIcon = async (base64: string) => {
  const fileName = v4()
  const type = getFileExtensionFromBase64(base64)
  const address = await authCloudRequest<UploadResponse>({
    url: `/aiAgent/icon/uploadAddress/fileName/${fileName}.${type}`,
    method: "GET",
  })
  const file = base642Blob(base64)
  return await upload(address.data.uploadAddress, file)
}
