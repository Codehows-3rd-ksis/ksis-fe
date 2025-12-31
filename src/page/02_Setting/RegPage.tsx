import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Breadcrumbs,
  Link,
} from "@mui/material";
import CustomButton from "../../component/CustomButton";
import Alert from "../../component/Alert";
import { type ConditionTableRows } from "../../Types/TableHeaders/SettingConditionHeader";
import { type RobotsTableRows } from "../../Types/TableHeaders/SettingRobotsHeader";
import { getPreview2, registSetting } from "../../API/02_SettingApi";
import LoadingProgress from "../../component/LoadingProgress";
import Step1 from "./Steps/Step1";
import Step2_Single from "./Steps/Step2_Single";
import Step2_Multi from "./Steps/Step2_Multi";
import Step3_Single from "./Steps/Step3_Single";
import Step3_Multi from "./Steps/Step3_Multi";

interface PreviewData {
  image?: string; // base64 이미지 형태
  html: string; // 페이지 전체 HTML 문자열
  domRects: Array<{
    selector: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
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
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["기본 정보", "영역지정", "검토"];
  const [isAble, setIsAble] = useState(false);
  // 1. 기본설정
  const [newData, setNewData] = useState<NewData>({
    settingName: "",
    userAgent: "",
    rate: "0",
    url: "",
    type: "",
    listArea: "",
    pagingType: "",
    pagingArea: "",
    pagingNextbtn: "",
    maxPage: "1",
    linkArea: "",
  });
  const [robotsRows, setRobotsRows] = useState<RobotsTableRows[]>([]); // Robots 테이블 데이터
  // 2. 영역지정
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [mainPreview, setMainPreview] = useState<PreviewData>({
    image: undefined,
    html: "",
    domRects: [],
  });
  const [detailPreview, setDetailPreview] = useState<PreviewData>({
    image: undefined,
    html: "",
    domRects: [],
  });
  const [condition, setCondition] = useState<ConditionTableRows[]>([]); // 추출조건 테이블 데이터
  const [isDetail, setIsDetail] = useState(false); // 상세영역 on/off 여부

  // Alert
  const [openCloseAlert, setOpenCloseAlert] = useState(false);
  const [openRegAlert, setOpenRegAlert] = useState(false);
  const [openRegDoneAlert, setOpenRegDoneAlert] = useState(false);
  const [openErrorAlert, setOpenErrorAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  /** 공통 기능 */
  const handleClose = () => {
    navigate("/setting");
  };
  // Stepper
  const handleNext = async () => {
    // Step1 → Step2 진입할 때 최초 1회만 API 호출
    if (activeStep === 0 && previewLoaded === false) {
      setLoading(true);
      try {
        const res = await getPreview2(newData.url);
        setMainPreview(res);
        setDetailPreview({
          image: undefined,
          html: "",
          domRects: [],
        });
        setPreviewLoaded(true);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleValidate = () => {
    const errMsg = [];
    if (newData.settingName === "") {
      errMsg.push("데이터 수집명을 입력해주세요.");
    }
    if (Number(newData.rate) < 0) {
      errMsg.push("수집간격의 값이 잘못되었습니다.");
    }
    if (Number(newData.maxPage) <= 0) {
      errMsg.push("수집할 페이지 수 는 최소 1을 입력해야합니다.");
    }
    if (condition.length <= 0) {
      errMsg.push("추출조건은 최소 1개 입력해야합니다.");
    }
    const invalidRows = condition.filter(
      (row) => !row.conditionsValue || !row.attr || !row.conditionsKey
    );
    if (invalidRows.length > 0) {
      errMsg.push("추출조건 중 입력되지 않은 값이 존재합니다.");
    }

    if (newData.type === "다중") {
      if (newData.listArea === "") errMsg.push("게시물 영역을 입력해주세요.");
      if (newData.pagingArea === "")
        errMsg.push("페이지네이션 영역을 입력해주세요.");
      if (newData.pagingNextbtn === "")
        errMsg.push("페이지네이션 다음버튼 영역을 입력해주세요.");
      if (newData.linkArea === "")
        errMsg.push("페이지네이션 다음버튼 영역을 입력해주세요.");
    }

    if (errMsg.length !== 0) {
      setAlertMsg(errMsg.join("\n"));
      setOpenErrorAlert(true);
    } else {
      handleRegist();
    }
  };
  const handleRegist = async () => {
    const data = {
      ...newData,
      rate: Number(newData.rate),
      maxPage: Number(newData.maxPage),
      conditions: condition,
    };
    try {
      await registSetting(data);
      setOpenRegDoneAlert(true);
    } catch (err) {
      console.error(err);
      setAlertMsg("세팅 등록을 실패하였습니다.");
      setOpenErrorAlert(true);
      return;
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        backgroundColor: "#fafaf9",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {/* 상단 헤더 */}
      <Box sx={{ px: 4, pt: 3, pb: 2, flexShrink: 0 }}>
        <Breadcrumbs
          sx={{ mb: 0.5, "& .MuiTypography-root": { fontSize: 14 } }}
        >
          <Link
            component={RouterLink}
            to="/setting"
            underline="hover"
            color="inherit"
          >
            데이터 수집 설정
          </Link>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            설정 등록
          </Typography>
        </Breadcrumbs>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography
            sx={{
              fontSize: 32,
              fontWeight: 800,
              color: "#292524",
              letterSpacing: "-0.03em",
            }}
          >
            데이터 수집 설정
          </Typography>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel
                  sx={{
                    "& .MuiStepIcon-root": {
                      color: activeStep === index ? "#ba7d1bff" : "#78716c",
                    },
                    "& .MuiStepLabel-label": {
                      color: activeStep === index ? "#ba7d1bff" : "#78716c",
                      fontWeight: activeStep === index ? 700 : 500,
                      borderBottom:
                        activeStep === index ? "2px solid #ba7d1bff" : "none",
                      fontSize: 15,
                    },
                  }}
                  StepIconComponent={() => null}
                >
                  {index + 1 + ". " + label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Box>

      {/* 본문 영역 */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          border: "1px solid #e7e5e4",
          borderRadius: 3,
          marginLeft: 4,
          marginRight: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: 2,
          p: 2,
          overflowY: "auto",
          backgroundColor: "#fff",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
        }}
      >
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
            />
          </>
        )}

        {/* 2. 영역지정 (단일) */}
        {activeStep === 1 && newData.type === "단일" && (
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
        {activeStep === 1 && newData.type === "다중" && (
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
            />
          </>
        )}
        {/* 3. 검토 (단일) */}
        {activeStep === 2 && newData.type === "단일" && (
          <>
            <Step3_Single newData={newData} condition={condition} />
          </>
        )}
        {/* 3. 검토 (다중) */}
        {activeStep === 2 && newData.type === "다중" && (
          <>
            <Step3_Multi newData={newData} condition={condition} />
          </>
        )}
      </Box>

      {/* 하단 푸터 */}
      <Box
        sx={{
          px: 4,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <CustomButton
          text="닫기"
          radius={2}
          backgroundColor="#F2F2F2"
          onClick={() => setOpenCloseAlert(true)}
          border="1px solid #757575"
          hoverStyle={{
            backgroundColor: "transparent",
            border: "2px solid #373737ff",
          }}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          {activeStep > 0 && (
            <CustomButton
              text="이전"
              onClick={handleBack}
              radius={2}
              backgroundColor="#F2F2F2"
              border="1px solid #757575"
              hoverStyle={{
                backgroundColor: "transparent",
                border: "2px solid #373737ff",
              }}
            />
          )}

          {activeStep < steps.length - 1 ? (
            <CustomButton
              text="다음"
              onClick={handleNext}
              radius={2}
              border="1px solid #757575"
              hoverStyle={{
                backgroundColor: "#ba7d1bff",
                border: "2px solid #373737ff",
              }}
              disabled={
                activeStep === 0
                  ? isAble === false
                  : activeStep === 1
                  ? condition.length === 0
                  : false
              }
            />
          ) : (
            <CustomButton
              text="등록"
              onClick={() => setOpenRegAlert(true)}
              radius={2}
              border="1px solid #757575"
              hoverStyle={{
                backgroundColor: "#ba7d1bff",
                border: "2px solid #373737ff",
              }}
            />
          )}
        </Box>
      </Box>

      <Alert
        open={openCloseAlert}
        text="현재 입력한 정보가 사라집니다. 정말로 닫으시겠습니까?"
        onConfirm={() => {
          setOpenCloseAlert(false);
          handleClose();
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
          handleValidate();
        }}
        onCancel={() => {
          setOpenRegAlert(false);
        }}
      />
      <Alert
        open={openRegDoneAlert}
        text="등록 되었습니다."
        type="success"
        onConfirm={() => {
          setOpenRegDoneAlert(false);
          navigate("/setting");
        }}
      />
      <Alert
        open={openErrorAlert}
        text={alertMsg}
        type="error"
        onConfirm={() => {
          setOpenErrorAlert(false);
        }}
      />
      <LoadingProgress open={loading} />
    </Box>
  );
}
