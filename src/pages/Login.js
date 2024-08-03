import React, { useCallback, useRef, useState } from 'react'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, Form, Input, Space } from 'antd';
import { Typography } from 'antd';
import loginImage from "../images/login.png"
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';


const { Title,Text } = Typography;

const Login = () => {   
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  // const formData = useRef({ email: '', password: '' });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    console.log(formData);
    // setLoading(true);

    const result = await signIn(email, password);
    // if (!result.isOk) {
    //   setLoading(false);
    //   // notify(result.message, 'error', 2000);
    // }
  }, [formData, signIn]);

  return (
    
    <div className='container'>
    <div className='row vh-100 align-content-center
     d-flex justify-content-evenly
     '
     >
      <div className='col-5 h-50 d-flex flex-column justify-content-center gap-5 mt-5'>
     <Form onSubmitCapture={onSubmit}>
        <div className='my-4'>
          <Title level={1} className='m-0'>Welcome Back!</Title>
          <Text type="secondary">Login to access your all data</Text>
        </div>
        <div className='w-75 my-3'>
          <Text type="secondary" className='fw-semibold'>Email Address or Username</Text>
          <Input
            name="email"
            placeholder="Email Address or Username"
            className='h-75'
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className='w-75 my-3'>
          <Text type="secondary" className='fw-semibold'>Password</Text>
          <Input.Password
            name="password"
            className='h-75'
            placeholder="Password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
        <Button
          htmlType="submit"
          style={{ background: "#382e99" }}
          type="primary"
          className='rounded-5 p-3 w-75 h-auto mt-4'
        >
          Sign In
        </Button>
    </Form>
      </div>
      <div className='col-6'>
         <img src={loginImage} style={{height:"70vh"}} className='rounded-5'/>
      </div>
    </div>
    </div>
  )
}

export default Login
