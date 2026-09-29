import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

import PublicLayout from "../layouts/public/Public";
import { userData } from "../providers/appConfig";

export default function PublicRoute(props) {
    const { component: Component, ...rest } = props;

    const token = localStorage.getItem("token");
    const user = userData();

    if (!token || !user) {
        return (
            <PublicLayout {...rest}>
                <Component {...rest} />
            </PublicLayout>
        );
    } else {
        return <Navigate to="/dashboard" replace />;
    }
}

PublicRoute.propTypes = {
    component: PropTypes.elementType.isRequired,
};
