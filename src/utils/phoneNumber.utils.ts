export function isValidPhoneNumber(phoneNumber: string) {
    return (
        (phoneNumber.startsWith("0") && phoneNumber.length === 10) ||
        (!phoneNumber.startsWith("0") && phoneNumber.length === 9)
    );
}

export function phoneNumberToWhatsAppNumber(phoneNumber: string) {
    if (phoneNumber.startsWith("0")) {
        return `972${phoneNumber.slice(1)}`;
    }
    return `972${phoneNumber}`;
}
