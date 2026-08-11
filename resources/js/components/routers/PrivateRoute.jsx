import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

import PrivateLayout from "../layouts/private/Private";
import useCheckAuthStatus from "../providers/useCheckAuthStatus";
import useCheckUserPermission from "../providers/useCheckUserPermission";

function PrivateRouteAuthenticated(props) {
    const {
        component: Component,
        layout = true,
        moduleName,
        moduleCode,
        ...rest
    } = props;

    useCheckAuthStatus();

    const { dataPermissions, refetchPermissions } = useCheckUserPermission(
        moduleName,
        moduleCode,
    );

    if (layout) {
        return (
            <PrivateLayout
                dataPermissions={dataPermissions ? dataPermissions.data : []}
                refetchPermissions={refetchPermissions}
                moduleCode={moduleCode}
                moduleName={moduleName}
                {...rest}
            >
                <Component
                    dataPermissions={
                        dataPermissions ? dataPermissions.data : []
                    }
                    refetchPermissions={refetchPermissions}
                    moduleCode={moduleCode}
                    moduleName={moduleName}
                    {...rest}
                />
            </PrivateLayout>
        );
    }

    return (
        <Component
            dataPermissions={dataPermissions ? dataPermissions.data : []}
            refetchPermissions={refetchPermissions}
            moduleCode={moduleCode}
            moduleName={moduleName}
            {...rest}
        />
    );
}

PrivateRouteAuthenticated.propTypes = {
    component: PropTypes.elementType.isRequired,
    layout: PropTypes.bool,
};

export default function PrivateRoute(props) {
    const isLoggedIn = localStorage.getItem("token");

    if (!isLoggedIn) {
        return <Navigate to="/" replace />;
    }

    return <PrivateRouteAuthenticated {...props} />;
}

PrivateRoute.propTypes = {
    component: PropTypes.elementType.isRequired,
    layout: PropTypes.bool,
};
