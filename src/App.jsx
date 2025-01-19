/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import Modal from './components/Modal/Modal'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import MapControls from './components/map/MapControls'
import TableComponent from './components/map/TableComponent'

const MapApp = () => {
  const mapContainer = useRef()
  const mapInstance = useRef(null)
  const drawControl = useRef()

  const [modalData, setModalData] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPolygonToolModalOpen, setIsPolygonToolModalOpen] = useState(false)
  const [dropdownVisible, setDropdownVisible] = useState(null) // Track which dropdown is open
  const [polygonToolData, setPolygonToolData] = useState(null)

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

    if (modalData && modalData.content && modalData.content[index]) {
      const [lat, lon] = modalData.content[index].Coordinates.split(', ').map(Number)
      mapInstance.current.flyTo({ center: [lon, lat], zoom: 15 })
    }
    setDropdownVisible(null)
  }

  const generateModalData = () => {
    const features = drawControl.current.getAll()

    if (!features || features.features.length === 0) {
      alert('No features drawn!')
      return
    }

    const feature = features.features[0]
    const isPolygon = feature.geometry.type === 'Polygon'
    const coordinates = isPolygon ? feature.geometry.coordinates[0] : feature.geometry.coordinates
    const processedCoords = coordinates.map((coord, index) => ({
      WP: `${index.toString().padStart(2, '0')}`,
      Coordinates: `${coord[1].toFixed(8)}, ${coord[0].toFixed(8)}`,
      Distance: index > 0 ? calculateDistance(coordinates[index - 1], coord) : 0,
    }))

    setModalData({
      title: isPolygon ? 'Polygon Waypoints' : 'LineString Waypoints',
      content: processedCoords,
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

  const onDropdownClick = (idx) => {
    setDropdownVisible(dropdownVisible === idx ? null : idx)
  }

  const handlePolygonToolClick = () => {
    drawControl.current.changeMode('draw_polygon')
    mapInstance.current.getCanvas().style.cursor = 'crosshair'

    const handlePolygonDrawComplete = () => {
      const features = drawControl.current.getAll()

      if (features.features.length > 0) {
        const feature = features.features[features.features.length - 1]
        if (feature.geometry.type === 'Polygon') {
          const coordinates = feature.geometry.coordinates[0]
          const processedCoords = coordinates.map((coord, index) => ({
            WP: `${index.toString().padStart(2, '0')}`,
            Coordinates: `${coord[1].toFixed(8)}, ${coord[0].toFixed(8)}`,
            Distance: index > 0 ? calculateDistance(coordinates[index - 1], coord) : 0,
          }))

          setPolygonToolData({
            title: 'Polygon Tool Coordinates',
            content: processedCoords,
          })

          setIsPolygonToolModalOpen(true)
          setIsModalOpen(false)
        }
      }
      mapInstance.current.off('draw.create', handlePolygonDrawComplete)
    }
    mapInstance.current.on('draw.create', handlePolygonDrawComplete)
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div id='map' ref={mapContainer} style={{ width: '100%', height: '100%', position: 'absolute' }}></div>
      <MapControls
        drawPolygon={drawPolygon}
        drawLineString={drawLineString}
        deleteAllFeatures={deleteAllFeatures}
        handlePolygonToolClick={handlePolygonToolClick}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalData?.title}
        header='Mission Creation'
        btnName='Generate Data'
        content={
          <TableComponent
            processedCoords={modalData?.content}
            dropdownVisible={dropdownVisible}
            onClick={onDropdownClick}
            handleInsertPolygon={handleInsertPolygon}
          />
        }
      />
      <Modal
        isOpen={isPolygonToolModalOpen}
        onClose={() => setIsPolygonToolModalOpen(false)}
        title={polygonToolData?.title}
        header='Polygon Tool'
        btnName='Imports Points'
        content={<TableComponent processedCoords={polygonToolData?.content} />}
      />
    </div>
  )
}

export default MapApp
