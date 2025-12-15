import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Breadcrumbs, Link, Radio, RadioGroup, FormControl, FormControlLabel } from '@mui/material';
import CommonTable from '../../component/CommonTable';
import { getColumns, type UserLogTableRows } from '../../Types/TableHeaders/UserManageLogHeader';
import CustomButton from '../../component/CustomButton';
import SearchBarSet from '../../component/SearchBarSet';
import { getUserLog } from '../../API/01_UsermanagementApi';
import Alert from '../../component/Alert';

export default function LogPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { userId, username } = location.state || {};

    const [baseRows, setBaseRows] = useState<UserLogTableRows[]>([]);
    const [filteredRows, setFilteredRows] = useState<UserLogTableRows[]>([]);
    const [radioFilteredRows, setRadioFilteredRows] = useState<UserLogTableRows[]>([]);
    const [filterType, setFilterType] = useState('all');

    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const getTableDatas = async () => {
        try {
            const data = await getUserLog(userId);
            const result = data.map((row: UserLogTableRows, i: number) => ({
                ...row,
                id: row.workId,
                index: i + 1,
            }));
            setBaseRows(result);
            setFilteredRows(result);
        } catch (err) {
            console.error(err);
            setErrorMsg('getUserLog 실패');
            setOpenErrorAlert(true);
        }
    };

    useEffect(() => {
        getTableDatas();
    }, []);

    useEffect(() => {
        let currentRows = [...baseRows];
        if (filterType !== "all") {
          currentRows = currentRows.filter((row) => row.type === filterType);
        }
        setRadioFilteredRows(currentRows);
      }, [baseRows, filterType]);

    const handleDetailView = (row: UserLogTableRows) => {
        console.log('row', row);
        // 수집이력 상세가 만들어지면 거기에 연결하도록
    };

    const columns = getColumns({ handleDetailView });
    
    const handleClose = () => {
        navigate('/user');
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setFilterType(value);
    };

    return (
        <Box sx={{ height: "97%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ paddingLeft: 2, marginTop: 1 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                    <Link component={RouterLink} to="/user" underline="hover" color="inherit" sx={{ fontWeight: "bold", fontSize: 16 }}>
                        유저관리
                    </Link>
                    <Typography color="text.primary" sx={{ fontWeight: "bold", fontSize: 16 }}>
                        데이터 수집 요청 로그
                    </Typography>
                </Breadcrumbs>
            </Box>

            <Typography sx={{ fontSize: 60, fontWeight: "bold", color: "black", paddingLeft: 2, marginTop: 5, marginBottom: 2 }}>
                데이터 수집 요청 로그
            </Typography>

            <Box sx={{ border: "2px solid #abababff", margin: "0 20px", flexGrow: 1, display: "flex", flexDirection: "column", gap: 2, padding: 3 }}>
                
                <SearchBarSet
                    baseRows={radioFilteredRows}
                    setFilteredRows={setFilteredRows}
                    dateField="startAt"
                    showDateRange={true}
                    showKeyword={true}
                    showCount={true}
                />

                <Box sx={{ display: "flex", justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ bgcolor: "#f0f0f0", display: "flex", alignItems: "center", padding: 2, gap: 1, width: "fit-content", borderRadius: 2 }}>
                        <Typography sx={{ color: "black" }}>User ID: </Typography>
                        <Typography sx={{ color: "black", fontWeight: 600 }}>{username}</Typography>
                    </Box>
                    <FormControl>
                        <RadioGroup row value={filterType} onChange={handleFilterChange} sx={{ color: "black" }}>
                            <FormControlLabel value="all" control={<Radio sx={{ color: "gray", "&.Mui-checked": { color: "#BB510C" } }} />} label="전체" />
                            <FormControlLabel value="스케줄링" control={<Radio sx={{ color: "gray", "&.Mui-checked": { color: "#BB510C" } }} />} label="스케줄링" />
                            <FormControlLabel value="수동실행" control={<Radio sx={{ color: "gray", "&.Mui-checked": { color: "#BB510C" } }} />} label="수동실행" />
                        </RadioGroup>
                    </FormControl>
                </Box>

                <Box sx={{ flexGrow: 1, marginTop: 2 }}>
                    <CommonTable columns={columns} rows={filteredRows} />
                </Box>

                <Box sx={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <CustomButton text="닫기" onClick={handleClose} backgroundColor="#f0f0f0" radius={2} />
                </Box>
            </Box>
            
            <Alert open={openErrorAlert} text={errorMsg} type="error" onConfirm={() => setOpenErrorAlert(false)} />
        </Box>
    );
}
>>>>>>> dev
