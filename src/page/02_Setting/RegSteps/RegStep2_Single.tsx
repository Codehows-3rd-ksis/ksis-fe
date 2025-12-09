import React, { useState, useRef } from 'react'
import { Box, Typography } from '@mui/material'
import CustomIconButton from '../../../component/CustomIconButton';
import ScrollTable from '../../../component/ScrollTable';
import HtmlInspector from '../../../component/HTMLInspector';
import Alert from '../../../component/Alert';
import { type ConditionTableRows, getColumns } from '../../../Types/TableHeaders/SettingConditionHeader';

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

interface Props {
    previewData: PreviewData;
    conditionData: ConditionTableRows[]
    setCondition: (value: ConditionTableRows[] | ((prev: ConditionTableRows[]) => ConditionTableRows[])) => void;
    setLoading: (v: boolean) => void;
}

export default React.memo(function RegStep2_Single({
    previewData,
    conditionData,
    setCondition,
    setLoading
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

    const handleInspectorTableClick = (element: Element) => {
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
            delete newMap[selectTarget]; // 하이라이트 해제
          } else {
            newMap[selectTarget] = element; // 새 노드 저장
          }
        
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
        
          return newMap;
        });

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
                <Box
                    sx={{
                        flex: 7,
                        display: "flex",
                        gap: 2,
                        borderBottom: "2px solid #ccc",
                        pb: 2,
                        overflow: 'auto'
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
                      onNodeClick={handleInspectorTableClick}
                      highlightNodes={highlightNodesMap}
                    />
                </Box>
                {/* 하단 */}
                <Box 
                  sx={{
                    flex: 3,
                    mt: 2,
                    background: "#f7f7f7",
                    borderRadius: 2,
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2
                  }}
                >
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