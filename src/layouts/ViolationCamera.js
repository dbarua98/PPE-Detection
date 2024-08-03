import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Dropdown, message, Space, Switch, Tabs } from 'antd';
import { Avatar, List, Skeleton } from 'antd';
import React, { useState, useEffect } from 'react';
import cameraDummyImage from '../images/dummyCamera.webp';
import './ViolationCamera.scss';
import AllViolationPopup from './AllViolationPopup';

const ViolationCamera = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const count = 3;
  const fakeDataUrl = `https://randomuser.me/api/?results=${count}&inc=name,gender,email,nat,picture&noinfo`;
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [list, setList] = useState([]);

  useEffect(() => {
    fetch(fakeDataUrl)
      .then((res) => res.json())
      .then((res) => {
        setInitLoading(false);
        setData(res.results);
        setList(res.results);
      });
  }, []);

  const onLoadMore = () => {
    setLoading(true);
    setList(
      data.concat(
        [...new Array(count)].map(() => ({
          loading: true,
          name: {},
          picture: {},
        })),
      ),
    );
    fetch(fakeDataUrl)
      .then((res) => res.json())
      .then((res) => {
        const newData = data.concat(res.results);
        setData(newData);
        setList(newData);
        setLoading(false);
        window.dispatchEvent(new Event('resize'));
      });
  };

  const loadMore = !initLoading && !loading ? (
    <div
      style={{
        textAlign: 'center',
        marginTop: 12,
        height: 32,
        lineHeight: '32px',
      }}
    >
      <Button onClick={onLoadMore}>loading more</Button>
    </div>
  ) : null;

  const videoUrls = [
    'https://www.youtube.com/embed/WCJMayi-acw?autoplay=1',
    'https://www.youtube.com/embed/czQY2iZTxCE?autoplay=1',
    'https://www.youtube.com/embed/Bcfrxdb9fVI?autoplay=1',
    'https://www.youtube.com/embed/F0GOOP82094?autoplay=1',
    'https://www.youtube.com/embed/0FBiyFpV__g?autoplay=1',
  ];

  const [videos, setVideos] = useState(videoUrls);

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

  return (
    <div>
      <div className="d-flex justify-content-between  ">
        <Dropdown menu={menuProps} className='fw-semibold p-3 '>
          <Button>
            <Space>
              Total Visuals:1-5
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <div className="d-flex gap-2">
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
        </div>
      </div>
      <div className="mt-5">
        <div className="row">
          {videos.length === 2 ? (
            videos.map((video, i) => (
              <div key={i} className="col-12 col-md-6">
                <div className="gallery-item">
                  <iframe
                   style={{height: "270px", width: "100%"}}
                     className="img-fluid rounded-4 "
                    src={video}
                    title={`PPE Detection ${i}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onClick={() => handleVideoClick(i)}
                  ></iframe>
                  <div className="camera-label" onClick={() => handleVideoClick(i)}  >{`CAM ${i + 1}`}</div>
                </div>
              </div>
            ))
          ) : videos.length === 3 ? (
            <>
              <div className="col-12 col-lg-6 large">
                <div className="gallery-item">
                  <iframe
                    width="100%"
                    height="560px"
                    src={videos[0]}
                    title="PPE Detection 0"
                    className="img-fluid rounded-4"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onClick={() => handleVideoClick(0)}
                  ></iframe>
                  <div className="camera-label"  onClick={() => handleVideoClick(0)} >CAM 1</div>
                </div>
              </div>
              <div className="col-12 col-lg-6 small-grid">
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="gallery-item">
                      <iframe
                        width="100%"
                        height="270px"
                        src={videos[1]}
                        title="PPE Detection 1"
                        className="img-fluid rounded-4"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onClick={() => handleVideoClick(1)}
                      ></iframe>
                      <div className="camera-label"  onClick={() => handleVideoClick(1)} >CAM 2</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="gallery-item">
                      <iframe
                        width="100%"
                        height="270px"
                        src={videos[2]}
                        title="PPE Detection 2"
                        className="img-fluid rounded-4"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onClick={() => handleVideoClick(2)}
                      ></iframe>
                      <div className="camera-label"  onClick={() => handleVideoClick(2)} >CAM 3</div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex flex-column align-items-center justify-content-center gallery-item border border-2 rounded-4 bg-dark-subtle" style={{ height: '270px', width: '100%' }}>
                      <img
                        style={{ height: 'auto', width: '9%', border: '1px dashed gray' }}
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
                <div className="gallery-item position-relative" 
                    onClick={() => handleVideoClick(0)}
                

                >
                  <iframe
                   style={{height: "560px", width: "1020px"}}
                     className="img-fluid rounded-4"
                    src={videos[0]}
                    title="PPE Detection 0"
                    frameBorder="0"
                    // allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    // allowFullScreen
                  ></iframe>
                  <div className="camera-label position-absolute bg-dark-subtle rounded-4 fw-bold h6 p-2 px-3 opacity-75 text-center w-auto"  style={{cursor:"pointer",zIndex:1000,marginTop:"-82px",width:"20%",marginLeft:"20px"}} onClick={() => handleVideoClick(0)} >CAM 1</div>
                </div>
              </div>
              <div className="col-12 col-lg-6 small-grid">
                <div className="row">
                  {videos.slice(1).map((video, i) => (
                    <div key={i} className="col-6 small">
                      <div className="gallery-item position-relative"   
                      // onClick={() => handleVideoClick(i + 1)}
                      >
                        <iframe
                         style={{height: "270px", width: "100%"}}
                     className="img-fluid rounded-4"
                          src={video}
                          title={`PPE Detection ${i + 1}`}
                          frameBorder="0"
                          // allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          // allowFullScreen
                          onClick={() => handleVideoClick(i + 1)}
                        ></iframe>
                        <div className="camera-label position-absolute bg-dark-subtle rounded-4 fw-bold h6 p-2 opacity-75 text-center" style={{cursor:"pointer",zIndex:1000,marginTop:"-70px",width:"20%",marginLeft:"20px"}} onClick={() => handleVideoClick(i + 1)} >{`CAM ${i + 2}`}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div>
          <Dropdown menu={menuProps} className="mt-5 p-4 fw-semibold  " trigger={['click']}>
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
          />
        </div>
      </div>
      <AllViolationPopup isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </div>
  );
};

export default ViolationCamera;
