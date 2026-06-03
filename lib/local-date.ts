function padDatePart(value: number) {
  return value.toString().padStart(2, "0");
}

export function getLocalDateAtNoon(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

export function getLocalIsoDate(date = new Date()) {
  const localDate = getLocalDateAtNoon(date);
  const year = localDate.getFullYear();
  const month = padDatePart(localDate.getMonth() + 1);
  const day = padDatePart(localDate.getDate());
  return `${year}-${month}-${day}`;
}
