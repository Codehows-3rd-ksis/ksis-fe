import axios from "axios"
import instance from "./AxiosInstance";
const BASE_URL = import.meta.env.VITE_API_URL;

// 공통 axios config (토큰, 헤더 등 필요 시 확장 가능)
// const getAxiosConfig = () => {
//   const token = sessionStorage.getItem('jwt');
//   return {
//     headers: { 
//       'Authorization': token
//     },
//   }
// };

// export const loginUser = async (data: Partial<{
//   username: string; // 사용자 ID (= login ID)
//   password: string; // 비밀번호
// }>) => {
//   const response = await axios.post(`${BASE_URL}/login`, data, getAxiosConfig());
//   return response.data;
// };

// 로그인 (Authorization 헤더 ❌) - 토큰을 받기 위한 요청에는 Authorization 불필요
export const loginUser = async (data: { username: string; password: string }) => {
  const response = await axios.post(
    `${BASE_URL}/login`,
    data,
    {
      headers: { "Content-Type": "application/json" }
    }
  );

  return response.data; // { accessToken, refreshToken, user? }
};

// 로그인한 유저 정보 조회 (Authorization 자동)
export const getProfile = async () => {
  const response = await instance.get("/profile");
  return response.data; // user info
};
