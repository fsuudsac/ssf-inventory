import { useEffect, useRef, useState } from "react";
import { Badge, Button, Dropdown, Flex, List, Popover } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBell,
    faCheck,
    faEllipsis,
    // faSquareXmark,
} from "@fortawesome/pro-regular-svg-icons";

import { system_id } from "../../../providers/appConfig";
import {
    // DELETE,
    GET,
    POST,
} from "../../../providers/useAxiosQuery";
import notificationErrors from "../../../providers/notificationErrors";
import NotificationModalView from "./NotificationModalView";

// NotificationPopover — bell icon with popover list of notifications
export default function NotificationPopover(props) {
    const { userdata } = props;

    const [notificationCount, setNotificationCount] = useState(0);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [toggleModalView, setToggleModalView] = useState({
        open: false,
        data: null,
    });

    // Pagination state — 5 items shown on load, more revealed as the user scrolls down
    const PAGE_SIZE = 5;
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // Refs for the scroll container and the invisible sentinel at the bottom of the list
    const scrollRef = useRef(null);
    const sentinelRef = useRef(null);

    const {
        data: dataNotifications,
        refetch: refetchNotifications,
        isLoading: isLoadingNotifications,
        isFetching: isFetchingNotifications,
    } = GET(
        `api/user_notifications?user_id=${userdata.id}&system_id=${system_id}`,
        "user_notifications",
        (res) => {
            if (res.data.length > 0) {
                let unread = res.data.filter((item) => item.read === 0);
                setNotificationCount(unread.length);
            }
        },
        false,
    );

    const { mutate: mutateUpdateNotification } = POST(
        `api/update_notification`,
        "user_notifications",
    );
    const { mutate: mutateReadAll } = POST(
        `api/read_all_notifications`,
        "user_notifications",
    );
    // const { mutate: mutateDeleteNotification } = DELETE(
    // 	`api/user_notifications`,
    // 	"user_notifications",
    // );
    const { mutate: mutateReadUnreadNotification } = POST(
        `api/read_unread_notification`,
        "user_notifications",
    );

    const handleReadAllNotifications = () => {
        let data = {
            user_id: userdata.id,
        };

        mutateReadAll(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setNotificationCount(0);
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };
    // const handleDeleteNotification = (item) => {
    // 	mutateDeleteNotification(item, {
    // 		onSuccess: (res) => {
    // 			if (res.success) {
    // 				refetchNotifications();
    // 			}
    // 		},
    // 		onError: (err) => {
    // 			notificationErrors(err);
    // 		},
    // 	});
    // };
    const handleReadUnreadNotification = (item) => {
        mutateReadUnreadNotification(item, {
            onSuccess: (res) => {
                if (res.success) {
                    if (notificationCount > 0) {
                        setNotificationCount(notificationCount - 1);
                    }
                    refetchNotifications();
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };
    const handleClickItem = (item) => {
        mutateUpdateNotification(item, {
            onSuccess: (res) => {
                if (res.success) {
                    if (notificationCount > 0) {
                        setNotificationCount(notificationCount - 1);
                    }
                    refetchNotifications();
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
        setToggleModalView({
            open: true,
            data: item,
        });
        setPopoverOpen(false);
    };

    const allNotifications = dataNotifications?.data ?? [];
    const visibleNotifications = allNotifications.slice(0, visibleCount);
    const hasMore = visibleCount < allNotifications.length;

    // Load the next page when the sentinel scrolls into view inside the scroll container.
    // The scrollHeight > clientHeight guard prevents an immediate trigger when all visible
    // items fit within the container height (no actual scrollbar present yet).
    useEffect(() => {
        const sentinel = sentinelRef.current;
        const container = scrollRef.current;
        if (!sentinel || !container || !hasMore) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    container.scrollHeight > container.clientHeight
                ) {
                    setVisibleCount((prev) => prev + PAGE_SIZE);
                }
            },
            { root: container, threshold: 0 },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleCount, dataNotifications, popoverOpen]);

    // Reset visible count when the popover is closed so it starts fresh on next open
    const handleOpenChange = (open) => {
        setPopoverOpen(open);
        if (!open) setVisibleCount(PAGE_SIZE);
    };

    // Dropdown menu for the popover header (global actions)
    const menuNotificationSettings = () => ({
        items: [
            {
                label: (
                    <Flex align="center" gap={6}>
                        <FontAwesomeIcon icon={faCheck} />
                        Mark all as read
                    </Flex>
                ),
                key: "0",
                onClick: handleReadAllNotifications,
            },
        ],
    });

    // Per-item dropdown menu (mark as read/unread, delete)
    const itemMenu = (item) => ({
        items: [
            {
                label: (
                    <Flex align="center" gap={6}>
                        <FontAwesomeIcon icon={faCheck} />
                        {item.read === 0 ? "Mark as read" : "Mark as unread"}
                    </Flex>
                ),
                key: "0",
                onClick: () => handleReadUnreadNotification(item),
            },
            // {
            // 	label: (
            // 		<Flex align="center" gap={6}>
            // 			<FontAwesomeIcon icon={faSquareXmark} />
            // 			Delete this notification
            // 		</Flex>
            // 	),
            // 	key: "1",
            // 	onClick: () => handleDeleteNotification(item),
            // },
        ],
    });

    // Popover content — scroll container owns the overflow so IntersectionObserver
    // can use it as the root and correctly detect when the sentinel enters view
    const notificationContent = (
        <div ref={scrollRef} className="notif-scroll-container">
            <List
                dataSource={visibleNotifications}
                loading={isLoadingNotifications || isFetchingNotifications}
                bordered={false}
                itemLayout="vertical"
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <div
                                key={`elapsed-time-${item.id}`}
                                className={`elapsed-time ${item.read === 1 ? "read" : ""}`}
                            >
                                {item.elapsed_time}
                            </div>,
                        ]}
                        extra={
                            <Dropdown
                                placement="bottomRight"
                                trigger={["click"]}
                                rootClassName="notification-settings"
                                menu={itemMenu(item)}
                            >
                                {/* Settings button — hidden until row is hovered */}
                                <Button
                                    className="list-settings no-wave"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <FontAwesomeIcon icon={faEllipsis} />
                                </Button>
                            </Dropdown>
                        }
                        onClick={() => handleClickItem(item)}
                    >
                        <List.Item.Meta
                            title={
                                <div className={item.read === 1 ? "read" : ""}>
                                    {item.notification.title}
                                </div>
                            }
                            description={
                                <div className={item.read === 1 ? "read" : ""}>
                                    {item.notification.description}
                                </div>
                            }
                        />
                    </List.Item>
                )}
                locale={{
                    emptyText: (
                        <div className="notif-empty">No Notifications</div>
                    ),
                }}
            />

            {/* Sentinel — observed by IntersectionObserver to trigger loading the next page */}
            {hasMore && <div ref={sentinelRef} className="notif-sentinel" />}

            {/* End-of-list indicator once all notifications are shown */}
            {!hasMore && allNotifications.length > 0 && (
                <div className="notif-end-label">You&apos;re all caught up</div>
            )}
        </div>
    );

    return (
        <>
            <Popover
                title={
                    <Flex justify="space-between" align="center">
                        <div className="notif-popover-title">Notifications</div>
                        <Dropdown
                            menu={menuNotificationSettings()}
                            placement="bottomRight"
                            trigger={["click"]}
                            rootClassName="notification-settings"
                        >
                            <Button className="notification-settings-btn no-wave">
                                <FontAwesomeIcon icon={faEllipsis} />
                            </Button>
                        </Dropdown>
                    </Flex>
                }
                trigger="click"
                arrow={false}
                placement="bottomRight"
                align={{ offset: [0, 21] }}
                rootClassName="notification-popup"
                content={notificationContent}
                open={popoverOpen}
                onOpenChange={handleOpenChange}
            >
                <Badge count={notificationCount} offset={[-2, 4]}>
                    <FontAwesomeIcon
                        className="menu-submenu-notification"
                        icon={faBell}
                        size="xl"
                    />
                </Badge>
            </Popover>

            <NotificationModalView
                toggleModalView={toggleModalView}
                setToggleModalView={setToggleModalView}
            />
        </>
    );
}
