import instance from "./AxiosInstance";

// 이력조회 - 관리자일 경우 모두 조회
export const getHistoryAll = async () => {
  const response = await instance.get(`/history`);
  return response.data;
};
// 입력한 workId를 가지는 ResultItem들 가져오기
export const getHistoryResult = async (workId: number) => {
  const response = await instance.get(`/history/${workId}`);
  return response.data;
};

//  - 특정 유저의 로그 조회
export const getUserLog = async (userId: number) => {
  const response = await instance.post(`/user/log/`, { userId });
  return response.data;
};