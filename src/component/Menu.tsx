import React from 'react'
import { useNavigate, useLocation  } from 'react-router-dom';
// import logo from '../assets/ksisLogo.png'
import logo2 from '../assets/logo.png'
import { 
    Box,
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
import { useAuthStore } from '../Store/authStore';

function Menu() {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    
    const navigate = useNavigate();
    const location = useLocation();  // 현재 경로 얻기

    const userMenu = [
        {title: '유저목록', path: '/user', icon: <ManageAccounts fontSize="small" />},
    ]
    const settingMenu = [
        {title: '데이터 수집 현황', path: '/status', icon: <Notifications fontSize="small" />},
        {title: '데이터 수집 설정', path: '/setting', icon: <Settings fontSize="small" />},
        {title: '스케줄러', path: '/scheduler', icon: <AlarmAdd fontSize="small" />},
        {title: '데이터 수집 이력', path: '/history', icon: <Monitor fontSize="small" />},
    ]

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,   
            gap: 5
        }}>
            {/* --- 상단 영역 (로고 + 메뉴) --- */}
            <Box sx={{ 
                display: 'flex',
                flexDirection: 'column', 
                gap: 2,
                p: 2 
            }}>
                {/* 로고 */}
                <Box sx={{ textAlign: 'center', marginTop: '30px', marginRight: '10px' }}>
                <img
                    src={logo2}
                    alt="company logo"
                    style={{ width: '80%', height: 'auto' }}
                />
                </Box>
                {/* User Profile */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    // bgcolor: '#F8F8F5',
                    // color: 'black',
                    bgcolor: '#1e1d1dff',
                    // background: 'linear-gradient(90deg, #000000 0%, #46464B 100%)',
                    // border: '2px solid rgba(86, 86, 86, 1)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '-2px 2px 0 0 rgba(0, 0, 0, 0.42)',
                    minHeight: 100
                  }}
                >
                  <Box sx={{paddingLeft: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                    <Typography variant="subtitle1" fontWeight="bold" fontSize={25} >
                      {user?.name + ' 님'|| '게스트'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }} fontSize={15}>
                      환영합니다.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column-reverse'}}>
                    <CustomIconButton
                        icon="logout"
                        backgroundColor='#1e1d1dff'
                        color="white"
                        onClick={()=> {
                            logout()
                            navigate('/login')
                        }}
                    />
                  </Box>
                </Box>
            </Box>

            {/* 메뉴 */}                        
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                minWidth: '240px',
                p: 2
              }}
            >
                {/* ✅ 관리자 전용 메뉴 */}
                {user?.role === 'ROLE_ADMIN' && (
                    <>
                        <MenuList>
                            {userMenu.map((item, index) => (
                                <MenuItem
                                    key={index}
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        height: 80,
                                        borderRadius: 2,
                                        boxShadow: '0px 2px 0 1px rgba(0, 0, 0, 0.42)',
                                        backgroundColor: location.pathname.startsWith(item.path) ? '#EDA634' : 'inherit',
                                        color: location.pathname.startsWith(item.path) ? 'black' : 'white',
                                        '&:hover': {
                                          backgroundColor: location.pathname.startsWith(item.path) ? '#eda634d3' : '#EDA634',
                                          color: location.pathname.startsWith(item.path) ? 'black' : 'white',
                                        },
                                    }}
                                >
                                    <ListItemIcon 
                                        sx={{ 
                                            minWidth: 40,
                                            color: location.pathname.startsWith(item.path) ? 'black' : 'white',
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
                                                    fontWeight: location.pathname.startsWith(item.path) ? 700 : 400,
                                                }
                                            }
                                        }}
                                    />
                                    <PlayArrow sx={{fontSize: 26}} />
                                </MenuItem>
                            ))}
                        </MenuList>
                        {/* <Divider /> */}
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
                                borderRadius: 2,
                                marginBottom: 0.5,
                                boxShadow: '0px 2px 0 1px rgba(0, 0, 0, 0.42)',
                                backgroundColor: location.pathname.startsWith(item.path) ? '#EDA634' : 'inherit',
                                color: location.pathname.startsWith(item.path) ? 'black' : 'white',
                                '&:hover': {
                                    backgroundColor: location.pathname.startsWith(item.path) ? '#eda634d3' : '#EDA634',
                                    color: location.pathname.startsWith(item.path) ? 'black' : 'white',
                                },
                            }}
                        >
                            <ListItemIcon sx={{
                                color: location.pathname.startsWith(item.path) ? 'black' : 'white',
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
                                            fontWeight: location.pathname.startsWith(item.path) ? 700 : 400,
                                        }
                                    }
                                }}
                            />
                            <PlayArrow sx={{fontSize: 26}} />
                        </MenuItem>
                    ))}
                </MenuList>
                <Divider />
            </Box>    
        </Box>
    )
}

export default Menu;