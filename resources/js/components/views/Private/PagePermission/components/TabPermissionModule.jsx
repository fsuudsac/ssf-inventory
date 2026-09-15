import TablePermission from "./TablePermission";

export default function TabPermissionModule(props) {
    const { tabParentActive, userRole } = props;

    return (
        <TablePermission
            tabParentActive={tabParentActive}
            userRole={userRole}
        />
    );
}
