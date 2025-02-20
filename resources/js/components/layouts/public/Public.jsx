import { useEffect } from "react";
import { Layout } from "antd";

import { appName } from "../../providers/appConfig";

export default function Public(props) {
    const { children, title, pageId } = props;

    useEffect(() => {
        if (title) {
            document.title = title + " | " + appName;
        }

        return () => {};
    }, [title]);

    return (
        <Layout
            className="public-layout h-screen bg-transparent!"
            id={pageId ?? ""}
        >
            {children}
        </Layout>
    );
}
