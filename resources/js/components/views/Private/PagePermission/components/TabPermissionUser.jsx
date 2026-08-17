import TablePermission from "./TablePermission";

export default function TabPermissionUser(props) {
    const { tabParentActive, userRole } = props;

    return (
        <TablePermission
            tabParentActive={tabParentActive}
            userRole={userRole}
        />
    );
}
