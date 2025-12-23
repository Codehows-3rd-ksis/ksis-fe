/**
 * resultValue 파싱 유틸리티 함수
 * 크롤링 결과 데이터의 JSON 문자열을 파싱하고 평탄화하는 공통 함수
 */

/**
 * 단일 resultValue JSON 문자열을 파싱하고 평탄화
 * @param resultValue - JSON 문자열 형태의 크롤링 결과 데이터
 * @returns 평탄화된 객체
 *
 * @example
 * parseResultValue('{"title": "제목", "price": "1000"}')
 * // Returns: { title: "제목", price: "1000" }
 *
 * parseResultValue('[{"title": "제목"}, {"price": "1000"}]')
 * // Returns: { title: "제목", price: "1000" }
 */
export const parseResultValue = (resultValue: string): Record<string, any> => {
  try {
    if(!resultValue) return {};
    const parsedValue = JSON.parse(resultValue);

    // 배열이 아닌 경우 배열로 변환
    const valueArray = Array.isArray(parsedValue) ? parsedValue : [parsedValue];

    // 배열의 모든 객체를 평탄화하여 하나의 객체로 병합
    const flat = valueArray.reduce((acc: any, obj: any) => {
      // obj가 객체인지 확인
      if (typeof obj === "object" && obj !== null) {
        Object.entries(obj).forEach(([key, val]) => {
          acc[key] = val;
        });
      }
      return acc;
    }, {});

    return flat;
  } catch (e) {
    console.error("resultValue JSON parse error:", e);
    return {};
  }
};

/**
 * rows 배열의 모든 resultValue를 파싱하여 평탄화된 데이터 배열 반환
 * @param rows - resultValue를 포함하는 데이터 배열
 * @param additionalFields - 각 row에서 추가로 포함할 필드를 추출하는 함수
 * @returns 파싱된 데이터 배열
 *
 * @example
 * // StatusDetail 초기 로드용
 * parseResultValueRows(
 *   [{ id: 1, seq: 1, resultValue: '{"제목": "뉴스"}' }],
 *   (row) => ({ id: row.id, seq: row.seq })
 * )
 * // Returns: [{ id: 1, seq: 1, 제목: "뉴스" }]
 *
 * @example
 * // History 내보내기용
 * parseResultValueRows(
 *   [{ seq: 1, pageUrl: "http://...", resultValue: '{"제목": "뉴스"}' }],
 *   (row) => ({ seq: row.seq, page_url: row.pageUrl })
 * )
 * // Returns: [{ seq: 1, page_url: "http://...", 제목: "뉴스" }]
 */
export const parseResultValueRows = <T extends { resultValue: string }>(
  rows: T[],
  additionalFields: (row: T) => Record<string, any> = () => ({})
): Array<Record<string, any>> => {
  return rows.map((row) => ({
    ...additionalFields(row), // id, seq 등 추가 필드
    ...parseResultValue(row.resultValue), // resultValue 파싱 결과
  }));
};
