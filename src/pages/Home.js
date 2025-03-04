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
import { settingIcon } from "../utils/base-64-Icons";

// Import the logo image
import logo from "../images/logo.png";

const Home = () => {
  const [isUILoaded, setIsUILoaded] = useState(false);
  const [addCameraPopup, setAddCameraPopup] = useState(false);
  const [cameraAdded, setCameraAdded] = useState(false);
  const [changePasswordPopup, setChangePasswordPopup] = useState(false);
  // Initialize tabKey from localStorage if available; default to "1"
  const [tabKey, setTabKey] = useState(() => localStorage.getItem("currentTabKey") || "1");
  const { user, signOut } = useAuth();
  const [VisibleCams, setVisibleCams] = useState([]);
  const [cameras, setCameras] = useState([]);
  const cameraRefs = useRef([]);
  const [username, setUsername] = useState("");
  const baseURL = process.env.REACT_APP_BASE_URL;

  // Fetch username from API
  useEffect(() => {
    const token = localStorage.getItem("token");
    const myHeaders = new Headers();
    myHeaders.append("X-Session-Token", token);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    fetch(`${baseURL}/auth`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setUsername(result.username);
      })
      .catch((error) => console.error(error));
  }, []);

  // Notification API call using EventSource for real-time notifications
  useEffect(() => {
    const eventSource = new EventSource("http://35.208.97.216/notifications");

    eventSource.onmessage = (e) => {
      let dataStr = e.data;
      // Remove prefix "data: " if present
      if (dataStr.startsWith("data: ")) {
        dataStr = dataStr.slice("data: ".length);
      }
      try {
        const data = JSON.parse(dataStr);
        // Check if violation info exists and display a toast notification
        if (data && data.camera_unique_id && data.violations) {
          message.info(
            `Violation detected on ${data.camera_unique_id}: ${data.violations.join(", ")}`
          );
        }
      } catch (error) {
        console.error("Error parsing notification:", error);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchCameras = async () => {
    try {
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
          return fetch(`${baseURL}/ppe/detect`, {
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
        }
      })
      .catch((error) => {
        console.error("Error in frame capture/detection process:", error);
      });
  };

  // Set an interval to call sendFrames every second, but only if tabKey is "2" or "3"
  useEffect(() => {
    if (tabKey === "2" || tabKey === "3") {
      const intervalId = setInterval(() => {
        sendFrames();
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [cameras, tabKey]);

  // Set a timeout for showing the UI after 500ms
  useEffect(() => {
    const hasReloaded = localStorage.getItem("reloaded");
    const uiTimeout = setTimeout(() => {
      if (!hasReloaded) {
        localStorage.setItem("reloaded", "true");
        window.location.reload();
      } else {
        setIsUILoaded(true);
        localStorage.removeItem("reloaded");
      }
    }, 500);
    return () => clearTimeout(uiTimeout);
  }, []);

  const items = [
    {
      key: "1",
      label: "All Cameras",
      children: (
        <ViolationCamera
          setaddCameraPopup={setAddCameraPopup}
          cameraAdded={cameraAdded}
          setCameraAdded={setCameraAdded}
          setVisibleCams={setVisibleCams}
          setCameras={setCameras}
          tabKey={tabKey}
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

  // On every tab change, store the new tab key and force a reload
  const onChange = (key) => {
    localStorage.setItem("currentTabKey", key);
    window.location.reload();
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
          {/* Replace text "Logo" with your image */}
          <img src={logo} alt="Logo" width={75} style={{ borderRadius: "50px" }} />

          <div className="d-flex mt-2">
            <div className="d-flex border rounded-3 align-items-center px-2 gap-2 h-75 py-2">
              <Avatar style={{ backgroundColor: "#87d068" }} icon={<UserOutlined />} />
              {/* Render fetched username; fallback to empty string */}
              <p className="m-0">{username}</p>
            </div>
            <Dropdown menu={menuProps} className="h-75 setting-icon" trigger={["click"]} arrow>
              <Button>
                <Space>
                  <img src={settingIcon} alt="failed" width={58} className="w-auto" />
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </div>
        <div className="mt-2">
          {/* Use activeKey to control the Tabs */}
          <Tabs activeKey={tabKey} items={items} onChange={onChange} />
        </div>
      </div>

      {/* Render off-screen camera images only if tabKey is "2" or "3" */}
      {(tabKey === "2" || tabKey === "3") && (
        <div>
          {cameras?.map((camera, index) => (
            <div
              key={camera.camera_unique_id}
              className="camera-item"
              style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
            >
              <img
                ref={(el) => (cameraRefs.current[index] = el)}
                data-camera-id={camera?.camera_unique_id}
                src={camera?.ip}
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
      )}

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
