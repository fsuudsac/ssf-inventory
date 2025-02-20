import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArchive,
    faFileImport,
    faUsers,
} from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../providers/useAxiosQuery";
import PageEmployeeContext from "./components/PageEmployeeContext";
import ModalEmployeeFormImport from "./components/ModalEmployeeFormImport";
import CustomTabs from "../../../providers/CustomTabs";
import TabItemContentEmployee from "./components/TabItemContentEmployee";
import TabItemContentImportEmployee from "./components/TabItemContentImportEmployee";

export default function PageEmployees() {
    const navigate = useNavigate();
    const location = useLocation();

    const [toggleModalUploadExcel, setToggleModalUploadExcel] = useState(false);
    const [toggleModalPreview, setToggleModalPreview] = useState({
        open: false,
        data: null,
    });

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at_formatted",
        sort_order: "desc",
        status: "Active",
        employee_type: "Full Time",
        from: location.pathname,
    });

    useEffect(() => {
        console.log("location: ", location);

        return () => {};
    }, [location]);

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/profile?${new URLSearchParams(tableFilter)}`,
        "employee_list"
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    return (
        <PageEmployeeContext.Provider
            value={{
                dataSource,
                toggleModalUploadExcel,
                setToggleModalUploadExcel,
                tableFilter,
                setTableFilter,
                navigate,
                location,
                toggleModalPreview,
                setToggleModalPreview,
            }}
        >
            <CustomTabs
                defaultActiveKey="employee_active"
                items={[
                    {
                        key: "employee_active",
                        label: "Active Employees",
                        icon: <FontAwesomeIcon icon={faUsers} />,
                        iconSize: 30,
                        children: <TabItemContentEmployee tblId="active" />,
                    },
                    {
                        key: "employee_archived",
                        label: "Archived Employees",
                        icon: <FontAwesomeIcon icon={faArchive} />,
                        iconSize: 27,
                        children: <TabItemContentEmployee tblId="archived" />,
                    },
                    {
                        key: "employee_import",
                        label: "Import Employees",
                        icon: <FontAwesomeIcon icon={faFileImport} />,
                        iconSize: 27,
                        children: <TabItemContentImportEmployee />,
                    },
                ]}
                onChange={(key) => {
                    setTableFilter((ps) => ({
                        ...ps,
                        status:
                            key === "employee_active" ? "Active" : "Archived",
                    }));
                }}
            />

            <ModalEmployeeFormImport />
        </PageEmployeeContext.Provider>
    );
}
