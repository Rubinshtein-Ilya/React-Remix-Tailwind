export const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, "");

  let phoneNumbers = numbers;
  if (phoneNumbers.startsWith("8")) {
    phoneNumbers = "7" + phoneNumbers.substring(1);
  }

  phoneNumbers = phoneNumbers.substring(0, 11);

  if (phoneNumbers.length === 0) return "";
  if (phoneNumbers.length === 1 && phoneNumbers === "7") return "+7 ";
  if (phoneNumbers.startsWith("7")) {
    phoneNumbers = phoneNumbers.substring(1);
    let formatted = "+7 ";

    if (phoneNumbers.length > 0) {
      formatted += phoneNumbers.substring(0, 3);
    }
    if (phoneNumbers.length > 3) {
      formatted += " " + phoneNumbers.substring(3, 6);
    }
    if (phoneNumbers.length > 6) {
      formatted += "-" + phoneNumbers.substring(6, 8);
    }
    if (phoneNumbers.length > 8) {
      formatted += "-" + phoneNumbers.substring(8, 10);
    }

    return formatted;
  }

  return (
    "+7 " +
    phoneNumbers.substring(0, 3) +
    (phoneNumbers.length > 3 ? " " + phoneNumbers.substring(3, 6) : "") +
    (phoneNumbers.length > 6 ? "-" + phoneNumbers.substring(6, 8) : "") +
    (phoneNumbers.length > 8 ? "-" + phoneNumbers.substring(8, 10) : "")
  );
};
