import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArchive,
    faFileImport,
    faUsers,
} from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../providers/useAxiosQuery";
import CustomTabs from "../../../providers/CustomTabs";
import PageStudentsContext from "./components/PageStudentContext";
import TabItemContentStudent from "./components/TabItemContentStudent";
import TabItemContentImportStudent from "./components/TabItemContentImportStudent";
import ModalStudentFormImport from "./components/ModalStudentFormImport";

export default function PageStudents() {
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
        from: location.pathname,
    });

    useEffect(() => {
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

    const { data: dataSchoolYear } = GET(
        `api/school_year`,
        "school_year_dropdown",
        () => {},
        false
    );

    const { data: dataSemester } = GET(
        `api/semester`,
        "semester_dropdown",
        () => {},
        false
    );

    return (
        <PageStudentsContext.Provider
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
                dataSchoolYear:
                    dataSchoolYear && dataSchoolYear.data
                        ? dataSchoolYear.data
                        : [],
                dataSemester:
                    dataSemester && dataSemester.data ? dataSemester.data : [],
            }}
        >
            <CustomTabs
                defaultActiveKey="student_active"
                items={[
                    {
                        key: "student_active",
                        label: "Active Student",
                        icon: <FontAwesomeIcon icon={faUsers} />,
                        iconSize: 30,
                        children: <TabItemContentStudent tblId="active" />,
                    },
                    {
                        key: "student_archived",
                        label: "Archived Student",
                        icon: <FontAwesomeIcon icon={faArchive} />,
                        iconSize: 27,
                        children: <TabItemContentStudent tblId="archived" />,
                    },
                    {
                        key: "student_import",
                        label: "Import Student",
                        icon: <FontAwesomeIcon icon={faFileImport} />,
                        iconSize: 27,
                        children: <TabItemContentImportStudent />,
                    },
                ]}
                onChange={(key) => {
                    setTableFilter((ps) => ({
                        ...ps,
                        status:
                            key === "student_active" ? "Active" : "Archived",
                    }));
                }}
            />

            <ModalStudentFormImport />
        </PageStudentsContext.Provider>
    );
}
