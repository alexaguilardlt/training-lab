export const formatDateToDDMMYYYY = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export const formatPace = (paceDecimalMinutes: number): string => {
  const minutes = Math.floor(paceDecimalMinutes);
  const seconds = Math.round((paceDecimalMinutes - minutes) * 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}