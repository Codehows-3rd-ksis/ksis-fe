import instance from "./AxiosInstance";

// 이력조회 - 관리자일 경우 모두 조회
export const getHistoryAll = async () => {
  const response = await instance.get(`/history`);
  return response.data;
};
// 이력조회 - 유저일 경우 자신의 이력 조회
export const getHistoryUser = async (userId: number) => {
  const response = await instance.get(`/history/${userId}`);
  return response.data;
};
// 입력한 workId를 가지는 ResultItem들 가져오기
export const getHistoryResult = async (workId: number) => {
  const response = await instance.get(`/history/result/${workId}`);
  return response.data;
};
