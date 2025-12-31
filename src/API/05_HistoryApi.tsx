import instance from "./AxiosInstance";

// 이력조회 - 관리자일 경우 모두 조회
// export const getHistory = async () => {
//   const response = await instance.get(`/history`);
//   return response.data;
// };
export const getHistory = async (
  startDate: string,
  endDate: string,
  type: string,
  keyword: string,
  page: number,
  size: number
) => {
  const response = await instance.get(`/history`, {
    params: {
      startDate,
      endDate,
      type,
      keyword,
      page,
      size,
    },
  });
  return response.data;
};

// 입력한 workId를 가지는 ResultItem들 가져오기
export const getHistoryExport = async (workId: number) => {
  const response = await instance.get(`/history/export/${workId}`);
  return response.data;
};

// 이력 상세 조회
export const getHistoryDetail = async (workId: string) => {
  const response = await instance.get(`/history/result/${workId}`);
  return response.data;
};
