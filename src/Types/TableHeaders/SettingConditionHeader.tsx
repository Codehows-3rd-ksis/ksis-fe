import { type GridColDef, type GridRenderEditCellParams  } from '@mui/x-data-grid';
import CustomButton from '../../component/CustomButton'
import CustomIconButton from '../../component/CustomIconButton';
import CustomSelect from '../../component/CustomSelect';
import { Box } from '@mui/material'

export interface ConditionTableRows {
    id: number,
    conditionsValue: string,
    attr: string,
    conditionsKey: string,
}

const attrList = [
        { value: 'text', name: '텍스트(text)' },
        { value: 'src', name: '이미지경로(src)' },
        { value: 'href', name: '링크(href)' },
];

// 외부에서 받을 핸들러들을 타입으로 정의
export interface ConditionTableColumnHandlers {
  handleAreaSelect: (rowId: number) => void;
  handleSelectChange: (row: ConditionTableRows, value: string) => void;
  handleCancel: (id: number) => void;
}

// 편집 모드 input 컴포넌트
function EditConditionsKey(props: GridRenderEditCellParams) {
  const { id, value, field, api } = props;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    api.setEditCellValue({ id, field, value: e.target.value }, e);
  };

  return (
    <input
      autoFocus
      style={{
        width: '100%',
        height: '30px',
        fontSize: '14px',
        padding: '4px 8px',
        borderRadius: 4,
        border: '1px solid #ccc',
      }}
      value={value ?? ''}
      onChange={onChange}
    />
  );
}



// 핸들러를 주입받아 columns를 반환하는 함수
export const getColumns = ({
  handleAreaSelect,
  handleSelectChange,
  handleCancel
}: ConditionTableColumnHandlers): GridColDef[] => {
  return [
    { field: 'conditionsValue', headerName: '추출영역', flex:2,
      renderCell: (params) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Box sx={{display:'flex', gap: 1, alignItems:"center"}}>
              <CustomButton 
                text="영역선택"
                onClick={()=>handleAreaSelect(params.row.id)} 
                radius={2}
                border="1px solid #757575"
                hoverStyle={{
                  backgroundColor: "#ba7d1bff",
                  border: "2px solid #373737ff",
                }}
              />
              {params.value}
            </Box>
          </Box>
        )
      }
    },
    { field: 'attr', headerName: '추출속성', flex:1,
      renderCell: (params) => ( 
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <CustomSelect 
              value={params.row.attr ?? ''}
              listItem={attrList}
              onChange={(e) => handleSelectChange(params.row, String(e.target.value))}
          /> 
        </Box>
      )
    },
    { field: 'conditionsKey', headerName: '추출값 명칭 지정(더블클릭 시 수정가능)', flex: 1,
      editable: true, // 편집 가능 설정
      renderEditCell: (params) => <EditConditionsKey {...params} />, // 편집 모드 렌더링
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', pl: 1 }}>
          {params.value}
        </Box>
      ),
    },
    { field: 'cancel', headerName: '', width: 70,
      renderCell: (params) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <CustomIconButton 
                icon='close'
                onClick={()=>handleCancel(params.row.id)} 
              />
          </Box>
        )
      }
    },
  ]
}
