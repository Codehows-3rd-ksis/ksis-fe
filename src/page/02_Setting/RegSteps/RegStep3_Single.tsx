import { Box, Typography } from "@mui/material";
import ScrollTable from "../../../component/ScrollTable";
import { useMemo } from 'react'

import { type ConditionTableRows } from '../../../Types/TableHeaders/SettingConditionHeader';
import { type NewData } from "../RegPage";

interface Props {
  newData: NewData;
  condition: ConditionTableRows[];
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

export default function RegStep3_Single({
  newData,
  condition, 
}: Props) {
  const reviewColumns = [
        { field: 'conditionsValue', headerName: '추출영역', flex: 2 },
        { field: 'attr', headerName: '추출속성', flex: 1 },
        { field: 'conditionsKey', headerName: '추출값 명칭 지정', flex: 1 },
  ]

  const selectedUserAgentName = useMemo(() => {
      return userAgentList.find(item => item.value === newData.userAgent)?.name || newData.userAgent;
  }, [newData.userAgent, userAgentList])

  return (
    <>
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
    </>
  );
}
