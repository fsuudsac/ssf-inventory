import { Button, Dropdown, Flex, Menu, Typography, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxArchive,
    faCalendar,
    faEllipsis,
    faPenToSquare,
    faPlus,
} from "@fortawesome/pro-regular-svg-icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import dayjs from "dayjs";
import { POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);

    const [removed] = sourceClone.splice(droppableSource.index, 1);
    let splice = destClone.splice(droppableDestination.index, 0, removed);

    const result = {};

    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return {
        result,
        removed,
    };
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: grid * 2,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "white",

    // styles we need to apply on draggables
    ...draggableStyle,
});

const getListStyle = (isDraggingOver) => (isDraggingOver ? "drag-over" : "");

export default function BoardBk(props) {
    const { dataSource, setDataSource, setToggleModalFormPurchase } = props;

    const { mutate: mutatePurchaseOrderNo } = POST(
        `api/purchase_order_no`,
        "category_purchase_list",
    );

    function onDragEnd(result) {
        const { source, destination } = result;

        if (!destination) {
            return;
        }
        const sInd = +source.droppableId;
        const dInd = +destination.droppableId;

        if (sInd === dInd) {
            let findDataSourceIndex = dataSource.findIndex(
                (f) => f.id === Number(sInd),
            );

            const items = reorder(
                dataSource[findDataSourceIndex].purchases,
                source.index,
                destination.index,
            );

            const newState = [...dataSource];
            let puchases = {
                ...newState[findDataSourceIndex],
                purchases: items,
            };
            newState[findDataSourceIndex] = puchases;

            setDataSource(newState);

            mutatePurchaseOrderNo(
                {
                    data: puchases.purchases,
                    from_category_id: sInd,
                    to_category_id: dInd,
                    isMove: 0,
                },
                {
                    onSuccess: (res) => {
                        if (res.success) {
                            notification.success({
                                message: "Purchase Order No",
                                description: res.message,
                            });
                        } else {
                            notification.error({
                                message: "Purchase Order No",
                                description: res.message,
                            });
                        }
                    },
                    onError: (err) => {
                        notificationErrors(err);
                    },
                },
            );
        } else {
            const result = move(
                dataSource.find((f) => f.id === Number(sInd)).purchases,
                dataSource.find((f) => f.id === Number(dInd)).purchases,
                source,
                destination,
            );

            let findsIndIndex = dataSource.findIndex(
                (f) => f.id === Number(sInd),
            );
            let findDIndIndex = dataSource.findIndex(
                (f) => f.id === Number(dInd),
            );

            const newState = [...dataSource];
            newState[findsIndIndex] = {
                ...newState[findsIndIndex],
                purchases: result.result[findsIndIndex + 1],
            };
            let toPurchases = {
                ...newState[findDIndIndex],
                purchases: result.result[findDIndIndex + 1],
            };
            newState[findDIndIndex] = toPurchases;

            setDataSource(newState);

            mutatePurchaseOrderNo(
                {
                    data: toPurchases.purchases,
                    from_category_id: sInd,
                    to_category_id: dInd,
                    isMove: 1,
                    complete: result.removed,
                },
                {
                    onSuccess: (res) => {
                        if (res.success) {
                            notification.success({
                                message: "Purchase Order No",
                                description: res.message,
                            });
                        } else {
                            notification.error({
                                message: "Purchase Order No",
                                description: res.message,
                            });
                        }
                    },
                    onError: (err) => {
                        notificationErrors(err);
                    },
                },
            );
        }
    }

    return (
        <div className="board-wrapper">
            <div className="board">
                <DragDropContext onDragEnd={onDragEnd}>
                    {dataSource.map((category, category_index) => {
                        return (
                            <Droppable
                                key={category.id}
                                droppableId={`${category.id}`}
                            >
                                {(provided, snapshot) => (
                                    <div
                                        className="board-item"
                                        key={category_index}
                                    >
                                        <div
                                            className="board-item-header"
                                            style={{
                                                backgroundColor:
                                                    category["bg_color"],
                                                color: category["text_color"],
                                            }}
                                        >
                                            <h1>{category.category}</h1>
                                        </div>

                                        <div className="board-item-body">
                                            <div
                                                className={`board-drop ${
                                                    category.purchases
                                                        .length === 0
                                                        ? "no-data"
                                                        : ""
                                                } ${getListStyle(
                                                    snapshot.isDraggingOver,
                                                )}`}
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                            >
                                                {category.purchases.map(
                                                    (purchase, index) => {
                                                        return (
                                                            <Draggable
                                                                key={
                                                                    purchase.id
                                                                }
                                                                draggableId={`${purchase.id}`}
                                                                index={index}
                                                            >
                                                                {(
                                                                    provided,
                                                                    snapshot,
                                                                ) => (
                                                                    <div
                                                                        className="board-drag mb-10"
                                                                        ref={
                                                                            provided.innerRef
                                                                        }
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        style={{
                                                                            ...getItemStyle(
                                                                                snapshot.isDragging,
                                                                                provided
                                                                                    .draggableProps
                                                                                    .style,
                                                                            ),
                                                                            borderLeftColor: `3px solid ${category["bg_color"]}`,
                                                                        }}
                                                                    >
                                                                        <Flex
                                                                            justify="space-between"
                                                                            align="center"
                                                                            className="board-purchase-type mb-10"
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    fontSize:
                                                                                        "12px",
                                                                                    fontWeight:
                                                                                        "200",
                                                                                    border: "1px solid #DFDBDB",
                                                                                    borderRadius:
                                                                                        "3px",
                                                                                    padding:
                                                                                        "0px 8px",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    purchase.type
                                                                                }
                                                                            </div>
                                                                            <Dropdown
                                                                                placement="bottomRight"
                                                                                arrow
                                                                                menu={{
                                                                                    items: [
                                                                                        {
                                                                                            key: "1",
                                                                                            label: "Edit",
                                                                                            onClick:
                                                                                                () => {
                                                                                                    setToggleModalFormPurchase(
                                                                                                        {
                                                                                                            open: true,
                                                                                                            data: purchase,
                                                                                                            category_id:
                                                                                                                category.id,
                                                                                                        },
                                                                                                    );
                                                                                                },
                                                                                            icon: (
                                                                                                <FontAwesomeIcon
                                                                                                    icon={
                                                                                                        faPenToSquare
                                                                                                    }
                                                                                                />
                                                                                            ),
                                                                                        },
                                                                                        {
                                                                                            key: "2",
                                                                                            label: "Archive",
                                                                                            onClick:
                                                                                                () => {
                                                                                                    deleteItemFunction(
                                                                                                        purchase.id,
                                                                                                    );
                                                                                                },
                                                                                            icon: (
                                                                                                <FontAwesomeIcon
                                                                                                    icon={
                                                                                                        faBoxArchive
                                                                                                    }
                                                                                                />
                                                                                            ),
                                                                                        },
                                                                                    ],
                                                                                }}
                                                                            >
                                                                                <Button
                                                                                    icon={
                                                                                        <FontAwesomeIcon
                                                                                            icon={
                                                                                                faEllipsis
                                                                                            }
                                                                                        />
                                                                                    }
                                                                                    style={{
                                                                                        border: "none",
                                                                                        height: "100%",
                                                                                    }}
                                                                                />
                                                                            </Dropdown>
                                                                        </Flex>
                                                                        <Typography.Title
                                                                            level={
                                                                                4
                                                                            }
                                                                        >
                                                                            {" "}
                                                                            {
                                                                                purchase.tracking_number
                                                                            }
                                                                        </Typography.Title>
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                faCalendar
                                                                            }
                                                                            color="#AFAFAF"
                                                                        />{" "}
                                                                        {purchase.type ===
                                                                        "Purchase Order"
                                                                            ? `Date Purchase Order: ${dayjs(
                                                                                  purchase.date_purchase,
                                                                              ).format(
                                                                                  "MMMM DD, YYYY",
                                                                              )}`
                                                                            : `Date Purchase Order Return: ${dayjs(
                                                                                  purchase.date_returned,
                                                                              ).format(
                                                                                  "MMMM DD, YYYY",
                                                                              )}`}
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        );
                                                    },
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        </div>

                                        <div className="board-item-footer">
                                            <Button
                                                icon={
                                                    <FontAwesomeIcon
                                                        icon={faPlus}
                                                    />
                                                }
                                                onClick={() =>
                                                    setToggleModalFormPurchase({
                                                        open: true,
                                                        data: null,
                                                        category_id:
                                                            category.id,
                                                    })
                                                }
                                                style={{
                                                    backgroundColor:
                                                        category["bg_color"],
                                                    color: category[
                                                        "text_color"
                                                    ],
                                                }}
                                            >
                                                Add Purchase Order
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        );
                    })}
                </DragDropContext>
            </div>
        </div>
    );
}
