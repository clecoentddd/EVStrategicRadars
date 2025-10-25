// utils/GetRadarData.js
export async function GetRadar(radarId) {
  const response = await fetch(`/api/organisations-fetch?id=${radarId}`);
  if (!response.ok) throw new Error('Failed to fetch radar');
  return await response.json();
}

export async function GetRadarItems(radarId) {
  const response = await fetch(`/api/radar-items?radarId=${radarId}`);
  if (!response.ok) throw new Error('Failed to fetch radar items');
  return await response.json();
}

export async function GetRadarConfig() {
  const response = await fetch('/api/radar_config');
  if (!response.ok) throw new Error('Failed to fetch config');
  return await response.json();
}

export async function GetAllRadars() {
  const response = await fetch('/api/organisations-fetch');
  if (!response.ok) throw new Error('Failed to fetch radars');
  return await response.json();
}
