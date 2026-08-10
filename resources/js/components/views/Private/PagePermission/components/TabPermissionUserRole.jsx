import { useEffect, useState } from "react";
import { Tabs } from "antd";

import { GET } from "../../../../providers/useAxiosQuery";
import optionUserType from "../../../../providers/optionUserType";
import TableUserRolePermission from "./TableUserRolePermission";

export default function TabPermissionUserRole() {
    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "module_code",
        sort_order: "asc",
        system_id: 1,
        user_role_id: 1,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/user_role_permission?${new URLSearchParams(tableFilter)}`,
        "user_role_permission_list"
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    const handleTabChange = (key) => {
        setTableFilter((ps) => ({ ...ps, user_role_id: key }));
    };

    return (
        <Tabs
            onChange={handleTabChange}
            defaultActiveKey="1"
            type="card"
            items={[
                ...(optionUserType
                    ? optionUserType.map((item) => ({
                          key: item.value,
                          label: item.label,
                          children: (
                              <TableUserRolePermission
                                  dataSource={dataSource}
                                  tableFilter={tableFilter}
                                  setTableFilter={setTableFilter}
                              />
                          ),
                      }))
                    : []),
            ]}
        />
    );
}
