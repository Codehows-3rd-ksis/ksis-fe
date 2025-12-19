import { type GridColDef } from '@mui/x-data-grid';
import CustomButton from '../../component/CustomButton'

export interface TestRows {
    id: number,
    data1?: string,
    data2?: string,
    data3?: string,
}

// 외부에서 받을 핸들러들을 타입으로 정의
export interface TestColumnHandlers {
  handleEdit: (row: TestRows) => void;
  handleDelete: (id: number) => void;
}

// 핸들러를 주입받아 columns를 반환하는 함수
export const getTestColumns = ({
  handleEdit,
  handleDelete,
}: TestColumnHandlers): GridColDef[] => [
  { field: 'id', headerName: 'id', width: 70, headerAlign: 'center', align: 'center' },
  { field: 'data1', headerName: 'A', flex: 1, minWidth: 100, headerAlign: 'center', align: 'center' },
  { field: 'data2', headerName: 'B', flex: 1, minWidth: 100, headerAlign: 'center', align: 'center' },
  { field: 'data3', headerName: 'C', flex: 1, minWidth: 100, headerAlign: 'center', align: 'center' },
  {
    field: 'edit',
    headerName: '수정',
    width: 100,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <CustomButton
        width="50px"
        text="수정"
        onClick={() => handleEdit(params.row)}
      />
    ),
  },
  {
    field: 'del',
    headerName: '삭제',
    width: 100,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <CustomButton
        width="50px"
        text="삭제"
        backgroundColor="#fb1e1eff"
        onClick={() => handleDelete(params.row.id)}
      />
    ),
  },
];