import React, { useState } from 'react';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Dropdown, message, Space, Switch, Tabs,Modal } from 'antd';

const AllViolationPopup = (props) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    props.setIsModalOpen(true);
  };

  const handleOk = () => {
    props.setIsModalOpen(false);
  };

  const handleCancel = () => {
    props.setIsModalOpen(false);
  };

  const dropdownItems = [
    {
        label: '1st menu item',
        key: '1',
        icon: <UserOutlined />,
    },
    {
        label: '2nd menu item',
        key: '2',
        icon: <UserOutlined />,
    },
    {
        label: '3rd menu item',
        key: '3',
        icon: <UserOutlined />,
        danger: true,
    },
    {
        label: '4th menu item',
        key: '4',
        icon: <UserOutlined />,
        danger: true,
        disabled: true,
    },
];

  const handleMenuClick = (e) => {
    message.info('Click on menu item.');
    console.log('click', e);
};
const menuProps = {
    items: dropdownItems,
    onClick: handleMenuClick,
};

  return (
    <>
      <Modal title="All Violation Camera" className='fw-semibold' open={props.isModalOpen} onOk={handleOk} onCancel={handleCancel}>
      <div>
        <Dropdown menu={menuProps} className='my-4' trigger={["click"]}>
          <Button>
            <Space>
              Button
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        </div>
      <div className='d-flex gap-2'>
          <div className='d-flex gap-2 align-items-center'>
            <span className='item-detect '>{"Gloves"}</span>
        <Switch defaultChecked title='Gloves' />
        </div>
          <div className='d-flex gap-2 align-items-center'>
            <span className='item-detect'>{"Mask"}</span>
        <Switch defaultChecked title='Gloves' />
        </div>
          <div className='d-flex gap-2 align-items-center'>
            <span className='item-detect'>{"Helmet"}</span>
        <Switch defaultChecked title='Gloves' />
        </div>
        </div>
      </Modal>
    </>
  );
};

export default AllViolationPopup;