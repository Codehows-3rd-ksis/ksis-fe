import { Box, Typography, InputAdornment, type SelectChangeEvent, } from "@mui/material";
import CustomTextField from "../../../component/CustomTextField";
import CustomSelect from "../../../component/CustomSelect";
import CustomButton from "../../../component/CustomButton";
import ScrollTable from "../../../component/ScrollTable";
import Alert from "../../../component/Alert";
import { useState } from 'react'
import { getColumns, type RobotsTableRows} from '../../../Types/TableHeaders/SettingRobotsHeader'
import { type ConditionTableRows } from '../../../Types/TableHeaders/SettingConditionHeader';
import { getRobots } from '../../../API/02_SettingApi';
import { type NewData } from "../RegPage";

interface Props {
  newData: NewData;
  setIsAble: (v: boolean) => void;
  setNewData: (value: NewData | ((prev: NewData) => NewData)) => void;
  setCondition: (row: ConditionTableRows[]) => void;
  setLoading: (v: boolean) => void;
  setPreviewLoaded: (v: boolean) => void;
  robotsRows: RobotsTableRows[]
  setRobotsRows: (value: RobotsTableRows[] | ((prev: RobotsTableRows[]) => RobotsTableRows[])) => void;
  setDetailUrl: (v: string) => void;
  
}

const userAgentList = [
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
]
const typeList = [
        { value: '단일', name: '단일' },
        { value: '다중', name: '다중' },
]

export default function Step1({
  newData, 
  setIsAble, 
  setNewData, 
  setCondition,
  setLoading,
  setPreviewLoaded,
  robotsRows,
  setRobotsRows,
  setDetailUrl,
}: Props) {
  const [openRobotsAlert, setOpenRobotsAlert] = useState(false)
  const [openErrorAlert, setOpenErrorAlert] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')
  
  const robotsColumns = getColumns()
  const handleInputChange = (key: keyof typeof newData, value: string) => {
      setNewData((prev) => {
          if (key === 'rate') {
            if (value === '' || Number(value) < 0) value = '0';
          }
          if (prev[key] === value) return prev; // 값이 같으면 상태 변경 안함
        
          if(key === 'url') {
            setIsAble(false)
            setPreviewLoaded(false)
            setCondition([])
            prev['listArea'] = ''
            prev['pagingArea'] = ''
            prev['pagingNextbtn'] = ''
            prev['linkArea'] = ''
            setDetailUrl('')

          }
        
          return { ...prev, [key]: value };
      });
  }
  const handleSelectChange = (key: keyof typeof newData) => 
    (event: SelectChangeEvent<string | number>) => {
      setNewData((prev) => ({ ...prev, [key]: event.target.value }));
      
      setCondition([])
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

  const handleRobots = async () => {
          try {
            const errMsg = []
            if(!newData.settingName) {
              errMsg.push('데이터 수집명을 입력해주세요.')
            }
            if (!newData.url) {
              errMsg.push('URL을 입력해주세요.')
            }
            if(errMsg.length !== 0) {
                setAlertMsg(errMsg.join('\n'));
                setOpenErrorAlert(true)
                setLoading(false)
                return;
            }

            const resRobots = await getRobots(newData.url, newData.userAgent)
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

  return (
    <>
      {/* 데이터 수집명 */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "black" }}>
        <Typography sx={{ width: "200px", textAlign: "left", fontSize: 25 }}>
          데이터 수집명
        </Typography>
        <CustomTextField
          height="50px"
          value={newData.settingName}
          inputWidth="600px"
          placeholder="데이터 수집명"
          onChange={(e) => handleInputChange("settingName", e.target.value)}
        />
      </Box>

      {/* User-Agent */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "black" }}>
        <Typography sx={{ width: "200px", textAlign: "left", fontSize: 25 }}>
          User-Agent
        </Typography>
        <CustomSelect
          inputWidth="600px"
          height="50px"
          value={newData.userAgent}
          listItem={userAgentList}
          onChange={handleSelectChange("userAgent")}
        />
      </Box>

      {/* 수집간격 */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "black" }}>
        <Typography sx={{ width: "200px", textAlign: "left", fontSize: 25 }}>
          데이터 수집간격(s)
        </Typography>
        <CustomTextField
          height="50px"
          value={newData.rate}
          inputWidth="600px"
          placeholder="데이터 수집간격(s)"
          type="number"
          step={10}
          onChange={(e) => handleInputChange("rate", e.target.value)}
        />
      </Box>

      {/* URL + 타입 + 검증 */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "black" }}>
        <Typography sx={{ width: "200px", textAlign: "left", fontSize: 25 }}>
          URL
        </Typography>
        <CustomTextField
          height="50px"
          value={newData.url}
          inputWidth="600px"
          placeholder="URL"
          onChange={(e) => handleInputChange("url", e.target.value)}
          startAdornment={
            <InputAdornment position="start" sx={{ marginLeft: "-14px" }}>
              <CustomSelect
                height="50px"
                inputWidth="80px"
                value={newData.type}
                listItem={typeList}
                onChange={handleSelectChange("type")}
              />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end" sx={{ marginRight: "-14px" }}>
              <CustomButton
                width="40px"
                height="50px"
                text={"검증"}
                onClick={() => {
                  setLoading(true);
                  handleRobots();
                }}
                radius={1}
              />
            </InputAdornment>
          }
        />
      </Box>

      <br /><br />

      {/* Robots Table */}
      <Typography
        sx={{ width: "200px", textAlign: "left", fontSize: 25, color: "black" }}
      >
        Crawl Rules
      </Typography>

      <Box
        sx={{
          minWidth: 800,
          height: 600,
          bgcolor: "#f0f0f0",
        }}
      >
        <Box sx={{ padding: 2 }}>
          <ScrollTable columns={robotsColumns} rows={robotsRows} maxHeight={560} />
        </Box>
      </Box>

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
    </>
  );
}
