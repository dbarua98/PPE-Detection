import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, message, Space, Switch, Tabs } from "antd";
import React, { useState } from "react";
import ViolationCamera from "../layouts/ViolationCamera";
import { settingIcon } from "../utils/base-64-Icons";
import "./Home.scss"
import AddCameraPopup from "../layouts/AddCameraPopup";
import { useAuth } from "../contexts/auth";

const Home = () => {
  const [addCameraPopup,setaddCameraPopup] = useState(false);
  const { user, signOut } = useAuth();
  const items = [
    {
      key: "1",
      label: "All Cameras",
      children: <ViolationCamera setaddCameraPopup={setaddCameraPopup} />,
    },
    {
      key: "2",
      label: "Violation Camera",
      children: "Content of Tab Pane 2",
    },
    {
      key: "3",
      label: "Reports",
      children: "Content of Tab Pane 3",
    },
  ];

  const onChange = (key) => {
    console.log(key);
  };

  const dropdownItems = [
    {
        label: 'Add Camera',
        key: '1',
        // onclick:()=>{setaddCameraPopup(true)}
        // icon: <UserOutlined />,
    },
    {
        label: 'Logout',
        key: '2',
        // icon: <UserOutlined />,
    },
    // {
    //     label: '3rd menu item',
    //     key: '3',
    //     icon: <UserOutlined />,
    //     danger: true,
    // },
    // {
    //     label: '4th menu item',
    //     key: '4',
    //     icon: <UserOutlined />,
    //     danger: true,
    //     disabled: true,
    // },
];

const handleMenuClick = (e) => {
  if (e.key === '1') {
    setaddCameraPopup(true);
  }
  if (e.key === '2') {
    signOut();
  }
  // message.info(`Clicked on menu item: ${e.key}`);
};
  const menuProps = {
    items: dropdownItems,
    onClick: handleMenuClick,
};

  return (
    <div className="px-5 mx-5">
      <div className=" mt-2">
        <div className="d-flex justify-content-between">
          <h2>Logo</h2>
          <div className="d-flex mt-2">
            <div className="d-flex border rounded-3 align-items-center px-2 gap-2 h-75 py-2 ">
              <Avatar
                style={{ backgroundColor: "#87d068" }}
                icon={<UserOutlined />}
                className=""
              />
              <p className="m-0">{"Deepesh"}</p>
            </div>
            {/* <div className='d-flex align-items-center border rounded-3 px-2  h-75'>

                    <img src={settingIcon}  alt="failed" width={58} className="w-auto"/>
                    </div> */}
            <Dropdown menu={menuProps} className="h-75 setting-icon" trigger={["click"]} arrow >
              <Button>
                <Space>
                <img src={settingIcon}  alt="failed" width={58} className="w-auto"/>
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </div>
        <div className="mt-2">
          <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
        </div>
      </div>
      {addCameraPopup &&
      <AddCameraPopup
        showModal={addCameraPopup}
        setShowModal={setaddCameraPopup}
      />}
    </div>
  );
};

export default Home;
