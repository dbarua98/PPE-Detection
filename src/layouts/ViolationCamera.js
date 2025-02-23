import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Dropdown, message, Modal, Space, Switch, Tabs } from 'antd';
import { Avatar, List, Skeleton } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import cameraDummyImage from '../images/dummyCamera.webp';
import './ViolationCamera.scss';
import AllViolationPopup from './AllViolationPopup';
import io from 'socket.io-client';
import axios from 'axios';
import EditCameraPopup from './EditCameraPopup';


const ViolationCamera = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const count = 3;
  const fakeDataUrl = `https://randomuser.me/api/?results=${count}&inc=name,gender,email,nat,picture&noinfo`;
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [list, setList] = useState([]);
  const [videoRefs, setVideoRefs] = useState([]);
  const [streams, setStreams] = useState([]);
  const socketRef = useRef(null);
  const peerConnectionsRef = useRef([]);
  const iceCandidatesRef = useRef([]);
  const servers = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
    ],
  };
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const baseURL = process.env.REACT_APP_BASE_URL;
  const videoRef = useRef(null);
  const cameraRefs = useRef([]);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
const [fullScreenSrc, setFullScreenSrc] = useState('');
const [violatedCameras, setViolatedCameras] = useState([]);

const openFullScreenView = (src) => {
  setFullScreenSrc(src);
  setIsFullScreenOpen(true);
};

const closeFullScreenView = () => {
  setIsFullScreenOpen(false);
  setFullScreenSrc('');
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
        console.log("heyy",response.data)
        setList(response.data); 
        setVideos(response.data);
      }
    } catch (error) {
      console.error("Error fetching camera list:", error);
    } finally {
      setLoading(false);
      props?.setCameraAdded(false)
    }
  };
  useEffect(() => {
    

    fetchList();
  }, [props?.cameraAdded]);

  const handleRemove = async (cameraId) => {
    try {
      await axios.delete(`${baseURL}/camera/${cameraId}`);
      message.success('Camera removed successfully!');
      setList(list.filter(item => item.camera_unique_id !== cameraId));
      fetchList();
    } catch (error) {
      message.error('Failed to remove the camera.');
      console.error('Remove Error:', error);
    }
  };

console.log("camera list",list)

   // ==================================================
  // CAPTURE FRAMES FROM MAIN IP CAMERA AND SEND TO API
  // ==================================================
  useEffect(() => {

    fetchList();

  }, [props?.cameraAdded]);



  // const handleRemove = async (cameraId) => {

  //   try {

  //     await axios.delete(`${baseURL}/camera/${cameraId}`);

  //     message.success('Camera removed successfully!');

  //     setList(list.filter(item => item.camera_unique_id !== cameraId));

  //     fetchList();

  //   } catch (error) {

  //     message.error('Failed to remove the camera.');

  //     console.error('Remove Error:', error);

  //   }

  // };



  console.log("camera list", list);



  // ==================================================

  // CAPTURE FRAMES FROM ALL CAMERAS AND SEND IN A SINGLE API CALL

  // ==================================================


  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     const formData = new FormData();
  //     const blobPromises = [];
  
  //     // Loop through each camera image element
  //     cameraRefs.current.forEach((imgElement, index) => {
  //       if (imgElement && imgElement.naturalWidth && imgElement.naturalHeight) {
  //         // Create an off-screen canvas
  //         const canvas = document.createElement('canvas');
  //         canvas.width = imgElement.naturalWidth;
  //         canvas.height = imgElement.naturalHeight;
  //         const ctx = canvas.getContext('2d');
  
  //         // Draw the current frame from the image element
  //         ctx.drawImage(imgElement, 0, 0);
  
  //         // Create a promise for blob creation
  //         const blobPromise = new Promise((resolve) => {
  //           canvas.toBlob((blob) => {
  //             if (blob) {
  //               // Get the original camera ID
  //               const originalId = imgElement.getAttribute('data-camera-id');
  //               // const output = originalId.replace("camera", "");
  //               // console.log("originalId",output);
  //               // Format the camera ID to match the required format
  //               const cameraId = `${originalId || (index + 1)}`;
  //               resolve({ blob, cameraId });
  //             } else {
  //               resolve(null);
  //             }
  //           }, 'image/png');
  //         });
  
  //         blobPromises.push(blobPromise);
  //       }
  //     });
  
  //     // Wait for all blobs to be created
  //     Promise.all(blobPromises)
  //       .then((results) => {
  //         let hasValidImages = false;
          
  //         // Add valid blobs to FormData
  //         results.forEach((result) => {
  //           if (result) {
  //             formData.append(result.cameraId, result.blob);
  //             hasValidImages = true;
  //             console.log('Adding camera:', result.cameraId); // Debug log
  //           }
  //         });
  
  //         // Only make the API call if we have valid images
  //         if (hasValidImages) {
  //           console.log('Sending FormData with cameras:', formData.getAll); // Debug log
  //           return fetch('http://34.46.36.202/ppe/detect', {
  //             method: 'POST',
  //             headers: {
  //               'X-Session-Token': 'bb86b35928774a05a615e6f0a6d1c031'
  //             },
  //             body: formData,
  //           });
  //         }
  //       })
  //       .then(response => {
  //         if (response) {
  //           if (!response.ok) {
  //             throw new Error(`HTTP error! status: ${response.status}`);
  //           }
  //           return response.json();
  //         }
  //       })
  //       .then(result => {
  //         if (result) {
  //           console.log('PPE Detection Response:', result);
  //           // Handle the detection results here
  //           if (result.results) {

  //             const violated = result.results

  //               .filter(r => r.detections?.violations?.length > 0)

  //               .map(r => r.camera_id.toString());

  //             setViolatedCameras(violated);

  //           }
  //         }
  //       })
  //       .catch((error) => {
  //         console.error('Error in frame capture process:', error);
  //       });
  //   }, 1000);
  
  //   // Cleanup function
  //   return () => clearInterval(intervalId);
  // }, [list]); // Re-run if the list of cameras changes
  
  

  const videoUrls = [
    'http://192.168.29.199:4747/video',
    // 'https://www.youtube.com/embed/czQY2iZTxCE?autoplay=1',
    // 'https://www.youtube.com/embed/Bcfrxdb9fVI?autoplay=1',
    // 'https://www.youtube.com/embed/F0GOOP82094?autoplay=1',
    // 'https://www.youtube.com/embed/0FBiyFpV__g?autoplay=1',
  ];

  const [videos, setVideos] = useState([]);

  const handleVideoClick = (index) => {
    if (index !== 0) {
      const newVideos = [...videos];
      [newVideos[0], newVideos[index]] = [newVideos[index], newVideos[0]];
      setVideos(newVideos);
    }
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

  const getCameraStyle = (cameraId, defaultStyle = {}) => {
    // If the cameraId is of the form "camera_375", extract "375"
    const extractedId = cameraId && cameraId.includes('_')
      ? cameraId.split('_')[1]
      : cameraId;
    
    return violatedCameras.includes(extractedId?.toString())
      ? { ...defaultStyle, border: '2px solid red' }
      : defaultStyle;
  };

  return (
    <div>
      <div className="d-flex justify-content-between  ">
        <Dropdown menu={menuProps} className="fw-semibold p-3 ">
          <Button>
            <Space>
              Total Visuals:1-5
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
          {videos.length === 2 ? (
            videos.map((video, i) => (
              <div key={i} className="col-12 col-md-6">
                <div className="gallery-item" style={getCameraStyle(videos[i]?.camera_unique_id)}>
                  {/* <iframe
                    style={{ height: "270px", width: "100%" }}
                    className="img-fluid rounded-4 "
                    src={`${list[i]?.ip}`}
                    title={`PPE Detection ${i}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onClick={() => handleVideoClick(i)}
                  ></iframe> */}
                  <img
                    // ref={cameraRef}
                    ref={el => {

                      cameraRefs.current[i] = el;

                    }}
                    data-camera-id={videos[i]?.camera_unique_id}
                    src={`${videos[i]?.ip}`}
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
          ) :
           videos.length === 3 ? (
            <>
              <div className="col-12 col-lg-6 large">
                <div className="gallery-item" style={getCameraStyle(videos[0]?.camera_unique_id)}>
                  {/* <iframe
                    width="100%"
                    height="560px"
                    src={videos[0]}
                    title="PPE Detection 0"
                    className="img-fluid rounded-4"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onClick={() => handleVideoClick(0)}
                  ></iframe> */}
                  <img
                    // ref={cameraRef}
                    ref={el => {

                      cameraRefs.current[0] = el;

                    }}
                    data-camera-id={videos[0]?.camera_unique_id}
                    src={`${videos[0]?.ip}`}
                    alt="IP Camera"
                    crossOrigin="anonymous"
                    style={{ height: "270px", width: "100%", cursor: "pointer" }}
                    className="img-fluid rounded-4"
                    autoPlay
                    playsInline
                    muted
                    onClick={() => openFullScreenView(videos[0]?.ip)}
                  />
                  <div
                    className="camera-label"
                    onClick={() => openFullScreenView(videos[0]?.ip)}
                  >
                  {/* <div
                    className="camera-label"
                    onClick={() => handleVideoClick(0)}
                  > */}
                    CAM 1
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6 small-grid">
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="gallery-item" style={getCameraStyle(videos[1]?.camera_unique_id)}>
                      {/* <iframe
                        width="100%"
                        height="270px"
                        src={videos[1]}
                        title="PPE Detection 1"
                        className="img-fluid rounded-4"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onClick={() => handleVideoClick(1)}
                      ></iframe> */}
                     <img
                        // ref={cameraRef}
                        ref={el => {

                          cameraRefs.current[1] = el;

                        }}
                        data-camera-id={videos[1]?.camera_unique_id}
                        src={isFullScreenOpen ? "" : `${videos[1]?.ip}`}
                        alt="IP Camera"
                        crossOrigin="anonymous"
                        style={{ height: "270px", width: "100%", cursor: "pointer" }}
                        className="img-fluid rounded-4"
                        autoPlay
                        playsInline
                        muted
                        onClick={() => openFullScreenView(videos[1]?.ip)}
                      />
                      {/* <div
                        className="camera-label"
                        onClick={() => handleVideoClick(1)}
                      > */}
                      <div
                        className="camera-label"
                        onClick={() => openFullScreenView(videos[1]?.ip)}
                      >
                        CAM 2
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="gallery-item" style={getCameraStyle(videos[2]?.camera_unique_id)}>
                      {/* <iframe
                        width="100%"
                        height="270px"
                        src={videos[2]}
                        title="PPE Detection 2"
                        className="img-fluid rounded-4"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onClick={() => handleVideoClick(2)}
                      ></iframe> */}
                     <img
                        // ref={cameraRef}
                        ref={el => {

                          cameraRefs.current[2] = el;

                        }}
                        data-camera-id={videos[2]?.camera_unique_id}
                        src={`${videos[2]?.ip}`}
                        alt="IP Camera"
                        crossOrigin="anonymous"
                        style={{ height: "270px", width: "100%", cursor: "pointer" }}
                        className="img-fluid rounded-4"
                        autoPlay
                        playsInline
                        muted
                        onClick={() => openFullScreenView(videos[2]?.ip)}
                      />
                      <div
                        className="camera-label"
                        onClick={() => openFullScreenView(videos[2]?.ip)}
                      >
                      {/* <div
                        className="camera-label"
                        onClick={() => handleVideoClick(2)}
                      > */}
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
          ) :
           (
            <>
              <div className="col-12 col-lg-6 large">
                <div
                  className="gallery-item position-relative"
                  style={getCameraStyle(list[0]?.camera_unique_id, {

                    height: "545px",

                    width: "1020px",

                    backgroundColor: "black",

                    cursor: "pointer"

                  })}
                  onClick={() => handleVideoClick(0)}
                >
                  <img
                    // ref={cameraRef}
                    ref={el => {

                      cameraRefs.current[0] = el;

                    }}
                    data-camera-id={videos[0]?.camera_unique_id}
                    src={`${list[0]?.ip}`}
                    alt="IP Camera"
                    crossOrigin="anonymous"
                    style={{
                      height: "545px",
                      width: "1020px",
                      backgroundColor: "black",
                      cursor: "pointer"
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
                  {/* <div
                    className="camera-label position-absolute bg-dark-subtle rounded-4 fw-bold h6 p-2 px-3 opacity-75 text-center w-auto"
                    style={{
                      cursor: "pointer",
                      zIndex: 1000,
                      marginTop: "-82px",
                      width: "20%",
                      marginLeft: "20px",
                    }}
                    onClick={() => handleVideoClick(0)}
                  > */}
                    CAM 1
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6 small-grid">
                <div className="row">
                  {videos.slice(1).map((video, i) => (
                    <div key={i} className="col-6 small">
                      <div
                        className="gallery-item position-relative"
                        style={getCameraStyle(list[i]?.camera_unique_id)}
                        // onClick={() => handleVideoClick(i + 1)}
                      >
                        {/* <iframe
                          style={{ height: "270px", width: "100%" }}
                          className="img-fluid rounded-4"
                          src={video}
                          title={`PPE Detection ${i + 1}`}
                          frameBorder="0"
                          // allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          // allowFullScreen
                          onClick={() => handleVideoClick(i + 1)}
                        ></iframe> */}
                          <img
                          // ref={cameraRef}
                          ref={el => {

                            cameraRefs.current[i] = el;
  
                          }}
                          data-camera-id={videos[i]?.camera_unique_id}
                          src={`${list[i]?.ip}`}
                          alt="IP Camera"
                          crossOrigin="anonymous"
                          style={{ height: "270px", width: "100%", cursor: "pointer" }}
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
          {/* <List
            className="demo-loadmore-list border border-1 px-4 mt-3"
            loading={initLoading}
            itemLayout="horizontal"
            loadMore={loadMore}
            dataSource={list}
            renderItem={(item) => (
              <List.Item>
                <Skeleton avatar title={false} loading={item.loading} active>
                  <List.Item.Meta
                    title={<a href="https://ant.design" className='text-decoration-none fs-6 fw-bolder'>{"Camera 1"}</a>}
                  />
                  <Button type="primary" className="rounded-4 me-2 fw-semibold">View</Button>
                  <Button className="rounded-4 me-2 text-primary border-primary fw-semibold">Edit</Button>
                  <Button className="rounded-4 text-danger border-danger fw-semibold">Remove</Button>
                </Skeleton>
              </List.Item>
            )}
          /> */}
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
                  <Button type="primary" className="rounded-4 me-2 fw-semibold">
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
  );
};

export default ViolationCamera;
