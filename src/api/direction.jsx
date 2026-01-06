// 경로 주소 상수 선언
const BASE_URL= "https://api.mapbox.com/directions/v5"

//getRoute
export const getRoute = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Mapbox 경로 데이터를 불러오지 못했습니다.");
  }
  return await response.json();
};

// 이동 수단 설정
export const fetchRoute = async (start, end, token) => {
    const profile = "mapbox/driving"; // 자동차 도로 중심
    const coords = `${start[0]},${start[1]};${end[0]},${end[1]}`;  // url 주소 안에 출발지와 도착지 좌표 > 문자열 변환
    const url = `${BASE_URL}/${profile}/${coords}?geometries=geojson&access_token=${token}`; //옵션 나중게 깔끔하게 정리할게요
    try {
    const data = await getRoute(url);
    return data.routes[0].geometry.coordinates; // 경로 좌표 배열([ [lng, lat], [lng, lat] ... ]) 반환
  } catch (error) {
    console.error("fetchRoute 에러:", error.message);
    throw error; // 에러를 다시 던져서 컴포넌트에서 알림을 띄우게 함
  }
}
