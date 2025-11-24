import { useState, useEffect } from "react"
import { Box, Typography } from '@mui/material'

// Components
// import CustomTextField from "../component/CustomTextField"
import CustomButton from "../component/CustomButton"
import SearchHeader from "../component/SearchHeader"

// Table
import CommonTable from "../component/CommonTable"
import { getTestColumns, type TestRows } from '../Types/TableHeaders/TestHeaders'

// Search
import { getTestSearchCategory } from "../Types/Search"

function Test() {
  // TextField
  // const [testData, setTestData] = useState({
  //   field1: "",
  //   field2: "",
  // })
  // const handleInputChange = (key: keyof typeof testData, value: string) => {
  //   setTestData((prev) => ({ ...prev, [key]: value }))
  // }

  // // Button
  // const handleButtonClick = () => {
  //   alert('버튼 클릭')
  // }

  // Table
  const [baseRows, setBaseRows] = useState<TestRows[]>([])
  const [filteredRows, setFilteredRows] = useState<TestRows[]>([])  //  검색 결과
  const [selectedRows, setSelectedRows] = useState<TestRows[]>([])  //  선택된 행
  const [isDeleteMode, setIsDeleteMode] = useState(false) // 삭제 모드(체크박스 다중 선택) 여부


  useEffect(() => {
    const data = [
      { id: 1, data1: '테스트1', data2: '테스트2', data3: '테스트3' },
      { id: 2, data1: '테스트4', data2: '테스트5', data3: '테스트6' },
      { id: 3, data1: '테스트7', data2: '테스트8', data3: '테스트9' },
    ]
    setBaseRows(data)
    // setFilteredRows(data)
  }, [])

  const handleRowSelect = (row: TestRows) => { //setSelect기능 함수 래핑
    setSelectedRows([row]) //배열형태로 저장
  }

  // const handleEdit = (row: TestRows) => console.log('수정', row)
  // const handleDelete = (id: number) => console.log('삭제', id)

  // const columns = getTestColumns({ handleEdit, handleDelete })

  const handleEdit = () => {
    if (selectedRows.length === 0) {
      alert("수정할 항목을 선택하세요.")
      return
    }
    console.log("수정:", selectedRows)
    alert(`${selectedRows[0].data1} 항목 수정 실행`)
  }

  // const handleDeleteModeToggle = () => {
  //   setIsDeleteMode((prev) => !prev)
  //   setSelectedRows([]) // ✅ 삭제 모드 전환 시 선택 초기화
  // }

  // const handleDeleteConfirm = () => {
  //   if (selectedRows.length === 0) return alert("삭제할 항목을 선택하세요.")
  //     //삭제로직
  //   // const remaining = baseRows.filter((r) => !selectedRows.some((s) => s.id === r.id))
  //   // setBaseRows(remaining)
  //   // setFilteredRows(remaining)
  //   // setSelectedRows([])
  //   // setIsDeleteMode(false) // ✅ 삭제 후 일반 모드 복귀
  //   console.log('삭제', selectedRows[0])
  // }

  //삭제로직 분기
  /** ✅ 삭제 버튼 클릭 시 로직 분기 */
  const handleDelete = () => {
    if (isDeleteMode) {
      //삭제 ->다중선택모드 진입 [체크박스 선택 → 삭제확인 → 실제 삭제 실행]
      if (selectedRows.length === 0) return alert("삭제할 항목을 선택하세요.")

      //개발모드
      console.log('삭제', selectedRows[0])

      // //삭제로직
      // const remaining = baseRows.filter((r) => !selectedRows.some((s) => s.id === r.id))
      // setBaseRows(remaining)
      // setFilteredRows(remaining)
      // setSelectedRows([])
      // setIsDeleteMode(false) // 모드 해제
      // alert("선택된 항목이 삭제되었습니다.")
    } 
    else { // 단일행 선택 시 즉시 삭제, 없으면 다중선택 모드 진입

      // 단일행 선택 → 삭제
      if (selectedRows.length === 1) {
        

        //개발모드
        console.log('삭제', selectedRows[0])
      
        // //삭제로직
        // const idToDelete = selectedRows[0].id
        // const remaining = baseRows.filter((r) => r.id !== idToDelete)
        // setBaseRows(remaining)
        // setFilteredRows(remaining)
        // setSelectedRows([])
        // alert("해당 행이 삭제되었습니다.")
      }

      else {
        // 삭제 → 다중 삭제 모드 진입
        setIsDeleteMode(true)
        setSelectedRows([])
        // alert("삭제할 항목을 선택하세요.")
      }
    }
  }

  const handleCancelDeleteMode = () => {
    setIsDeleteMode(false)
    setSelectedRows([])
    
}


  const columns = getTestColumns({
    handleEdit: (row) => console.log("행 내부 수정", row),
    handleDelete: (id) => console.log("행 내부 삭제", id),
  })


  return (
    <Box sx={{ width: '100vw', height: '100vh' }}>
      <Typography sx={{ color: 'black', fontSize: 40 }}>테스트 페이지</Typography>

      {/* TextField
      <Box>
        <CustomTextField 
          label="라벨"
          variant="outlined"
          value={testData.field1}
          inputWidth="300px"
          disabled={false}
          readOnly={false}
          placeholder="테스트"
          type="text"
          onChange={(e) => handleInputChange('field1', e.target.value)}
        />
      </Box>

      <CustomButton text="클릭" onClick={handleButtonClick} /> */}

      {/* 검색 헤더 */}
      <SearchHeader 
        baseRows={baseRows} 
        setFilteredRows={setFilteredRows}
        getSearchCategory={getTestSearchCategory}
      />

         <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {!isDeleteMode ? (
            <>
            <CustomButton
              text="수정"
              backgroundColor="#1976d2"
              onClick={handleEdit}
            />
            <CustomButton
              text="삭제"
              backgroundColor="#432121"
              // onClick={isDeleteMode ? handleDeleteConfirm : handleDeleteModeToggle}
              onClick={handleDelete}
            />
            </>
          ):(
            <>
            <CustomButton
              text="확인"
              backgroundColor="#432121"
             
              onClick={handleDelete}
            />
            <CustomButton
          text="취소"
          backgroundColor="grey"
          onClick={handleCancelDeleteMode}
          />
          </>
          )
          }
        
        {/* <CustomButton
          text={isDeleteMode ? "확인" : "삭제"}
          backgroundColor={isDeleteMode ? "#c62828" : "#432121"}
          // onClick={isDeleteMode ? handleDeleteConfirm : handleDeleteModeToggle}
          onClick={handleDelete}
        /> */}

        {/* {isDeleteMode && (
          <CustomButton
          text="취소"
          backgroundColor="grey"
          onClick={handleCancelDeleteMode}
          />
        )} */}

      </Box>
      {/* 테이블 */}
      <Box sx={{ padding: 2 }}>
        <CommonTable 
          columns={columns}
          rows={filteredRows.length > 0 ? filteredRows : baseRows}  //  검색 결과 우선 표시
          // onRowClick={(params) => setSelectedRows([params.row])}    //  클릭 시 선택 행 저장
          selectedRows={selectedRows} // ✅ 선택된 상태 전달
          onRowClick={(params) => handleRowSelect(params.row)}
          onRowSelectionChange={(ids) => {
            const currentRows = filteredRows.length > 0 ? filteredRows : baseRows; // ✅ 실제 표시 중인 데이터
            const selectedData = currentRows.filter((row) => ids.includes(row.id));
            setSelectedRows(selectedData);  // ✅ 선택/해제 모두 반영
        }}
          // check={true}
          check={isDeleteMode}
        />
      </Box>
    </Box>
  )
}

export default Test


// import { useState, useEffect } from "react"
// import { Box, Typography, type SelectChangeEvent } from '@mui/material'

// // Components
// import CustomTextField from "../component/CustomTextField"
// import CustomButton from "../component/CustomButton"
// import SearchHeader from "../component/SearchHeader"

// // Table
// import CommonTable from "../component/CommonTable"
// import { getTestColumns, type TestRows } from '../Types/TableHeaders/TestHeaders'

// // Search
// import { getUserSearchCategory } from "../Types/Search"

// function Test() {

//   // TextField
//   const [testData, setTestData] = useState({
//     field1: "",
//     field2: "",
//   })
//   const handleInputChange = (key: keyof typeof testData, value: string) => {
//         setTestData((prev) => ({ ...prev, [key]: value }));
//   };

//   // Button
//   const handleButtonClick = () => {
//     alert('버튼 클릭')
//   }

//   // Table
//   const [baseRows, setBaseRows] = useState<TestRows[]>([])
//   const [filteredRows, setFilteredRows] = useState<TestRows[]>([])

//   useEffect(()=> {
//     const data=[
//       {id: 1, data1: '테스트1', data2: '테스트2', data3: '테스트3'},
//       {id: 2, data1: '테스트4', data2: '테스트5', data3: '테스트6'},
//       {id: 3, data1: '테스트7', data2: '테스트8', data3: '테스트9'},
//     ]
//     setBaseRows(data)
//     setFilteredRows(data)
    
//     setSearchList(getUserSearchCategory())

//   }, [])

//   const handleEdit = (row: TestRows) => console.log('수정', row);
//   const handleDelete = (id: number) => console.log('삭제', id);

//   const columns = getTestColumns({ handleEdit, handleDelete });

//   // // Search
//   const [isSearch, setIsSearch] = useState(false)
//   const [searchList, setSearchList] = useState<{id:number, name: string, value: string}[]>([]) 

//   return (
//     <Box sx={{ width: '100vw', height: '100vh'}}>
//       <Typography sx={{
//         color: 'black', fontSize: 40
//       }}>테스트 페이지</Typography>
//       {/*  */}
//       <Box>
//         <CustomTextField 
//           label="라벨"
//           variant="outlined"
//           value={testData.field1}
//           inputWidth="300px"
//           disabled={false}
//           readOnly={false}
//           placeholder="테스트"
//           type="text"
//           onChange={(e) => handleInputChange('field1', e.target.value)}
//         />
//       </Box>
//       {/*  */}
//       <CustomButton text="클릭" onClick={handleButtonClick} />
//       {/*  */}
//       <SearchHeader  baseRows={baseRows} setFilteredRows={setFilteredRows}/>
     
//       {/* 테이블 영역 */}
//       <Box sx={{padding: 2}}>
//           { isSearch ? (
//               <CommonTable 
//               columns={columns}
//               rows={filteredRows}
//               />
//           ) : (
//               <CommonTable 
//                   columns={columns}
//                   rows={baseRows}
//               />
//           )}
//       </Box>
//     </Box>
//   )
// }

// export default Test
