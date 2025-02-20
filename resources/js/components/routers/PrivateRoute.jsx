import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

import PrivateLayout from "../layouts/private/Private";
import useCheckAuthStatus from "../providers/useCheckAuthStatus";

export default function PrivateRoute(props) {
    const { component: Component, layout = true, ...rest } = props;

    useCheckAuthStatus();

    let isLoggedIn = localStorage.getItem("token");

    if (isLoggedIn) {
        if (layout) {
            return (
                <PrivateLayout {...rest}>
                    <Component {...rest} />
                </PrivateLayout>
            );
        } else {
            return <Component {...rest} />;
        }
    } else {
        return <Navigate to="/" />;
    }
}

PrivateRoute.propTypes = {
    component: PropTypes.elementType.isRequired,
    layout: PropTypes.bool,
};
