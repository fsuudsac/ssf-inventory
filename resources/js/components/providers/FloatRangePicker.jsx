import React, { useState } from "react";
import { DatePicker } from "antd";
import PropTypes from "prop-types";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function FloatRangePicker(props) {
    const {
        label,
        value,
        placeholder,
        required,
        popupClassName,
        format,
        picker,
        disabled,
        disabledDate, // Optional
        id,
        onChange,
        allowClear,
        className,
        size = "large",
        onBlur,
    } = props;

    const [focus, setFocus] = useState(false);
    const [from, setFrom] = useState(null); // Store the first selected date

    const new_placeholder = placeholder || label;
    const isOccupied = focus || (value && value.length !== 0);
    const labelClass = isOccupied ? "label float-label" : "label";
    const requiredMark = required ? (
        <span className="text-danger">*</span>
    ) : null;

    const handleChange = (dates) => {
        if (onChange) {
            onChange(dates);
        }
        // Clear the 'from' state if dates are cleared
        if (!dates || dates.length === 0) {
            setFrom(null);
        }
    };

    return (
        <div
            id={id ?? ""}
            className={`float-wrapper float-range-picker ${className ?? ""}`}
            onBlur={() => setFocus(false)}
            onFocus={() => setFocus(true)}
        >
            <RangePicker
                onChange={handleChange}
                onBlur={onBlur}
                value={value || null}
                size={size}
                placeholder={[""]}
                popupClassName={popupClassName || ""}
                format={format || "YYYY"}
                allowClear={allowClear ?? false}
                picker={picker || "year"}
                disabled={disabled || false}
                disabledDate={(current) => {
                    if (disabledDate) {
                        return disabledDate(current, { from, type: picker });
                    }
                    return false;
                }}
                onCalendarChange={(dates) => {
                    if (dates && dates[0]) {
                        setFrom(dayjs(dates[0]));
                    } else {
                        setFrom(null);
                    }
                }}
            />

            <label className={labelClass}>
                {isOccupied ? label : new_placeholder} {requiredMark}
            </label>
        </div>
    );
}

FloatRangePicker.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.array,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    popupClassName: PropTypes.string,
    format: PropTypes.string,
    picker: PropTypes.string,
    disabled: PropTypes.bool,
    disabledDate: PropTypes.func, // Optional
    id: PropTypes.string,
    onChange: PropTypes.func,
    allowClear: PropTypes.bool,
    className: PropTypes.string,
    size: PropTypes.oneOf(["small", "middle", "large"]),
    onBlur: PropTypes.func,
};
