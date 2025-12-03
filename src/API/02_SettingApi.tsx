import instance from "./AxiosInstance";

// robots.txt 검증 및 검출
export const getRobots = async (url: string, robotsTxt: string) => {
  const response = await instance.post(`/robots`, {url, robotsTxt});
  return response.data;
};
// 페이지 미리보기 요청 (스크린샷 + HTML)
export const getPreview = async (url: string) => {
  const response = await instance.post(`/preview`, {url});
  return response.data;
};
// 특정 selector에 대한 하이라이트 좌표 요청
export const getHighlight = async (url: string, selector: string) => {
  const response = await instance.post(`/crawl/highlight`, {url, selector});
  return response.data;
};

// 조회
export const getSetting = async () => {
  const response = await instance.get(`/setting`);
  return response.data;
};

interface Condition {
    conditionsKey: string;
    attr: string;
    conditionsValue: string;
}
// 등록
export const registSetting = async (data: Partial<{
  userId: number;
  settingName: string; // 수집명
  url: string; // URL
  type: string; // 단일/다중 타입
  userAgent: string; // UserAgent
  rate: number; // 수집간격
  listArea?: string; // 게시물영역 (다중인 경우에만)
  pagingType?: string; // 페이지네이션 타입 (다중)
  pagingArea?: string; // 페이지네이션 영역 (다중)
  pagingNextbtn?: string; // 페이지네이션 다음버튼 영역 (다중)
  maxPage?: number; // 최대페이지 (다중)
  linkArea?: string; // 상세링크 영역 (다중)
  conditions?: Condition[];
}>) => {
  const response = await instance.post(`/setting`, data);
  return response.data;
};

// 수정할 때 추출조건 조회
export const getCondtions = async (settingId:number) => {
  const response = await instance.get(`/setting/conditions/${settingId}`);
  return response.data;
};

interface Condition {
    conditionsKey: string;
    attr: string;
    conditionsValue: string;
}
// 수정
export const updateSetting = async (settingId:number, data: Partial<{
  userId: number;
  settingName: string; // 수집명
  url: string; // URL
  type: string; // 단일/다중 타입
  userAgent: string; // UserAgent
  rate: number; // 수집간격
  listArea?: string; // 게시물영역 (다중인 경우에만)
  pagingType?: string; // 페이지네이션 타입 (다중)
  pagingArea?: string; // 페이지네이션 영역 (다중)
  pagingNextbtn?: string; // 페이지네이션 다음버튼 영역 (다중)
  maxPage?: number; // 최대페이지 (다중)
  linkArea?: string; // 상세링크 영역 (다중)
  conditions?: Condition[];
}>) => {
  const response = await instance.put(`/setting/${settingId}`,data);
  return response.data;
};

// 삭제
export const deleteSetting = async (id: number) => {
  const response = await instance.delete(`/setting/${id}`);
  return response.data;
};
