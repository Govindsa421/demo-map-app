/* eslint-disable react/prop-types */
const MapControls = ({ drawPolygon, drawLineString, deleteAllFeatures, handlePolygonToolClick }) => {
  return (
    <div className='absolute space-x-4 p-2'>
      <button className='bg-red-500 text-white p-2 rounded' onClick={drawPolygon}>
        Draw Polygon
      </button>
      <button className=' bg-blue-500 text-white p-2 rounded' onClick={drawLineString}>
        Draw LineString
      </button>
      <button className=' bg-indigo-600 text-white p-2 rounded' onClick={handlePolygonToolClick}>
        Polygon Tool
      </button>
      <button className=' bg-gray-500 text-white p-2 rounded' onClick={deleteAllFeatures}>
        Delete All
      </button>
    </div>
  )
}

export default MapControls
