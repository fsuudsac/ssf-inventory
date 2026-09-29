import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, Badge, Tag, Typography, Empty, Space, Tooltip } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import StageTimerBadge from "./StageTimerBadge";

export { StageTimerBadge };

const { Text } = Typography;

/**
 * Reusable Attachment Indicator Badge for Kanban Cards
 */
export function AttachmentBadge({ count, className = "", showLabel = false }) {
  if (!count) return null;
  return (
    <Tooltip title={`${count} Audit Evidence Document(s) Attached`}>
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/90 shadow-2xs ${className}`}
      >
        <PaperClipOutlined className="text-amber-600 text-xs" />
        <span>{count}</span>
        {showLabel && <span className="text-[10px] text-amber-700">evidence</span>}
      </span>
    </Tooltip>
  );
}

/**
 * Reusable KanbanBoard Component for Process Tracking
 * Accepts columns configuration, items array, and custom card renderer.
 */
export default function KanbanBoard({
  columns = [],
  items = [],
  onCardDrop,
  onDragEnd,
  onDragStart,
  renderCard,
  onCardClick,
  getItemColumnId = (item) => item.status,
  getItemId = (item) => item.id,
  isItemDragDisabled = null,
  className = "",
  terminalZone = null,
}) {
  const handleDragStart = (start) => {
    if (onDragStart) {
      onDragStart(start);
    }
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const itemId = draggableId;
    const sourceColumnId = source.droppableId;
    const targetColumnId = destination.droppableId;

    if (onDragEnd) {
      onDragEnd(result, itemId, sourceColumnId, targetColumnId);
    } else if (onCardDrop) {
      onCardDrop(itemId, sourceColumnId, targetColumnId);
    }
  };

  // Group items by column
  const itemsByColumn = columns.reduce((acc, col) => {
    acc[col.id] = items.filter((item) => getItemColumnId(item) === col.id);
    return acc;
  }, {});

  return (
    <div className={`kanban-board-container w-full overflow-x-auto pb-4 ${className}`}>
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <div className="flex gap-4 min-w-max items-start">
          {columns.map((column) => {
            const columnItems = itemsByColumn[column.id] || [];
            const colColor = column.color || "#1890ff";

            return (
              <div
                key={column.id}
                className="kanban-column w-80 flex-shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col max-h-[calc(100vh-220px)]"
                style={{
                  borderTop: `4px solid ${colColor}`,
                }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    {column.icon && <span className="text-slate-500">{column.icon}</span>}
                    <Text strong className="text-slate-800 text-sm">
                      {column.title}
                    </Text>
                  </div>
                  <Tag
                    color={colColor}
                    className="m-0 font-semibold px-2 py-0.5 rounded-full text-xs"
                  >
                    {columnItems.length}
                  </Tag>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`kanban-card-list flex-1 overflow-y-auto space-y-3 min-h-[140px] p-1 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? "bg-blue-50/70 ring-2 ring-blue-300 ring-dashed" : ""
                      }`}
                    >
                      {columnItems.length === 0 ? (
                        <div className="h-28 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-lg p-3">
                          <span className="text-xs">No items</span>
                          <span className="text-[11px] text-slate-400">Drag cards here</span>
                        </div>
                      ) : (
                        columnItems.map((item, index) => {
                          const id = String(getItemId(item));
                          const dragDisabled = isItemDragDisabled ? isItemDragDisabled(item) : false;
                          return (
                            <Draggable key={id} draggableId={id} index={index} isDragDisabled={dragDisabled}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  onClick={() => onCardClick && onCardClick(item)}
                                  className={`kanban-card-wrapper transition-all duration-150 ${
                                    dragSnapshot.isDragging
                                      ? "shadow-xl scale-102 ring-2 ring-blue-500 rotate-1 z-50 opacity-95"
                                      : "hover:shadow-md"
                                  }`}
                                >
                                  {renderCard ? (
                                    renderCard(item, dragSnapshot.isDragging)
                                  ) : (
                                    <DefaultCard item={item} />
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}

          {/* Optional Visual Terminal Drop Zone */}
          {terminalZone && (
            <Droppable droppableId={terminalZone.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`kanban-terminal-zone w-72 flex-shrink-0 rounded-xl p-4 border-2 border-dashed transition-all flex flex-col justify-between ${
                    snapshot.isDraggingOver
                      ? "bg-emerald-100/90 border-emerald-500 scale-102 ring-4 ring-emerald-200"
                      : "bg-emerald-50/50 border-emerald-300 hover:border-emerald-400"
                  }`}
                  style={{ minHeight: 280 }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {terminalZone.icon || <span className="text-emerald-600 font-bold">✓</span>}
                      <Text strong className="text-emerald-900 text-sm">
                        {terminalZone.title || "Terminal Drop Zone"}
                      </Text>
                    </div>
                    <div className="text-xs text-emerald-700 mb-3">
                      {terminalZone.description || "Drop here to complete, increment stock, and archive to Completed Records."}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-emerald-300/80 rounded-lg bg-white/80 my-2">
                    <span className="text-emerald-600 text-2xl mb-1.5">📥</span>
                    <span className="text-xs font-semibold text-emerald-800 text-center">
                      {snapshot.isDraggingOver ? "Release to Complete & Restock" : "Drag Card Here to Complete"}
                    </span>
                    <span className="text-[11px] text-emerald-600 text-center mt-1">
                      {terminalZone.badgeText || "Instant Restock & Archive"}
                    </span>
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      </DragDropContext>
    </div>
  );
}

function DefaultCard({ item }) {
  const attachmentCount = item.attachments?.length || item.evidence_count || 0;
  return (
    <Card
      size="small"
      className="bg-white rounded-lg border border-slate-200 cursor-grab active:cursor-grabbing hover:border-blue-300"
    >
      <div className="space-y-1.5">
        <div className="flex justify-between items-start gap-2">
          <Text strong className="text-sm text-slate-800 line-clamp-1">
            {item.title || item.po_no || item.canvass_no || item.pr_no || `Item #${item.id}`}
          </Text>
          <AttachmentBadge count={attachmentCount} />
        </div>
        {item.notes && (
          <p className="text-xs text-slate-500 line-clamp-2 m-0">{item.notes}</p>
        )}
      </div>
    </Card>
  );
}
