// ex) "Tue, 28 Mar 2023 20:29:07 +0900" -> "2023-03-28T11:29:07.000Z"
export const convertDateFormatToISO = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = date.toISOString();
  return formattedDate;
};
