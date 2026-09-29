import TablePermission from "./TablePermission";

export default function TabPermissionUserRole(props) {
    const { tabParentActive, userRole, userRoleName } = props;

    return (
        <TablePermission
            tabParentActive={tabParentActive}
            userRole={userRole}
            userRoleName={userRoleName}
        />
    );
}
