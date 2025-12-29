import { Box, Typography, InputAdornment, type SelectChangeEvent, Card } from "@mui/material";
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
      <Card sx={{display: 'flex', flexDirection: 'column', color: 'black', p:2, gap: 1, bgcolor: "#f8f8f5"}}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ minWidth: "220px", textAlign: "left", fontSize: 25, fontWeight: 500 }}>
            · 데이터 수집명
          </Typography>
          <CustomTextField
            height="50px"
            value={newData.settingName}
            inputWidth="600px"
            placeholder="데이터 수집명"
            onChange={(e) => handleInputChange("settingName", e.target.value)}
            border='1px solid #cdbaa6'
          />
        </Box>

        {/* User-Agent */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ minWidth: "220px", textAlign: "left", fontSize: 25, fontWeight: 500 }}>
            · User-Agent
          </Typography>
          <CustomSelect
            inputWidth="600px"
            height="50px"
            value={newData.userAgent}
            listItem={userAgentList}
            onChange={handleSelectChange("userAgent")}
            border='1px solid #cdbaa6'
          />
        </Box>

        {/* 수집간격 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ minWidth: "220px", textAlign: "left", fontSize: 25, fontWeight: 500 }}>
            · 데이터 수집간격(s)
          </Typography>
          <CustomTextField
            height="50px"
            value={newData.rate}
            inputWidth="600px"
            placeholder="데이터 수집간격(s)"
            type="number"
            step={10}
            onChange={(e) => handleInputChange("rate", e.target.value)}
            border='1px solid #cdbaa6'
          />
        </Box>

        {/* URL + 타입 + 검증 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ minWidth: "220px", textAlign: "left", fontSize: 25, fontWeight: 500 }}>
            · URL
          </Typography>
          <CustomTextField
            height="50px"
            value={newData.url}
            inputWidth="600px"
            placeholder="URL"
            onChange={(e) => handleInputChange("url", e.target.value)}
            border='1px solid #cdbaa6'
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
      </Card>
      

      <br /><br />

      {/* Robots Table */}
      
      <Card
        sx={{
          minWidth: 800,
          height: 600,
          // bgcolor: "#f5f5f5",
          bgcolor: "#f8f8f5",
          p:2,
        }}
      >
        <Typography
          sx={{ fontSize: 25, color: "black", fontWeight: 500 }}
        >
          · Crawl Rules
        </Typography>
        <Box>
          <ScrollTable columns={robotsColumns} rows={robotsRows} maxHeight={560} />
        </Box>
      </Card>

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
