import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Typography, Stepper, Step, StepLabel, 
    Breadcrumbs, Link, Dialog
} from '@mui/material'
import CustomButton from '../../component/CustomButton';
import Alert from "../../component/Alert"
import { type ConditionTableRows } from '../../Types/TableHeaders/SettingConditionHeader';
import { type RobotsTableRows} from '../../Types/TableHeaders/SettingRobotsHeader'
import { getPreview2, registSetting } from '../../API/02_SettingApi';
import LoadingProgress from '../../component/LoadingProgress';
import Step1 from './Steps/Step1';
import Step2_Single from './Steps/Step2_Single';
import Step2_Multi from './Steps/Step2_Multi';
import Step3_Single from './Steps/Step3_Single';
import Step3_Multi from './Steps/Step3_Multi';

interface PreviewData {
  image?: string;   // base64 이미지 형태
  html: string;   // 페이지 전체 HTML 문자열
  domRects: Array<{ selector: string; x:number; y:number; width:number; height:number }>;
}

export interface NewData {
  settingName: string;
  userAgent: string;
  rate: string;
  url: string;
  type: string;
  listArea?: string;
  pagingType?: string;
  pagingArea?: string;
  pagingNextbtn?: string;
  maxPage?: string;
  linkArea?: string;
}

export default function RegPage() {
    // 0. 공통
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['기본 정보', '영역지정', '검토'];
    const [isAble, setIsAble] = useState(false)
    // 1. 기본설정
    const [newData, setNewData] = useState<NewData>({
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
    const [robotsRows, setRobotsRows] = useState<RobotsTableRows[]>([]) // Robots 테이블 데이터
    // 2. 영역지정
    const [previewLoaded, setPreviewLoaded] = useState(false);
    const [mainPreview, setMainPreview] = useState<PreviewData>(
      {
        image: undefined,
        html: '',
        domRects: []
      }
    )
    const [detailPreview, setDetailPreview] = useState<PreviewData>(
      {
        image: undefined,
        html: '',
        domRects: []
      }
    )
    const [detailUrl, setDetailUrl] = useState('');
    const [condition, setCondition] = useState<ConditionTableRows[]>([]) // 추출조건 테이블 데이터
    const [isDetail, setIsDetail] = useState(false) // 상세영역 on/off 여부
    
    // Alert
    const [openCloseAlert, setOpenCloseAlert] = useState(false)
    const [openRegAlert, setOpenRegAlert] = useState(false)
    const [openRegDoneAlert, setOpenRegDoneAlert] = useState(false)
    const [openErrorAlert, setOpenErrorAlert] = useState(false)
    const [alertMsg, setAlertMsg] = useState("")

    /** 공통 기능 */
    const handleClose = () => {
        navigate('/setting')
    }
    // Stepper
    const handleNext = async () => {
        // Step1 → Step2 진입할 때 최초 1회만 API 호출
        if (activeStep === 0 && previewLoaded === false) {
            setLoading(true);
          try {
              const res = await getPreview2(newData.url);
              setMainPreview(res);
              setDetailPreview(
                {
                  image: undefined,
                  html: '',
                  domRects: []
                }
              )
              setDetailUrl('')
              setPreviewLoaded(true);
          } catch(err) {
              console.error(err);
          }
          setLoading(false);
        }
        setActiveStep(prev => prev + 1);
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
                  <Step1 
                    newData={newData}
                    setNewData={setNewData}
                    setIsAble={setIsAble}
                    setCondition={setCondition}
                    setLoading={setLoading}
                    setPreviewLoaded={setPreviewLoaded}
                    robotsRows={robotsRows}
                    setRobotsRows={setRobotsRows}
                    setDetailUrl={setDetailUrl}
                  />
                </>
                )}

                {/* 2. 영역지정 (단일) */}
                {activeStep === 1 && newData.type === '단일' && (
                <>
                  <Step2_Single 
                    previewData={mainPreview}
                    conditionData={condition}
                    setCondition={setCondition}
                    setLoading={setLoading}
                  />
                </>
                )}
                {/* 2. 영역지정 (다중) */}
                {activeStep === 1 && newData.type === '다중' && (
                <>
                  <Step2_Multi 
                    previewData={mainPreview}
                    detailData={detailPreview}
                    newData={newData}
                    conditionData={condition}
                    setNewData={setNewData}
                    setCondition={setCondition}
                    setDetailPreview={setDetailPreview}
                    setLoading={setLoading}
                    isDetail={isDetail}
                    setIsDetail={setIsDetail}
                    detailUrl={detailUrl}
                    setDetailUrl={setDetailUrl}
                  />
                </>
                )}
                {/* 3. 검토 (단일) */}
                {activeStep === 2 && newData.type === '단일' &&  (
                <>
                  <Step3_Single 
                    newData={newData}
                    condition={condition}
                  />
                </>
                )}
                {/* 3. 검토 (다중) */}
                {activeStep === 2 && newData.type === '다중' &&  (
                <>
                  <Step3_Multi 
                    newData={newData}
                    condition={condition}
                  />
                </>
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