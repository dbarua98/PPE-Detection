import React, { useEffect, useState } from 'react';
import { Table, DatePicker, Button, Form, Spin, Alert } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;

const ViolationList = () => {
  const [reports, setReports] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set default date range using moment objects
  const defaultRange = [moment('2025-01-01'), moment('2025-03-31')];
  const [dateRange, setDateRange] = useState(defaultRange);

  // Prepare headers and request options for the detections API
  const detectionHeaders = new Headers();
  detectionHeaders.append('X-Session-Token', 'bb86b35928774a05a615e6f0a6d1c031');

  const detectionOptions = {
    method: 'GET',
    headers: detectionHeaders,
    redirect: 'follow',
  };

  // Request options for the image fetch API (no headers required)
  const imageRequestOptions = {
    method: 'GET',
    redirect: 'follow',
  };

  // Function to fetch an image as a blob and convert it to an object URL
  const fetchImage = async (imageName) => {
    const url = `http://34.46.36.202/static/${encodeURIComponent(imageName)}`;
    try {
      const response = await fetch(url, imageRequestOptions);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Fetch reports using the selected date range
  const fetchReports = async (start, end) => {
    setLoading(true);
    setError(null);
    try {
      const startDate = start.format('YYYY-MM-DD');
      const endDate = end.format('YYYY-MM-DD');
      const response = await fetch(
        `http://34.46.36.202/reports/detections?start_date=${startDate}&end_date=${endDate}`,
        detectionOptions
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setReports(data);

      // Fetch images for each report and store their object URLs
      const urls = {};
      for (let report of data) {
        const objectUrl = await fetchImage(report.image_name);
        urls[report.id] = objectUrl;
      }
      setImageUrls(urls);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchReports(dateRange[0], dateRange[1]);
  }, []);

  // Handle form submission
  const onFinish = (values) => {
    const { dateRange } = values;
    if (dateRange && dateRange.length === 2) {
      setDateRange(dateRange);
      fetchReports(dateRange[0], dateRange[1]);
    }
  };

  // Render the detection result by parsing the JSON and displaying keys and values
  const renderDetectionResult = (text) => {
    try {
      const result = JSON.parse(text);
      return (
        <div>
          {Object.entries(result).map(([key, value]) => (
            <div key={key}>
              {Array.isArray(value) ? value.join(', ') : value}
            </div>
          ))}
        </div>
      );
    } catch (err) {
      return <span>Invalid detection result</span>;
    }
  };

  // Define the columns for the table with formatted created_at
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id',
    },
    {
      title: 'Image',
      dataIndex: 'image_name',
      key: 'image',
      render: (text, record) => {
        const imageUrl = imageUrls[record.id];
        return imageUrl ? (
          <img
            src={imageUrl}
            alt="Violation"
            style={{ width: '150px', borderRadius: '8px' }}
          />
        ) : (
          <span>Image not available</span>
        );
      },
    },
    {
      title: 'Detection Result',
      dataIndex: 'detection_result',
      key: 'detection_result',
      render: renderDetectionResult,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Camera ID',
      dataIndex: 'camera_id',
      key: 'camera_id',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* <h1>Violation Reports</h1> */}
      <Form
        layout="inline"
        onFinish={onFinish}
        initialValues={{ dateRange: defaultRange }}
        style={{ marginBottom: '24px' }}
      >
        <Form.Item name="dateRange" label="Date Range">
          <RangePicker />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Search
          </Button>
        </Form.Item>
      </Form>
      {loading ? (
        <Spin size="large" style={{ display: 'block', marginTop: '24px' }} />
      ) : error ? (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: '24px' }}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default ViolationList;
