// 마커 로직
import mapboxgl from 'mapbox-gl';

export const createMarker = (map, pos, color, label, ref) => {
  // 이전 마커가 있으면 지우기
  if (ref.current) ref.current.remove();

  // 새 마커 생성
  const marker = new mapboxgl.Marker({ color })
    .setLngLat(pos)
    .setPopup(new mapboxgl.Popup().setText(label))
    .addTo(map);

  // 다음에 지울 수 있도록 저장
  ref.current = marker;
};