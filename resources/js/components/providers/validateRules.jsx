import { isValidPhoneNumber } from "react-phone-number-input";

const validateRules = {
    required: {
        required: true,
        message: "This field is required",
    },
    quillValidator: {
        validator: async (_, value) => {
            if (!value || value === "<p><br></p>") {
                return Promise.reject(new Error("This field is required."));
            }
        },
    },
    email: {
        type: "email",
        message: "Invalid email address",
    },
    email_validate: ({ getFieldValue }) => ({
        validator(_, value) {
            if (!value || getFieldValue("email") === value) {
                return Promise.resolve();
            }
            return Promise.reject(
                new Error("The two emails that you entered do not match!"),
            );
        },
    }),

    username_validate: {
        pattern: new RegExp(/^[A-Za-zÑñ0-9._]+$/),
        message: "Please use letters and period in this field",
    },

    // validate that no input space in the beginning and end
    input_start: {
        validator: (_, value) => {
            if (value && (value[0] === "-" || value[0] === ".")) {
                return Promise.reject(
                    new Error("Input cannot start with symbols"),
                );
            }
            if (
                (value && value[value.length - 1] === "-") ||
                value[value.length - 1] === "."
            ) {
                return Promise.reject(
                    new Error("Input cannot end with symbols"),
                );
            }
            return Promise.resolve();
        },
    },

    trim: {
        message: "",
        validator: (_, value) => {
            if (value && (value[0] === "-" || value[0] === ".")) {
                return Promise.reject(
                    new Error("Input cannot start with symbols"),
                );
            }
            if (
                (value && value[value.length - 1] === "-") ||
                value[value.length - 1] === "."
            ) {
                return Promise.reject(
                    new Error("Input cannot end with symbols"),
                );
            }
            if (value && /^ *$/.test(value)) {
                return Promise.reject(new Error("Input cannot be only spaces"));
            }
            if (value && /\s\s+/.test(value)) {
                return Promise.reject(
                    new Error(
                        "Input cannot contain multiple consecutive spaces",
                    ),
                );
            }
            if (value && value.includes("..")) {
                return Promise.reject(
                    new Error(
                        "Input cannot contain multiple consecutive periods",
                    ),
                );
            }
            if (value && value.includes("--")) {
                return Promise.reject(
                    new Error("Input cannot contain multiple consecutive dash"),
                );
            }
            return Promise.resolve();
        },
    },
    height: {
        pattern: new RegExp(/^(0|[1-9][0-9]{0,2})$/),
        message: "Invalid Input",
    },

    weight: {
        pattern: new RegExp(/^(0|[1-9][0-9]*(\.[0-9]+)?)$/),
        message: "Invalid Input",
    },

    name_suffix: {
        validator: (_, value) => {
            // let suffix = [
            // 	"Jr",
            // 	"Sr",
            // 	"I",
            // 	"II",
            // 	"III",
            // 	"IV",
            // 	"V",
            // 	"VI",
            // 	"VII",
            // 	"VIII",
            // 	"IX",
            // 	"X",
            // ];

            // if (value && !suffix.includes(value)) {
            // 	return Promise.reject(new Error("Input is not a valid suffix name"));
            // }

            if (value && (value[0] === "-" || value[0] === ".")) {
            }
            if (value && /^ *$/.test(value)) {
                return Promise.reject(new Error("Input cannot be only spaces"));
            }
            if (value && /\s\s+/.test(value)) {
                return Promise.reject(
                    new Error(
                        "Input cannot contain multiple consecutive spaces",
                    ),
                );
            }
            if (value && value.includes("..")) {
                return Promise.reject(
                    new Error(
                        "Input cannot contain multiple consecutive periods",
                    ),
                );
            }
            return Promise.resolve();
        },
    },
    alphabet: {
        pattern: new RegExp(/^[A-Za-zÑñ -]+$/),
        message: "Please use letters and symbols - in this field",
    },
    alphabet_symbol: {
        pattern: new RegExp(/^[A-Za-zÑñ -.]+$/),
        message: "Please use letters and symbols -. only in this field",
    },

    address: {
        pattern: /^[A-Za-zÑñ()0-9 #+,.-]+$/,
        message: "Please use letters and symbols  #+,.-  in this field",
    },

    number: {
        pattern: /^[0-9\b]+$/,
        message: "Invalid Number",
    },
    phone: {
        pattern: /^\(\+63\)\s\d{3}\s\d{3}\s\d{4}$/,
        message: "Invalid Phone Number",
    },
    cell: {
        pattern: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        message: "Invalid Cell Number",
    },
    /** E.164 / international strings from `react-phone-number-input` (`FloatInputPhone`). */
    phone_international: {
        validator(_, value) {
            if (value === undefined || value === null || value === "") {
                return Promise.resolve();
            }
            return isValidPhoneNumber(value)
                ? Promise.resolve()
                : Promise.reject(new Error("Invalid Phone Number"));
        },
    },
    password: {
        pattern:
            /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,64}$/,
        message:
            "Please input at least 8 characters with uppercase, lowercase, numbers, and symbols",
    },
    password_validate: ({ getFieldValue }) => ({
        validator(_, value) {
            if (
                !value ||
                (getFieldValue("new_password") || getFieldValue("password")) ===
                    value
            ) {
                return Promise.resolve();
            }
            return Promise.reject(
                new Error("The two passwords that you entered do not match!"),
            );
        },
    }),
    username: ({ getFieldValue }) => ({
        validator(_, value) {
            if (
                !value
                    .toLowerCase()
                    .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    )
            ) {
                return Promise.resolve();
            }
            return Promise.reject(new Error("Invalid username format!"));
        },
    }),
    assessment_pattern: {
        pattern: new RegExp(
            /(^[E][F]$)|(^[A][I]$)|(^[A][R][T]$)|^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/,
        ),
        message: "Invalid value",
    },

    quillToolBar: {
        toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
            ],
            ["image", "video"],
            ["clean"],
        ],
        imageResize: {
            modules: ["Resize", "DisplaySize"],
        },
    },
    quillToolBarEmailTemplate: {
        toolbar: [
            [
                "bold",
                "italic",
                { list: "bullet" },
                { list: "ordered" },
                "blockquote",
                { align: [] },
            ],
        ],
    },
    quillFormats: [
        "header",
        "font",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
        "video",
    ],

    time12Hours: {
        // pattern: new RegExp(/^(1[0-2]|0?[1-9]):[0-5][0-9]$/),
        // message: "Invalid time format",
        validator: (_, value) => {
            if (!value) return Promise.resolve();
            if (value.includes("_"))
                return Promise.reject(new Error("Invalid time format!"));

            const [h, m] = value.split(":").map(Number);
            if (isNaN(h) || isNaN(m))
                return Promise.reject(new Error("Invalid time format!"));
            if (h < 1 || h > 12)
                return Promise.reject(new Error("Time is 12 hours format!"));
            if (m < 0 || m > 59)
                return Promise.reject(new Error("Time is 12 hours format!"));

            return Promise.resolve();
        },
    },

    time24Hours: {
        pattern: /^(2[0-3]|1[0-9]|0?[0-9]):[0-5][0-9]$/,
        message: "Invalid time format",
    },
};

export default validateRules;
