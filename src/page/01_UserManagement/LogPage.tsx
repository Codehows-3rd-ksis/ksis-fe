import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Breadcrumbs, Link,
    Radio, RadioGroup, FormControl, FormControlLabel, InputAdornment
 } from '@mui/material'
import CommonTable from '../../component/CommonTable'
import { getColumns, type UserLogTableRows } from '../../Types/TableHeaders/UserManageLogHeader'
import CustomButton from '../../component/CustomButton';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import CustomTextField from '../../component/CustomTextField';
import CustomIconButton from '../../component/CustomIconButton';
import { getUserLog } from './Api';

export default function LogPage () {
    const location = useLocation();
    const navigate = useNavigate();
    const { userId, username } = location.state || {}

    const [baseRows, setBaseRows] = useState<UserLogTableRows[]>([])
    const [filteredRows, setFilteredRows] = useState<UserLogTableRows[]>([]);
    const columns = getColumns();

    const [filterType, setFilterType] = useState('all');  // 라디오 선택값 상태
    const [searchStartAt, setSearchStartAt] = useState<Dayjs | null>(null);
    const [searchEndAt, setSearchEndAt] = useState<Dayjs | null>(null);
    const [searchName, setSearchName] = useState('')
    const [searchCount, setSearchCount] = useState(0)

    const getTableDatas = async () => {
        try {
            const data = await getUserLog(userId);
            
            const result = data.map((row: UserLogTableRows, i: number) => ({
                ...row,
                id: row.workId,
                index: i+1,
            }))

            setBaseRows(result)
            setFilteredRows(result)
        }
        catch(err) {
            console.error(err)
            alert('getUserLog 실패')
        }
    }
    
    useEffect(()=> {
        const data = [
          { workId: 1, id: 1, index: 1, settingId: 1, settingName: '창원시청 공지사항 수집', userId: 1, username: 'ksis1', state: '진행중', startAt: '2025-10-24 09:00', type: '스케줄링' },
          { workId: 2, id: 2, index: 2, settingId: 2, settingName: '창원시청 공지사항 수집', userId: 1, username: 'ksis1', state: '수집완료(수집실패: 5건)', startAt: '2025-10-24 09:00', endAt: '2025-10-24 09:43', type: '스케줄링' },
          { workId: 3, id: 3, index: 3, settingId: 3, settingName: '경상남도 보도자료 수집', userId: 1, username: 'ksis1', state: '수집완료', startAt: '2025-10-22 15:23', endAt: '2025-10-22 16:00', type: '수동실행' },
        ];
    
        setBaseRows(data)
        setFilteredRows(data)

        // getTableDatas()
    }, [])

    const handleClose = () => {
        navigate('/user')
    }

    const handleInputChange = (value: string) => {
        setSearchName(value)
    }

    const handleSearch = (forceType?: string) => {
        let filtered = [...baseRows]

        const typeToUse = forceType ?? filterType;

        if(searchStartAt && (searchEndAt === null)) {
            filtered = filtered.filter(row => {
                const startDate = searchStartAt?.format("YYYY-MM-DD");
                const rowStartDate = row.startAt.slice(0, 10);
                return rowStartDate >= startDate
            })
        } 
        else if(searchEndAt && (searchStartAt === null)) {
            filtered = filtered.filter(row => {
                const endDate = searchEndAt?.format("YYYY-MM-DD");
                const rowEndDate = row.endAt? row.endAt.slice(0, 10) : null;
                if(rowEndDate) return rowEndDate <= endDate
            })
        } else if(searchStartAt && searchEndAt) {
            filtered = filtered.filter(row => {
                const startDate = searchStartAt?.format("YYYY-MM-DD");
                const rowStartDate = row.startAt.slice(0, 10);
                const endDate = searchEndAt?.format("YYYY-MM-DD");
                const rowEndDate = row.endAt? row.endAt.slice(0, 10) : null;

                if(rowEndDate) {
                    return rowStartDate >= startDate && rowEndDate <= endDate
                }
            })
        }

        if(searchName.trim() !== '') {
            filtered = filtered.filter(row =>
                row.settingName?.includes(searchName.trimEnd())
            )
        }

        if(typeToUse !== 'all') {
            filtered = filtered.filter(row => row.type === typeToUse);
        }

        setFilteredRows(filtered)
        setSearchCount(filtered.length)

    }
    const handleReset = () => {
        setSearchStartAt(null)
        setSearchEndAt(null)
        setSearchName('')
        setFilteredRows(baseRows)
        setFilterType('all')
        setSearchCount(0)
    }

    // 라디오 선택 변경시 호출될 함수
    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setFilterType(value);

        handleSearch(value)
    };

    return (
        <Box sx={{ height: '97%'}}>
            {/* <Box sx={{ bgcolor: '#FFC98B', height: '120px', borderRadius: '10px 10px 0px 0px', display: 'flex', alignItems: 'center'}}>
            </Box> */}
                {/* BreadCrumbs */}
                <Box sx={{paddingLeft: 2, marginTop: 1}}>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                        <Link
                            component={RouterLink}
                            to="/user"
                            underline="hover"
                            color="inherit"
                            sx={{ fontWeight: 'bold', fontSize: 16 }}
                        >
                            유저관리
                        </Link>
                        <Typography color="text.primary" sx={{ fontWeight: 'bold', fontSize: 16 }}>
                            데이터 수집 요청 로그
                        </Typography>
                    </Breadcrumbs>
                </Box>
                <Typography sx={{fontSize: 60, fontWeight: 'bold', color: 'black', paddingLeft: 2, marginTop: -1}}>
                  데이터 수집 요청 로그
                </Typography>
                {/* Search */}
                <Box sx={{
                    bgcolor: '#f0f0f0', display: 'flex', justifyContent: 'space-between', height: 80
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', padding:2, gap: 1}}>
                        <Typography sx={{color: 'black'}}>User ID: </Typography>
                        <Typography sx={{color: 'black', fontWeight: 600}}>{username}</Typography>
                    </Box>
                    {/*  */}
                    <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="시작일자"
                            format="YYYY-MM-DD"
                            value={searchStartAt}
                            onChange={(newValue) => setSearchStartAt(newValue)}
                          />
                          <DatePicker
                            label="종료일자"
                            format="YYYY-MM-DD"
                            value={searchEndAt}
                            onChange={(newValue) => setSearchEndAt(newValue)}
                          />
                        </LocalizationProvider>
                        <CustomTextField
                            value={searchName} 
                            height='56px'
                            inputWidth='300px' 
                            placeholder="수집명"
                            type="text"
                            onChange={(e) => handleInputChange(e.target.value)}
                            endAdornment={
                              <InputAdornment position="end">
                                    <CustomIconButton icon="search" width='20px' height='20px' color="gray" onClick={() => handleSearch()} />
                                    <CustomIconButton icon="reset"   width='20px' height='20px' color="gray" onClick={handleReset} />
                              </InputAdornment>
                            }
                        />
                    </Box>
                </Box>
                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                    {/* Search Count */}
                    <Box sx={{display: 'flex', alignItems: 'center', padding: 2}}>
                        {searchCount > 0? 
                            (<Typography sx={{color: 'black', fontWeight: 700}}>검색결과 : {searchCount} 건 입니다.</Typography>) : (
                                <></>
                            )
                        }
                    </Box>
                    {/* RadioBtn */}
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', paddingRight: 1}}>
                        <FormControl>
                            <RadioGroup
                                row
                                value={filterType} 
                                onChange={handleFilterChange} 
                                sx={{color: 'black'}}
                            >
                                <FormControlLabel 
                                    value="all" 
                                    control={
                                        <Radio sx={{
                                            color: 'gray',
                                            '&.Mui-checked': {
                                                color: '#BB510C', 
                                            }
                                        }}/>
                                    } 
                                    label="전체" 
                                />
                                <FormControlLabel 
                                    value="스케줄링" 
                                    control={
                                        <Radio sx={{
                                            color: 'gray',
                                            '&.Mui-checked': {
                                                color: '#BB510C', 
                                            }
                                        }}/>
                                    } 
                                    label="스케줄링" 
                                />
                                <FormControlLabel 
                                    value="수동실행" 
                                    control={
                                        <Radio sx={{
                                            color: 'gray',
                                            '&.Mui-checked': {
                                                color: '#BB510C', 
                                            }
                                        }}/>
                                    } 
                                    label="수동실행" 
                                />
                            </RadioGroup>
                        </FormControl>
                    </Box>
                </Box>
                {/* 테이블 영역 */}
                <Box sx={{padding: 2}}>
                    <CommonTable columns={columns} rows={filteredRows} />
                </Box>
                <Box sx={{display: 'flex', justifyContent: 'flex-end', padding: 2}}>
                    <CustomButton text="닫기" onClick={handleClose} backgroundColor='#f0f0f0' radius={2}/>
                </Box>
        </Box>
    )
}