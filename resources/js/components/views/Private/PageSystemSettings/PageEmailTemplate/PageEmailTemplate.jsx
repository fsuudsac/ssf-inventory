import { useState } from "react";
import { Tabs } from "antd";

import TabEmailTemplateOpis from "./components/TabEmailTemplateOpis";
import TabEmailTemplateFacultyMonitoring from "./components/TabEmailTemplateFacultyMonitoring";
import TabEmailTemplateGuidance from "./components/TabEmailTemplateGuidance";
import ModalFormEmailTemplate from "./components/ModalFormEmailTemplate";

export default function PageEmailTemplate() {
    const [toggleModalFormEmailTemplate, setToggleModalFormEmailTemplate] =
        useState({
            open: false,
            data: null,
            system_id: null,
        });

    return (
        <>
            <Tabs
                defaultActiveKey="0"
                size="small"
                items={[
                    {
                        key: "0",
                        label: "OPIS",
                        children: (
                            <TabEmailTemplateOpis
                                setToggleModalFormEmailTemplate={
                                    setToggleModalFormEmailTemplate
                                }
                            />
                        ),
                    },
                    {
                        key: "1",
                        label: "FACULTY MONITORING",
                        children: (
                            <TabEmailTemplateFacultyMonitoring
                                setToggleModalFormEmailTemplate={
                                    setToggleModalFormEmailTemplate
                                }
                            />
                        ),
                    },
                    {
                        key: "2",
                        label: "GUIDANCE",
                        children: (
                            <TabEmailTemplateGuidance
                                setToggleModalFormEmailTemplate={
                                    setToggleModalFormEmailTemplate
                                }
                            />
                        ),
                    },
                ]}
            />
            <ModalFormEmailTemplate
                toggleModalFormEmailTemplate={toggleModalFormEmailTemplate}
                setToggleModalFormEmailTemplate={
                    setToggleModalFormEmailTemplate
                }
            />
        </>
    );
}
