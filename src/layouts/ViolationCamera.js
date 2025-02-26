import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Dropdown, message, Modal, Space, Switch } from "antd";
import {List, Skeleton } from "antd";
import React, { useState, useEffect, useRef } from "react";
import cameraDummyImage from "../images/dummyCamera.webp";
import "./ViolationCamera.scss";
import AllViolationPopup from "./AllViolationPopup";
import axios from "axios";
import EditCameraPopup from "./EditCameraPopup";

const ViolationCamera = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const baseURL = process.env.REACT_APP_BASE_URL;
  const cameraRefs = useRef([]);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [fullScreenSrc, setFullScreenSrc] = useState("");
  const [violatedCameras, setViolatedCameras] = useState([]);

  const openFullScreenView = (src) => {
    setFullScreenSrc(src);
    setIsFullScreenOpen(true);
  };

  const closeFullScreenView = () => {
    setIsFullScreenOpen(false);
    setFullScreenSrc("");
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsEditPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsEditPopupVisible(false);
  };

  const fetchList = async () => {
    try {
      const response = await axios.get(`${baseURL}/camera/list`);
      if (response.status === 200) {
        console.log("heyy", response.data);
        setList(response.data);
        setVideos(response.data);
      }
    } catch (error) {
      console.error("Error fetching camera list:", error);
    } finally {
      setLoading(false);
      props?.setCameraAdded(false);
    }
  };
  useEffect(() => {
    fetchList();
  }, [props?.cameraAdded]);

  const handleRemove = async (cameraId) => {
    try {
      await axios.delete(`${baseURL}/camera/${cameraId}`);
      message.success("Camera removed successfully!");
      setList(list.filter((item) => item.camera_unique_id !== cameraId));
      fetchList();
    } catch (error) {
      message.error("Failed to remove the camera.");
      console.error("Remove Error:", error);
    }
  };

  // CAPTURE FRAMES FROM MAIN IP CAMERA AND SEND TO API
  useEffect(() => {
    fetchList();
  }, [props?.cameraAdded]);

  // CAPTURE FRAMES FROM ALL CAMERAS AND SEND IN A SINGLE API CALL
  useEffect(() => {
    const intervalId = setInterval(() => {
      const formData = new FormData();
      const blobPromises = [];
      console.log("cameraRefsrty", cameraRefs);
      // Loop through each camera image element
      cameraRefs.current.forEach((imgElement, index) => {
        if (imgElement && imgElement.naturalWidth && imgElement.naturalHeight) {
          // Create an off-screen canvas
          const canvas = document.createElement("canvas");
          canvas.width = imgElement.naturalWidth;
          canvas.height = imgElement.naturalHeight;
          const ctx = canvas.getContext("2d");

          // Draw the current frame from the image element
          ctx.drawImage(imgElement, 0, 0);

          //     // Create a promise for blob creation
          const blobPromise = new Promise((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) {
                // Get the original camera ID
                const originalId = imgElement.getAttribute("data-camera-id");
                // Format the camera ID to match the required format
                const cameraId = `${originalId || index + 1}`;
                resolve({ blob, cameraId });
              } else {
                resolve(null);
              }
            }, "image/png");
          });

          blobPromises.push(blobPromise);
        }
      });
      console.log("blobpromise", blobPromises);
      console.log("videos", videos);
      // Wait for all blobs to be created
      Promise.all(blobPromises)
        .then((results) => {
          let hasValidImages = false;

          // Add valid blobs to FormData
          results.forEach((result) => {
            if (result) {
              formData.append(result.cameraId, result.blob);
              hasValidImages = true;
              console.log("Adding camera:", result.cameraId); // Debug log
            }
          });

          // Only make the API call if we have valid images
          if (hasValidImages) {
            console.log("Sending FormData with cameras:", formData.getAll); // Debug log
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
            console.log("PPE Detection Response:", result);
            // Handle the detection results here
            if (result.results) {
              const violated = result.results

                .filter((r) => r.detections?.violations?.length > 0)

                .map((r) => r.camera_id.toString());

              setViolatedCameras(violated);
            }
          }
        })
        .catch((error) => {
          console.error("Error in frame capture process:", error);
        });
    }, 1000);

    // Cleanup function
    return () => clearInterval(intervalId);
  }, [list]); // Re-run if the list of cameras changes

  const [videos, setVideos] = useState([]);
  const [selectedRange, setSelectedRange] = useState([0, 5]);

  const generateDropdownItems = () => {
    const totalCameras = videos.length;
    const pages = Math.ceil(totalCameras / 5);
    let items = [];
    for (let i = 0; i < pages; i++) {
      const start = i * 5;
      const end = (i + 1) * 5;
      items.push({
        label: `${start + 1}-${Math.min(end, totalCameras)}`,
        key: `${i}`,
        // Update range and call setVisibleCams when clicked.
        onClick: () => {
          const newRange = [start, end];
          setSelectedRange(newRange);
          const newVisibleVideos = videos.slice(newRange[0], newRange[1]);
          const hiddenVideos = videos.filter(
            (cam) => !newVisibleVideos.includes(cam)
          );
          console.log("dfghj", hiddenVideos);
          // props.setVisibleCams({ visible: newVisibleVideos, hidden: hiddenVideos });
          props.setVisibleCams([hiddenVideos]);
        },
        icon: <UserOutlined />,
      });
    }
    return items;
  };

  const handleVideoClick = (index) => {
    if (index !== 0) {
      const newVideos = [...videos];
      [newVideos[0], newVideos[index]] = [newVideos[index], newVideos[0]];
      setVideos(newVideos);
    }
  };

  const dropdownItems = [
    {
      label: "1st menu item",
      key: "1",
      icon: <UserOutlined />,
    },
    {
      label: "2nd menu item",
      key: "2",
      icon: <UserOutlined />,
    },
    {
      label: "3rd menu item",
      key: "3",
      icon: <UserOutlined />,
      danger: true,
    },
    {
      label: "4th menu item",
      key: "4",
      icon: <UserOutlined />,
      danger: true,
      disabled: true,
    },
  ];

  const handleMenuClick = (e) => {
    message.info("Click on menu item.");
    console.log("click", e);
  };

  const menuProps = {
    items: generateDropdownItems(),
  };
  const visibleVideos = videos.slice(selectedRange[0], selectedRange[1]);
  const hiddenVideos = videos.filter(
    (video, index) => index < selectedRange[0] || index >= selectedRange[1]
  );

  const getCameraStyle = (cameraId, defaultStyle = {}) => {
    // If the cameraId is of the form "camera_375", extract "375"
    const extractedId =
      cameraId && cameraId.includes("_") ? cameraId.split("_")[1] : cameraId;

    return violatedCameras.includes(extractedId?.toString())
      ? { ...defaultStyle, border: "2px solid red" }
      : defaultStyle;
  };
  if (props.tabKey !== "1") {
    return null;
  }

  return (
    <>
      {props.tabKey == "1" ? (
        <div>
          <div className="d-flex justify-content-between  ">
            <Dropdown menu={menuProps} className="fw-semibold p-3">
              <Button>
                <Space>
                  Total Visuals: {selectedRange[0] + 1}-
                  {Math.min(selectedRange[1], videos.length)}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            {/* <div className="d-flex gap-2">
          <div className="d-flex gap-2 align-items-center">
            <span className="item-detect">{"Gloves"}</span>
            <Switch defaultChecked title="Gloves" />
          </div>
          <div className="d-flex gap-2 align-items-center">
            <span className="item-detect">{"Mask"}</span>
            <Switch defaultChecked title="Mask" />
          </div>
          <div className="d-flex gap-2 align-items-center">
            <span className="item-detect">{"Helmet"}</span>
            <Switch defaultChecked title="Helmet" />
          </div>
          <Button onClick={() => setIsModalOpen(true)}>All Violation</Button>
        </div> */}
          </div>
          <div className="mt-5">
            <div className="row">
              {visibleVideos.length === 2 ? (
                visibleVideos.map((video, i) => (
                  <div key={i} className="col-12 col-md-6">
                    <div
                      className="gallery-item"
                      style={getCameraStyle(visibleVideos[i]?.camera_unique_id)}
                    >
                      <img
                        ref={(el) => {
                          cameraRefs.current[i] = el;
                        }}
                        data-camera-id={visibleVideos[i]?.camera_unique_id}
                        src={`${visibleVideos[i]?.ip}`}
                        alt="IP Camera"
                        crossOrigin="anonymous"
                        style={{ height: "270px", width: "100%" }}
                        className="img-fluid rounded-4 "
                        autoPlay
                        playsInline
                        muted
                      />
                      <div
                        className="camera-label"
                        onClick={() => handleVideoClick(i)}
                      >{`CAM ${i + 1}`}</div>
                    </div>
                  </div>
                ))
              ) : visibleVideos.length === 3 ? (
                <>
                  <div className="col-12 col-lg-6 large">
                    <div
                      className="gallery-item"
                      style={getCameraStyle(visibleVideos[0]?.camera_unique_id)}
                    >
                      <img
                        ref={(el) => {
                          cameraRefs.current[0] = el;
                        }}
                        data-camera-id={visibleVideos[0]?.camera_unique_id}
                        src={`${visibleVideos[0]?.ip}`}
                        alt="IP Camera"
                        crossOrigin="anonymous"
                        style={{
                          height: "270px",
                          width: "100%",
                          cursor: "pointer",
                        }}
                        className="img-fluid rounded-4"
                        autoPlay
                        playsInline
                        muted
                        onClick={() => openFullScreenView(visibleVideos[0]?.ip)}
                      />
                      <div
                        className="camera-label"
                        onClick={() => openFullScreenView(visibleVideos[0]?.ip)}
                      >
                        CAM 1
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-6 small-grid">
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <div
                          className="gallery-item"
                          style={getCameraStyle(
                            visibleVideos[1]?.camera_unique_id
                          )}
                        >
                          <img
                            ref={(el) => {
                              cameraRefs.current[1] = el;
                            }}
                            data-camera-id={visibleVideos[1]?.camera_unique_id}
                            src={
                              isFullScreenOpen ? "" : `${visibleVideos[1]?.ip}`
                            }
                            alt="IP Camera"
                            crossOrigin="anonymous"
                            style={{
                              height: "270px",
                              width: "100%",
                              cursor: "pointer",
                            }}
                            className="img-fluid rounded-4"
                            autoPlay
                            playsInline
                            muted
                            onClick={() =>
                              openFullScreenView(visibleVideos[1]?.ip)
                            }
                          />
                          <div
                            className="camera-label"
                            onClick={() =>
                              openFullScreenView(visibleVideos[1]?.ip)
                            }
                          >
                            CAM 2
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div
                          className="gallery-item"
                          style={getCameraStyle(
                            visibleVideos[2]?.camera_unique_id
                          )}
                        >
                          <img
                            ref={(el) => {
                              cameraRefs.current[2] = el;
                            }}
                            data-camera-id={visibleVideos[2]?.camera_unique_id}
                            src={`${visibleVideos[2]?.ip}`}
                            alt="IP Camera"
                            crossOrigin="anonymous"
                            style={{
                              height: "270px",
                              width: "100%",
                              cursor: "pointer",
                            }}
                            className="img-fluid rounded-4"
                            autoPlay
                            playsInline
                            muted
                            onClick={() =>
                              openFullScreenView(visibleVideos[2]?.ip)
                            }
                          />
                          <div
                            className="camera-label"
                            onClick={() =>
                              openFullScreenView(visibleVideos[2]?.ip)
                            }
                          >
                            CAM 3
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div
                          className="d-flex flex-column align-items-center justify-content-center gallery-item border border-2 rounded-4 bg-dark-subtle"
                          style={{ height: "270px", width: "100%" }}
                        >
                          <img
                            style={{
                              height: "auto",
                              width: "9%",
                              border: "1px dashed gray",
                            }}
                            src={cameraDummyImage}
                            alt="Add Camera"
                            className="p-2 rounded-4"
                            onClick={() => props.setaddCameraPopup(true)}
                          />
                          <div className="camera-label">Add Camera</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-12 col-lg-6 large">
                    <div
                      className="gallery-item position-relative"
                      style={getCameraStyle(list[0]?.camera_unique_id, {
                        height: "545px",

                        width: "1020px",

                        backgroundColor: "black",

                        cursor: "pointer",
                      })}
                      onClick={() => handleVideoClick(0)}
                    >
                      <img
                        ref={(el) => {
                          cameraRefs.current[0] = el;
                        }}
                        data-camera-id={visibleVideos[0]?.camera_unique_id}
                        src={`${visibleVideos[0]?.ip}`}
                        alt="IP Camera"
                        crossOrigin="anonymous"
                        style={{
                          height: "545px",
                          width: "1020px",
                          backgroundColor: "black",
                          cursor: "pointer",
                        }}
                        className="img-fluid rounded-4"
                        autoPlay
                        playsInline
                        muted
                        onClick={() => openFullScreenView(list[0]?.ip)}
                      />
                      <div
                        className="camera-label position-absolute bg-dark-subtle rounded-4 fw-bold h6 p-2 px-3 opacity-75 text-center w-auto"
                        style={{
                          cursor: "pointer",
                          zIndex: 1000,
                          marginTop: "-82px",
                          width: "20%",
                          marginLeft: "20px",
                        }}
                        onClick={() => openFullScreenView(list[1]?.ip)}
                      >
                        CAM 1
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-6 small-grid">
                    <div className="row">
                      {visibleVideos.slice(1).map((video, i) => (
                        <div key={i} className="col-6 small">
                          <div
                            className="gallery-item position-relative"
                            style={getCameraStyle(list[i]?.camera_unique_id)}
                            // onClick={() => handleVideoClick(i + 1)}
                          >
                            <img
                              ref={(el) => {
                                cameraRefs.current[i + 1] = el;
                              }}
                              data-camera-id={
                                visibleVideos[i + 1]?.camera_unique_id
                              }
                              src={`${visibleVideos[i + 1]?.ip}`}
                              alt="IP Camera"
                              crossOrigin="anonymous"
                              style={{
                                height: "270px",
                                width: "100%",
                                cursor: "pointer",
                              }}
                              className="img-fluid rounded-4"
                              autoPlay
                              playsInline
                              muted
                              onClick={() => openFullScreenView(list[i]?.ip)}
                            />
                            <div
                              className="camera-label position-absolute bg-dark-subtle rounded-4 fw-bold h6 p-2 opacity-75 text-center"
                              style={{
                                cursor: "pointer",
                                zIndex: 1000,
                                marginTop: "-70px",
                                width: "20%",
                                marginLeft: "20px",
                              }}
                              // onClick={() => handleVideoClick(i + 1)}
                              onClick={() => openFullScreenView(list[i]?.ip)}
                            >{`CAM ${i + 2}`}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="row" style={{ display: "none" }}>
                      {hiddenVideos.map((video, i) => (
                        <div key={i} className="col-6 small">
                          <div
                            className="gallery-item position-relative"
                            style={getCameraStyle(list[i]?.camera_unique_id)}
                            // onClick={() => handleVideoClick(i + 1)}
                          >
                            <img
                              // ref={cameraRef}
                              ref={(el) => {
                                cameraRefs.current[5 + i] = el;
                              }}
                              data-camera-id={hiddenVideos[i]?.camera_unique_id}
                              src={`${hiddenVideos[i]?.ip}`}
                              alt="IP Camera"
                              crossOrigin="anonymous"
                              style={{
                                height: "270px",
                                width: "100%",
                                cursor: "pointer",
                              }}
                              className="img-fluid rounded-4"
                              autoPlay
                              playsInline
                              muted
                              onClick={() => openFullScreenView(list[i]?.ip)}
                            />
                            <div
                              className="camera-label position-absolute bg-dark-subtle rounded-4 fw-bold h6 p-2 opacity-75 text-center"
                              style={{
                                cursor: "pointer",
                                zIndex: 1000,
                                marginTop: "-70px",
                                width: "20%",
                                marginLeft: "20px",
                              }}
                              // onClick={() => handleVideoClick(i + 1)}
                              onClick={() => openFullScreenView(list[i]?.ip)}
                            >{`CAM ${i + 2}`}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div>
              <Dropdown
                menu={menuProps}
                className="mt-5 p-4 fw-semibold  "
                trigger={["click"]}
              >
                <Button>
                  <Space>
                    List of all Cameras
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            </div>
            <div>
              <List
                className="demo-loadmore-list border border-1 px-4 mt-3"
                // loading={loading}
                itemLayout="horizontal"
                dataSource={list}
                renderItem={(item) => (
                  <List.Item>
                    <Skeleton avatar title={false} loading={loading} active>
                      <List.Item.Meta
                        title={
                          <a
                            href="#"
                            className="text-decoration-none fs-6 fw-bolder"
                          >
                            {item?.camera_unique_id}
                          </a>
                        }
                      />
                      <Button
                        type="primary"
                        className="rounded-4 me-2 fw-semibold"
                      >
                        View
                      </Button>
                      <Button
                        className="rounded-4 me-2 text-primary border-primary fw-semibold"
                        onClick={() => handleEditClick(item)}
                      >
                        Edit
                      </Button>
                      {/* <Button className="rounded-4 text-danger border-danger fw-semibold">Remove</Button> */}
                      <Button
                        className="rounded-4 text-danger border-danger fw-semibold"
                        onClick={() => handleRemove(item?.camera_unique_id)}
                      >
                        Remove
                      </Button>
                    </Skeleton>
                    <EditCameraPopup
                      isVisible={isEditPopupVisible}
                      onClose={handleClosePopup}
                      initialData={{
                        camera_unique_id: selectedItem?.camera_unique_id,
                        violations: selectedItem?.violations || [],
                      }}
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
          <AllViolationPopup
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
          {/* Full-Screen Modal for Camera */}
          <Modal
            visible={isFullScreenOpen}
            footer={null}
            onCancel={closeFullScreenView}
            centered
            width="100%"
            style={{ top: 0, padding: 0 }}
            bodyStyle={{
              padding: 0,
              backgroundColor: "black",
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={fullScreenSrc}
              alt="Full Screen Camera"
              style={{
                width: "100%",
                height: "100vh",
                objectFit: "contain",
              }}
            />
          </Modal>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default ViolationCamera;
