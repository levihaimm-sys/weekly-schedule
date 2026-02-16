export function getWazeUrl(street: string, city: string): string {
  const query = encodeURIComponent(`${street}, ${city}, ישראל`);
  return `https://waze.com/ul?q=${query}&navigate=yes`;
}
