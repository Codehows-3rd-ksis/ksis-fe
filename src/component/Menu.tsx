import React from 'react'
import { useNavigate, useLocation  } from 'react-router-dom';
import logo from '../assets/ksisLogo.png'
import { 
    Box,
    Paper,
    MenuList,
    MenuItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Typography
} from '@mui/material';
import CustomIconButton from './CustomIconButton';
import {
    ManageAccounts,
    Settings,
    Monitor,
    AlarmAdd,
    PlayArrow,
    Notifications,
} from '@mui/icons-material';
import { type Menu_Type } from '../Types/Components';

function Menu(props: Menu_Type) {
    const {userInfo, onLogout} = props
    const navigate = useNavigate();
    const location = useLocation();  // 현재 경로 얻기

    const userMenu = [
        {title: '유저목록', path: '/user', icon: <ManageAccounts fontSize="small" />},
    ]
    const settingMenu = [
        {title: '데이터 수집 현황', path: '/status', icon: <Notifications fontSize="small" />},
        {title: '데이터 수집 설정', path: '/setting', icon: <Settings fontSize="small" />},
        {title: '스케쥴러', path: '/scheduler', icon: <AlarmAdd fontSize="small" />},
        {title: '데이터 수집 이력', path: '/history', icon: <Monitor fontSize="small" />},
    ]

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',  // ✅ 상단(로고+메뉴)과 하단(유저영역) 분리
            height: '98vh',
            minWidth: '260px',
            // width: '260px',
            boxSizing: 'border-box'
        }}>
            {/* --- 상단 영역 (로고 + 메뉴) --- */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {/* 로고 */}
                <Box sx={{ textAlign: 'center', marginTop: '30px', marginRight: '10px' }}>
                <img
                    src={logo}
                    alt="company logo"
                    style={{ width: '80%', height: 'auto' }}
                />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    bgcolor: '#F8F8F5',
                    color: 'black',
                    borderRadius: '0 0 10px 10px',
                    p: 1,
                    marginLeft: 1,
                    marginRight: 2,
                    boxShadow: 1,
                    height: 100
                  }}
                >
                  <Box sx={{paddingLeft: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                    <Typography variant="subtitle1" fontWeight="bold" fontSize={25} >
                      {userInfo?.name + ' 님'|| '게스트'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }} fontSize={15}>
                      환영합니다.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column-reverse'}}>
                    <CustomIconButton
                        icon="logout"
                        backgroundColor='#F8F8F5'
                        onClick={onLogout}
                    />
                  </Box>
            </Box>

                {/* 메뉴 */}
                <Paper sx={{ 
                    // width: '100%',
                    marginLeft: 1,
                    marginRight: 2,
                    minWidth: '240px',
                }}>
                    {/* ✅ 관리자 전용 메뉴 */}
                    {userInfo?.role === 'admin' && (
                        <>
                            <MenuList>
                                {userMenu.map((item, index) => (
                                    <MenuItem
                                        key={index}
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            height: 80,
                                            backgroundColor: location.pathname.includes(item.path) ? '#FFE6C5' : 'inherit',
                                            color: location.pathname.includes(item.path) ? '#BB510C' : 'inherit',
                                            '&:hover': {
                                              backgroundColor: location.pathname.includes(item.path) ? '#FEC88B' : '#FFE6C5',
                                              color: location.pathname.includes(item.path) ? '#BB510C' : '#BB510C',
                                            },
                                        }}
                                    >
                                        <ListItemIcon 
                                            sx={{ 
                                                minWidth: 40,
                                                color: location.pathname.includes(item.path) ? '#BB510C' : 'black',
                                        }}>
                                            {/* {item.icon} */}
                                            {React.cloneElement(item.icon as React.ReactElement<any>, {
                                                sx: { fontSize: 28 }
                                            })}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={item.title} 
                                            slotProps={{
                                                primary: {
                                                    sx: {
                                                        fontSize: 20,
                                                        fontWeight: location.pathname.includes(item.path) ? 700 : 400,
                                                    }
                                                }
                                            }}
                                        />
                                        <PlayArrow sx={{fontSize: 26}} />
                                    </MenuItem>
                                ))}
                            </MenuList>
                            <Divider />
                        </>
                    )}
                    {/* ✅ 일반 메뉴 (모든 사용자 접근 가능) */}
                    <MenuList>
                        { settingMenu.map((item, index) => (
                            <MenuItem
                                key={index}  
                                onClick={() => navigate(item.path)}
                                sx={{
                                    height: 80,
                                    backgroundColor: location.pathname.includes(item.path) ? '#FFE6C5' : 'inherit',
                                    color: location.pathname.includes(item.path) ? '#BB510C' : 'inherit',
                                    '&:hover': {
                                        backgroundColor: location.pathname.includes(item.path) ? '#FEC88B' : '#FFE6C5',
                                        color: location.pathname.includes(item.path) ? '#BB510C' : '#BB510C',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{
                                    color: location.pathname.includes(item.path) ? '#BB510C' : 'inherit',
                                }}>
                                    {/* {item.icon} */}
                                    {React.cloneElement(item.icon as React.ReactElement<any>, {
                                        sx: { fontSize: 28 }
                                    })}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.title} 
                                    slotProps={{
                                        primary: {
                                            sx: {
                                                fontSize: 20,
                                                fontWeight: location.pathname.includes(item.path) ? 700 : 400,
                                            }
                                        }
                                    }}
                                />
                                <PlayArrow sx={{fontSize: 26}} />
                            </MenuItem>

                        ))}
                    </MenuList>
                    <Divider />
                </Paper>
            </Box>
        </Box>
    )
}

export default Menu;