import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL;

// 공통 axios config (토큰, 헤더 등 필요 시 확장 가능)
const getAxiosConfig = () => ({
  headers: { "Content-Type": "application/json" },
});

// 유저관리 - 조회
export const getUser = async () => {
  const response = await axios.get(`${BASE_URL}/user`, getAxiosConfig());
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
  const response = await axios.post(`${BASE_URL}/user`, data, getAxiosConfig());
  return response.data;
};

// 유저관리 - 회원 수정
export const updateUser = async (id:number, data: Partial<{
  username: string; // 사용자 ID (= login ID)
  password: string; // 비밀번호
  name: string; // 이름
  dept: string; // 부서
  ranks: string; // 직위
  state: string; // 승인상태
}>) => {
  const response = await axios.put(`${BASE_URL}/user/${id}`,data, getAxiosConfig());
  return response.data;
};

// 유저관리 - 삭제
export const deleteUser = async (id: number) => {
  const response = await axios.delete(`${BASE_URL}/user/${id}`, getAxiosConfig());
  return response.data;
};

// 유저관리 - 특정 유저의 로그 조회
export const getUserLog = async (id: number) => {
  const response = await axios.get(`${BASE_URL}/user/log/${id}`, getAxiosConfig());
  return response.data;
};