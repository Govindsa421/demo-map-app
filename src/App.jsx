import { useState, useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import Modal from './components/Modal/Modal'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowUpTrayIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'

const MapApp = () => {
  const mapContainer = useRef()
  const mapInstance = useRef(null)
  const drawControl = useRef()

  const [modalData, setModalData] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dropdownVisible, setDropdownVisible] = useState(null) // Track which dropdown is open

  const [viewState] = useState({
    center: [-100.43, 35],
    zoom: 5,
    pitch: 50,
  })

  useEffect(() => {
    mapInstance.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      ...viewState,
    })

    drawControl.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: { line_string: false, polygon: false, trash: false },
    })

    mapInstance.current.addControl(drawControl.current, 'top-right')
    mapInstance.current.addControl(new maplibregl.NavigationControl(), 'bottom-right')
    mapInstance.current.addControl(new maplibregl.GeolocateControl(), 'bottom-right')

    const handleKeyPress = (event) => {
      if (event.key === 'Enter') generateModalData()
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      mapInstance.current.remove()
    }
  }, [viewState])

  const calculateDistance = (coord1, coord2) => {
    const toRadians = (deg) => (deg * Math.PI) / 180
    const [lon1, lat1] = coord1
    const [lon2, lat2] = coord2

    // Earth's radius in meters
    const R = 6371000
    const φ1 = toRadians(lat1)
    const φ2 = toRadians(lat2)
    const Δφ = toRadians(lat2 - lat1)
    const Δλ = toRadians(lon2 - lon1)

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    // Distance in meters
    return R * c
  }

  const handleInsertPolygon = (index, position) => {
    drawControl.current.changeMode('draw_polygon')
    mapInstance.current.getCanvas().style.cursor = 'crosshair'
    setDropdownVisible(null)
  }

  const generateModalData = () => {
    const features = drawControl.current.getAll()

    if (!features || features.features.length === 0) {
      alert('No features drawn!')
      return
    }

    const feature = features.features[0] // Use the first feature
    const isPolygon = feature.geometry.type === 'Polygon'
    const coordinates = isPolygon ? feature.geometry.coordinates[0] : feature.geometry.coordinates
    const processedCoords = coordinates.map((coord, index) => ({
      WP: `${index.toString().padStart(2, '0')}`,
      Coordinates: `${coord[1].toFixed(8)}, ${coord[0].toFixed(8)}`,
      Distance: index > 0 ? calculateDistance(coordinates[index - 1], coord) : 0,
    }))

    setModalData({
      title: isPolygon ? 'Polygon Waypoints' : 'LineString Waypoints',
      content: (
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
                    onClick={
                      () => setDropdownVisible(dropdownVisible === idx ? null : idx) // Toggle dropdown visibility for the clicked row
                    }
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
      ),
    })
    setIsModalOpen(true)
  }

  const drawPolygon = () => {
    drawControl.current.changeMode('draw_polygon')
    mapInstance.current.getCanvas().style.cursor = 'crosshair'
  }

  const drawLineString = () => {
    drawControl.current.changeMode('draw_line_string')
    mapInstance.current.getCanvas().style.cursor = 'pointer'
  }

  const deleteAllFeatures = () => {
    drawControl.current.deleteAll()
    setModalData(null)
    setIsModalOpen(false)
    mapInstance.current.getCanvas().style.cursor = ''
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div id='map' ref={mapContainer} style={{ width: '100%', height: '100%', position: 'absolute' }}></div>

      <div className='absolute space-x-4 p-2'>
        <button className='bg-red-500 text-white p-2 rounded' onClick={drawPolygon}>
          Draw Polygon
        </button>
        <button className=' bg-blue-500 text-white p-2 rounded' onClick={drawLineString}>
          Draw LineString
        </button>
        <button className=' bg-gray-500 text-white p-2 rounded' onClick={deleteAllFeatures}>
          Delete All
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalData?.title}
        header='Mission Creation'
        content={modalData?.content}
      />
    </div>
  )
}

export default MapApp
