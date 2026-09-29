import { useEffect, useState } from "react";
import { Row, Col, Tabs } from "antd";

import { GET } from "../../../providers/useAxiosQuery";
import TableUserRolePermission from "./components/TableUserRolePermission";
import optionUserType from "../../../providers/optionUserType";

export default function PageUserPermissions() {
    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "id",
        sort_order: "asc",
        role: "Super Admin",
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/user_role_permission?${new URLSearchParams(tableFilter)}`,
        "user_role_permission_list",
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    const handleTabChange = (key) => {
        setTableFilter((ps) => ({ ...ps, role: key }));
    };

    return (
        <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24}>
                <Tabs
                    onChange={handleTabChange}
                    defaultActiveKey="1"
                    // type="card"
                    items={optionUserType.map((item) => ({
                        key: item.value,
                        label: item.label,
                        children: (
                            <TableUserRolePermission
                                dataSource={dataSource}
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                                user_role_id={item.id}
                            />
                        ),
                    }))}
                />
            </Col>
        </Row>
    );
}
