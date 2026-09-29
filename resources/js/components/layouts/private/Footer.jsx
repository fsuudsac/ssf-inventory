import { Flex, Layout } from "antd";
import dayjs from "dayjs";

import { appName } from "../../providers/appConfig";
import packageJson from "../../../../../package.json";

export default function Footer() {
    return (
        <Layout.Footer
            style={{
                borderTop: "1px solid var(--color-border)",
            }}
        >
            <Flex justify="space-between">
                <span>
                    TM and © {dayjs().format("YYYY")} {appName}. All Rights
                    Reserved.
                </span>

                <span>
                    V:{" "}
                    {packageJson && packageJson.version
                        ? packageJson.version
                        : "0.0.1"}
                </span>
            </Flex>
        </Layout.Footer>
    );
}
