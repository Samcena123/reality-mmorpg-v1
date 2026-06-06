export function getZoneLevel(lat: number, lng: number) {
  const seed = Math.abs(Math.sin(lat + lng) * 10000);

  if (seed % 10 > 7) return "DANGER";
  if (seed % 10 > 4) return "NORMAL";
  return "SAFE";
}