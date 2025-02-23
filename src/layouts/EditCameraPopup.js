import React, { useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import axios from "axios";

const { Option } = Select;

const EditCameraPopup = ({ isVisible, onClose, initialData }) => {
  const [form] = Form.useForm();
  const baseURL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        camera_unique_id: initialData?.camera_unique_id,
        violations: [...(initialData?.violations || [])],
      });
    }
  }, [initialData, form]);

  const handleSave = () => {
    form
      .validateFields()
      .then(values => {
        const { camera_unique_id, violations } = values;

        // Prepare payload as expected by the replace_violations API
        const payload = {
          camera_unique_id,
          violations,
        };

        axios
          .patch(`${baseURL}/camera/replace_violations`, payload)
          .then(response => {
            message.success("Camera violations replaced successfully!");
            onClose();
          })
          .catch(error => {
            console.error("API Error:", error);
            message.error("Failed to replace camera violations.");
          });
      })
      .catch(info => {
        console.error("Validation Failed:", info);
      });
  };

  return (
    <Modal
      title="Edit Camera Details"
      visible={isVisible}
      onCancel={onClose}
      onOk={handleSave}
      okText="Save"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        {/* Camera Unique ID (read-only) */}
        <Form.Item
          name="camera_unique_id"
          label="Camera Unique ID"
          rules={[{ required: true }]}
        >
          <Input readOnly />
        </Form.Item>

        {/* Multi-select Violations */}
        <Form.Item
          name="violations"
          label="Violations"
          rules={[
            {
              required: true,
              message: "Please select at least one violation",
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select or enter violations"
            allowClear
            tokenSeparators={[","]}
          >
            <Option value="No gloves">No gloves</Option>
            <Option value="No boots">No boots</Option>
            <Option value="No safety vest">No safety vest</Option>
            <Option value="Traffic Light Violation">
              Traffic Light Violation
            </Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCameraPopup;
