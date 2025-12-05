import { useState, useMemo, useRef } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Typography, InputAdornment, type SelectChangeEvent, Stepper, Step, StepLabel, 
    Breadcrumbs, Link, Dialog
} from '@mui/material'
import CustomButton from '../../component/CustomButton';
import CustomTextField from '../../component/CustomTextField';
import CustomSelect from '../../component/CustomSelect';
import Alert from "../../component/Alert"
// import CommonTable from '../../component/CommonTable';
import ScrollTable from '../../component/ScrollTable';
import CustomIconButton from '../../component/CustomIconButton';
import { getColumns as getConditionColumns, type ConditionTableRows } from '../../Types/TableHeaders/SettingConditionHeader';
import { getColumns as getRobotsColumns } from '../../Types/TableHeaders/SettingRobotsHeader';
import { type RobotsTableRows} from '../../Types/TableHeaders/SettingRobotsHeader'
import { getRobots, getPreview, getHighlight, registSetting } from '../../API/02_SettingApi';
import HtmlInspector from "../../component/HTMLInspector"
import LoadingProgress from '../../component/LoadingProgress';

interface PreviewData {
  image?: string;   // base64 이미지 형태
  html: string;   // 페이지 전체 HTML 문자열
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

export default function RegPage() {
    const navigate = useNavigate();
    // 0. 공통
    const [loading, setLoading] = useState(false)
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['기본 정보', '영역지정', '검토'];
    // 1. 기본설정
    const [newData, setNewData] = useState({
        settingName: '',
        userAgent: '',
        rate: '0',
        url: '',
        type: '',
        listArea: '',
        pagingType: '',
        pagingArea: '',
        pagingNextbtn: '',
        maxPage: '1',
        linkArea: '',
    })
    const userAgentList = useMemo(() => [
        { value: 
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edg/120.0.0.0 Safari/537.36", 
          name: 'Windows / Edge' 
        },
        { value: 
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36", 
          name: 'Windows / Chrome' 
        },
        {
          value:
            "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/117.0",
          name: "Linux / Firefox",
        },
        {
          value:
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          name: "Linux / Chrome",
        },
        { value: 
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          name: 'Mac / Chrome' 
        },
    ], [])
    const typeList = useMemo(() => [
        { value: '단일', name: '단일' },
        { value: '다중', name: '다중' },
    ], [])
    const pagingTypeList = useMemo(() => [
        { value: 'Numeric', name: '페이지 형식' },
        { value: 'Next_Btn', name: '다음버튼 형식' },
        { value: 'AJAX', name: 'AJAX' },
    ], [])
    const [robotsRows, setRobotsRows] = useState<RobotsTableRows[]>([]) // Robots 테이블 데이터
    const [isAble, setIsAble] = useState(false)
    // 2. 영역지정
    const [mainPreview, setMainPreview] = useState<PreviewData>(
      {
        image: undefined,
        html: ''
      }
    )
    const [detailPreview, setDetailPreview] = useState<PreviewData>(
      {
        image: undefined,
        html: ''
      }
    )
    const [highlightNodesMap, setHighlightNodesMap] = useState<Record<string, Element | undefined>>({});
    const [mainRects, setMainRects] = useState<HighlightPos[]>([]); // Preview highlight
    const [detailRects, setDetailRects] = useState<HighlightPos[]>([]); // Preview highlight
    const [mainImageSize, setMainImageSize] = useState({
      naturalWidth: 0,
      naturalHeight: 0,
      displayWidth: 0,
      displayHeight: 0
    });

    const [detailImageSize, setDetailImageSize] = useState({
      naturalWidth: 0,
      naturalHeight: 0,
      displayWidth: 0,
      displayHeight: 0
    });
    const mainImgRef = useRef<HTMLImageElement>(null);
    const detailImgRef = useRef<HTMLImageElement>(null);
    const [selectTarget, setSelectTarget] = useState<any>(null); // 영역선택 포커스
    const [detailUrl, setDetailUrl] = useState<any>(null);
    const [condition, setCondition] = useState<ConditionTableRows[]>([]) // 추출조건 테이블 데이터
    const [isDetail, setIsDetail] = useState(false) // 상세영역 on/off 여부
    // 3. 검토
    // Alert
    const [openCloseAlert, setOpenCloseAlert] = useState(false)
    const [openRegAlert, setOpenRegAlert] = useState(false)
    const [openRegDoneAlert, setOpenRegDoneAlert] = useState(false)
    const [openRobotsAlert, setOpenRobotsAlert] = useState(false)
    const [openErrorAlert, setOpenErrorAlert] = useState(false)
    const [alertMsg, setAlertMsg] = useState("")
    // 검토 테이블 컬럼
    const reviewColumns = [
        { field: 'conditionsValue', headerName: '추출영역', flex: 2 },
        { field: 'attr', headerName: '추출속성', flex: 1 },
        { field: 'conditionsKey', headerName: '추출값 명칭 지정', flex: 1 },
    ]

    /** 공통 기능 */
    const handleClose = () => {
        navigate('/setting')
    }
    // Stepper
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };
    const handleValidate = () => {
        const errMsg = []
        if(newData.settingName === '') {
            errMsg.push('데이터 수집명을 입력해주세요.')     
        }
        if(Number(newData.rate) < 0) {
            errMsg.push('수집간격의 값이 잘못되었습니다.')
        }
        if(Number(newData.maxPage) <= 0) {
            errMsg.push('수집할 페이지 수 는 최소 1을 입력해야합니다.')
        }
        if(condition.length <= 0) {
            errMsg.push('추출조건은 최소 1개 입력해야합니다.')
        }
        const invalidRows = condition.filter(
          (row) => !row.conditionsValue || !row.attr || !row.conditionsKey
        );
        if(invalidRows.length > 0) {
          errMsg.push('추출조건 중 입력되지 않은 값이 존재합니다.')
        }

        if(newData.type === '다중') {
          if(newData.listArea === '') errMsg.push('게시물 영역을 입력해주세요.')
          if(newData.pagingArea === '') errMsg.push('페이지네이션 영역을 입력해주세요.')
          if(newData.pagingNextbtn === '') errMsg.push('페이지네이션 다음버튼 영역을 입력해주세요.')
          if(newData.linkArea === '') errMsg.push('페이지네이션 다음버튼 영역을 입력해주세요.')
        }

        if(errMsg.length !== 0) {
            setAlertMsg(errMsg.join('\n'));
            setOpenErrorAlert(true)
        } else {
            handleRegist()
        }
    }
    const handleRegist = async () => {
        const data = {
          ...newData,
          rate: Number(newData.rate),
          maxPage: Number(newData.maxPage),
          conditions: condition
        }
        try {
          await registSetting(data)
          setOpenRegDoneAlert(true)
        }
        catch(err) {
          console.error(err)
          setAlertMsg('세팅 등록을 실패하였습니다.')
          setOpenErrorAlert(true)
          return;
        }
    }

    /** 1. 기본정보 */
    const robotsColumns = getRobotsColumns()
    const handleInputChange = (key: keyof typeof newData, value: string) => {
        setNewData((prev) => {
            if (key === 'rate' || key === 'maxPage') {
              if (value === '' || Number(value) < 0) value = '0';
            }
            if (prev[key] === value) return prev; // 값이 같으면 상태 변경 안함
          
            if(key === 'url') {
              setIsAble(false)
            }
          
            return { ...prev, [key]: value };
        });
    }
    const handleSelectChange = (key: keyof typeof newData) => 
    (event: SelectChangeEvent<string | number>) => {
      setNewData((prev) => ({ ...prev, [key]: event.target.value }));

      if(key === "type") {
        setCondition([])
      }
      
      setIsAble(false)
    };

    const parseRobotsTxt = (robotsTxt: string) => {
      const lines = robotsTxt.split(/\r?\n/);
      const result: any[] = [];

      let currentUA: string | null = null;
      let allowList: string[] = [];
      let disallowList: string[] = [];

      const pushCurrent = () => {
        if (currentUA) {
          result.push({
            userAgent: currentUA,
            allow: allowList,
            disallow: disallowList,
          });
        }
      };

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue; // 빈 줄/주석 제외
      
        if (trimmed.toLowerCase().startsWith("user-agent")) {
          // UA 블록이 새로 시작하면 이전거 push
          if (currentUA !== null) pushCurrent();
        
          currentUA = trimmed.split(":")[1].trim();
          allowList = [];
          disallowList = [];
        } 
        else if (trimmed.toLowerCase().startsWith("allow")) {
          const path = trimmed.split(":")[1].trim();
          if (path) allowList.push(path);
        } 
        else if (trimmed.toLowerCase().startsWith("disallow")) {
          const path = trimmed.split(":")[1].trim();
          if (path) disallowList.push(path);
        }
      }

      // 마지막 UA push
      pushCurrent();

      return result;
    }

    /** ✅ robots.txt 확인 */
    const handleRobots = async () => {
        if (!newData.url) {
          setAlertMsg('URL을 입력해주세요.')
          setOpenErrorAlert(true)
          return;
        }
        try {
          const resRobots = await getRobots(newData.url, newData.userAgent)
          const resPreview = await getPreview(newData.url)
          setMainPreview(resPreview)
          const robotsTableData = parseRobotsTxt(resRobots.robotsTxt)
          
          setIsAble(resRobots.allow)
          setAlertMsg(resRobots.message)
          if(resRobots.allow === true) setOpenRobotsAlert(true)
          else setOpenErrorAlert(true)
          
          setRobotsRows(
            robotsTableData.map((item, index) => ({
              id: index + 1,
              userAgent: item.userAgent,
              disallow: item.disallow,
              allow: item.allow,
            }))
          );
          setLoading(false)
        }
        catch(err) {
          console.error(err)
          setAlertMsg('Robots 검출 실패')
          setOpenErrorAlert(true)
          setLoading(false)
        }
    }
    /** 2. 영역지정 */
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
    
    // 다중페이지 영역선택 클릭시
    const handleInspectorClick = async (element: Element) => {
      try {
        setLoading(true)
        if (selectTarget === null) {
          setLoading(false)
          return;
        }
      
        const selector = getCssSelector(element);
        if(selector === null) {
          setLoading(false)
          return;
        }

        const rect = await getHighlight(newData.url, selector)
        setMainRects(prev => {
          // 같은 selectTarget 영역이 있으면 교체, 없으면 추가
          const filtered = prev.filter(r => r.target !== selectTarget);
          return [
            ...filtered,
            {
              target: selectTarget,
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
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
        
          // ★ newData도 토글 ON/OFF에 따라 동기화
          setNewData(prev => ({
            ...prev,
            [`${selectTarget}Selector`]: isToggleOff ? "" : selector,
            [`${selectTarget}`]: isToggleOff ? "" : selector,
          }));
        
          // linkArea: 토글 ON → 링크 업데이트, 토글 OFF → URL 제거
          if (selectTarget === 'linkArea') {
            if (isToggleOff) {
              // 동일 노드를 다시 눌러서 해제할 경우
              setDetailUrl("");
            } else {
              // 태그 이름 확인
              const tag = element.tagName.toLowerCase();
              // href 속성이 존재하는지 확인
              const hrefLink = element.getAttribute("href");

              // <a> 또는 <area> + href가 있는 경우만 "진짜 링크"로 인정
              if ((tag === "a" || tag === "area") && hrefLink) {
                setDetailUrl(new URL(hrefLink, newData.url).href);
              } else {
                // 링크가 아니라고 판단 → 초기화
                setDetailUrl("");
              }
            }
          }
        
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
    // 추출조건 테이블 내 영역선택 버튼 클릭시
    const handleInspectorTableClick = async (element: Element) => {
      try {
        setLoading(true)
        if (selectTarget === null) {
          setLoading(false)
          return;
        }

        const selector = getCssSelector(element);
        if(selector === null) {
          setLoading(false)
          return;
        }

        if(newData.type === "단일") {
          const rect = await getHighlight(newData.url, selector) 
          setMainRects(prev => {
            // 같은 selectTarget 영역이 있으면 교체, 없으면 추가
            const filtered = prev.filter(r => r.target !== selectTarget);
            return [
              ...filtered,
              {
                target: selectTarget,
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
              }
            ];
          });
        } else {
          const rect = await getHighlight(detailUrl, selector) 
          setDetailRects(prev => {
            // 같은 selectTarget 영역이 있으면 교체, 없으면 추가
            const filtered = prev.filter(r => r.target !== selectTarget);
            return [
              ...filtered,
              {
                target: selectTarget,
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
              }
            ];
          });
        }

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

        // setCondition((prev) =>
        //   prev.map((row) =>
        //     row.id === selectTarget
        //       ? { ...row, conditionsValue: selector ?? "" } // 선택된 행에 css selector 업데이트
        //       : row
        //   )
        // );

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
        const resPreview = await getPreview(detailUrl) 
        setDetailPreview(resPreview)
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

      if(newData.type === "단일") {
        setMainRects(prev =>
          prev.filter(rect => String(rect.target) !== String(id))
        );
      } else { // 다중
        setDetailRects(prev =>
          prev.filter(rect => String(rect.target) !== String(id))
        );
      }
    }
    const conditionColumns = getConditionColumns({
        handleAreaSelect: handleAreaSelectTable,
        handleSelectChange: handleConditionSelectChange,
        handleCancel,
    })

    /** 3. 검토 */
    const selectedUserAgentName = useMemo(() => {
      return userAgentList.find(item => item.value === newData.userAgent)?.name || newData.userAgent;
    }, [newData.userAgent, userAgentList])
    const selectedPagingTypeName = useMemo(() => {
      return pagingTypeList.find(item => item.value === newData.pagingType)?.name || newData.pagingType;
    }, [newData.pagingType, pagingTypeList])

    return (
        <Box sx={{ height: '97%', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* BreadCrumbs */}
            <Box sx={{paddingLeft: 2, marginTop: 1}}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                    <Link
                        component={RouterLink}
                        to="/setting"
                        underline="hover"
                        color="inherit"
                        sx={{ fontWeight: 'bold', fontSize: 16 }}
                    >
                        데이터 수집 설정
                    </Link>
                    <Typography color="text.primary" sx={{ fontWeight: 'bold', fontSize: 16 }}>
                        설정 등록
                    </Typography>
                </Breadcrumbs>
            </Box>
            <Box sx={{ display:'flex', justifyContent: 'space-between'}}>
                <Typography sx={{fontSize: 60, fontWeight: 'bold', color: 'black', paddingLeft: 2, marginTop: -1}}>
                  데이터 수집 설정
                </Typography>
                <Box sx={{display: 'flex', flexDirection: 'row-reverse', alignItems: 'flex-end', paddingRight: 2}}>
                    <Stepper activeStep={activeStep}>
                        {steps.map((label, index) => (
                        <Step key={label} completed={activeStep > index}>
                            <StepLabel
                                sx={{
                                    '& .MuiStepIcon-root': {
                                      color: activeStep === index ? '#F5A623' : '#555555',
                                    },
                                    '& .MuiStepLabel-label': {
                                        color:
                                          activeStep === index
                                            ? '#F5A623' // 🔹 현재 단계 색상
                                            : '#555555', // ⚪ 비활성 단계 색상
                                        fontWeight: activeStep === index ? 'bold' : 'normal',
                                        borderBottom: activeStep === index ? '2px solid #F5A623' : 'none',
                                        fontSize: 18,
                                    },
                                }}
                                StepIconComponent={()=>null}
                            >
                                {(index+1) + '. '+ label}</StepLabel>
                        </Step>
                        ))}
                    </Stepper>
                </Box>
            </Box>

            <Box sx={{
                height: 'calc(97% - 96px)',
                border: '2px solid #abababff',
                marginLeft: '20px',
                marginRight: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                gap: 2,
                p:2,
                overflowY: 'auto'
            }}>
                {/* 1. 기본 정보 */}
                {activeStep === 0 && (
                <>
                    {/* 데이터 수집명 */}
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, color: 'black'}}>
                        <Typography sx={{width: '200px', textAlign:'left', fontSize: 25}}>데이터 수집명</Typography>
                        <CustomTextField 
                        height="50px"
                        value={newData.settingName}
                        inputWidth="600px"
                        disabled={false}
                        readOnly={false}
                        placeholder="데이터 수집명"
                        type="text"
                        onChange={(e) => handleInputChange('settingName', e.target.value)}
                        />
                    </Box>
                    {/* User-Agent */}
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, color: 'black'}}>
                        <Typography sx={{width: '200px', textAlign:'left', fontSize: 25}}>User-Agent</Typography>
                        <CustomSelect
                            inputWidth="600px"
                            height="50px"
                            value={newData.userAgent}
                            listItem={userAgentList}
                            onChange={handleSelectChange('userAgent')}
                        />
                    </Box>
                    {/* 수집간격 */}
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, color: 'black'}}>
                        <Typography sx={{width: '200px', textAlign:'left', fontSize: 25}}>데이터 수집간격(s)</Typography>
                        <CustomTextField 
                        height="50px"
                        value={newData.rate}
                        inputWidth="600px"
                        disabled={false}
                        readOnly={false}
                        placeholder="데이터 수집간격(s)"
                        type="number"
                        step={10}
                        onChange={(e) => handleInputChange('rate', e.target.value)}
                        />
                    </Box>
                    {/* URL */}
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, color: 'black'}}>
                        <Typography sx={{width: '200px', textAlign:'left', fontSize: 25}}>URL</Typography>
                        <CustomTextField 
                            height="50px"
                            value={newData.url}
                            inputWidth="600px"
                            disabled={false}
                            readOnly={false}
                            placeholder="URL"
                            type="text"
                            onChange={(e) => handleInputChange('url', e.target.value)}
                            startAdornment={
                                <InputAdornment position="start" sx={{marginLeft: '-14px'}}>
                                    <CustomSelect
                                        height="50px"
                                        inputWidth="80px"
                                        value={newData.type}
                                        listItem={typeList}
                                        onChange={handleSelectChange('type')}
                                    />
                                </InputAdornment>  
                            }
                            endAdornment={
                                <InputAdornment position="end" sx={{marginRight: '-14px'}}>
                                    <CustomButton width='40px' height='50px' 
                                        text={'검증'}
                                        // text={robotsLoading ? '확인중' : '검증'}
                                        onClick={()=>{
                                          setLoading(true)
                                          handleRobots()
                                        }} 
                                        radius={1}
                                    />
                                </InputAdornment>
                            }
                        />
                    </Box>
                    <br/>
                    <br/>
                    <Typography sx={{width: '200px', textAlign:'left', fontSize: 25, color: 'black'}}>Crawl Rules</Typography>
                    <Box sx={{
                        minWidth: 800,
                        height: 600,
                        // height: 'calc(97%-296px)',
                        bgcolor: '#f0f0f0',
                    }}>
                        <Box sx={{padding: 2}}>
                            <ScrollTable 
                              columns={robotsColumns} 
                              rows={robotsRows} 
                              maxHeight={560}
                            />
                        </Box>
                    </Box>
                </>)}

                {/* 2. 영역지정 (단일) */}
                {activeStep === 1 && newData.type === '단일' && (
                <Box 
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        height: "100%",
                    }}
                >
                    {/* 상단 */}
                    <Box
                      sx={{
                        flex: 7,
                        display: "flex",
                        gap: 2,
                        borderBottom: "2px solid #ccc",
                        pb: 2,
                        overflow: 'auto'
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
                        }}
                      >
                        {mainPreview.image ? (
                          <img
                            ref={mainImgRef}
                            src={`data:image/png;base64,${mainPreview.image}`}
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
                        html={mainPreview.html}
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
                                rows={condition}
                                columns={conditionColumns}
                                processRowUpdate={processRowUpdate}
                                maxHeight={320}
                        />
                    </Box>
                </Box>
                )}
                {/* 2. 영역지정 (다중) */}
                {activeStep === 1 && newData.type === '다중' && (
                    <Box 
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        <Box
                          sx={{
                            // flex: 7,
                            height: 550,
                            minHeight: 550,
                            display: "flex",
                            gap: 2,
                            pb: 2,
                            borderBottom: "2px solid #ccc",
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
                            }}
                          >
                            {mainPreview.image ? (
                              <img
                                ref={mainImgRef}
                                src={`data:image/png;base64,${mainPreview.image}`}
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
                            html={mainPreview.html}
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
                          }}
                        >
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
                                  onChange={(e) => handleInputChange('listArea', e.target.value)}
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
                                  onChange={(e) => handleInputChange('pagingArea', e.target.value)}
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
                                  onChange={(e) => handleInputChange('pagingNextbtn', e.target.value)}
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
                                  onChange={(e) => handleInputChange('linkArea', e.target.value)}
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
                                  }}
                              >
                                  {detailPreview.image ? (
                                    <img
                                      ref={detailImgRef}
                                      src={`data:image/png;base64,${detailPreview.image}`}
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
                                html={detailPreview.html}
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
                          }}
                        >
                            <Box sx={{display: 'flex', justifyContent: 'flex-end', color: 'black', alignItems: 'center'}}>
                                <Typography sx={{ fontSize: 22, fontWeight: "bold" }}>
                                    조건 행 추가
                                </Typography>
                                <CustomIconButton icon="add" backgroundColor='#f7f7f7' onClick={handleAddCondition}/>
                            </Box>
                            <ScrollTable
                                    rows={condition}
                                    columns={conditionColumns}
                                    processRowUpdate={processRowUpdate}
                                    maxHeight={320}
                            />
                        </Box>
                        </>
                        )}
                    </Box>
                )}
                {/* 3. 검토 (단일) */}
                {activeStep === 2 && newData.type === '단일' &&  (
                  <Box sx={{ color: 'black', paddingLeft: 2, display:'flex', flexDirection: 'column', gap: 10 }}>
                    <Box>
                        <Typography sx={{ fontSize: 30, fontWeight: 600 }}>기본 설정</Typography>
                        <Box sx={{ display: 'flex'}}>
                            <Box sx={{ borderRight: '2px solid', textAlign: 'end', bgcolor: 'rgba(245,166,35,0.49)', padding: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: '155px'}}>
                                <Typography sx={{ fontSize: 20, minHeight: '60px'}}>데이터 수집명</Typography>
                                <Typography sx={{ fontSize: 20, minHeight: '60px'}}>User-agent</Typography>
                                <Typography sx={{ fontSize: 20, minHeight: '60px'}}>데이터 수집간격(s)</Typography>
                                <Typography sx={{ fontSize: 20, minHeight: '60px'}}>URL</Typography>
                            </Box>
                            <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                                <Typography sx={{ fontSize: 20, minHeight: '60px'}}>{newData.settingName || "입력되지 않음"}</Typography>
                                <Typography sx={{ fontSize: 20, minHeight: '60px'}}>{selectedUserAgentName}</Typography>
                                <Typography sx={{ fontSize: 20, minHeight: '60px'}}>{newData.rate}</Typography>
                                <Typography sx={{ fontSize: 20, minHeight: '60px'}}>{newData.url}</Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 30, fontWeight: 600 }}>추출 설정</Typography>
                        <Box sx={{ paddingRight: 4}}>
                            <ScrollTable
                                rows={condition}
                                columns={reviewColumns}
                                maxHeight={320}
                            />
                        </Box>
                    </Box>
                  </Box>
                )}
                {/* 3. 검토 (다중) */}
                {activeStep === 2 && newData.type === '다중' &&  (
                  <Box sx={{ color: 'black', paddingLeft: 2, display:'flex', flexDirection: 'column', gap: 10 }}>
                    <Box>
                        <Typography sx={{ fontSize: 30, fontWeight: 600 }}>기본 설정</Typography>
                        <Box sx={{ display: 'flex', justifyContent:'space-around'}}>
                                <Box sx={{ borderRight: '2px solid', textAlign: 'end', bgcolor: 'rgba(245,166,35,0.49)', padding: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: '155px'}}>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>데이터 수집명</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>User-agent</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>데이터 수집간격(s)</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>URL</Typography>
                                </Box>
                                <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>{newData.settingName || "입력되지 않음"}</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>{selectedUserAgentName}</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>{newData.rate}</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>{newData.url}</Typography>
                                </Box>
                            <Box sx={{ display: 'flex'}}>
                                <Box sx={{ borderRight: '2px solid', textAlign: 'end', bgcolor: 'rgba(245,166,35,0.49)', padding: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: '155px'}}>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>게시물 영역</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>페이지네이션 타입</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>페이지네이션 영역</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>다음버튼 영역</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>수집할 페이지 수</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>상세 링크 영역</Typography>
                                </Box>
                                <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>{newData.listArea || "입력되지 않음"}</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>{selectedPagingTypeName}</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>{newData.pagingArea || "입력되지 않음"}</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>{newData.pagingNextbtn || "입력되지 않음"}</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>{newData.maxPage}</Typography>
                                    <Typography sx={{ fontSize: 20, minHeight: '60px'}}>{newData.linkArea || "입력되지 않음"}</Typography>
                                </Box>
                            </Box>

                        </Box>
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 30, fontWeight: 600 }}>추출 설정</Typography>
                        <Box sx={{ paddingRight: 4}}>
                            <ScrollTable
                                rows={condition}
                                columns={reviewColumns}
                                maxHeight={320}
                            />
                        </Box>
                    </Box>
                  </Box>
                )}
            </Box>


            <Box sx={{display: 'flex', justifyContent: 'space-between', paddingLeft: 2.5, paddingRight: 2.5, marginTop: 2 }}>
                <CustomButton text="닫기" radius={2} backgroundColor='#BABABA' onClick={()=>setOpenCloseAlert(true)} />
                <Box sx={{display: 'flex', gap: 2}}>
                    {activeStep > 0 && <CustomButton text="◀ 이전" onClick={handleBack} radius={2} backgroundColor='#BABABA'/>}
                    {activeStep < steps.length - 1 ? (
                        <>
                            <CustomButton text="다음 ▶" onClick={handleNext} radius={2} 
                              disabled={
                                activeStep === 0 ? 
                                  ( isAble === false ? true : false)
                                  : false
                              }
                            />
                        </>
                    ) : (
                        <>
                            <CustomButton text="등록" onClick={()=>setOpenRegAlert(true)} radius={2} />
                        </>
                    )}
                </Box>
            </Box>

            <Alert
              open={openCloseAlert}
              text="현재 입력한 정보가 사라집니다. 정말로 닫으시겠습니까?"
              onConfirm={() => {
                setOpenCloseAlert(false);
                handleClose()
              }}
              onCancel={() => {
                setOpenCloseAlert(false);
              }}
            />
            <Alert
              open={openRegAlert}
              text="등록 하시겠습니까?"
              type="question"
              onConfirm={() => {
                setOpenRegAlert(false);
                handleValidate()
              }}
              onCancel={() => {
                setOpenRegAlert(false);
              }}
            />
            <Alert
                open={openRegDoneAlert}
                text="등록 되었습니다."
                type='success'
                onConfirm={() => {
                  setOpenRegDoneAlert(false);
                  navigate('/setting')
                }}
            />
            <Alert
                open={openRobotsAlert}
                text={alertMsg}
                type='success'
                onConfirm={() => {
                  setOpenRobotsAlert(false);
                }}
            />
            <Alert
                open={openErrorAlert}
                text={alertMsg}
                type='error'
                onConfirm={() => {
                  setOpenErrorAlert(false);
                }}
            />
            <Dialog 
                open={loading}
                slotProps={{
                  paper: {
                    sx: {
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100vh',
                      width: '100vw',
                    }
                  },
                  backdrop: {
                    sx: {
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      backdropFilter: 'blur(2px)', 
                    }
                  }
                }}
            >
                <LoadingProgress />
            </Dialog>
        </Box>
    )
}