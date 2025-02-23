import React, { useState } from 'react';
import { Modal, Input, Typography, message } from 'antd';
import axios from 'axios';

const { Text } = Typography;
const baseURL = process.env.REACT_APP_BASE_URL;
const AddCameraPopup = (props) => {
  const [formData, setFormData] = useState({
    // name: '',
    // description: '',
    videoSource: '',
    // videoSubstreamSource: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOk = async () => {
    try {
      const API_URL = `${baseURL}/camera/add`;
      
      const payload = {
        camera_unique_id: `camera_${Math.floor(Math.random() * 10000)}`,
        ip: formData.videoSource,
        // description: formData.description,
        // video_source: formData.videoSource,
        // video_substream_source: formData.videoSubstreamSource,
        violations: ["No helmet", "No safety vest"],
      };

      await axios.post(API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      message.success('Camera added successfully');
      props.setCameraAdded(true);
      props.setShowModal(false);
    } catch (error) {
      message.error('Failed to add the camera');
      console.error(error);
    }
  };

  const handleCancel = () => {
    props.setShowModal(false);
  };

  return (
    <div>
      <Modal
        title={<div className="fs-5 fw-bold text-center">Add Camera</div>}
        open={props.showModal}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div>
          {/* <div className='my-3'>
            <Text type="secondary" className='fw-semibold'>Name</Text>
            <Input
              placeholder="Name"
              className='h-100 p-2'
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div> */}
          {/* <div className='my-3'>
            <Text type="secondary" className='fw-semibold'>Description</Text>
            <Input
              placeholder="Description"
              className='h-100 p-2'
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div> */}
          <div className='my-3'>
            <Text type="secondary" className='fw-semibold'>Video Source</Text>
            <Input
              placeholder="Video Source"
              className='h-100 p-2'
              value={formData.videoSource}
              onChange={(e) => handleChange('videoSource', e.target.value)}
            />
          </div>
          {/* <div className='mt-3 mb-5'>
            <Text type="secondary" className='fw-semibold'>Video Substream Source</Text>
            <Input
              placeholder="Video Substream Source"
              className='h-100 p-2'
              value={formData.videoSubstreamSource}
              onChange={(e) => handleChange('videoSubstreamSource', e.target.value)}
            />
          </div> */}
        </div>
      </Modal>
    </div>
  );
};

export default AddCameraPopup;
