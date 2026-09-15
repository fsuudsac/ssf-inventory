import TablePermission from "./TablePermission";

export default function TabPermissionUserRole(props) {
    const { tabParentActive, userRole } = props;

    return (
        <TablePermission
            tabParentActive={tabParentActive}
            userRole={userRole}
        />
    );
}
