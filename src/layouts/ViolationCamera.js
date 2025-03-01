import { DownOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  message,
  Modal,
  Space,
  Switch,
  List,
  Skeleton,
} from "antd";
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

  // Read the selected range from sessionStorage or default to [0, 5]
  const storedRange = sessionStorage.getItem("selectedRange");
  const initialRange = storedRange ? JSON.parse(storedRange) : [0, 5];
  const [selectedRange, setSelectedRange] = useState(initialRange);
  const [videos, setVideos] = useState([]);

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
      const imagePromises = []; 
      console.log("cameraRefs", cameraRefs); 
      
      // Loop through each camera image element 
      cameraRefs.current.forEach((imgElement, index) => { 
        if (imgElement && imgElement.naturalWidth && imgElement.naturalHeight) { 
          // Create an off-screen canvas with exact 640x640 dimensions
          const canvas = document.createElement("canvas");
          canvas.width = 640;
          canvas.height = 640;
          const ctx = canvas.getContext("2d");
          
          // Calculate scaling to fit the image into 640x640 square while maintaining aspect ratio
          const aspectRatio = imgElement.naturalWidth / imgElement.naturalHeight;
          let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
          
          if (aspectRatio > 1) {
            // Image is wider than tall
            drawHeight = 640;
            drawWidth = drawHeight * aspectRatio;
            offsetX = -(drawWidth - 640) / 2;
          } else {
            // Image is taller than wide
            drawWidth = 640;
            drawHeight = drawWidth / aspectRatio;
            offsetY = -(drawHeight - 640) / 2;
          }
          
          // Fill with black background first (optional - creates black bars for non-square images)
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, 640, 640);
          
          // Center and draw the image
          ctx.drawImage(imgElement, offsetX, offsetY, drawWidth, drawHeight);
          
          // Create a promise for JPEG image creation
          const imagePromise = new Promise((resolve) => {
            // Convert to JPEG using toBlob directly
            canvas.toBlob((blob) => {
              if (blob) {
                const originalId = imgElement.getAttribute("data-camera-id");
                const cameraId = `${originalId || index + 1}`;
                resolve({ blob, cameraId });
              } else {
                resolve(null);
              }
            }, "image/jpeg", 0.9); // Explicitly specify JPEG format
          });
          
          imagePromises.push(imagePromise);
        } 
      }); 
      
      console.log("imagePromises", imagePromises); 
      console.log("videos", videos); 
      
      // Wait for all images to be created 
      Promise.all(imagePromises) 
        .then((results) => { 
          let hasValidImages = false; 
          
          // Add valid images to FormData 
          results.forEach((result) => { 
            if (result) { 
              // Add JPEG blob directly to FormData
              formData.append(result.cameraId, result.blob, `camera_${result.cameraId}.jpg`); // Ensure filename has .jpg extension
              hasValidImages = true; 
              console.log("Adding camera:", result.cameraId); 
            } 
          }); 
          
          // Only make the API call if we have valid images 
          if (hasValidImages) { 
            console.log("Sending FormData with cameras:", formData.getAll); 
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
            console.log("PPE Detection Response:", result); 
            if (result.results) { 
              const violated = result.results 
                .filter((r) => r?.violations?.length > 0) 
                .map((r) => r.camera_id.toString()); 
              setViolatedCameras(violated); 
            } 
          } 
        }) 
        .catch((error) => { 
          console.error("Error in frame capture process:", error); 
        }); 
    }, 1000); 
    
    return () => clearInterval(intervalId); 
  }, [list]);
  
  // Helper function to convert base64 data URI to Blob
  function dataURItoBlob(dataURI) {
    // Convert base64/URLEncoded data component to raw binary data
    const byteString = atob(dataURI.split(',')[1]);
    
    // Separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
    // Write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    // Write the ArrayBuffer to a blob
    return new Blob([ab], { type: mimeString });
  }

  // Generate dropdown items; when a page is selected, store the new range in sessionStorage and reload.
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
        onClick: () => {
          const newRange = [start, end];
          sessionStorage.setItem("selectedRange", JSON.stringify(newRange));
          window.location.reload();
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

  const menuProps = {
    items: generateDropdownItems(),
  };

  const visibleVideos = videos.slice(selectedRange[0], selectedRange[1]);
  const hiddenVideos = videos.filter(
    (video, index) => index < selectedRange[0] || index >= selectedRange[1]
  );

  // Assign a ref using the video's actual index in the "videos" array.
  const assignRef = (video, el) => {
    if (el) {
      const idx = videos.indexOf(video);
      if (idx !== -1) {
        cameraRefs.current[idx] = el;
      }
    }
  };

  const getCameraStyle = (cameraId, defaultStyle = {}) => {
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
      {props.tabKey === "1" ? (
        <div>
          <div className="d-flex justify-content-between">
            <Dropdown menu={menuProps} className="fw-semibold p-3">
              <Button>
                <Space>
                  Total Visuals: {selectedRange[0] + 1}-
                  {Math.min(selectedRange[1], videos.length)}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
          <div className="mt-5">
           { list.length>0?<div className="row">
              {visibleVideos.length === 2 ? (
                visibleVideos.map((video, i) => (
                  <div key={i} className="col-12 col-md-6">
                    <div
                      className="gallery-item"
                      style={getCameraStyle(video?.camera_unique_id)}
                    >
                      <img
                        ref={(el) => assignRef(video, el)}
                        data-camera-id={video?.camera_unique_id}
                        src={`${video?.ip}`}
                        alt="IP Camera"
                        crossOrigin="anonymous"
                        style={{ height: "270px", width: "100%" }}
                        className="img-fluid rounded-4"
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
                        ref={(el) => assignRef(visibleVideos[0], el)}
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
                            ref={(el) => assignRef(visibleVideos[1], el)}
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
                            ref={(el) => assignRef(visibleVideos[2], el)}
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
                      style={getCameraStyle(visibleVideos[0]?.camera_unique_id, {
                        height: "545px",
                        width: "670px",
                        backgroundColor: "black",
                        cursor: "pointer",
                        borderRadius:"16px",

                      })}
                      onClick={() => handleVideoClick(0)}
                    >
                      <div
                        className="camera-label position-absolute bg-dark-subtle rounded-4 fw-bold h6 p-2 px-3 opacity-75 text-center w-auto"
                        style={{
                          cursor: "pointer",
                          zIndex: 1000,
                          // marginTop: "-82px",
                          marginTop: "480px",
                          width: "20%",
                          marginLeft: "20px",
                        }}
                        onClick={() => openFullScreenView(list[1]?.ip)}
                      >
                        CAM 1
                      </div>
                      <img
                        ref={(el) => assignRef(visibleVideos[0], el)}
                        data-camera-id={visibleVideos[0]?.camera_unique_id}
                        src={`${visibleVideos[0]?.ip}`}
                        alt="IP Camera"
                        crossOrigin="anonymous"
                        style={{
                          height: "100%",
                          width: "100%",
                          backgroundColor: "black",
                          cursor: "pointer",
                        }}
                        className="img-fluid rounded-4"
                        autoPlay
                        playsInline
                        muted
                        onClick={() => openFullScreenView(list[0]?.ip)}
                      />
                      
                    </div>
                  </div>
                  <div className="col-12 col-lg-6 small-grid">
                    <div className="row">
                      {visibleVideos.slice(1).map((video, i) => (
                        <div key={i} className="col-6 small">
                          <div
                            className="gallery-item position-relative"
                            style={getCameraStyle(visibleVideos[i]?.camera_unique_id)}
                            onClick={() => openFullScreenView(list[i]?.ip)}
                          >
                            <div
                              className="camera-label position-absolute bg-dark-subtle rounded-4 fw-bold h6 p-2 opacity-75 text-center"
                              style={{
                                cursor: "pointer",
                                zIndex: 1000,
                                marginTop: "200px",
                                width: "24%",
                                marginLeft: "20px",
                              }}
                              onClick={() => openFullScreenView(list[i]?.ip)}
                            >{`CAM ${i + 2}`}</div>
                            <img
                              ref={(el) => assignRef(visibleVideos[i + 1], el)}
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
                            
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="row" style={{ display: "none" }}>
                      {hiddenVideos.map((video, i) => (
                        <div key={i} className="col-6 small">
                          <div
                            className="gallery-item position-relative"
                            style={getCameraStyle(hiddenVideos[i]?.camera_unique_id)}
                            onClick={() => openFullScreenView(list[i]?.ip)}
                          >
                            <img
                              ref={(el) => assignRef(video, el)}
                              data-camera-id={video?.camera_unique_id}
                              src={`${video?.ip}`}
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
                              onClick={() => openFullScreenView(list[i]?.ip)}
                            >{`CAM ${i + 2}`}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>:<></>}
          </div>
          <div>
            <Dropdown
              menu={menuProps}
              className="mt-5 p-4 fw-semibold"
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
          <AllViolationPopup
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
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
          {/* Extra container for hidden videos (display: none) so that detection API sees all cameras */}
          <div style={{ display: "none" }}>
            {hiddenVideos.map((video, i) => (
              <div key={video.camera_unique_id}>
                <img
                  ref={(el) => assignRef(video, el)}
                  data-camera-id={video?.camera_unique_id}
                  src={`${video?.ip}`}
                  alt={`IP Camera hidden ${i}`}
                  crossOrigin="anonymous"
                  style={{ height: "270px", width: "100%" }}
                  className="img-fluid rounded-4"
                  autoPlay
                  playsInline
                  muted
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default ViolationCamera;
