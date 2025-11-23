export const formatPan = (pan: string) => {
  return `${pan.substring(0, 4)} •••• •••• ${pan.substring(pan.length - 4)}`;
};

export const formatExpDate = (expDate: string) => {
  return `${expDate.substring(0, 2)}/${expDate.substring(2, 4)}`;
};
