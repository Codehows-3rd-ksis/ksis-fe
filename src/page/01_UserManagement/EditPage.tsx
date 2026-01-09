import {useState} from 'react'
import {Box, Typography, type SelectChangeEvent} from '@mui/material'
import CustomButton from '../../component/CustomButton';
import CustomTextField from '../../component/CustomTextField';
import CustomIconButton from '../../component/CustomIconButton';
import CustomSelect from '../../component/CustomSelect';
import Alert from '../../component/Alert';
import { updateUserInfo } from '../../API/01_UsermanagementApi';

import { type UserTableRows } from '../../Types/TableHeaders/UserManageHeader'

interface EditPageProps {
    row: UserTableRows | null;
    handleDone: () => void;
    handleCancel: () => void;
}

interface UserForm {
  username: string;
  name: string;
  dept: string;
  ranks: string;
  state: string;
}

export default function EditPage(props: EditPageProps) {
    const {row, handleDone, handleCancel} = props
    const [newData, setNewData] = useState<UserForm>({
        username: row?.username || '',
        name: row?.name || '',
        dept: row?.dept || '',
        ranks: row?.ranks || '',
        state: row?.state || '승인대기',
    })
    const [openCancelAlert, setOpenCancelAlert] = useState(false)
    const [openEditAlert, setOpenEditAlert] = useState(false)
    const stateList = [
        { value: '승인대기', name: '승인대기' },
        { value: '승인완료', name: '승인완료' },
    ];
    const [openValidAlert, setOpenValidAlert] = useState(false)
    const [validateMsg, setValidateMsg] = useState('')
    const [openErrorAlert, setOpenErrorAlert] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const handleInputChange = (key: keyof typeof newData, value: string) => {
        setNewData((prev) => {
            const updated = { ...prev, [key]: value };

            return updated;
        });
    }

    const handleSelectChange = (key: keyof typeof newData) => 
    (event: SelectChangeEvent<string | number>) => {
      setNewData((prev) => ({ ...prev, [key]: event.target.value }));
    };

    const handleValidate = async () => {
        try {
            if(row === null) return;

            const errMsg = []
            if (newData.name === '') errMsg.push('이름 미입력')

            if(errMsg.length !== 0) {
                setValidateMsg(errMsg.join('\n'));
                setOpenValidAlert(true)
            } else {
                handleEdit()
            }
        }
        catch(err) {
            console.error(err)
            setOpenEditAlert(false);
            setErrorMsg('get User 실패');
            setOpenErrorAlert(true)
        }
        
    }
    const handleEdit = async () => {
        try {
            if(row === null) {
                setOpenEditAlert(false);
                setErrorMsg('row is null // User 수정 실패');
                setOpenErrorAlert(true)
                return;
            }
            await updateUserInfo(row.userId,{
                name: newData.name,
                dept: newData.dept,
                ranks: newData.ranks,
                state: newData.state,
            })
            handleDone()
        }
        catch(err) {
            console.error(err)
            setOpenEditAlert(false);
            setErrorMsg('User 수정 실패');
            setOpenErrorAlert(true)
            
        }
    }


    return (
        <Box sx={{
            width: '600px',
            height: '65vh',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <Box sx={{bgcolor: '#FFC98B', display: 'flex', justifyContent: 'space-between'}}>
                <Typography sx={{fontSize: 48, fontWeight: 'bold', marginLeft: '20px'}}>사용자 정보 수정</Typography>
                <CustomIconButton icon="close" backgroundColor='#FFC98B' onClick={()=>setOpenCancelAlert(true)}/>
            </Box>
            <Box sx={{
                border: '2px solid #abababff',
                marginLeft: '20px',
                marginRight: '20px',
                borderRadius: 1,
                paddingTop: 1,
                paddingBottom: 1,
                overflowY: 'auto'
            }}>
                {/* ID */}
                <Box sx={{display: 'flex', justifyContent: 'space-around', gap: 2, padding: 1}}>
                    <Box sx={{display: 'flex', justifyContent:'center', alignItems: 'center', borderRight: '1px solid', width: '200px'}}>
                        <Typography>아이디</Typography>
                        <Typography sx={{color: 'red'}}>*</Typography>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                        <CustomTextField 
                          variant="outlined"
                          value={newData.username}
                          inputWidth="300px"
                          disabled={true}
                          readOnly={true}
                          placeholder="아이디"
                          type="text"
                        />
                    </Box>
                </Box>
                {/* 이름 */}
                <Box sx={{display: 'flex', justifyContent: 'space-around', gap: 2, padding: 1}}>
                    <Box sx={{display: 'flex', justifyContent:'center', alignItems: 'center', borderRight: '1px solid', width: '200px'}}>
                        <Typography>이름</Typography>
                        <Typography sx={{color: 'red'}}>*</Typography>
                    </Box>
                    <Box>
                        <CustomTextField 
                          variant="outlined"
                          value={newData.name}
                          inputWidth="300px"
                          disabled={false}
                          readOnly={false}
                          placeholder="이름"
                          type="text"
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                    </Box>
                </Box>
                {/* 부서 */}
                <Box sx={{display: 'flex', justifyContent: 'space-around', gap: 2, padding: 1}}>
                    <Box sx={{display: 'flex', justifyContent:'center', alignItems: 'center', borderRight: '1px solid', width: '200px'}}>
                        <Typography>부서</Typography>
                    </Box>
                    <Box>
                        <CustomTextField 
                          variant="outlined"
                          value={newData.dept}
                          inputWidth="300px"
                          disabled={false}
                          readOnly={false}
                          placeholder="부서"
                          type="text"
                          onChange={(e) => handleInputChange('dept', e.target.value)}
                        />
                    </Box>
                </Box>
                {/* 직위 */}
                <Box sx={{display: 'flex', justifyContent: 'space-around', gap: 2, padding: 1}}>
                    <Box sx={{display: 'flex', justifyContent:'center', alignItems: 'center', borderRight: '1px solid', width: '200px'}}>
                        <Typography>직위</Typography>
                    </Box>
                    <Box>
                        <CustomTextField 
                          variant="outlined"
                          value={newData.ranks}
                          inputWidth="300px"
                          disabled={false}
                          readOnly={false}
                          placeholder="직위"
                          type="text"
                          onChange={(e) => handleInputChange('ranks', e.target.value)}
                        />
                    </Box>
                </Box>
                {/* 승인상태 */}
                <Box sx={{display: 'flex', justifyContent: 'space-around', gap: 2, padding: 1}}>
                    <Box sx={{display: 'flex', justifyContent:'center', alignItems: 'center', borderRight: '1px solid', width: '200px'}}>
                        <Typography>승인상태</Typography>
                        <Typography sx={{color: 'red'}}>*</Typography>
                    </Box>
                    <Box sx={{marginRight: '20px'}}>
                        <CustomSelect
                          value={newData.state}
                          listItem={stateList}
                          onChange={handleSelectChange('state')}
                        />
                    </Box>
                </Box>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'center', gap:2, marginBottom: 2}}>
                <CustomButton 
                    text="수정" 
                    onClick={()=>setOpenEditAlert(true)} 
                    radius={2}
                    border="1px solid #757575"
                    hoverStyle={{
                      backgroundColor: "#ba7d1bff",
                      border: "2px solid #373737ff",
                    }}
                />
                <CustomButton 
                    text="닫기" 
                    onClick={()=>setOpenCancelAlert(true)} 
                    radius={2}
                    backgroundColor="#F2F2F2"
                    border="1px solid #757575"
                    hoverStyle={{
                      backgroundColor: "transparent",
                      border: "2px solid #373737ff",
                    }}
                />
            </Box>

            {/* Cancel Alert */}
            <Alert
              open={openCancelAlert}
              text="정말로 닫으시겠습니까?"
              onConfirm={() => {
                setOpenCancelAlert(false);
                handleCancel()
              }}
              onCancel={() => {
                setOpenCancelAlert(false);
              }}
            />
            {/* Edit Alert */}
            <Alert
              open={openEditAlert}
              text="수정 하시겠습니까?"
              type="question"
              onConfirm={() => {
                setOpenEditAlert(false);
                handleValidate()
              }}
              onCancel={() => {
                setOpenEditAlert(false);
              }}
            />
            {/* Validation Alert */}
            <Alert
              open={openValidAlert}
              text={validateMsg}
              type="validate"
              onConfirm={() => {
                setOpenValidAlert(false);
              }}
            />
            {/* Error Alert */}
            <Alert
              open={openErrorAlert}
              text={errorMsg}
              type="error"
              onConfirm={() => {
                setOpenErrorAlert(false);
              }}
            />
        </Box>
    )
}