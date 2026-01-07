import React, { useState, useRef, useCallback } from 'react'
import { Box, Typography, Card } from '@mui/material'
import CustomIconButton from '../../../component/CustomIconButton';
import CustomButton from '../../../component/CustomButton';
import ScrollTable from '../../../component/ScrollTable';
import HtmlInspector from '../../../component/HTMLInspector';
import Alert from '../../../component/Alert';
import { type ConditionTableRows, getColumns } from '../../../Types/TableHeaders/SettingConditionHeader';
import { SearchBar } from '../SearchBar';

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
type RunSearchParams = {
  keyword: string;
  domRefMap: Map<Element, HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setResults: React.Dispatch<React.SetStateAction<Element[]>>;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
};
const colors = [
  "rgba(255, 235, 59, 0.8)",   // 노란색
  "rgba(100, 181, 246, 0.8)",  // 파란색
  "rgba(129, 199, 132, 0.8)",  // 초록색
  "rgba(244, 143, 177, 0.8)",  // 핑크색
  "rgba(255, 183, 77, 0.8)",   // 오렌지
  "rgba(186, 104, 200, 0.8)",  // 보라색
  "rgba(121, 134, 203, 0.8)",  // 인디고
  "rgba(77, 182, 172, 0.8)",   // 청록
];

type SelectMode = "search" | "preview" | "confirm" | null;

interface Props {
    previewData: PreviewData;
    conditionData: ConditionTableRows[]
    setCondition: (value: ConditionTableRows[] | ((prev: ConditionTableRows[]) => ConditionTableRows[])) => void;
    setLoading: (v: boolean) => void;
}

export default React.memo(function Step2_Single({
    previewData,
    conditionData,
    setCondition,
    setLoading
}: Props) {
    const nextIdRef = useRef(0);
    const [highlightNodesMap, setHighlightNodesMap] = useState<Record<string, Element | undefined>>({});
    const [mainRects, setMainRects] = useState<HighlightPos[]>([]);
    const [mainImageSize, setMainImageSize] = useState({
      naturalWidth: 0,
      naturalHeight: 0,
      displayWidth: 0,
      displayHeight: 0
    });
    const mainImgRef = useRef<HTMLImageElement>(null);
    const [selectTarget, setSelectTarget] = useState<any>("search");
    const [selectMode, setSelectMode] = useState<SelectMode>("search");
    const [openErrorAlert, setOpenErrorAlert] = useState(false)
    const [alertMsg, setAlertMsg] = useState('')

    const [searchResults, setSearchResults] = useState<Element[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchHighlightSet, setSearchHighlightSet] = useState<Set<Element>>(new Set());
    const inspectorContainerRef = useRef<HTMLDivElement | null>(null);
    const domRefs = useRef<Map<Element, HTMLDivElement>>(new Map());

    const runSearchCommon = ({
      keyword,
      domRefMap,
      containerRef,
      setResults,
      setIndex,
    }: RunSearchParams) => {
      const normalized = keyword.trim().toLowerCase();
      if (!normalized) return;
    
      const results: Element[] = [];
      const seen = new Set<string>();
    
      for (const el of domRefMap.keys()) {
        const tag = el.tagName.toLowerCase();
        const id = el.getAttribute("id")?.toLowerCase() || "";
        const cls = el.getAttribute("class")?.toLowerCase() || "";
      
        if (
          tag.includes(normalized) ||
          id.includes(normalized) ||
          cls.includes(normalized)
        ) {
          const key = `${tag}#${id}.${cls}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push(el);
          }
        }
      }

      setResults(results);
      setIndex(0);
      setSearchHighlightSet(new Set(results));
    
      if (results.length > 0) {
        scrollToElement(results[0], domRefMap, containerRef);
      } else {
        setAlertMsg('검색결과가 존재하지 않습니다.')
        setOpenErrorAlert(true)
      }
    };

    const scrollToElement = (
      el: Element,
      domRefMap: Map<Element, HTMLDivElement>,
      containerRef: React.RefObject<HTMLDivElement | null>
    ) => {
      const wrapper = domRefMap.get(el);
      const container = containerRef.current;
      if (!wrapper || !container) return;
    
      const containerRect = container.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
    
      const top =
        container.scrollTop +
        (wrapperRect.top - containerRect.top) -
        container.clientHeight / 2 
        // +
        // wrapperRect.height / 2;
    
      container.scrollTo({ top, behavior: "smooth" });
    };
    
    const runMainSearch = useCallback(
      (keyword: string) => {
        runSearchCommon({
          keyword,
          domRefMap: domRefs.current,
          containerRef: inspectorContainerRef,
          setResults: setSearchResults,
          setIndex: setCurrentIndex,
        });
      },
      []
    );

    const findNext = () => {
      if (searchResults.length === 0) return;
      const nextIndex = (currentIndex + 1) % searchResults.length;
      setCurrentIndex(nextIndex);
      scrollToElement(
        searchResults[nextIndex],
        domRefs.current,
        inspectorContainerRef
      );
    };
    const findPrev = () => {
      if (searchResults.length === 0) return;
      const prevIndex = (currentIndex - 1 + searchResults.length) % searchResults.length;
      setCurrentIndex(prevIndex);
      scrollToElement(
        searchResults[prevIndex],
        domRefs.current,
        inspectorContainerRef
      );
    };

    const handleAddCondition = () => {
      const newId = nextIdRef.current++;
      setCondition(prev => [
        ...prev,
        {
          id: newId,
          conditionsValue: "",
          attr: "",
          conditionsKey: ""
        }
      ]);
      // setSelectTarget("search")
      // setSelectMode("search");
    };

    const handleAreaSelectTable = (rowId: number) => {
      clearPreviewByTarget(selectTarget);
      setSelectTarget(rowId);
      setSelectMode("preview");
    };

    const getColorIndexByTarget = (target: string | number) => {
      // 조건 테이블 rowId
      if (!isNaN(Number(target))) {
        return Number(target) % colors.length;
      }
      
      return 0;
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

    const clearPreviewByTarget = (target: any) => {
      if (!target || target === "search") return;

      // main preview 제거
      setMainRects(prev =>
        prev.filter(rect => rect.target !== target)
      );
    
      // inspector highlight 제거
      setHighlightNodesMap(prev => {
        const newMap = { ...prev };
        delete newMap[target];
        return newMap;
      });
    };

    const handleInspectorTableClick = (element: Element) => {
      try {
        const selector = getCssSelector(element);
        if(!selector) return;
        
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
            delete newMap[selectTarget]; // 하이라이트 해제
          } else {
            newMap[selectTarget] = element; // 새 노드 저장
          }
        
          return newMap;
        });
        
        // const isToggleOff = highlightNodesMap[selectTarget]?.isSameNode(element);

        // setCondition((prev) =>
        //   prev.map((row) =>
        //     row.id === selectTarget
        //       ? {
        //           ...row,
        //           conditionsValue: isToggleOff ? "" : (selector ?? ""),
        //         }
        //       : row
        //   )
        // );

        // setSelectTarget(null)
        setLoading(false)
      }
      catch(err) {
        console.error(err)
        setLoading(false)
        setAlertMsg("하이라이트 관련 오류가 발생하였습니다.")
        setOpenErrorAlert(true)
      }
      
    };

    const confirmSelection = () => {
      if (selectTarget === null) return;
      
      const element = highlightNodesMap[selectTarget];
      if (!element) return;
      
      const selector = getCssSelector(element);
      if (!selector) return;

      // 조건 테이블
      setCondition(prev =>
        prev.map(row =>
          row.id === selectTarget
            ? { ...row, conditionsValue: selector }
            : row
        )
      );
      
    
      // ✅ 모드 종료
      setSelectTarget("search");
      setSelectMode("search");
    }

    const getConditionIndex = (targetId: number) => {
      return conditionData.findIndex(row => row.id === targetId);
    };

    const transAreaText = (target: string | number) => {
      const idx = getConditionIndex(Number(target));
      return `조건 ${idx + 1} 영역`;
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
   
        setMainRects(prev =>
          prev.filter(rect => String(rect.target) !== String(id))
        );
    }
    const conditionColumns = getColumns({
        handleAreaSelect: handleAreaSelectTable,
        handleSelectChange: handleConditionSelectChange,
        handleCancel,
        selectTarget,
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
                {/* 상단 */}
                <Card
                    sx={{
                        display: "flex",
                        gap: 2,
                        p: 2,
                        minHeight: 550,
                        minWidth: 1200,   // ⭐ 핵심: 최소 레이아웃 폭
                }}>
                    {/* 스크린샷 */}
                    <Box
                        sx={{
                          flex: "0 0 50%",   // ⭐ 비율 고정
                          minWidth: 500,
                          position: "relative",
                          overflow: "auto",
                          background: "#eaeaea",
                          border: '1px solid black',
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
                                border: pos.target === "search" ? `2px solid rgba(189, 189, 189, 0.8)` : `2px solid ${colors[getColorIndexByTarget(pos.target)]}`,
                                backgroundColor: pos.target === "search" ? `rgba(189, 189, 189, 0.25)` : `${colors[getColorIndexByTarget(pos.target)].replace("0.8", "0.25")}`, // 살짝 투명하게
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
                    <Box sx={{
                      // flex: "0 0 50%",
                      minWidth: 500,
                      display: "flex",
                      flexDirection: "column",
                      border: '1px solid black',
                    }}>
                      <Box sx={{background: 'linear-gradient(180deg, #EDECEC 0%, #DBD9DB 100%)',}}>

                      </Box>
                      <Box 
                        sx={{ 
                          display:'flex',
                          justifyContent: 'space-between', 
                          gap:2, 
                          height: 60,
                          pl: 2,
                          alignItems: 'center',
                      }}>
                        {/* 태그 페이지네이션 */}
                        <Box sx={{display: 'flex', gap: 1, alignItems: 'center',}}>
                          <SearchBar
                            placeholder="태그 검색"
                            onSearch={runMainSearch}
                          />
                          <CustomButton 
                            text="<" 
                            width="40px" 
                            border="1px solid #757575"
                            backgroundColor={currentIndex+1 <= 1? "#BABABA" : ""} 
                            hoverStyle={currentIndex+1 <= 1 ?{}:{
                                backgroundColor: "#ba7d1bff",
                                border: "2px solid #373737ff",
                            }} 
                            radius={1} 
                            onClick={findPrev} 
                            disabled={currentIndex+1 <= 1} 
                          />
                          <CustomButton 
                            text=">" 
                            width="40px" 
                            border="1px solid #757575"
                            backgroundColor={(currentIndex+1 === searchResults.length || searchResults.length === 0)? "#BABABA" : "" } 
                            hoverStyle={(currentIndex+1 === searchResults.length || searchResults.length === 0)? {}:{
                                backgroundColor: "#ba7d1bff",
                                border: "2px solid #373737ff",
                            }} 
                            radius={1} 
                            onClick={findNext} 
                            disabled={currentIndex+1 === searchResults.length || searchResults.length === 0} 
                          />
                          {searchResults.length > 0 ?
                            <Typography sx={{color: 'black'}}>{currentIndex+1} / {searchResults.length}</Typography>
                            : <></>
                          }
                        </Box>
                        {/* 영역 관련 버튼 */}
                        <Box sx={{display: 'flex', gap:1, alignItems: 'center', pr: 2}}>
                          <CustomButton
                            text="영역탐색"
                            radius={1}
                            height="40px"
                            onClick={() => {
                              clearPreviewByTarget(selectTarget);
                              setSelectMode("search");
                              setSelectTarget("search");
                            }}
                            backgroundColor={selectMode === "search" ? "#1b5bbac4" : ""}
                            color={selectMode === "search" ? "white" : "black"}
                            hoverStyle={{
                              backgroundColor: selectMode === "search" ? "#1b5bbaff" : "#ba7d1bff",
                            }}
                          />
                          <CustomButton 
                            text="영역확정"
                            radius={1}
                            height="40px"
                            disabled={selectTarget === "search"}
                            onClick={()=>confirmSelection()}
                            hoverStyle={{
                              backgroundColor: "#ba7d1bff",
                            }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ pl: 2, pb: 1 }}>
                        {selectMode === "search" && (
                          <Typography sx={{ color: "#1b5bbaff", fontWeight: "bold" }}>
                            🔍 자유 탐색 중입니다 (클릭하면 미리보기만 표시됩니다)
                          </Typography>
                        )}
                        
                        {selectMode === "preview" && selectTarget !== null && (
                          <Typography sx={{ color: "#ba7d1bff", fontWeight: "bold" }}>
                            ◎ 선택 대상: {String(transAreaText(selectTarget))} 미리보기 중
                          </Typography>
                        )}
                      </Box>
                      <Box 
                        sx={{
                          overflow: 'auto',
                          height: 530,
                        }}
                        ref={inspectorContainerRef}
                        data-scroll-container
                      >
                        <HtmlInspector 
                          html={previewData.html}
                          onNodeClick={handleInspectorTableClick}
                          highlightNodes={highlightNodesMap}
                          searchHighlightSet={searchHighlightSet}
                          currentSearchEl={searchResults[currentIndex] ?? null}
                          registerDomRef={(el, div) => {
                            domRefs.current.set(el, div);
                          }}
                        />
                      </Box>
                    </Box>
                </Card>
                {/* 하단 */}
                <Card 
                  sx={{
                      height: 350,
                      minHeight: 350,
                      mt: 2,
                      background: "#f7f7f7ff",
                      borderRadius: 2,
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      color: 'black'
                  }}
                >
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', color: 'black', alignItems: 'center'}}>
                        <Typography sx={{ fontSize: 22, fontWeight: "bold" }}>
                            조건 행 추가
                        </Typography>
                        <CustomIconButton icon="add" backgroundColor='#f7f7f7ff' onClick={handleAddCondition}/>
                    </Box>
                    <ScrollTable
                        rows={conditionData}
                        columns={conditionColumns}
                        processRowUpdate={processRowUpdate}
                        maxHeight={300}
                    />
                </Card>
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