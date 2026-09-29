import React, { useState } from "react";
import {
  Upload,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  App,
  Popconfirm,
  Modal,
  Select,
  Input,
  Form,
  Card,
  Empty,
  Tooltip,
} from "antd";
import {
  InboxOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileTextOutlined,
  FileUnknownOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;
const { Option } = Select;

// Format file size in human-readable format
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// Map file types to appropriate Ant Design icons
export const getFileIcon = (mimeType = "", fileName = "") => {
  const ext = fileName.split(".").pop().toLowerCase();
  if (mimeType.includes("pdf") || ext === "pdf") {
    return <FilePdfOutlined className="text-red-500 text-lg" />;
  }
  if (mimeType.includes("image") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
    return <FileImageOutlined className="text-blue-500 text-lg" />;
  }
  if (mimeType.includes("sheet") || mimeType.includes("excel") || ["xls", "xlsx", "csv"].includes(ext)) {
    return <FileExcelOutlined className="text-emerald-600 text-lg" />;
  }
  if (mimeType.includes("word") || ["doc", "docx"].includes(ext)) {
    return <FileWordOutlined className="text-indigo-600 text-lg" />;
  }
  if (mimeType.includes("text") || ["txt", "md"].includes(ext)) {
    return <FileTextOutlined className="text-slate-600 text-lg" />;
  }
  return <FileUnknownOutlined className="text-slate-400 text-lg" />;
};

export default function EvidenceAttachmentTab({
  module = "canvasses", // "canvasses" | "purchase-requests" | "purchase-orders"
  recordId,
  attachments = [],
  currentStage = "Canvass",
  onAttachmentChange,
  readOnly = false,
}) {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("Quotation / Bidding Document");
  const [description, setDescription] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const stageColors = {
    Canvass: "purple",
    "Purchase Request": "blue",
    "Purchase Order": "cyan",
    "Order Received": "green",
    Inventory: "gold",
  };

  const handleCustomUpload = async ({ file, onSuccess, onError }) => {
    if (!recordId) {
      message.error("Cannot upload evidence: missing record ID.");
      onError(new Error("Missing record ID"));
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Upload the raw file
      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedInfo = uploadRes.data?.data;
      if (!uploadedInfo) {
        throw new Error("Upload response missing file metadata");
      }

      // 2. Attach evidence record to this entity
      const attachPayload = {
        file_name: uploadedInfo.file_name,
        original_name: uploadedInfo.original_name,
        file_url: uploadedInfo.file_url,
        file_size: uploadedInfo.file_size,
        mime_type: uploadedInfo.mime_type,
        stage: currentStage,
        category: category,
        description: description || `${category} - ${uploadedInfo.original_name}`,
        uploaded_by: "Current User",
      };

      const attachRes = await axios.post(
        `/api/attachments/${module}/${recordId}`,
        attachPayload
      );

      message.success(`Evidence "${uploadedInfo.original_name}" attached successfully!`);
      setDescription("");
      onSuccess(attachRes.data);

      if (onAttachmentChange && attachRes.data?.data) {
        onAttachmentChange(attachRes.data.data);
      }
    } catch (err) {
      console.error("Evidence upload error:", err);
      message.error("Failed to upload evidence document.");
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      const res = await axios.delete(
        `/api/attachments/${module}/${recordId}/${attachmentId}`
      );
      message.success("Evidence document removed.");
      if (onAttachmentChange && res.data?.data) {
        onAttachmentChange(res.data.data);
      }
    } catch (err) {
      console.error("Failed to delete attachment:", err);
      message.error("Failed to delete attachment.");
    }
  };

  const columns = [
    {
      title: "Document / Evidence",
      key: "name",
      render: (_, record) => {
        const isImg =
          record.mime_type?.includes("image") ||
          /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(record.original_name || "");

        return (
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5">{getFileIcon(record.mime_type, record.original_name)}</div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-slate-800 text-xs hover:text-blue-600 transition-colors">
                  {record.original_name || record.file_name}
                </span>
                {record.stage && (
                  <Tag color={stageColors[record.stage] || "default"} className="text-[10px] m-0">
                    {record.stage}
                  </Tag>
                )}
              </div>
              {record.category && (
                <div className="text-[11px] text-slate-500 font-sans">
                  {record.category}
                </div>
              )}
              {record.description && (
                <div className="text-[11px] text-slate-400 italic">
                  {record.description}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Size",
      dataIndex: "file_size",
      key: "file_size",
      width: 90,
      render: (size) => (
        <span className="text-xs text-slate-600 font-mono">
          {formatFileSize(size)}
        </span>
      ),
    },
    {
      title: "Uploaded",
      key: "uploaded",
      width: 140,
      render: (_, record) => (
        <div className="text-xs text-slate-600">
          <div>{dayjs(record.uploaded_at).format("MMM D, YYYY")}</div>
          <div className="text-[10px] text-slate-400">
            {record.uploaded_by || "System"}
          </div>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 110,
      render: (_, record) => {
        const isImg =
          record.mime_type?.includes("image") ||
          /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(record.original_name || "");

        return (
          <Space size="small">
            <Tooltip title="Preview / Open Document">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                className="text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  setPreviewFile(record);
                  setIsPreviewOpen(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Download File">
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                className="text-slate-600 hover:bg-slate-100"
                href={record.file_url}
                download={record.original_name}
                target="_blank"
                rel="noreferrer"
              />
            </Tooltip>
            {!readOnly && (
              <Popconfirm
                title="Remove evidence document?"
                description="This file will be detached from this record."
                onConfirm={() => handleDeleteAttachment(record.id)}
                okText="Remove"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                  className="hover:bg-red-50"
                />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 pt-1">
      {/* Evidence Summary Header */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <PaperClipOutlined className="text-amber-600 text-lg" />
          <div>
            <span className="font-semibold text-slate-800 text-sm">
              Audit Evidence & Supporting Documents
            </span>
            <span className="text-xs text-slate-500 block">
              Documents attached here automatically carry over throughout the procurement pipeline.
            </span>
          </div>
        </div>
        <Tag color="blue" className="font-semibold px-2 py-0.5 text-xs m-0">
          {attachments.length} {attachments.length === 1 ? "Document" : "Documents"}
        </Tag>
      </div>

      {/* Upload Box (if not read-only) */}
      {!readOnly && (
        <Card size="small" className="border-dashed border-slate-300 bg-slate-50/50 rounded-xl">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Document Category
                </label>
                <Select
                  size="small"
                  className="w-full"
                  value={category}
                  onChange={setCategory}
                >
                  <Option value="Supplier Quotation / RFQ Response">
                    Supplier Quotation / RFQ Response
                  </Option>
                  <Option value="Comparative Bid Matrix">Comparative Bid Matrix</Option>
                  <Option value="Purchase Request Endorsement">
                    Purchase Request Endorsement
                  </Option>
                  <Option value="Budget Clearance / BAC Resolution">
                    Budget Clearance / BAC Resolution
                  </Option>
                  <Option value="Approved Purchase Order">Approved Purchase Order</Option>
                  <Option value="Delivery Receipt / Packing List">
                    Delivery Receipt / Packing List
                  </Option>
                  <Option value="Inspection & Acceptance Report">
                    Inspection & Acceptance Report
                  </Option>
                  <Option value="Sales Invoice / Official Receipt">
                    Sales Invoice / Official Receipt
                  </Option>
                  <Option value="General Audit Evidence">General Audit Evidence</Option>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Brief Description / Remarks (Optional)
                </label>
                <Input
                  size="small"
                  placeholder="e.g. Signed by Dean & Comptroller"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <Upload.Dragger
              name="file"
              multiple={false}
              showUploadList={false}
              customRequest={handleCustomUpload}
              disabled={uploading}
              className="bg-white hover:border-blue-400 py-3"
            >
              <p className="ant-upload-drag-icon mb-1">
                <InboxOutlined className="text-2xl text-blue-500" />
              </p>
              <p className="ant-upload-text text-xs font-semibold text-slate-700 m-0">
                Click or drag files here to upload audit evidence
              </p>
              <p className="ant-upload-hint text-[11px] text-slate-400 m-0">
                Supports PDF, DOCX, XLSX, PNG, JPG, Scanned receipts & quotes (Max 15MB)
              </p>
            </Upload.Dragger>
          </div>
        </Card>
      )}

      {/* Attachments Table */}
      <Table
        size="small"
        columns={columns}
        dataSource={attachments}
        rowKey="id"
        pagination={false}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-xs text-slate-400">
                  No evidence documents attached yet. Upload quotations, delivery receipts, or approvals above.
                </span>
              }
            />
          ),
        }}
      />

      {/* Document Preview Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            {previewFile && getFileIcon(previewFile.mime_type, previewFile.original_name)}
            <span className="text-sm font-semibold truncate max-w-md">
              {previewFile?.original_name || previewFile?.file_name}
            </span>
          </div>
        }
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewOpen(false)}>
            Close
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            href={previewFile?.file_url}
            download={previewFile?.original_name}
            target="_blank"
          >
            Download Original
          </Button>,
        ]}
        width={750}
      >
        {previewFile && (
          <div className="py-2">
            {previewFile.mime_type?.includes("image") ||
            /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(previewFile.original_name || "") ? (
              <div className="flex justify-center items-center p-4 bg-slate-900 rounded-lg max-h-[500px] overflow-auto">
                <img
                  src={previewFile.file_url}
                  alt={previewFile.original_name}
                  className="max-w-full max-h-[460px] object-contain rounded"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : previewFile.mime_type?.includes("pdf") ||
              /\.pdf$/i.test(previewFile.original_name || "") ? (
              <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                <FilePdfOutlined className="text-red-500 text-6xl mb-3" />
                <p className="font-semibold text-slate-800 text-sm">
                  PDF Document: {previewFile.original_name}
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  {formatFileSize(previewFile.file_size)} • Uploaded {dayjs(previewFile.uploaded_at).format("YYYY-MM-DD HH:mm")}
                </p>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  href={previewFile.file_url}
                  target="_blank"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Open PDF in New Window
                </Button>
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-4xl mb-3">
                  {getFileIcon(previewFile.mime_type, previewFile.original_name)}
                </div>
                <p className="font-semibold text-slate-800 text-sm">
                  {previewFile.original_name}
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  {formatFileSize(previewFile.file_size)} • Stage: {previewFile.stage}
                </p>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  href={previewFile.file_url}
                  download={previewFile.original_name}
                  target="_blank"
                >
                  Download File
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
