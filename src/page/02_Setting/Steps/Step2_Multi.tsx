import React, { useState, useRef, useCallback } from 'react'
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
import { getDetailPreview } from '../../../API/02_SettingApi';
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

    const [searchResults, setSearchResults] = useState<Element[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const inspectorContainerRef = useRef<HTMLDivElement | null>(null);
    const domRefs = useRef<Map<Element, HTMLDivElement>>(new Map());
    
    const [searchDetailResults, setSearchDetailResults] = useState<Element[]>([]);
    const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
    const detailInspectorContainerRef = useRef<HTMLDivElement>(null);
    const detailDomRefs = useRef<Map<Element, HTMLDivElement>>(new Map());

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
    
      if (results.length > 0) {
        scrollToElement(results[0], domRefMap, containerRef);
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
    const runDetailSearch = useCallback(
      (keyword: string) => {
        runSearchCommon({
          keyword,
          domRefMap: detailDomRefs.current,
          containerRef: detailInspectorContainerRef,
          setResults: setSearchDetailResults,
          setIndex: setCurrentDetailIndex,
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
    const findNextDetail = () => {
      if (searchDetailResults.length === 0) return;
      const nextIndex = (currentDetailIndex + 1) % searchDetailResults.length;
      setCurrentDetailIndex(nextIndex);
      scrollToElement(
        searchDetailResults[nextIndex],
        detailDomRefs.current,
        detailInspectorContainerRef
      );
    };
    const findPrevDetail = () => {
      if (searchDetailResults.length === 0) return;
      const prevIndex = (currentDetailIndex - 1 + searchDetailResults.length) % searchDetailResults.length;
      setCurrentDetailIndex(prevIndex);
      scrollToElement(
        searchDetailResults[prevIndex],
        detailDomRefs.current,
        detailInspectorContainerRef
      );
    };

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

    const handleDetailLoad = async () => {
        try {
          // const resPreview2 = await getPreview2(detailUrl) 
          // setDetailPreview(resPreview2)
          if(!newData.listArea || !newData.linkArea) {
            return;
          }
          const resDetailPreview = await getDetailPreview(newData.url, newData.listArea, newData.linkArea)
          setDetailPreview(resDetailPreview)
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
                        // maxHeight: 640,
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
                    <Box sx={{
                      width: '50%'
                    }}>
                      <Box 
                        sx={{ 
                          display:'flex', 
                          gap:2, 
                          height: 60,
                          alignItems: 'center'
                      }}>
                        <SearchBar
                          placeholder="태그 검색"
                          onSearch={runMainSearch}
                        />
                        <CustomButton text="<" radius={1} onClick={findPrev} disabled={currentIndex+1 <= 1} />
                        <CustomButton text=">" radius={1} onClick={findNext} disabled={currentIndex+1 === searchResults.length || searchResults.length === 0} />
                        {searchResults.length > 0 ?
                          <Typography sx={{color: 'black'}}>{currentIndex+1} / {searchResults.length}</Typography>
                          : <></>
                        }
                      </Box>
                      <Box 
                        sx={{
                          overflow: 'auto',
                          height: 490,
                        }}
                        ref={inspectorContainerRef}
                        data-scroll-container
                      >
                        <HtmlInspector 
                          html={previewData.html}
                          onNodeClick={handleInspectorClick}
                          highlightNodes={highlightNodesMap}
                          registerDomRef={(el, div) => {
                            domRefs.current.set(el, div);
                          }}
                        />
                      </Box>
                    </Box>

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
                                    disabled={newData.linkArea? false: true}
                                    onClick={()=>{
                                      setLoading(true)
                                      handleDetailLoad()
                                    }}
                                    backgroundColor={isDetail? '#BABABA' : ''}
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
                            // maxHeight: 640,
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
                      <Box sx={{
                        width: '50%'
                      }}>
                        <Box 
                          sx={{ 
                            display:'flex', 
                            gap:2, 
                            height: 60,
                            alignItems: 'center'
                        }}>
                          <SearchBar
                            placeholder="태그 검색"
                            onSearch={runDetailSearch}
                          />
                          <CustomButton text="<" radius={1} onClick={findPrevDetail} disabled={currentDetailIndex+1 <= 1} />
                          <CustomButton text=">" radius={1} onClick={findNextDetail} disabled={currentDetailIndex+1 === searchDetailResults.length || searchDetailResults.length === 0} />
                          {searchDetailResults.length > 0 ?
                            <Typography sx={{color: 'black'}}>{currentDetailIndex+1} / {searchDetailResults.length}</Typography>
                            : <></>
                          }
                        </Box>
                        <Box 
                          sx={{
                            overflow: 'auto',
                            height: 490,
                          }}
                          ref={detailInspectorContainerRef}
                          data-scroll-container
                        >
                          <HtmlInspector 
                            html={detailData.html}
                            onNodeClick={handleInspectorTableClick}
                            highlightNodes={highlightNodesMap}
                            registerDomRef={(el, div) => {
                              detailDomRefs.current.set(el, div);
                            }}
                          />
                        </Box>
                      </Box>
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