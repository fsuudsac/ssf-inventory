// Function to format a number to a specified currency
const formatToCurrency = (
    number,
    currency = "PHP",
    style = "decimal",
    maxDecimal = 2,
    minDecimal = 2,
) => {
    return new Intl.NumberFormat("en-US", {
        style: style,
        currency: currency,
        minimumFractionDigits: minDecimal,
        maximumFractionDigits: maxDecimal,
    }).format(number);
};
export default formatToCurrency;
