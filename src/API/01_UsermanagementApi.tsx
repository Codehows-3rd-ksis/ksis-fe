import instance from "./AxiosInstance";

// 유저관리 - 조회
// export const getUser = async () => {
//   const response = await instance.get(`/user`);
//   return response.data;
// };
export const getUser = async (type: string, keyword: string, page: number, size: number) => {
  const response = await instance.get(`/user`, {
    params: {
      type,
      keyword,
      page,
      size,
    },
  });
  return response.data;
};

// 유저관리 - 회원 등록
export const registUser = async (data: Partial<{
  username: string; // 사용자 ID (= login ID)
  password: string; // 비밀번호
  name: string; // 이름
  dept: string; // 부서
  ranks: string; // 직위
  state: string; // 승인상태
}>) => {
  const response = await instance.post(`/user`, data);
  return response.data;
};

// 유저관리 - 회원 정보수정
export const updateUserInfo = async (id:number, data: Partial<{
  name: string; // 이름
  dept: string; // 부서
  ranks: string; // 직위
  state: string; // 승인상태
}>) => {
  const response = await instance.put(`/userInfo/${id}`,data);
  return response.data;
};
// 유저관리 - 회원 계정수정
export const updateUserAccount = async (id:number, data: Partial<{
  username: string; // 사용자 ID (= login ID)
  password: string; // 비밀번호
}>) => {
  const response = await instance.put(`/userAccount/${id}`,data);
  return response.data;
};

// 유저관리 - 삭제
export const deleteUser = async (id: number) => {
  const response = await instance.delete(`/user/${id}`);
  return response.data;
};

// 유저관리 - 특정 유저의 로그 조회
export const getUserLog = async (userId: number) => {
  const response = await instance.get(`/history/${userId}`);
  return response.data;
};