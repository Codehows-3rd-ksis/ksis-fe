import { type TestRows } from '../Types/TableHeaders/TestHeaders'
import { type UserTableRows } from "./TableHeaders/UserManageHeader"
import { type SettingTableRows } from './TableHeaders/SettingHeader'

export type SearchCategory<K extends string | number | symbol> = {
  id: number
  name: string
  value: K
}
export const getTestSearchCategory = () : SearchCategory<keyof TestRows>[] => [
    {id: 1, name: 'A', value: 'data1'},
    {id: 2, name: 'B', value: 'data2'},
    {id: 3, name: 'C', value: 'data3'},
]

export const getUserSearchCategory = (): SearchCategory<keyof UserTableRows>[] => [
    {id: 1, name: '아이디', value: 'loginId'},
    {id: 2, name: '이름', value: 'name'},
    {id: 3, name: '부서', value: 'dept'},
    {id: 4, name: '직위', value: 'rank'},
    {id: 5, name: '접속일', value: 'loginAt'},
]

export const getSettingSearchCategory = (): SearchCategory<keyof SettingTableRows>[] => [
    {id: 1, name: '데이터수집명', value: 'settingName'},
    {id: 2, name: 'URL', value: 'url'},
    {id: 3, name: 'USER-AGENT', value: 'userAgent'},
]