import { Collapse } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/pro-regular-svg-icons";

export default function CustomCollapse(props) {
    const {
        activeKey = ["0"],
        expandIconPosition = "end",
        items = [],
        ...rest
    } = props;

    return (
        <Collapse
            className="custom-collapse"
            activeKey={activeKey}
            expandIconPosition={expandIconPosition}
            expandIcon={({ isActive }) =>
                isActive ? (
                    <FontAwesomeIcon icon={faAngleUp} />
                ) : (
                    <FontAwesomeIcon icon={faAngleDown} />
                )
            }
            items={items}
            {...rest}
        />
    );
}
