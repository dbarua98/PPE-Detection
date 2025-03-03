import React, { useState } from 'react';
import { Modal, Input } from 'antd';
import { Typography } from 'antd';

const { Text } = Typography;

const ChangePasswordPopup = (props) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(false);
  const baseURL = process.env.REACT_APP_BASE_URL;

  const handleOk = async () => {
    debugger
    // Reset previous error states
    setError('');
    setPasswordMatch(false);

    if (newPassword !== confirmPassword) {
      setPasswordMatch(true);
      return;
    }

    // Retrieve token from local storage
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${baseURL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": token // Token retrieved from local storage
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        })
      });
debugger
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error updating password");
      } else {
        props.setShowModal(false);
      }
    } catch (error) {
      setError("Network error");
    }
  };

  const handleCancel = () => {
    props.setShowModal(false);
  };

  return (
    <div>
      <Modal 
        title={<div className="fs-5 fw-bold text-center">Update Password</div>} 
        open={props.showModal} 
        onOk={handleOk} 
        onCancel={handleCancel}
      >
        <div>
          <div className='my-3'>
            <Text type="secondary" className='fw-semibold'>Old Password</Text>
            <Input.Password 
              placeholder="Old Password" 
              className='h-100 p-2' 
              onChange={(e) => setOldPassword(e.target.value)} 
            />
          </div>
          <div className='my-3'>
            <Text type="secondary" className='fw-semibold'>New Password</Text>
            <Input.Password 
              placeholder="New Password" 
              className='h-100 p-2' 
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className='my-3'>
            <Text type="secondary" className='fw-semibold'>Confirm Password</Text>
            <Input.Password 
              placeholder="Confirm Password" 
              className='h-100 p-2' 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>

          {error && (
            <p style={{ fontSize: "x-small", color: "red" }}>
              {error}
            </p>
          )}
          {passwordMatch && (
            <p style={{ fontSize: "x-small", color: "red" }}>
              New Password and Confirm Password do not match
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ChangePasswordPopup;
