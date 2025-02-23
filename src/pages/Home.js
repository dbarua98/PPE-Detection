import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, Space, Tabs, message, Spin } from "antd";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ViolationCamera from "../layouts/ViolationCamera";
import AddCameraPopup from "../layouts/AddCameraPopup";
import { useAuth } from "../contexts/auth";
import ChangePasswordPopup from "../layouts/ChangePasswordPopup";
import Reports from "../layouts/Reports";
import ViolationList from "../layouts/ViolationList";
import "./Home.scss";

const Home = () => {
  // Loader state: initially false, then set true after 5 seconds.
  const [isUILoaded, setIsUILoaded] = useState(false);

  const [addCameraPopup, setAddCameraPopup] = useState(false);
  const [cameraAdded, setCameraAdded] = useState(false);
  const [changePasswordPopup, setChangePasswordPopup] = useState(false);
  const { user, signOut } = useAuth();

  // Cameras state
  const [cameras, setCameras] = useState([]);
  // Refs for the image elements
  const cameraRefs = useRef([]);

  // Fetch cameras from API
  const fetchCameras = async () => {
    try {
      const baseURL = process.env.REACT_APP_BASE_URL;
      const response = await axios.get(`${baseURL}/camera/list`);
      if (response.status === 200) {
        setCameras(response.data);
      }
    } catch (error) {
      console.error("Error fetching camera list:", error);
      message.error("Failed to load cameras.");
    }
  };

  useEffect(() => {
    fetchCameras();
  }, [cameraAdded]);

  // Function to send frames to the detection API
  const sendFrames = () => {
    const formData = new FormData();
    const blobPromises = [];

    cameraRefs.current.forEach((imgElement, index) => {
      if (imgElement && imgElement.naturalWidth && imgElement.naturalHeight) {
        const canvas = document.createElement("canvas");
        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imgElement, 0, 0);

        const blobPromise = new Promise((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const cameraId =
                imgElement.getAttribute("data-camera-id") || `${index + 1}`;
              resolve({ blob, cameraId });
            } else {
              resolve(null);
            }
          }, "image/png");
        });
        blobPromises.push(blobPromise);
      }
    });

    Promise.all(blobPromises)
      .then((results) => {
        let hasValidImages = false;
        results.forEach((result) => {
          if (result) {
            formData.append(result.cameraId, result.blob);
            hasValidImages = true;
          }
        });
        if (hasValidImages) {
          return fetch("http://34.46.36.202/ppe/detect", {
            method: "POST",
            headers: {
              "X-Session-Token": "bb86b35928774a05a615e6f0a6d1c031",
            },
            body: formData,
          });
        }
      })
      .then((response) => {
        if (response) {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        }
      })
      .then((result) => {
        if (result) {
          console.log("Detection Response:", result);
          // Process detection result as needed
        }
      })
      .catch((error) => {
        console.error("Error in frame capture/detection process:", error);
      });
  };

  // Set an interval to call sendFrames every second once cameras are loaded
  useEffect(() => {
    const intervalId = setInterval(() => {
      sendFrames();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [cameras]);

  // Set a timeout for showing the UI after 5 seconds
  useEffect(() => {
    const hasReloaded = localStorage.getItem("reloaded");
    const uiTimeout = setTimeout(() => {
      if (!hasReloaded) {
        localStorage.setItem("reloaded", "true");
        window.location.reload();
      } else {
        setIsUILoaded(true);
        // Optionally, clear the flag if you no longer need it:
        localStorage.removeItem("reloaded");
      }
    }, 0);
    return () => clearTimeout(uiTimeout);
  }, []);

  // Tab items for your page
  const items = [
    {
      key: "1",
      label: "All Cameras",
      children: (
        <ViolationCamera
          setaddCameraPopup={setAddCameraPopup}
          cameraAdded={cameraAdded}
          setCameraAdded={setCameraAdded}
        />
      ),
    },
    {
      key: "2",
      label: "Violation Camera",
      children: <ViolationList />,
    },
    {
      key: "3",
      label: "Reports",
      children: <Reports />,
    },
  ];

  const onChange = (key) => {
    console.log("Tab changed to:", key);
  };

  const dropdownItems = [
    { label: "Add Camera", key: "1" },
    { label: "Change Password", key: "2" },
    { label: "Logout", key: "3" },
  ];

  const handleMenuClick = (e) => {
    if (e.key === "1") {
      setAddCameraPopup(true);
    }
    if (e.key === "2") {
      setChangePasswordPopup(true);
    }
    if (e.key === "3") {
      signOut();
    }
  };

  const menuProps = {
    items: dropdownItems,
    onClick: handleMenuClick,
  };

  // If UI is not loaded yet, show a spinner.
  if (!isUILoaded) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="px-5 mx-5">
      <div className="mt-2">
        <div className="d-flex justify-content-between">
          <h2>Logo</h2>
          <div className="d-flex mt-2">
            <div className="d-flex border rounded-3 align-items-center px-2 gap-2 h-75 py-2">
              <Avatar style={{ backgroundColor: "#87d068" }} icon={<UserOutlined />} />
              <p className="m-0">{"Deepesh"}</p>
            </div>
            <Dropdown
              menu={menuProps}
              className="h-75 setting-icon"
              trigger={["click"]}
              arrow
            >
              <Button>
                <Space>
                  <img src="/path/to/settingIcon" alt="settings" width={58} />
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

      {/* Keep the camera images off-screen so they load and are available for detection */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        {cameras.map((camera, index) => (
          <div key={camera.camera_unique_id} className="camera-item">
            <img
              ref={(el) => (cameraRefs.current[index] = el)}
              data-camera-id={camera.camera_unique_id}
              src={camera.ip}
              alt={`Camera ${index + 1}`}
              crossOrigin="anonymous"
              onLoad={() =>
                console.log("Image loaded for camera", camera.camera_unique_id)
              }
              style={{ width: "320px", height: "240px" }}
            />
          </div>
        ))}
      </div>

      {addCameraPopup && (
        <AddCameraPopup
          showModal={addCameraPopup}
          setShowModal={setAddCameraPopup}
          setCameraAdded={setCameraAdded}
        />
      )}
      {changePasswordPopup && (
        <ChangePasswordPopup
          showModal={changePasswordPopup}
          setShowModal={setChangePasswordPopup}
        />
      )}
    </div>
  );
};

export default Home;
