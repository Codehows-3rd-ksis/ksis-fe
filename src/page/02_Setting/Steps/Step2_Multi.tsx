import React, { useState, useRef } from 'react'
import { Box, Typography, InputAdornment, type SelectChangeEvent, } from '@mui/material'
import CustomIconButton from '../../../component/CustomIconButton';
import CustomTextField from '../../../component/CustomTextField';
import CustomButton from '../../../component/CustomButton';
import CustomSelect from '../../../component/CustomSelect';
import ScrollTable from '../../../component/ScrollTable';
import HtmlInspector from '../../../component/HTMLInspector';
import Alert from '../../../component/Alert';
import { type NewData } from '../RegPage';
import { type ConditionTableRows, getColumns } from '../../../Types/TableHeaders/SettingConditionHeader';
import { getPreview2 } from '../../../API/02_SettingApi';

interface PreviewData {
  image?: string;   // base64 이미지 형태
  html: string;   // 페이지 전체 HTML 문자열
  domRects: Array<{ selector: string; x:number; y:number; width:number; height:number }>;
}
interface HighlightPos {
  target: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
const colors = [
  "rgba(255, 235, 59, 0.8)",   // 노란색
  "rgba(100, 181, 246, 0.8)",  // 파란색
  "rgba(129, 199, 132, 0.8)",  // 초록색
  "rgba(244, 143, 177, 0.8)",  // 핑크색
];
const pagingTypeList = [
        { value: 'Numeric', name: '페이지 형식' },
        { value: 'Next_Btn', name: '다음버튼 형식' },
        { value: 'AJAX', name: 'AJAX' },
]

interface Props {
    previewData: PreviewData;
    detailData: PreviewData;
    newData: NewData;
    conditionData: ConditionTableRows[]
    setNewData: (value: NewData | ((prev: NewData) => NewData)) => void;
    setCondition: (value: ConditionTableRows[] | ((prev: ConditionTableRows[]) => ConditionTableRows[])) => void;
    setDetailPreview: (value: PreviewData | ((prev: PreviewData) => PreviewData)) => void;
    setLoading: (v: boolean) => void;
    isDetail: boolean;
    setIsDetail: (v: boolean) => void;
    detailUrl: string;
    setDetailUrl: (value: string | ((prev: string) => string)) => void;
}

export default React.memo(function Step2_Multi({
    previewData,
    detailData,
    newData,
    conditionData,
    setNewData,
    setCondition,
    setDetailPreview,
    setLoading,
    isDetail,
    setIsDetail,
    detailUrl,
    setDetailUrl
}: Props) {
    const [highlightNodesMap, setHighlightNodesMap] = useState<Record<string, Element | undefined>>({});
    const [mainRects, setMainRects] = useState<HighlightPos[]>([]);
    const [mainImageSize, setMainImageSize] = useState({
      naturalWidth: 0,
      naturalHeight: 0,
      displayWidth: 0,
      displayHeight: 0
    });
    const mainImgRef = useRef<HTMLImageElement>(null);
    const [detailRects, setDetailRects] = useState<HighlightPos[]>([]); // Preview highlight
    const [detailImageSize, setDetailImageSize] = useState({
      naturalWidth: 0,
      naturalHeight: 0,
      displayWidth: 0,
      displayHeight: 0
    });
    const detailImgRef = useRef<HTMLImageElement>(null);
    const [selectTarget, setSelectTarget] = useState<any>(null); // 영역선택 포커스
    const [openErrorAlert, setOpenErrorAlert] = useState(false)
    const [alertMsg, setAlertMsg] = useState('')

    const handleAddCondition = () => {
      setCondition(prev => [
        ...prev,
        {
          id: prev.length + 1,
          conditionsValue: "",
          attr: "",
          conditionsKey: ""
        }
      ]);
    };

    const handleInputChange = (key: keyof typeof newData, value: string) => {
        setNewData((prev) => {
            if (key === 'maxPage') {
              if (value === '' || Number(value) < 0) value = '0';
            }
            if (prev[key] === value) return prev; // 값이 같으면 상태 변경 안함

            return { ...prev, [key]: value };
        });
    }

    const handleSelectChange = (key: keyof typeof newData) => 
    (event: SelectChangeEvent<string | number>) => {
      setNewData((prev) => ({ ...prev, [key]: event.target.value }));
    };

    const handleAreaSelect = (target: any) => {
      setSelectTarget(target);
    };
    const handleAreaSelectTable = (rowId: number) => {
      setSelectTarget(rowId);
    };

    const getCssSelector = (el:any) => {
      if (!el || !(el instanceof Element)) return null;

      const path = [];
        
      while (el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
      
        // id가 있으면 끝내기
        if (el.id) {
          selector += `#${el.id}`;
          path.unshift(selector);
          break;
        }
      
        // 의미있는 클래스만 선택 (예: 't1', 'wrap1texts' 같은 자주 쓰이는 것 중 고유한 걸로 제한)
        const meaningfulClasses = Array.from(el.classList as DOMTokenList).filter((c: string) =>
          ['t1', 'wrap1texts', 'unique-class-name'].includes(c)
        );
      
        if (meaningfulClasses.length > 0) {
          selector += `.${meaningfulClasses.join('.')}`;
          path.unshift(selector);
          break; // 클래스가 충분히 고유하다면 여기서 끝내도 됨
        }
      
        // 없으면 부모로 올라가기 전에 nth-of-type으로 유일성 확보
        let sibling = el;
        let nth = 1;
      
        while ((sibling = sibling.previousElementSibling)) {
          if (sibling.nodeName === el.nodeName) nth++;
        }
        selector += `:nth-of-type(${nth})`;
      
        path.unshift(selector);
        el = el.parentNode as Element;
      }
    
      return path.join(' > ');
    }

    const findRectFromLocal = (
      selector: string,
      preview: PreviewData
    ) => {
      if (!selector || !preview?.domRects?.length) return null;
      // 정확히 일치
      const exact = preview.domRects.find(r => 
        r.selector && r.selector === selector
      );
      if (exact) return exact;
    
      // 부분매칭 — 빈 selector 제외
      const contains = preview.domRects.find(r =>
        r.selector &&
        r.selector.trim() !== "" &&
        (selector.includes(r.selector) || r.selector.includes(selector))
      );
      if (contains) return contains;
    
      return null;
    };

    // 다중페이지 영역선택 클릭시
    const handleInspectorClick = (element: Element) => {
      try {
        const selector = getCssSelector(element);
        if(selector === null) return;

        // 로컬 preview(domRects)에서 selector로 rect 검색
        const rect = findRectFromLocal(selector, previewData);
        
        if (!rect) {
          console.warn("Rect not found for selector", selector);
          return;
        }

        // mainRects 업데이트
        setMainRects(prev => {
          const filtered = prev.filter(r => r.target !== selectTarget);
        
          return [
            ...filtered,
            {
              target: selectTarget,
              x: rect.x,          // 서버 원본 좌표 그대로
              y: rect.y,
              width: rect.width,
              height: rect.height
            }
          ];
        });

        setHighlightNodesMap(prev => {
          const newMap = { ...prev };
          const currentNode = newMap[selectTarget];

          const isToggleOff = currentNode?.isSameNode(element);

          if (isToggleOff) {
            delete newMap[selectTarget];   // 하이라이트 해제
          } else {
            newMap[selectTarget] = element; // 새 노드 저장
          }

          return newMap;
        });
        // ✔ highlight 업데이트 이후 따로 호출
        const isToggleOff = highlightNodesMap[selectTarget]?.isSameNode(element);

        // ★ newData도 토글 ON/OFF에 따라 동기화
        setNewData(prev => ({
          ...prev,
          [`${selectTarget}Selector`]: isToggleOff ? "" : selector,
          [`${selectTarget}`]: isToggleOff ? "" : selector,
        }));
      
        // linkArea: 토글 ON → 링크 업데이트, 토글 OFF → URL 제거
        if (selectTarget === "linkArea") {
          if (isToggleOff) {
            setDetailUrl("");
          } else {
            const url = extractDetailUrlUniversal(
              element as HTMLElement,
              newData.url
            );
          
            if (url) {
              setDetailUrl(url);
            } else {
              setDetailUrl("");
            }
          }
        }

        setSelectTarget(null)
        setLoading(false)
      }
      catch(err) {
        console.error(err)
        setLoading(false)
        setAlertMsg("하이라이트 관련 오류가 발생하였습니다.")
        setOpenErrorAlert(true)
      }
    };
    // 추출조건 테이블 내 영역선택 버튼 클릭시
    const handleInspectorTableClick = (element: Element) => {
      try {
        const selector = getCssSelector(element);
        if(selector === null) return;       
        // 로컬 preview(domRects)에서 selector로 rect 검색
        const rect = findRectFromLocal(selector, detailData);
        if (!rect) {
          console.warn("Rect not found for selector", selector);
          return;
        }
        // detailRects 업데이트
        setDetailRects(prev => {
          const filtered = prev.filter(r => r.target !== selectTarget);
        
          return [
            ...filtered,
            {
              target: selectTarget,
              x: rect.x,          // 서버 원본 좌표 그대로
              y: rect.y,
              width: rect.width,
              height: rect.height
            }
          ];
        });
        
        setHighlightNodesMap(prev => {
          const newMap = { ...prev };
          const currentNode = newMap[selectTarget];
          const isToggleOff = currentNode?.isSameNode(element);

          if (isToggleOff) {
            delete newMap[selectTarget]; // 하이라이트 해제
          } else {
            newMap[selectTarget] = element; // 새 노드 저장
          }
        
          return newMap;
        });
        
        const isToggleOff = highlightNodesMap[selectTarget]?.isSameNode(element);

        setCondition((prev) =>
          prev.map((row) =>
            row.id === selectTarget
              ? {
                  ...row,
                  conditionsValue: isToggleOff ? "" : (selector ?? ""),
                }
              : row
          )
        );

        setSelectTarget(null)
        setLoading(false)
      }
      catch(err) {
        console.error(err)
        setLoading(false)
        setAlertMsg("하이라이트 관련 오류가 발생하였습니다.")
        setOpenErrorAlert(true)
      }
      
    };

    const handleDetailLoad = async () => {
        try {
          const resPreview2 = await getPreview2(detailUrl) 
          setDetailPreview(resPreview2)
          setIsDetail(true)
          setLoading(false)
        }
        catch(err) {
          console.error(err)
          setAlertMsg('상세영역 미리보기 불러오기 실패')
          setOpenErrorAlert(true)
          setIsDetail(false)
          setLoading(false)
        }
    }

    function extractDetailUrlUniversal(element: HTMLElement, pageUrl: string): string | null {
      const href = element.getAttribute("href") ?? "";
      const onclick = element.getAttribute("onclick") ?? "";
      const datasetUrl = (element as any)?.dataset?.url;
      const dataCode = (element as any)?.dataset?.code;    // 서울시 게시판
      const dataNttId = (element as any)?.dataset?.nttid;  // 일부 지자체 게시판
      const base = new URL(pageUrl);
        
      // =====================================================
      // ➊ 정상 href 처리 (javascript 제외)
      // =====================================================
      if (href && href !== "#" && !href.startsWith("javascript")) {
        try {
          return new URL(href, base).href;
        } catch {}
      }
    
      // =====================================================
      // ➋ onclick="location.href='...'"
      // =====================================================
      const locMatch = onclick.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
      if (locMatch) {
        try {
          return new URL(locMatch[1], base).href;
        } catch {}
      }
    
      // =====================================================
      // ➌ onclick="window.open('...')"
      // =====================================================
      const openMatch = onclick.match(/window\.open\s*\(\s*['"]([^'"]+)['"]/);
      if (openMatch) {
        try {
          return new URL(openMatch[1], base).href;
        } catch {}
      }
    
      // =====================================================
      // ➍ data-* 기반 지자체 패턴
      // =====================================================
      // 서울시: <a data-code="448396">
      if (dataCode) {
        try {
          return new URL(`/news/news_view.do?nttId=${dataCode}`, base).href;
        } catch {}
      }
    
      // 부산/울산: <a data-nttid="1234">
      if (dataNttId) {
        try {
          return new URL(`/view.do?nttId=${dataNttId}`, base).href;
        } catch {}
      }
    
      // dataset-url 사용
      if (datasetUrl) {
        try {
          return new URL(datasetUrl, base).href;
        } catch {}
      }
    
      // =====================================================
      // ➎ onclick 함수 호출 패턴
      // =====================================================
      const funcMatch = onclick.match(/([A-Za-z0-9_]+)\((.*?)\)/);
      if (funcMatch) {
        const funcName = funcMatch[1];
        const argsRaw = funcMatch[2];
      
        const args = argsRaw
          .split(",")
          .map(v => v.trim().replace(/^['"]|['"]$/g, ""));
      
        const fName = funcName.toLowerCase();
      
        // 대구광역시 fnView('code','no')
        if (fName === "fnview" && args.length >= 2) {
          try {
            return new URL(`/bbs/view.do?code=${args[0]}&no=${args[1]}`, base).href;
          } catch {}
        }
      
        // 통합 행정기관 fn_icms_navi_common('view','779519')
        if (fName === "fn_icms_navi_common" && args.length >= 2) {
          try {
            return new URL(
              `/icms/bbs/selectBoardArticle.do?bbsId=BBS_00153&nttId=${args[1]}`,
              base
            ).href;
          } catch {}
        }
      
        // 규격화된 view( 'id' ) 패턴
        if (fName.includes("view") && args.length === 1) {
          try {
            return new URL(`/view.do?id=${args[0]}`, base).href;
          } catch {}
        }
      
        // 그 외 함수 → 기본적으로 funcName.do?param=...
        try {
          return new URL(
            `${funcName}.do?param=${encodeURIComponent(args.join(","))}`,
            base
          ).href;
        } catch {}
      }
    
      // =====================================================
      // ➏ 내부 a[href] 우선 사용
      // =====================================================
      const innerA = element.querySelector("a[href]");
      if (innerA) {
        const innerHref = innerA.getAttribute("href") ?? "";
        if (innerHref) {
          try {
            return new URL(innerHref, base).href;
          } catch {}
        }
      }
    
      // =====================================================
      // ➐ 모든 케이스 실패
      // =====================================================
      return null;
    }

    // Conditions input 수정관련
    const handleConditionChange = (id: number, key: keyof ConditionTableRows, value: string) => {
      setCondition(prev =>
        prev.map(item => (item.id === id ? { ...item, [key]: value } : item))
      );
    };

    const handleConditionSelectChange = (row: ConditionTableRows, value: string) => {
      handleConditionChange(row.id, 'attr', value);
    };
    const processRowUpdate = (newRow: ConditionTableRows, oldRow: ConditionTableRows) => {
      // 변경된 행의 conditionsKey를 업데이트
      if (newRow.conditionsKey !== oldRow.conditionsKey) {
        handleConditionChange(newRow.id, 'conditionsKey', newRow.conditionsKey);
      }
      // 다른 변경 사항도 여기에 추가 가능
      return newRow;
    };
    const handleCancel = (id: number) => {
        setCondition(prev => prev.filter(item => item.id !== id));

        setHighlightNodesMap(prev => {
        const newMap = { ...prev };
        delete newMap[id];   // 특정 target(rowId)만 OFF
        return newMap;
        });
   
        setDetailRects(prev =>
          prev.filter(rect => String(rect.target) !== String(id))
        );
    }
    const conditionColumns = getColumns({
        handleAreaSelect: handleAreaSelectTable,
        handleSelectChange: handleConditionSelectChange,
        handleCancel,
    })

    return (
        <>
            <Box 
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%",
            }}>
                <Box
                  sx={{
                    // flex: 7,
                    height: 550,
                    minHeight: 550,
                    display: "flex",
                    gap: 2,
                    pb: 2,
                    borderBottom: "2px solid #ccc",
                }}>
                    {/* 스크린샷 */}
                    <Box
                      sx={{
                        flex: 1,
                        overflow: "auto",
                        maxHeight: 640,
                        background: "#eaeaea",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        color: 'black',
                        position: "relative",
                        border: "1px solid #ccc",
                    }}>
                        {previewData.image ? (
                          <img
                              ref={mainImgRef}
                              src={`data:image/png;base64,${previewData.image}`}
                              alt="미리보기"
                              style={{ width: "100%", height: "auto", objectFit: "contain" }}
                              onLoad={() => {
                                const img = mainImgRef.current;
                                if (!img) return;
                                setMainImageSize({
                                  naturalWidth: img.naturalWidth,
                                  naturalHeight: img.naturalHeight,
                                  displayWidth: img.clientWidth,
                                  displayHeight: img.clientHeight
                                });
                              }}
                          />
                        ) : (
                          <Typography>스크린샷이 없습니다.</Typography>
                        )}

                        {/* 하이라이트 박스들 */}
                        {mainRects.map((pos, idx) => {
                          const scaleX = mainImageSize.displayWidth / mainImageSize.naturalWidth;
                          const scaleY = mainImageSize.displayHeight / mainImageSize.naturalHeight;

                          return (
                            <Box
                              key={idx}
                              sx={{
                                position: "absolute",
                                border: `2px solid ${colors[idx % colors.length]}`,
                                backgroundColor: `${colors[idx % colors.length].replace("0.8", "0.25")}`, // 살짝 투명하게
                                pointerEvents: "none",
                                top: pos.y * scaleY,
                                left: pos.x * scaleX,
                                width: pos.width * scaleX,
                                height: pos.height * scaleY,
                                boxSizing: "border-box",
                              }}
                            />
                          );
                        })}
                    </Box>
                    {/* HTML 태그 */}
                    <HtmlInspector 
                      html={previewData.html}
                      onNodeClick={handleInspectorClick}
                      highlightNodes={highlightNodesMap}
                    />
                </Box>
                <Box 
                  sx={{
                    height: 350,
                    minHeight: 350,
                    mt: 2,
                    background: "#f7f7f7",
                    borderRadius: 2,
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                }}>
                    <Box sx={{
                        display: 'flex', width: '100%', alignContent: 'center', color: 'black'
                    }}>
                        <Typography sx={{fontSize: 25, marginRight: 1, width: '210px', textAlign: 'right'}}>게시물 영역:</Typography>
                        <CustomTextField 
                          inputWidth='800px' 
                          value={newData.listArea}
                          placeholder="게시물 영역"
                          readOnly={true}
                          type="text"
                          startAdornment={
                            <InputAdornment position="start" sx={{marginLeft: '-14px'}}>
                                <CustomButton
                                    text='영역선택'
                                    radius={1}
                                    height="40px"
                                    onClick={()=>handleAreaSelect('listArea')}
                                />
                            </InputAdornment>  
                          }
                        />
                    </Box>
                    <Box sx={{
                        display: 'flex', width: '100%', alignContent: 'center', color: 'black', gap:1
                    }}>
                        <Typography sx={{fontSize: 25, width: '210px', textAlign: 'right'}}>페이지네이션 영역:</Typography>
                        <CustomSelect
                            height="40px"
                            inputWidth="160px"
                            value={newData.pagingType}
                            listItem={pagingTypeList}
                            onChange={handleSelectChange('pagingType')}
                        />
                        <CustomTextField 
                          inputWidth='630px' 
                          value={newData.pagingArea}
                          placeholder="페이지네이션 영역"
                          readOnly={true}
                          type="text"
                          startAdornment={
                            <InputAdornment position="start" sx={{marginLeft: '-14px'}}>
                                <CustomButton
                                    text='영역선택'
                                    radius={1}
                                    height="40px"
                                    onClick={()=>handleAreaSelect('pagingArea')}
                                />
                            </InputAdornment>  
                          }
                        />
                        <CustomTextField 
                          inputWidth='300px' 
                          value={newData.pagingNextbtn}
                          placeholder="다음버튼 영역"
                          readOnly={true}
                          type="text"
                          startAdornment={
                            <InputAdornment position="start" sx={{marginLeft: '-14px'}}>
                                <CustomButton
                                    text='버튼선택'
                                    radius={1}
                                    height="40px"
                                    onClick={()=>handleAreaSelect('pagingNextbtn')}
                                />
                            </InputAdornment>  
                          }
                        />
                    </Box>
                    <Box sx={{
                        display: 'flex', width: '100%', alignContent: 'center', color: 'black'
                    }}>
                        <Typography sx={{fontSize: 25, marginRight: 1, width: '210px', textAlign: 'right'}}>수집할 페이지 수:</Typography>
                        <CustomTextField 
                          inputWidth='800px' 
                          value={newData.maxPage}
                          placeholder="수집할 페이지 수"
                          type="number"
                          onChange={(e) => handleInputChange('maxPage', e.target.value)}
                        />
                    </Box>
                    <Box sx={{
                        display: 'flex', width: '100%', alignContent: 'center', color: 'black'
                    }}>
                        <Typography sx={{fontSize: 25, marginRight: 1, width: '210px', textAlign: 'right'}}>상세 링크 영역:</Typography>
                        <CustomTextField 
                          inputWidth='1000px' 
                          value={newData.linkArea}
                          placeholder="상세 링크 영역"
                          readOnly={true}
                          type="text"
                          startAdornment={
                            <InputAdornment position="start" sx={{marginLeft: '-14px'}}>
                                <CustomButton
                                    text='영역선택'
                                    radius={1}
                                    height="40px"
                                    onClick={()=>handleAreaSelect('linkArea')}
                                />
                            </InputAdornment>  
                          }
                          endAdornment={
                            <InputAdornment position="end" sx={{marginRight: '-14px'}}>
                                <CustomButton
                                    text='상세페이지 불러오기'
                                    radius={1}
                                    height="40px"
                                    disabled={detailUrl? false: true}
                                    onClick={()=>{
                                      setLoading(true)
                                      handleDetailLoad()
                                    }}
                                    backgroundColor='#BABABA'
                                    width='200px'
                                />
                            </InputAdornment>  
                          }
                        />
                    </Box>
                </Box>
                {isDetail && (
                  <>
                    <br></br>
                    <Box
                    sx={{
                        height: 550,
                        minHeight: 550,
                        display: "flex",
                        gap: 2,
                        pb: 2
                      }}
                  >
                      {/* 스크린샷 */}
                      <Box
                          sx={{
                            flex: 1,
                            overflow: "auto",
                            maxHeight: 640,
                            background: "#eaeaea",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            color: 'black',
                            position: "relative",
                            border: "1px solid #ccc",
                      }}>
                          {detailData.image ? (
                            <img
                              ref={detailImgRef}
                              src={`data:image/png;base64,${detailData.image}`}
                              alt="미리보기"
                              style={{ width: "100%", height: "auto", objectFit: "contain" }}
                              onLoad={() => {
                                const img = detailImgRef.current;
                                if (!img) return;
                                setDetailImageSize({
                                  naturalWidth: img.naturalWidth,
                                  naturalHeight: img.naturalHeight,
                                  displayWidth: img.clientWidth,
                                  displayHeight: img.clientHeight
                                });
                              }}
                            />
                          ) : (
                            <Typography>스크린샷이 없습니다.</Typography>
                          )}
                          {/* 하이라이트 박스들 */}
                          {detailRects.map((pos, idx) => {
                              const scaleX = detailImageSize.displayWidth / detailImageSize.naturalWidth;
                              const scaleY = detailImageSize.displayHeight / detailImageSize.naturalHeight;
                            
                              return (
                                <Box
                                  key={idx}
                                  sx={{
                                    position: 'absolute',
                                    border: `2px solid ${colors[idx % colors.length]}`,
                                    backgroundColor: `${colors[idx % colors.length].replace("0.8", "0.25")}`, // 살짝 투명하게
                                    pointerEvents: 'none',
                                    top: pos.y * scaleY,
                                    left: pos.x * scaleX,
                                    width: pos.width * scaleX,
                                    height: pos.height * scaleY,
                                    boxSizing: "border-box",
                                  }}
                                />
                              );
                          })}
                      </Box>
                      {/* HTML 태그 */}
                      <HtmlInspector 
                        html={detailData.html}
                        onNodeClick={handleInspectorTableClick}
                        highlightNodes={highlightNodesMap}
                      />
                    </Box>
                    <Box 
                    sx={{
                      height: 350,
                      minHeight: 350,
                      mt: 2,
                      background: "#f7f7f7",
                      borderRadius: 2,
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2
                  }}>
                      <Box sx={{display: 'flex', justifyContent: 'flex-end', color: 'black', alignItems: 'center'}}>
                          <Typography sx={{ fontSize: 22, fontWeight: "bold" }}>
                              조건 행 추가
                          </Typography>
                          <CustomIconButton icon="add" backgroundColor='#f7f7f7' onClick={handleAddCondition}/>
                      </Box>
                      <ScrollTable
                              rows={conditionData}
                              columns={conditionColumns}
                              processRowUpdate={processRowUpdate}
                              maxHeight={320}
                      />
                    </Box>
                  </>
                )}
            </Box>

            <Alert
                open={openErrorAlert}
                text={alertMsg}
                type='error'
                onConfirm={() => {
                  setOpenErrorAlert(false);
                }}
            />
        </>
    )
})