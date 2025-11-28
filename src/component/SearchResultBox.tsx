import {useState, useEffect} from 'react'
import { Box, Typography } from '@mui/material';

import {type SearchResultBox_Type} from '../Types/Components';

export default function SearchResultBox(props: SearchResultBox_Type) {
    const {isSearch, searchCount} = props;
    const [localCount, setLocalCount] = useState<number>(searchCount??0);
    
    useEffect(() => {
        setLocalCount(searchCount?? 0);
    }, [searchCount]);

    return (
        <Box
          sx={{
            display: "flex",
            visibility: isSearch ? "visible" : "hidden", // ✅ 안 보이지만 자리 차지
            flexDirection: "column",
            justifyContent: "center",
            padding: 2,
            backgroundColor: "lightgrey",
            color: "black",
            minWidth: "200px",
            height: "50px",
            borderRadius: 1,
            // transition: "all 0.2s ease",
            // opacity: isSearch ? 1 : 0.5, // 🔸 검색 전엔 살짝 흐리게
          }}
        >
          {isSearch && (
            <>
              {localCount > 0 ? (
                <>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    검색 결과
                  </Typography>
                  <Typography variant="body1">
                    총 {localCount}건이 검색되었습니다.
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                  검색 결과 없음
                </Typography>
              )}
            </>
          )}
        </Box>
    );
  }