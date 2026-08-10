// Function to format a number to a specified currency
const formatToCurrency = (
    number,
    currency = "PHP",
    maxDecimal = 2,
    minDecimal = 2
) => {
    return new Intl.NumberFormat("en-US", {
        style: "decimal",
        currency: currency,
        minimumFractionDigits: minDecimal,
        maximumFractionDigits: maxDecimal,
    }).format(number);
};
export default formatToCurrency;
