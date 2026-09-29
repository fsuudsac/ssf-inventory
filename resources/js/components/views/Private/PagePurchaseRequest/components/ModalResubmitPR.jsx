import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Button, Row, Col, Alert, Table, Divider, Typography, Space } from "antd";
import { EditOutlined, SendOutlined, PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

export default function ModalResubmitPR({ open, onCancel, record, onResubmit, onSuccess, loading }) {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (record && open) {
      const recordItems = record.items && record.items.length > 0
        ? record.items.map((i, idx) => ({
            id: i.id || idx + 1,
            item_name: i.item_name || "",
            description: i.description || "",
            quantity: Number(i.quantity) || 1,
            unit: i.unit || "pcs",
            estimated_unit_cost: Number(i.estimated_unit_cost) || 0,
            total_estimated_cost: (Number(i.quantity) || 1) * (Number(i.estimated_unit_cost) || 0),
          }))
        : [{ id: 1, item_name: "", description: "", quantity: 1, unit: "pcs", estimated_unit_cost: 0, total_estimated_cost: 0 }];

      setItems(recordItems);
      form.setFieldsValue({
        title: record.title || record.purpose || "",
        purpose: record.purpose || "",
        resubmission_notes: "",
        items: recordItems,
      });
    }
  }, [record, open, form]);

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === "quantity" || field === "estimated_unit_cost") {
        const qty = field === "quantity" ? Number(value) || 0 : Number(item.quantity) || 0;
        const cost = field === "estimated_unit_cost" ? Number(value) || 0 : Number(item.estimated_unit_cost) || 0;
        item.total_estimated_cost = qty * cost;
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        item_name: "",
        description: "",
        quantity: 1,
        unit: "pcs",
        estimated_unit_cost: 0,
        total_estimated_cost: 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculatedTotal = items.reduce((sum, item) => sum + (Number(item.total_estimated_cost) || 0), 0);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        purpose: values.purpose,
        notes: values.resubmission_notes || "Initiator adjusted item quantities and costs per revision feedback.",
        items: items.map((i, idx) => ({
          id: i.id || idx + 1,
          item_name: i.item_name || "Requisition Item",
          description: i.description || "",
          quantity: Number(i.quantity) || 1,
          unit: i.unit || "pcs",
          estimated_unit_cost: Number(i.estimated_unit_cost) || 0,
          total_estimated_cost: (Number(i.quantity) || 1) * (Number(i.estimated_unit_cost) || 0),
        })),
        total_amount: calculatedTotal,
        total_estimated_budget: calculatedTotal,
      };
      const callback = onResubmit || onSuccess;
      if (callback) {
        await callback(record.id, payload);
      }
      onCancel();
    } catch (err) {
      console.error("Resubmit validation failed:", err);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <EditOutlined className="text-amber-600" />
          <span className="font-bold text-slate-900">
            Edit & Resubmit Requisition — {record?.pr_no}
          </span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SendOutlined />}
          className="bg-amber-600 hover:bg-amber-700"
          loading={loading}
          onClick={handleSubmit}
        >
          Resubmit to Finance Queue
        </Button>,
      ]}
      width={780}
      destroyOnClose
    >
      <div className="space-y-4 pt-1">
        {/* Revision Feedback Callout */}
        <Alert
          message={
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
              <ExclamationCircleOutlined className="text-amber-600" />
              Finance Revision Remarks:
            </div>
          }
          description={
            <div className="text-xs text-amber-950 mt-1 space-y-1">
              <p className="font-medium m-0">
                "{record?.revision_remarks || "Budget or specification adjustment requested by Finance Office."}"
              </p>
              {record?.revision_requested_by && (
                <p className="text-[11px] text-amber-800 m-0">
                  Requested by: <strong>{record.revision_requested_by}</strong> on {record.revision_requested_at}
                </p>
              )}
            </div>
          }
          type="warning"
          showIcon={false}
          className="border border-amber-300 bg-amber-50 rounded-xl"
        />

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="purpose"
                label={<span className="font-semibold text-slate-800">Requisition Purpose / Title</span>}
                rules={[{ required: true, message: "Purpose is required" }]}
              >
                <Input placeholder="Purpose of this purchase request" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="text-xs font-bold text-slate-600 my-2">
            Line Items & Budget Breakdown
          </Divider>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {items.map((item, index) => (
              <div key={item.id || index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <Row gutter={8} align="middle">
                  <Col span={9}>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Item Name</label>
                    <Input
                      size="small"
                      value={item.item_name}
                      placeholder="e.g. Multimeter"
                      onChange={(e) => handleItemChange(index, "item_name", e.target.value)}
                    />
                  </Col>
                  <Col span={4}>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Qty</label>
                    <InputNumber
                      size="small"
                      min={1}
                      value={item.quantity}
                      className="w-full"
                      onChange={(val) => handleItemChange(index, "quantity", val)}
                    />
                  </Col>
                  <Col span={4}>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Unit</label>
                    <Input
                      size="small"
                      value={item.unit}
                      placeholder="pcs"
                      onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                    />
                  </Col>
                  <Col span={5}>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Est. Unit Cost</label>
                    <InputNumber
                      size="small"
                      min={0}
                      value={item.estimated_unit_cost}
                      className="w-full"
                      prefix="₱"
                      onChange={(val) => handleItemChange(index, "estimated_unit_cost", val)}
                    />
                  </Col>
                  <Col span={2} className="text-right">
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">&nbsp;</label>
                    <Button
                      danger
                      size="small"
                      type="text"
                      icon={<DeleteOutlined />}
                      disabled={items.length <= 1}
                      onClick={() => handleRemoveItem(index)}
                    />
                  </Col>
                </Row>
                <div className="mt-2 flex items-center justify-between">
                  <Input
                    size="small"
                    value={item.description}
                    placeholder="Specification notes..."
                    className="max-w-[460px]"
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                  />
                  <div className="text-right font-semibold text-slate-800 text-xs">
                    Subtotal: ₱{Number(item.total_estimated_cost || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
            <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={handleAddItem}>
              Add Line Item
            </Button>
            <div className="text-right">
              <span className="text-xs text-slate-500 mr-2">Total Adjusted Budget:</span>
              <span className="text-base font-bold text-blue-700">
                ₱{calculatedTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <Divider orientation="left" className="text-xs font-bold text-slate-600 my-2">
            Resubmission Response & Action Notes
          </Divider>

          <Form.Item
            name="resubmission_notes"
            label={<span className="font-semibold text-slate-800">Response to Finance Officer</span>}
            rules={[{ required: true, message: "Please enter notes explaining the revision changes made." }]}
          >
            <Input.TextArea
              rows={2}
              placeholder="e.g. Revised item quantities from 6 to 4 units and applied 10% educational supplier discount to stay within approved budget ceiling."
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
