export type SearchCategory = {
  id: number;
  name: string;
  value: string;
};

export const getUserSearchCategory = (): SearchCategory[] => [
  { id: 0, name: "전체", value: "all" },
  { id: 1, name: "아이디", value: "username" },
  { id: 2, name: "이름", value: "name" },
  { id: 3, name: "부서", value: "dept" },
  { id: 4, name: "직위", value: "ranks" },
];

export const getSettingSearchCategory = (): SearchCategory[] => [
  { id: 0, name: "전체", value: "all" },
  { id: 1, name: "데이터수집명", value: "settingName" },
  { id: 2, name: "URL", value: "url" },
  { id: 3, name: "USER-AGENT", value: "userAgent" },
];

export const getSchedulerSearchCategory = (): SearchCategory[] => [
  { id: 0, name: "전체", value: "all" },
  { id: 1, name: "수집명", value: "settingName" },
  { id: 2, name: "주기", value: "cycle" },
  { id: 3, name: "시간", value: "startAt" },
];
