// TODO: Replace mock implementations with real API calls when backend is connected.

export interface SystemLog {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}

export const fetchSystemLogs = async (_search: string = ""): Promise<SystemLog[]> => {
  return [];
};

export const logActivityEvent = async (_action: string, _details: string = "-"): Promise<void> => {
  return;
};
