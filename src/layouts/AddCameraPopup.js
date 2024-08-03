import React, { useState } from 'react';
import { Button, Modal,Input, Space } from 'antd';
import { Typography } from 'antd';

const { Title,Text } = Typography;

const AddCameraPopup = (props) => {

  const handleOk = () => {
    props.setShowModal(false);
  };
  const handleCancel = () => {
    props.setShowModal(false);
  };
  return (
    <div className=''>
      <Modal className=''  title={<div className="fs-5 fw-bold text-center">Add Camera</div>}  open={props.showModal} onOk={handleOk} onCancel={handleCancel}>
     <div>
     <div className='my-3'>
        <Text type="secondary" className='fw-semibold'>Name</Text>
        <Input placeholder="Name" className='h-100 p-2' />
        </div>
      <div className='my-3'>
        <Text type="secondary" className='fw-semibold'>Description</Text>
        <Input placeholder="Description" className='h-100 p-2' />
        </div>
      <div className='my-3'>
        <Text type="secondary" className='fw-semibold'>Video Source</Text>
        <Input placeholder="Video Source" className='h-100 p-2' />
        </div>
      <div className='mt-3 mb-5'>
        <Text type="secondary" className='fw-semibold'>Video Substream Source</Text>
        <Input placeholder="Video Substream Source" className='h-100 p-2' />
        </div>
     </div>
      </Modal>
    </div>
  );
};
export default AddCameraPopup;