import { flexRender, Table } from '@tanstack/react-table'
import AppEmpty from '../AppEmpty.tsx'
import { Spin } from 'antd'

type PropsType = {
  table: Table<any>
  render?: unknown
  loading?: boolean
}

const XTable: FC<PropsType> = memo(({ table, loading }) => {
  return (
    <Spin spinning={loading} className="overflow-hidden">
      <table className="border-separate border-spacing-0 min-w-full">
        <colgroup>
          {table.getLeafHeaders().map((column) => (
            <col
              key={column.id}
              style={{
                width: `${column.column.getSize()}px`,
              }}
            />
          ))}
        </colgroup>
        <thead className="sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="rounded overflow-hidden bg-[#2E3A46]"
            >
              {headerGroup.headers.map((column) => (
                <th
                  key={column.id}
                  colSpan={column.colSpan}
                  className={clsx(
                    'p-3 whitespace-nowrap font-normal text-white text-left',
                    'border-b border-r border-solid border-[#23272D]',
                    'first:rounded-tl last:border-r-0',
                  )}
                >
                  {column.isPlaceholder
                    ? null
                    : flexRender(
                        column.column.columnDef.header,
                        column.getContext(),
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
                    'h-[33px] leading-6 py-1 px-3 whitespace-nowrap font-normal text-white',
                    'border-r border-b border-solid border-[#23272D]',
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
})

XTable.displayName = 'XTable'

export default XTable
