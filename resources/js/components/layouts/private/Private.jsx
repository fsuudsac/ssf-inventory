import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Breadcrumb, Layout, Card, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGifts, faHome, faRefresh } from "@fortawesome/pro-regular-svg-icons";
import { lineSpinner } from "ldrs";
import axios from "axios";

import { apiUrl, primaryColor, appName } from "../../providers/appConfig";
import ClearCache from "../../providers/ClearCache";
import Sidemenu from "./Sidemenu";
import Header from "./Header";
import Footer from "./Footer";

lineSpinner.register();

export default function Private(props) {
    const {
        children,
        moduleName,
        moduleCode,
        title,
        subtitle,
        breadcrumb,
        pageHeaderIcon,
        pageHeaderClass,
        pageId,
        className,
    } = props;

    const location = useLocation();
    const navigate = useNavigate();

    const [width, setWidth] = useState(window.innerWidth);

    const [sideMenuCollapse, setSideMenuCollapse] = useState(
        window.innerWidth <= 768 ? true : false
    );

    useEffect(() => {
        const section = document.querySelector(".private-layout");
        section.scrollIntoView({ behavior: "smooth", block: "start" });

        document.title = (moduleName ?? title).toUpperCase() + " | " + appName;

        function handleResize() {
            setWidth(window.innerWidth);

            if (window.innerWidth === 768) {
                setSideMenuCollapse(true);
            }
            if (window.innerWidth > 768) {
                setSideMenuCollapse(false);
            }
        }
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [title, moduleName]);

    return (
        <ClearCache>
            {({ isLatestVersion, emptyCacheStorage }) => (
                <>
                    {!isLatestVersion && (
                        <div className="notification-notice">
                            <div className="notification-notice-content">
                                <div className="notification-notice-icon">
                                    <FontAwesomeIcon icon={faGifts} />
                                </div>
                                <div className="notification-notice-message">
                                    <div className="title">
                                        Updates Now Available
                                    </div>
                                    <div className="description">
                                        A new version of this Web App is ready
                                    </div>
                                    <div className="action">
                                        <Button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                emptyCacheStorage();
                                            }}
                                            icon={
                                                <FontAwesomeIcon
                                                    icon={faRefresh}
                                                />
                                            }
                                        >
                                            Refresh
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="globalLoading hidden!">
                        <l-line-spinner
                            size="50"
                            stroke="5"
                            speed="1"
                            color={primaryColor}
                        />
                    </div>

                    <Layout
                        hasSider
                        className={`private-layout ${className ?? ""}`}
                        id={pageId ?? ""}
                    >
                        <Sidemenu
                            location={location}
                            sideMenuCollapse={sideMenuCollapse}
                            setSideMenuCollapse={setSideMenuCollapse}
                            width={width}
                        />

                        <Layout
                            className={
                                sideMenuCollapse
                                    ? "ant-layout-has-collapse"
                                    : ""
                            }
                        >
                            <Header
                                sideMenuCollapse={sideMenuCollapse}
                                setSideMenuCollapse={setSideMenuCollapse}
                                width={width}
                                pageHeaderClass={pageHeaderClass}
                                pageHeaderIcon={pageHeaderIcon}
                                title={title}
                                subtitle={subtitle}
                            />

                            <Layout.Content
                                onClick={() => {
                                    if (width <= 767) {
                                        setSideMenuCollapse(true);
                                    }
                                }}
                            >
                                <Breadcrumb
                                    separator={<span className="arrow" />}
                                    items={[
                                        {
                                            title: (
                                                <Link to="/">
                                                    <FontAwesomeIcon
                                                        icon={faHome}
                                                    />
                                                </Link>
                                            ),
                                        },
                                        ...(breadcrumb && breadcrumb.length > 0
                                            ? breadcrumb.map((item, index) => {
                                                  let colorRed = "";
                                                  if (breadcrumb.length > 1) {
                                                      if (
                                                          breadcrumb.length ===
                                                          index + 1
                                                      ) {
                                                          colorRed =
                                                              "breadcrumb-item-last";
                                                      }
                                                  }
                                                  return {
                                                      title: item.name,
                                                      className: `cursor-pointer font-14px breadcrumb-item-text ${colorRed}${
                                                          item.className
                                                              ? ` ${item.className}`
                                                              : ""
                                                      }`,
                                                      id: item.id ?? "",
                                                      onClick: () => {
                                                          if (item.link) {
                                                              navigate(
                                                                  item.link
                                                              );
                                                          }
                                                      },
                                                  };
                                              })
                                            : []),
                                    ]}
                                />

                                <Card variant="borderless">{children}</Card>
                            </Layout.Content>

                            <Footer />
                        </Layout>
                    </Layout>
                </>
            )}
        </ClearCache>
    );
}
