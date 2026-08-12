import { useState } from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

export default function FloatInputPhone(props) {
	const {
		id = "",
		value,
		label = "",
		placeholder = "",
		required,
		international,
		countryCallingCodeEditable,
		disabled = false,
		size = "large",
		...rest
	} = props;

	const [focus, setFocus] = useState(false);

	let new_placeholder = placeholder ? placeholder : label;

	let isOccupied = focus || (value && value.length !== 0) || international;

	let labelClass = isOccupied ? " float-label" : "";

	let requiredMark = required ? <span className="text-red-600">*</span> : null;

	return (
		<div
			id={id}
			className={`float-wrapper input-phone-number${
				disabled ? " disabled" : ""
			}${size ? " " + size : ""}`}
			onBlur={() => setFocus(false)}
			onFocus={() => setFocus(true)}
		>
			<PhoneInput
				id={`${id}_inputphonenumber`}
				international={international ?? false}
				countryCallingCodeEditable={countryCallingCodeEditable ?? false}
				// defaultCountry={defaultCountry ? defaultCountry : "US"}
				// country={defaultCountry ? defaultCountry : "US"}
				// countries={["US", "PH"]}
				value={value}
				className={`ant-input-phone-number${size ? " " + size : ""}`}
				disabled={disabled}
				{...rest}
			/>
			<label
				className={`label${labelClass}${size ? " " + size : ""}`}
				htmlFor={`${id}_inputphonenumber`}
			>
				{isOccupied ? label : new_placeholder} {requiredMark}
			</label>
		</div>
	);
}
