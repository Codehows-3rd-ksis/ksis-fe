import instance from "./AxiosInstance";

// 이력 상세 조회
export const getHistoryDetail = async (workId: string) => {
  const response = await instance.get(`/history/result/${workId}`);
  return response.data;
};

// 개별 재수집
export const recollectItem = async (itemId: string) => {
  const response = await instance.post(`/recollect/item/${itemId}`);
  return response.data;
};

// 일괄 재수집
export const recollectWork = async (workId: string) => {
  const response = await instance.post(`/recollect/work/${workId}`);
  return response.data;
};
