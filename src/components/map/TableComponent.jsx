/* eslint-disable react/prop-types */
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowUpTrayIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'

const TableComponent = ({ processedCoords, dropdownVisible, onClick, handleInsertPolygon }) => {
  return (
    <table className='w-full text-left border-collapse'>
      <thead>
        <tr>
          <th className='p-2 border-b-2 border-gray-300'>WP</th>
          <th className='p-2 border-b-2 border-gray-300'>Coordinates</th>
          <th className='p-2 border-b-2 border-gray-300'>Distance</th>
          <th className='p-2 border-b-2 border-gray-300'>
            <ArrowUpTrayIcon className='w-6 h-6 text-blue-400' />
          </th>
        </tr>
      </thead>
      <tbody>
        {processedCoords.map((item, idx) => (
          <tr key={idx} className='border-b'>
            <td className='p-2 text-gray-600 font-semibold'>{item.WP}</td>
            <td className='p-2 text-gray-600'>{item.Coordinates}</td>
            <td className='p-2 text-gray-600'>{item.Distance > 0 ? item.Distance.toFixed(2) : '--'}</td>
            <td className='p-2 text-gray-600 relative'>
              <EllipsisVerticalIcon
                className='h-6 w-6 text-gray-800 cursor-pointer'
                onClick={() => {
                  onClick(idx)
                }}
              />

              {/* Dropdown Menu */}
              {dropdownVisible === idx && (
                <div className='absolute right-0 bg-white shadow-lg border rounded-md mt-2 z-10'>
                  <ul className='text-gray-700'>
                    <li
                      className='px-4 py-2 w-52 flex gap-2 items-center cursor-pointer hover:bg-gray-100'
                      onClick={() => handleInsertPolygon(idx, 'before')}
                    >
                      <ArrowLeftStartOnRectangleIcon className='w-4 h-4' />
                      <p>Insert Polygon Before</p>
                    </li>
                    <li
                      className='px-4 py-2 w-52 flex gap-2 cursor-pointer items-center hover:bg-gray-100'
                      onClick={() => handleInsertPolygon(idx, 'after')}
                    >
                      <ArrowRightStartOnRectangleIcon className='w-4 h-4' />
                      <p>Insert Polygon After</p>
                    </li>
                  </ul>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default TableComponent
