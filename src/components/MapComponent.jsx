import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 1. 위에서 만든 함수들 가져오기
import { fetchRoute } from '../../api/direction.jsx';
import { createMarker } from './MapControls.jsx';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);

  const [lng, setLng] = useState(126.7052);
  const [lat, setLat] = useState(37.4563);
  const [coords, setCoords] = useState({ start: null, end: null });

 useEffect(() => {
  if (map.current) return;
  
  map.current = new mapboxgl.Map({
    container: mapContainer.current,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [lng, lat],
    zoom: 14
  });

  map.current.on('move', () => {
    const center = map.current.getCenter();
    setLng(center.lng.toFixed(4));
    setLat(center.lat.toFixed(4));
  });

  // 아래 주석을 바로 윗줄에 추가하면 ESLint 경고가 사라집니다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  // 2. 경로 그리기 (API 호출 및 레이어 추가)
  const drawRoute = async (start, end) => {
    try {
      const routeCoords = await fetchRoute(start, end, mapboxgl.accessToken);
      
      const geojson = {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: routeCoords }
      };

      if (map.current.getSource('route')) {
        map.current.getSource('route').setData(geojson);
      } else {
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: { type: 'geojson', data: geojson },
          paint: { 'line-color': '#3887be', 'line-width': 5 }
        });
      }
    } catch (e) { alert(e.message); }
  };

  // 3. 버튼 클릭 시 실행될 함수 (마커 찍기 + 경로 트리거)
  const setPoint = (type) => {
    const pos = [parseFloat(lng), parseFloat(lat)];
    const color = type === 'start' ? '#2ecc71' : '#e74c3c';
    const label = type === 'start' ? '출발지' : '도착지';
    const ref = type === 'start' ? startMarkerRef : endMarkerRef;

    // 마커 유틸리티 사용
    createMarker(map.current, pos, color, label, ref);
    
    // 좌표 상태 업데이트
    const newCoords = { ...coords, [type]: pos };
    setCoords(newCoords);

    // 둘 다 찍혔으면 경로 그리기
    if (newCoords.start && newCoords.end) {
      drawRoute(newCoords.start, newCoords.end);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div style={sidebarStyle}>
        <div>중앙 경도: {lng} | 위도: {lat}</div>
        <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
          <button onClick={() => setPoint('start')}>출발지로 설정</button>
          <button onClick={() => setPoint('end')}>도착지로 설정</button>
        </div>
      </div>
      <div style={crosshairStyle}>📍</div>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

const sidebarStyle = { position: 'absolute', top: 10, left: 10, zIndex: 1, background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' };
const crosshairStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)', zIndex: 1, fontSize: '30px', pointerEvents: 'none' };

export default MapComponent;