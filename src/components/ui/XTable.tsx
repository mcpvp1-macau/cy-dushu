import { flexRender, Table } from '@tanstack/react-table'
import AppEmpty from '../AppEmpty.tsx'
import { Popover, Spin, Switch } from 'antd'
import IconButtonWithDropDownDialog from './button/IconButtonWithDropDownDialog.tsx'
import IconSetting from '@/assets/icons/jsx/IconSetting.tsx'
import { CaretDownOutlined } from '@ant-design/icons'

type PropsType = {
  table: Table<any>
  render?: unknown
  loading?: boolean
}

const XTable: FC<PropsType> = ({ table, loading }) => {
  const state = table.getState()
  const isHaveVisible = Object.values(state.columnVisibility).length > 0

  return (
    <Spin spinning={loading} className="overflow-hidden">
      <table className="border-separate border-spacing-0 min-w-full">
        <colgroup>
          {table.getVisibleLeafColumns().map((column) => (
            <col
              key={column.id}
              style={{
                width: `${column.getSize()}px`,
              }}
            />
          ))}
        </colgroup>
        <thead className="sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="rounded overflow-hidden bg-ground-6"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className={clsx(
                    'p-3 whitespace-nowrap font-normal text-highlight text-left',
                    'border-b border-r border-solid border-ground-3',
                    'first:rounded-tl last:border-r-0',
                    (header.id === 'actions' ||
                      header.column.columnDef.enableColumnFilter) &&
                      'flex items-center justify-between',
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}

                  {header.column.columnDef.enableColumnFilter ? (
                    <div className="ml-3">
                      <Popover
                        // title={header.column.columnDef.header + '筛选'}
                        placement="bottomRight"
                        trigger={['click']}
                        styles={{
                          body: {
                            backgroundColor: '#16202b',
                            padding: 0,
                          },
                        }}
                        content={() => (
                          <div className="p-2 bg-ground-1">
                            {/* @ts-ignore */}
                            {header.column.columnDef.meta?.filterRender?.(
                              header.column,
                            )}
                          </div>
                        )}
                        rootClassName="[&_.ant-popover-arrow:before]:!bg-ground-1"
                      >
                        {/* <IconFilter /> */}
                        <CaretDownOutlined />
                      </Popover>
                    </div>
                  ) : null}
                  {isHaveVisible && header.id === 'actions' && (
                    <IconButtonWithDropDownDialog
                      title={'配置表头'}
                      tippyProps={{ content: '配置表头' }}
                      trigger={['click']}
                      popupRender={() => (
                        <div className="p-2">
                          <div className="text-sm text-highlight mb-2">
                            字段名称
                          </div>
                          {table
                            .getAllColumns()
                            .filter((column) => column.id !== 'actions')
                            .map((column) => (
                              <div
                                key={column.id}
                                className="flex items-center justify-between gap-2 mb-2 min-w-[160px]"
                              >
                                <span className="text-sm">
                                  {column.columnDef.header?.toString() ?? ''}
                                </span>
                                <Switch
                                  checked={column.getIsVisible()}
                                  disabled={!column.getCanHide()}
                                  onChange={column.toggleVisibility}
                                  size="small"
                                />
                              </div>
                            ))}
                        </div>
                      )}
                    >
                      <IconSetting className="cursor-pointer hover:text-primary-color-4" />
                    </IconButtonWithDropDownDialog>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="text-sm">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="bg-ground-4 hover:bg-ground-5">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={clsx(
                    'h-[33px] leading-6 py-1 px-3 whitespace-nowrap font-normal text-highlight',
                    'border-r border-b border-solid border-ground-3',
                    'last:border-r-0',
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td
                colSpan={table.getFlatHeaders().length}
                className="text-center py-4"
              >
                <div>
                  <AppEmpty />
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className=""></div>
    </Spin>
  )
}

XTable.displayName = 'XTable'

export default XTable
