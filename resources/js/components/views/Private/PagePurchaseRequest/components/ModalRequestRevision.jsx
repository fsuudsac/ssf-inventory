import React, { useState } from "react";
import { Modal, Form, Input, Select, Alert, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Paragraph, Text } = Typography;
const { Option } = Select;

const PRESET_REVISION_REASONS = [
  "Estimated unit cost exceeds approved departmental CAPEX allocation ceiling. Please reduce item quantities or attach alternative supplier quotes.",
  "Item specifications incomplete or non-standard. Please detail warranty, manufacturer part numbers, and delivery timeline.",
  "Budget alignment mismatch. Requires revision to charge under OpEx instructional consumables rather than capital outlay.",
  "Duplicate item requisition detected across pending department submissions. Please consolidate or provide justification.",
];

export default function ModalRequestRevision({ open, onCancel, record, onConfirm, loading }) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onConfirm(record.id, values.remarks);
      form.resetFields();
      onCancel();
    } catch (err) {
      console.error("Validation error:", err);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-amber-600" />
          <span className="font-bold text-slate-900">
            Request Revision from Department — {record?.pr_no}
          </span>
        </div>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Flag as Needs Revision"
      okButtonProps={{ className: "bg-amber-600 hover:bg-amber-700" }}
      width={560}
      destroyOnClose
    >
      <div className="space-y-3 pt-2">
        <Alert
          type="warning"
          showIcon
          message="Workflow Action: Return Requisition to Initiator"
          description="Flagging this request as 'Needs Revision' will immediately remove it from the Finance queue and flag it in the Department Module for the initiator to edit and resubmit."
          className="text-xs"
        />

        <Form form={form} layout="vertical">
          <Form.Item label="Preset Revision Templates (Optional)">
            <Select
              placeholder="Select a standard feedback template..."
              allowClear
              onChange={(val) => {
                if (val) {
                  form.setFieldsValue({ remarks: val });
                }
              }}
            >
              {PRESET_REVISION_REASONS.map((r, i) => (
                <Option key={i} value={r}>
                  {r.slice(0, 70)}...
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="remarks"
            label={<span className="font-semibold text-slate-800">Finance Revision Remarks & Instructions</span>}
            rules={[{ required: true, message: "Please specify the reasons or adjustments needed." }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Detail the budget ceiling, specification corrections, or quotation requirements the department must adjust before resubmitting..."
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
