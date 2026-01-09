import { useMemo, useEffect, useState } from "react";
import { Box, Typography, Card } from "@mui/material";
import ScrollTable from "../../component/ScrollTable";

import { type ConditionTableRows } from '../../Types/TableHeaders/SettingConditionHeader';
import { type SettingTableRows } from "../../Types/TableHeaders/SettingHeader";
import CustomButton from '../../component/CustomButton';
import { getCondtions } from "../../API/02_SettingApi";

interface DetailPageProps {
    row: SettingTableRows | null;
    handleCancel: () => void;
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
const pagingTypeList = [
        { value: 'Numeric', name: '페이지 형식' },
        { value: 'Next_Btn', name: '다음버튼 형식' },
]
const reviewColumns = [
      { field: 'conditionsValue', headerName: '추출영역', flex: 2 },
      { field: 'attr', headerName: '추출속성', flex: 1 },
      { field: 'conditionsKey', headerName: '추출값 명칭 지정', flex: 1 },
]

export default function DetailPage(props: DetailPageProps) {
    const {row, handleCancel} = props;
    // const [settingData, setSettingData] = useState<SettingTableRows>()
    const [conditionData, setCondition] = useState<ConditionTableRows[]>([])
    const getSettingData = async (settingId: number) => {
        const cData = await getCondtions(settingId);

        const result = cData.map((row: ConditionTableRows, i: number) => ({
              ...row,
              id: i,
            }));
        setCondition(result);
    }

    useEffect(() => {
        if(row?.settingId) {
            getSettingData(row.settingId)
        }
    }, [row?.settingId])

    const selectedUserAgentName = useMemo(() => {
        if (!row) return '';
        return userAgentList.find(item => item.value === row.userAgent)?.name ?? row.userAgent;
    }, [row]);
    
    const selectedPagingTypeName = useMemo(() => {
        if (!row) return '';
        return pagingTypeList.find(item => item.value === row.pagingType)?.name ?? row.pagingType;
    }, [row]);
    
    if(row !== null) {
        return (
        <>
          <Box sx={{ color: 'black', p: 2, display:'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{display: 'flex', gap: 2}}>
              <Box sx={{flex:4}}>
                  <Typography sx={{ paddingLeft: 1, fontSize: 30, fontWeight: 600 }}>기본 설정</Typography>
                  <Card sx={{bgcolor: '#f8f8f5'}}>
                      <Box sx={{p: 2}}>
                        <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', fontWeight: 'bold'}}>데이터 수집명</Typography>
                        <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', border: '2px solid #cdbaa6', borderRadius: '5px', bgcolor: '#fff'}}>{row.settingName}</Typography>
                        <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', fontWeight: 'bold'}}>User-agent</Typography>
                        <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', border: '2px solid #cdbaa6', borderRadius: '5px', bgcolor: '#fff'}}>{selectedUserAgentName}</Typography>
                        <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', fontWeight: 'bold'}}>데이터 수집간격(s)</Typography>
                        <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', border: '2px solid #cdbaa6', borderRadius: '5px', bgcolor: '#fff'}}>{row.rate}</Typography>
                        <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', fontWeight: 'bold'}}>URL</Typography>
                        <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', border: '2px solid #cdbaa6', borderRadius: '5px', bgcolor: '#fff'}}>{row.url}</Typography>
                      </Box>
                  </Card>
              </Box>
              {row.type === '다중' && (
                <Box sx={{flex: 6}}>
                    <Typography sx={{ paddingLeft: 1, fontSize: 30, fontWeight: 600 }}>다중 설정</Typography>
                    <Card sx={{bgcolor: '#f8f8f5'}}>
                        <Box sx={{p: 2}}>
                            <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', fontWeight: 'bold'}}>게시물 영역</Typography>
                            <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', border: '2px solid #cdbaa6', borderRadius: '5px', bgcolor: '#fff'}}>{row.listArea}</Typography>
                            <Box sx={{display: 'flex', gap: 2}}>
                            <Box sx={{flex: 1}}>
                                <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', fontWeight: 'bold'}}>페이지네이션 타입</Typography>
                                <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', border: '2px solid #cdbaa6', borderRadius: '5px', bgcolor: '#fff'}}>{selectedPagingTypeName}</Typography>
                            </Box>
                            <Box sx={{flex: 1}}>
                                <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', fontWeight: 'bold'}}>수집할 페이지 수</Typography>
                                <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', border: '2px solid #cdbaa6', borderRadius: '5px', bgcolor: '#fff'}}>{row.maxPage}</Typography>
                            </Box>
                            </Box>
                            <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', fontWeight: 'bold'}}>페이지네이션 영역</Typography>
                            <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', border: '2px solid #cdbaa6', borderRadius: '5px', bgcolor: '#fff'}}>{row.pagingArea}</Typography>
                            <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', fontWeight: 'bold'}}>다음버튼 영역</Typography>
                            <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', border: '2px solid #cdbaa6', borderRadius: '5px', bgcolor: '#fff'}}>{row.pagingNextbtn}</Typography>
                            <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', fontWeight: 'bold'}}>상세 링크 영역</Typography>
                            <Typography sx={{ paddingLeft: 1, alignContent: 'center', fontSize: 20, minHeight: '40px', border: '2px solid #cdbaa6', borderRadius: '5px', bgcolor: '#fff'}}>{row.linkArea}</Typography>
                        </Box>
                    </Card>
                </Box>
              )}
            </Box>
            <Box>
                <Typography sx={{ paddingLeft: 1, fontSize: 30, fontWeight: 600 }}>추출 설정</Typography>
                <Card sx={{bgcolor: '#f8f8f5', minHeight: 350, maxHeight: 420}}>
                  <Box sx={{p: 2}}>
                    <ScrollTable
                        rows={conditionData}
                        columns={reviewColumns}
                        maxHeight={400}
                    />
                  </Box>
                </Card>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1}}>
                {/* <CustomButton 
                text="빠른 수정" 
                onClick={handleCancel} 
                radius={2}
                /> */}
                <CustomButton 
                    text="닫기" 
                    onClick={handleCancel} 
                    radius={2}
                    backgroundColor="#F2F2F2"
                    border="1px solid #757575"
                    hoverStyle={{
                      backgroundColor: "transparent",
                      border: "2px solid #373737ff",
                    }}
                />
            </Box>
          </Box>
        </>
        );    
    } 
}
