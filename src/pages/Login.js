import React, { useCallback, useRef, useState } from "react";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Button, Form, Input, Space } from "antd";
import { Typography } from "antd";
import loginImage from "../images/login.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import { createAccount, resetPassword } from "../api/auth";

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [invalidCredential, setInvalidCredential] = useState();
  // const formData = useRef({ email: '', password: '' });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const initialFormData={
    firstName: "",
    lastName: "",
    companyName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  }
  const [formData, setFormData] = useState(initialFormData);
  const [forgetPassword, setForgetPassword] = useState(false);
  const [updatePassword, setUpdatePassword] = useState(false);
  const [createNewUser, setCreateNewUser] = useState(false);
  const [mobileInValid, setMobileInValid] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [resetEmailError, setResetEmailError] = useState(false);
  const initialErrors = {
    email: false,
    password: false,
    firstName: false,
    lastName: false,
    phoneNumber: false,
    companyName: false,
    confirmPassword: false,
  };
  const [errors, setErrors] = useState(initialErrors);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let hasError = false;
    const newErrors = {};
    // login
    if (!forgetPassword && !createNewUser) {
      for (const key in formData) {
        if (
          (key == "email" && !formData[key]) ||
          (key == "password" && !formData[key])
        ) {
          newErrors[key] = true;
          hasError = true;
        }
        else if (
          key === "email" &&
          (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[key]))
        ) {
          setEmailInvalid(true); 
          hasError = true;
        } 

        //  else if (key === 'mobileNo' && patientAppointment[key].length < 10) {
        //     setMobileValid(true);
        //     hasError = true;
        // } else {
        //     newErrors[key] = false;
        // }
        // setErrors(newErrors);
        // return hasError;
      }
    }
    // forgetPassword
    if (forgetPassword) {
      for (const key in formData) {
        if (key == "email" && !formData[key]) {
          newErrors[key] = true;
          hasError = true;
        }
        else if (
          key === "email" &&
          (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[key]))
        ) {
          setEmailInvalid(true); 
          hasError = true;
        } 

        //  else if (key === 'mobileNo' && patientAppointment[key].length < 10) {
        //     setMobileValid(true);
        //     hasError = true;
        // } else {
        //     newErrors[key] = false;
        // }
        // setErrors(newErrors);
        // return hasError;
      }
    }
    // create new user
    if (createNewUser) {
      debugger;
      for (const key in formData) {
        if (!formData[key]) {
          newErrors[key] = true;
          hasError = true;
        } else if (
          key === "phoneNumber" &&
          (formData[key].length < 10 )
        ) {
          setMobileInValid(true);
          hasError = true;
        } 
        else if (
          key === "email" &&
          (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[key]))
        ) {
          setEmailInvalid(true); 
          hasError = true;
        } 
        else {
          newErrors[key] = false;
        }
      }
    }
    setErrors(newErrors);
    return hasError;
  };
  console.log("new errors", errors);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      return;
    }
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      companyName,
      confirmPassword,
    } = formData;
    if (!forgetPassword && !createNewUser) {
      const result = await signIn(email, password);
      if (!result.isOk) {
        setLoading(false);
        setInvalidCredential(result.message);
      }
    } else if (forgetPassword) {
      const result = await resetPassword(email);
      if (!result.isOk) {
        setLoading(false);
        setInvalidCredential(result.message);
      }
    } else {
      const result = await createAccount(
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        companyName,
        confirmPassword
      );
      if (!result.isOk) {
        setLoading(false);
        setInvalidCredential(result.message);
      }
    }
  };

  const backToLoginFromForget = () => {
    setForgetPassword(false);
    setErrors(initialErrors);
    setEmailInvalid(false)
    setMobileInValid(false)
    setFormData(initialFormData)
  };
  const onCreateUserClick = () => {
    setCreateNewUser(true);
    setErrors(initialErrors);
    setEmailInvalid(false)
    setMobileInValid(false)
    setFormData(initialFormData)

  };
  const onForgetPasswordClick = () => {
    setForgetPassword(true);
    setErrors(initialErrors);
    setEmailInvalid(false)
    setMobileInValid(false)
    setFormData(initialFormData)

  };
  const onUpdatePasswordClick = () => {
    setUpdatePassword(true);
    // setErrors(initialErrors);
    // setEmailInvalid(false)
    // setMobileInValid(false)
    // setFormData(initialFormData)

  };

  const backToLoginFromSignup = () => {
    setCreateNewUser(false);
    setErrors(initialErrors);
    setEmailInvalid(false)
    setMobileInValid(false)
    setFormData(initialFormData)

  };
  return (
    <div className="container">
      <div
        className="row vh-100 align-content-center
     d-flex justify-content-evenly
     "
      >
        <div className="col-5 h-50 d-flex flex-column justify-content-center gap-5 mt-5">
          {!forgetPassword && !createNewUser && (
            <Form onSubmitCapture={onSubmit}>
              <div className="my-4">
                <Title level={1} className="m-0">
                  Welcome Back!
                </Title>
                <Text type="secondary">Login to access your all data</Text>
              </div>
              <div className="w-75 my-3">
                <Text type="secondary" className="fw-semibold">
                  Email Address or Username
                </Text>
                <Input
                  name="email"
                  placeholder="Email Address or Username"
                  className="h-75"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email?<p style={{ fontSize: "x-small", color: "red" }}>
                  {errors.email ? "Please Enter Email" : ""}
                </p>:
                <p style={{ fontSize: "x-small", color: "red" }}>
                  {emailInvalid ? "Please Enter Valid EmailId" : ""}
                </p>}
              </div>
              <div className="w-75 my-3">
                <Text type="secondary" className="fw-semibold">
                  Password
                </Text>
                <Input.Password
                  name="password"
                  className="h-75"
                  placeholder="Password"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <p style={{ fontSize: "x-small", color: "red" }}>
                  {errors.password ? "Please Enter Password" : ""}
                </p>
              </div>

              <div
                className={`d-flex  w-75 ${
                  invalidCredential
                    ? "justify-content-between"
                    : "justify-content-end"
                }  `}
              >
                {invalidCredential && (
                  <span className="fst-normal text-danger fw-semibold">
                    {invalidCredential}
                  </span>
                )}
                <span
                  className="text-decoration-underline btn-link"
                  style={{ cursor: "pointer" }}
                  // onClick={() => setForgetPassword(true)}
                  onClick={() => onForgetPasswordClick()}
                >
                  {"Forget/Reset Password ?"}
                </span>
              </div>
              <Button
                htmlType="submit"
                style={{ background: "#382e99" }}
                type="primary"
                className="rounded-5 p-3 w-75 h-auto mt-4"
              >
                Sign In
              </Button>

              <Button
                htmlType="button"
                style={{ background: "#3c9c70" }}
                type="primary"
                className="rounded-5 p-3 w-75 h-auto mt-3"
                onClick={() => onCreateUserClick()}
              >
                Create New User
              </Button>
            </Form>
          )}
          {forgetPassword && (
            <Form onSubmitCapture={onSubmit}>
              <div className="my-4">
                <Title level={1} className="m-0">
                  Forget Password
                </Title>
              </div>
              <div className="w-75 my-3">
                <Text type="secondary" className="fw-semibold">
                  Email Address or Username
                </Text>
                <Input
                  name="email"
                  placeholder="Email Address or Username"
                  className="h-75"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                
                
              </div>
              <div
                className={`d-flex  w-75 ${
                
                  "justify-content-between"
                    
                }  `}
              >

{errors.email ?<p style={{ fontSize: "x-small", color: "red" }}>
                  {errors.email ? "Please Enter Email" : ""}
                </p>:
                <p style={{ fontSize: "x-small", color: "red" }}>
                  {emailInvalid ? "Please Enter Valid EmailId" : ""}
                </p>}
                <span
                  className="text-decoration-underline btn-link"
                  style={{ cursor: "pointer" }}
                  // onClick={() => setForgetPassword(true)}
                  onClick={() => onUpdatePasswordClick()}
                >
                  {"Update Password ?"}
                </span>
              </div>
              <Button
                htmlType="submit"
                style={{ background: "#382e99" }}
                type="primary"
                className="rounded-5 p-3 w-75 h-auto mt-4"
              >
                Send Email
              </Button>
              <Button
                htmlType="button"
                style={{ background: "#3c9c70" }}
                type="primary"
                className="rounded-5 p-3 w-75 h-auto mt-3"
                // onClick={() => setForgetPassword(false)}
                onClick={() => backToLoginFromForget()}
              >
                Back To Login
              </Button>
            </Form>
          )}
          {createNewUser && (
            <Form onSubmitCapture={onSubmit}>
              <div className="my-4">
                <Title level={1} className="m-0">
                  Sign Up
                </Title>
              </div>
              <div className="w-75 my-3">
                <Text type="secondary" className="fw-semibold">
                  First Name
                </Text>
                <Input
                  name="firstName"
                  placeholder="First Name"
                  className="h-75"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                <p style={{ fontSize: "x-small", color: "red" }}>
                  {errors.firstName ? "Please Enter First Name" : ""}
                </p>
              </div>

              <div className="w-75 my-3">
                <Text type="secondary" className="fw-semibold">
                  Last Name
                </Text>
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  className="h-75"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
                <p style={{ fontSize: "x-small", color: "red" }}>
                  {errors.lastName ? "Please Enter Last Name" : ""}
                </p>
              </div>

              <div className="w-75 my-3">
                <Text type="secondary" className="fw-semibold">
                  Company Name
                </Text>
                <Input
                  name="companyName"
                  placeholder="Company Name"
                  className="h-75"
                  value={formData.companyName}
                  onChange={handleInputChange}
                />
                <p style={{ fontSize: "x-small", color: "red" }}>
                  {errors.lastName ? "Please Enter Company Name" : ""}
                </p>
              </div>

              <div className="w-75 my-3">
                <Text type="secondary" className="fw-semibold">
                  Phone Number
                </Text>
                <Input
                  name="phoneNumber"
                  placeholder="Phone Number"
                  className="h-75"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const { value } = e.target;
                    if (/^\d*$/.test(value)) {
                      // Only allow digits
                      handleInputChange(e); // Call the handler if valid
                    }
                  }}
                />
                {errors.phoneNumber ? (
                  <p style={{ fontSize: "x-small", color: "red" }}>
                    {errors.phoneNumber ? "Please Enter Phone Number" : ""}
                  </p>
                ) : (
                  <p style={{ fontSize: "x-small", color: "red" }}>
                    {mobileInValid ? "Please Enter 10 digits" : ""}
                  </p>
                )}
              </div>

              <div className="w-75 my-3">
                <Text type="secondary" className="fw-semibold">
                  Email Address or Username
                </Text>
                <Input
                  name="email"
                  placeholder="Email Address or Username"
                  className="h-75"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email?<p style={{ fontSize: "x-small", color: "red" }}>
                  {errors.email ? "Please Enter Email" : ""}
                </p>:
                <p style={{ fontSize: "x-small", color: "red" }}>
                  {emailInvalid ? "Please Enter Valid EmailId" : ""}
                </p>}
              </div>

              <div className="w-75 my-3">
                <Text type="secondary" className="fw-semibold">
                  Password
                </Text>
                <Input.Password
                  name="password"
                  className="h-75"
                  placeholder="Password"
                  // iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <p style={{ fontSize: "x-small", color: "red" }}>
                  {errors.password ? "Please Enter Password" : ""}
                </p>
              </div>

              <div className="w-75 my-3">
                <Text type="secondary" className="fw-semibold">
                  Confirm Password
                </Text>
                <Input.Password
                  name="confirmPassword"
                  className="h-75"
                  placeholder="Confirm Password"
                  // iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <p style={{ fontSize: "x-small", color: "red" }}>
                  {errors.password ? "Please Confirm Password" : ""}
                </p>
              </div>

              <Button
                htmlType="submit"
                style={{ background: "#382e99" }}
                type="primary"
                className="rounded-5 p-3 w-75 h-auto mt-4"
              >
                Sign Up
              </Button>

              <Button
                htmlType="button"
                style={{ background: "#3c9c70" }}
                type="primary"
                className="rounded-5 p-3 w-75 h-auto mt-3"
                // onClick={() => setCreateNewUser(false)}
                onClick={() => backToLoginFromSignup()}
              >
                Back To Login
              </Button>
            </Form>
          )}
        </div>
        <div className="col-6">
          <img
            src={loginImage}
            style={{ height: "70vh" }}
            className="rounded-5"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
