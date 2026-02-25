// src/api/reportApi.ts
import { api } from './axiosInstance';

export const ReportType = {
  ROOM: 'ROOM',
  MESSAGE: 'MESSAGE',
  MEME: 'MEME'
} as const;

export type ReportType = typeof ReportType[keyof typeof ReportType];

export interface ReportCreateRequest {
  reportedId: string;
  contentId: number;
  reportedContent: string;
  reportType: ReportType;
  reportReason: string;
}

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

export const createReport = async (data: ReportCreateRequest): Promise<ApiResponse<void>> => {
  const response = await api.post('/report/create', data);
  return response.data;
};