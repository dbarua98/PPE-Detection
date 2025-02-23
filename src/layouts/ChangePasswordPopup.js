import React, { useState } from 'react';
import { Button, Modal,Input, Space } from 'antd';
import { Typography } from 'antd';
import { changePassword } from '../api/auth';

const { Title,Text } = Typography;

const ChangePasswordPopup = (props) => {
    const[oldPassword,setOldPassword] = useState();
    const[newPassword,setNewPassword] = useState();
    const[confirmPassword,setConfirmPassword] = useState();
    const[error,setError] = useState();
    const[passwordMatch,setPasswordMatch] =useState(false);

  const handleOk = async() => {
    if(newPassword == confirmPassword){
    // changePassword(oldPassword, newPassword)
    const result = await changePassword(oldPassword, newPassword);
    if (!result.isOk) {
        setError(result.message);
    }else{

        props.setShowModal(false);
    }
    }
    else{
        setPasswordMatch(true)
    }
  };
  const handleCancel = () => {
    props.setShowModal(false);
  };
  return (
    <div className=''>
      <Modal className=''  title={<div className="fs-5 fw-bold text-center">Update Password</div>}  open={props.showModal} onOk={handleOk} onCancel={handleCancel}>
     <div>
     <div className='my-3'>
        <Text type="secondary" className='fw-semibold'>Old Password</Text>
        <Input.Password  placeholder="Old Password" className='h-100 p-2' onChange={(e)=>setOldPassword(e.target.value)} />
        </div>
      <div className='my-3'>
        <Text type="secondary" className='fw-semibold'>New Password</Text>
        <Input.Password placeholder="New Password" className='h-100 p-2'  onChange={(e)=>setNewPassword(e.target.value)}/>
        </div>
      <div className='my-3'>
        <Text type="secondary" className='fw-semibold'>Confirm Password</Text>
        <Input.Password placeholder="Confirm Password" className='h-100 p-2' onChange={(e)=>setConfirmPassword(e.target.value)} />
        </div>
    
    {error &&  <p style={{ fontSize: "x-small", color: "red" }}>
                  {error ? error.message : ""}
                </p>}
    {passwordMatch &&  <p style={{ fontSize: "x-small", color: "red" }}>
                  {passwordMatch ? "New Password and Confirm Password doesnot match" : ""}
                </p>}
     </div>
      </Modal>
    </div>
  );
};
export default ChangePasswordPopup;