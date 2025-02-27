import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import axios from "axios";

const { Option } = Select;

const EditCameraPopup = ({ isVisible, onClose, initialData }) => {
  const [form] = Form.useForm();
  const baseURL = process.env.REACT_APP_BASE_URL;
  // Use a flag so we only set the initial values once per open
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isVisible && initialData && !initialized) {
      form.setFieldsValue({
        camera_unique_id: initialData.camera_unique_id,
        violations: initialData.violations || [],
      });
      setInitialized(true);
    }
  }, [isVisible, initialData, form, initialized]);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const { camera_unique_id, violations } = values;
        const payload = { camera_unique_id, violations };

        axios
          .patch(`${baseURL}/camera/replace_violations`, payload)
          .then(() => {
            message.success("Camera violations replaced successfully!");
            handleClose();
          })
          .catch((error) => {
            console.error("API Error:", error);
            message.error("Failed to replace camera violations.");
          });
      })
      .catch((info) => {
        console.error("Validation Failed:", info);
      });
  };

  const handleClose = () => {
    setInitialized(false);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Edit Camera Details"
      visible={isVisible}
      onCancel={handleClose}
      onOk={handleSave}
      okText="Save"
      cancelText="Cancel"
      destroyOnClose
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

        {/* Multi-select Violations with tag mode */}
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
            mode="tags"
            placeholder="Select or enter violations"
            allowClear
            tokenSeparators={[","]}
            style={{ width: "100%" }}
          >
            <Option value="Hardhat">Hardhat</Option>
            <Option value="Mask">Mask</Option>
            <Option value="NO-Hardhat">NO-Hardhat</Option>
            <Option value="NO-Safety Vest">NO-Safety Vest</Option>
            <Option value="Person">Person</Option>
            <Option value="Safety Cone">Safety Cone</Option>
            <Option value="Safety Vest">Safety Vest</Option>
            <Option value="machinery">machinery</Option>
            <Option value="vehicle">vehicle</Option>
            <Option value="NO-Mask">NO-Mask</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCameraPopup;
