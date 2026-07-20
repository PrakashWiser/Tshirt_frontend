export const getPositionFromMapLink = (mapLink: any) => {
  if (typeof mapLink !== "string") {
    return null;
  }
  const match = mapLink.match(/q=([-0-9.]+),([-0-9.]+)/);
  if (!match) return null;

  return {
    lat: Number(match[1]),
    lng: Number(match[2]),
  };
};
