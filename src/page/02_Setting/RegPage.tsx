import {useEffect, useState, useRef} from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Typography, InputAdornment, type SelectChangeEvent, Stepper, Step, StepLabel, 
    Breadcrumbs, Link,
} from '@mui/material'
import CustomButton from '../../component/CustomButton';
import CustomTextField from '../../component/CustomTextField';
import CustomSelect from '../../component/CustomSelect';
import Alert from "../../component/Alert"
import ScrollTable from '../../component/ScrollTable';


let idCounter = 0;
// dummy
const dummyData = Array.from({ length: 100 }, () => {
    idCounter += 1;
    return {
      id: idCounter,
      area: `영역 위치 ${idCounter}`,
      attr: `속성 ${idCounter}`,
      naming: `명칭 데이터 ${idCounter}`,
    };
  });

export default function RegPage() {
    const navigate = useNavigate();
    const loadingRef = useRef(false); // 로딩 상태 직접 관리

    const [openCloseAlert, setOpenCloseAlert] = useState(false)
    const [openRegAlert, setOpenRegAlert] = useState(false)
    const [openRegDoneAlert, setOpenRegDoneAlert] = useState(false)
    const [activeStep, setActiveStep] = useState(0);
    const [newData, setNewData] = useState({
        settingName: '',
        userAgent: '',
        rate: '',
        url: '',
        type: '',
        listArea: '',
        pagingArea: '',
        maxPage: 1,
        linkArea: '',
    })
    // const [nextIndex, setNextIndex] = useState(0);
    const [rows, setRows] = useState<{id: number, area: string, attr: string, naming: string}[]>([])
    const columns = [
        { field: 'area', headerName: '추출영역', flex: 2 },
        { field: 'attr', headerName: '추출속성', flex: 1 },
        { field: 'naming', headerName: '추출값 명칭 지정', flex: 1 },
    ]
    // const [loading, setLoading] = useState(false);

    const handleClose = () => {
        navigate('/setting')
    }

    // Stepper
    const steps = ['기본 정보', '영역지정', '검토'];

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    // 🔹 robots.txt 상태 관리
    // const [robotsUrl, setRobotsUrl] = useState('');
    // const [robotsTxt, setRobotsTxt] = useState('');
    // const [robotsLoading, setRobotsLoading] = useState(false);
    // const [robotsError, setRobotsError] = useState('');

    const userAgentList = [
        { value: 'Windows / Edge', name: 'Windows / Edge' },
        { value: 'Windows / Chrome', name: 'Windows / Chrome' },
        { value: 'Mac / Chrome', name: 'Mac / Chrome' },
    ];
    const typeList = [
        { value: '단일', name: '단일' },
        { value: '다중', name: '다중' },
    ];

    const handleInputChange = (key: keyof typeof newData, value: string) => {
        setNewData((prev) => {
            if(key === 'rate') {
                value = Number(value) < 0 ? '0' : value
            }
            
            const updated = { ...prev, [key]: value };

            return updated;
        });
    }

    const handleSelectChange = (key: keyof typeof newData) => 
    (event: SelectChangeEvent<string | number>) => {
      setNewData((prev) => ({ ...prev, [key]: event.target.value }));
    };

    const handleRegist = () => {
        // 설정 등록 API 호출
        setOpenRegDoneAlert(true)
    }

    /** ✅ robots.txt 확인 */
    const handleRobots = async () => {
        if (!newData.url) {
          alert('URL을 입력해주세요.');
          return;
        }

        // setRobotsTxt('');
        // setRobotsError('');
        // setRobotsLoading(true);

        // 여기에 백엔드 api를 입력해야됨. 프론트에서 하려니 CORS정책때문에 불가능
        
    }

    /** 테이블 무한스크롤 */
    useEffect(() => {
        setRows(dummyData.slice(0, 20));
    }, []);
    
    useEffect(() => {
      if (rows.length < dummyData.length) {
        loadingRef.current = false;
      } else {
        // 모든 데이터를 불러왔으니 더 이상 로딩 막음
        loadingRef.current = true;
      }
    }, [rows]);

    const loadMore = () => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        setRows((prevRows) => {
            const start = prevRows.length;
            const newRows = dummyData.slice(start, start + 20);
          if (newRows.length === 0) {
            loadingRef.current = false;
            console.log('No more rows to load');
            return prevRows;
          }

          return [...prevRows, ...newRows];
        });
    };
    

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
                alignItems: activeStep === 0 ? 'center' : 'flex-start',
                gap: 2,
                paddingTop: 2
            }}>
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
                        placeholder="데이터 수집간격(ms)"
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
                                        onClick={handleRobots} 
                                        radius={1}
                                    />
                                </InputAdornment>
                            }
                        />
                    </Box>
                    <Box sx={{
                        width: '816px',
                        height: 600,
                        // height: 'calc(97%-296px)',
                        bgcolor: '#f0f0f0'
                    }}>

                    </Box>
                </>)}

                {/* 나중에 step 1, 2 단계 추가할 자리 */}
                {activeStep === 1 && (
                <Box sx={{ mx: 2, p: 3 }}>
                    <Typography>영역 지정 단계 화면 구성 예정</Typography>
                </Box>
                )}
                {/* 검토 - 단일 */}
                {activeStep === 2 && newData.type === '단일' &&  (
                  <Box sx={{ color: 'black', paddingLeft: 2, display:'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                    <Box>
                        <Typography sx={{ fontSize: 30, fontWeight: 600 }}>기본 설정</Typography>
                        <Box sx={{ display: 'flex', width:'50%'}}>
                            <Box sx={{ borderRight: '2px solid', textAlign: 'end', bgcolor: 'rgba(245,166,35,0.49)', padding: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                                <Typography sx={{ fontSize: 20}}>데이터 수집명</Typography>
                                <Typography sx={{ fontSize: 20}}>User-agent</Typography>
                                <Typography sx={{ fontSize: 20}}>데이터 수집간격(s)</Typography>
                                <Typography sx={{ fontSize: 20}}>URL</Typography>
                            </Box>
                            <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                                <Typography sx={{ fontSize: 20}}>{newData.settingName}</Typography>
                                <Typography sx={{ fontSize: 20}}>{newData.userAgent}</Typography>
                                <Typography sx={{ fontSize: 20}}>{newData.rate}</Typography>
                                <Typography sx={{ fontSize: 20}}>{newData.url}</Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 30, fontWeight: 600 }}>추출 설정</Typography>
                        <Box sx={{ paddingRight: 4}}>
                            <ScrollTable
                                rows={rows}
                                columns={columns}
                                height={630}
                                onLoadMore={loadMore}
                            />
                        </Box>
                    </Box>
                  </Box>
                )}
                {/* 검토 - 다중 */}
                {activeStep === 2 && newData.type === '다중' &&  (
                  <Box sx={{ color: 'black', paddingLeft: 2, display:'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                    <Box>
                        <Typography sx={{ fontSize: 30, fontWeight: 600 }}>기본 설정</Typography>
                        <Box sx={{ display: 'flex', justifyContent:'space-around'}}>
                            <Box sx={{ display: 'flex', width:'50%'}}>
                                <Box sx={{ borderRight: '2px solid', textAlign: 'end', bgcolor: 'rgba(245,166,35,0.49)', padding: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                                    <Typography sx={{ fontSize: 20}}>데이터 수집명</Typography>
                                    <Typography sx={{ fontSize: 20}}>User-agent</Typography>
                                    <Typography sx={{ fontSize: 20}}>데이터 수집간격(s)</Typography>
                                    <Typography sx={{ fontSize: 20}}>URL</Typography>
                                </Box>
                                <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                                    <Typography sx={{ fontSize: 20}}>{newData.settingName}</Typography>
                                    <Typography sx={{ fontSize: 20}}>{newData.userAgent}</Typography>
                                    <Typography sx={{ fontSize: 20}}>{newData.rate}</Typography>
                                    <Typography sx={{ fontSize: 20}}>{newData.url}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', width:'50%'}}>
                                <Box sx={{ borderRight: '2px solid', textAlign: 'end', bgcolor: 'rgba(245,166,35,0.49)', padding: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                                    <Typography sx={{ fontSize: 20}}>게시물 영역</Typography>
                                    <Typography sx={{ fontSize: 20}}>페이지네이션 영역</Typography>
                                    <Typography sx={{ fontSize: 20}}>수집할 페이지 수</Typography>
                                    <Typography sx={{ fontSize: 20}}>상세 링크 영역</Typography>
                                </Box>
                                <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                                    <Typography sx={{ fontSize: 20}}>{newData.listArea}</Typography>
                                    <Typography sx={{ fontSize: 20}}>{newData.pagingArea}</Typography>
                                    <Typography sx={{ fontSize: 20}}>{newData.maxPage}</Typography>
                                    <Typography sx={{ fontSize: 20}}>{newData.linkArea}</Typography>
                                </Box>
                            </Box>

                        </Box>
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 30, fontWeight: 600 }}>추출 설정</Typography>
                        <Box sx={{ paddingRight: 4}}>
                            <ScrollTable
                                rows={rows}
                                columns={columns}
                                height={630}
                                onLoadMore={loadMore}
                            />
                        </Box>
                    </Box>
                  </Box>
                )}
            </Box>


            <Box sx={{display: 'flex', justifyContent: 'space-between', paddingLeft: 2.5, paddingRight: 2.5 }}>
                <CustomButton text="닫기" radius={2} backgroundColor='#BABABA' onClick={()=>setOpenCloseAlert(true)} />
                <Box sx={{display: 'flex', gap: 2}}>
                    {activeStep > 0 && <CustomButton text="◀ 이전" onClick={handleBack} radius={2} backgroundColor='#BABABA'/>}
                    {activeStep < steps.length - 1 ? (
                        <>
                            <CustomButton text="다음 ▶" onClick={handleNext} radius={2} />
                        </>
                    ) : (
                        <>
                            <CustomButton text="등록" onClick={()=>setOpenRegAlert(true)} radius={2} />
                            {/* <CustomButton text="닫기" onClick={handleCancle} /> */}
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
                handleRegist()
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
        </Box>
    )
}