import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { GET } from "./useAxiosQuery";
import { system_id, userData } from "./appConfig";

export default function useCheckUserPermission(moduleName, moduleCode) {
    const location = useLocation();
    const navigate = useNavigate();

    // Updated: synced to match buttonCodes list below, duplicates removed
    const buttonNames = [
        "btn_active_archive",
        "btn_add",
        "btn_decline",
        "btn_delete",
        "btn_download",
        "btn_edit",
        "btn_edit_permission",
        "btn_generate_report",
        "btn_import",
        "btn_payment",
        "btn_preview",
        "btn_print",
        "btn_request",
        "btn_status",
        "btn_submit",
        "btn_sweep",
        "btn_switch",
        "btn_upload_excel",
        "btn_view",
    ];

    useEffect(() => {
        buttonNames.forEach((name) => {
            document.querySelectorAll(`[name='${name}']`).forEach((el) => {
                el.classList.add("hide");
            });
        });

        return () => {
            buttonNames.forEach((name) => {
                document.querySelectorAll(`[name='${name}']`).forEach((el) => {
                    el.classList.remove("hide");
                });
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const user = userData();
    const userId = user?.id || 1;
    const activeRole = localStorage.getItem("simulated_role") || "PMO/VPASA (Admin)";
    const isAdmin =
        activeRole.includes("Admin") ||
        activeRole.includes("Super Admin") ||
        activeRole.includes("PMO") ||
        activeRole.includes("VPASA");

    const { data: dataPermissions, refetch: refetchPermissions } = GET(
        `api/user_permission?system_id=${system_id}&user_id=${userId}`,
        "check_user_permissions",
        (res) => {
            if (res.data) {
                let data = res.data;

                let excludeUrl = ["/edit-profile", "/dashboard"];

                if (!excludeUrl.includes(location.pathname)) {
                    // Check if attempting to access permissions page without admin rights
                    if (
                        (moduleCode === "page_user_permissions" || moduleCode === "page_permissions") &&
                        !isAdmin
                    ) {
                        navigate("/request-permission");
                        return;
                    }

                    if (data.length) {
                        let dataPermissionsFilter = data.find(
                            (f) =>
                                f.module_code === moduleCode &&
                                (f.can_view === true ||
                                    (f.module_buttons &&
                                        f.module_buttons.some(
                                            (f2) =>
                                                (f2.mod_button_code === "view_page" || f2.mod_button_code === "btn_view") &&
                                                parseInt(f2.status) === 1,
                                        )
                                    )
                                ),
                        );

                        if (dataPermissionsFilter) {
                            // console.log("dataPermissionsFilter", dataPermissionsFilter);

                            setTimeout(() => {
                                buttonNames.forEach((name) => {
                                    document
                                        .querySelectorAll(`[name=${name}]`)
                                        .forEach((el) => {
                                            if (el.classList.contains("hide")) {
                                                el.classList.remove("hide");
                                                el.disabled = true;
                                            }
                                        });
                                });
                            }, 200);

                            dataPermissionsFilter.module_buttons.forEach(
                                (el) => {
                                    setTimeout(() => {
                                        // Updated: duplicates removed, kept in logical add/edit/delete groups
                                        const buttonCodes = [
                                            "btn_active_archive",
                                            "btn_add",
                                            "btn_decline",
                                            "btn_delete",
                                            "btn_download",
                                            "btn_edit",
                                            "btn_edit_permission",
                                            "btn_generate_report",
                                            "btn_import",
                                            "btn_payment",
                                            "btn_preview",
                                            "btn_print",
                                            "btn_request",
                                            "btn_status",
                                            "btn_submit",
                                            "btn_sweep",
                                            "btn_switch",
                                            "btn_upload_excel",
                                            "btn_view",
                                        ];
                                        buttonCodes.forEach((buttonCode) => {
                                            // console.log("buttonCodes", buttonCode);

                                            if (
                                                el.mod_button_code ===
                                                buttonCode
                                            ) {
                                                document
                                                    .querySelectorAll(
                                                        `[name=${buttonCode}]`,
                                                    )
                                                    .forEach((elem) => {
                                                        if (
                                                            parseInt(
                                                                el.status,
                                                            ) === 0
                                                        ) {
                                                            elem.remove();
                                                        } else {
                                                            elem.classList.remove(
                                                                "hide",
                                                            );
                                                            elem.disabled = false;
                                                        }
                                                    });
                                            }
                                        });
                                    }, 100);
                                },
                            );
                        } else {
                            // navigate("/request-permission");
                            navigate("/user-permissions");
                        }
                    } else {
                        navigate("/");
                    }
                }
            }
        },
        false,
    );

    return { dataPermissions, refetchPermissions };
}
