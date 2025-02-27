import React, { useEffect, useState } from 'react';
import { Table, DatePicker, Button, Form, Spin, Alert } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;

const ViolationList = () => {
  const [reports, setReports] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Set default date range using moment objects
  const defaultRange = [moment('2025-01-01'), moment('2025-03-31')];
  const [dateRange, setDateRange] = useState(defaultRange);

  // Prepare headers and options for the detections API
  const detectionHeaders = new Headers();
  detectionHeaders.append('X-Session-Token', 'bb86b35928774a05a615e6f0a6d1c031');

  const detectionOptions = {
    method: 'GET',
    headers: detectionHeaders,
    redirect: 'follow',
  };

  // Request options for fetching images (no headers required)
  const imageRequestOptions = {
    method: 'GET',
    redirect: 'follow',
  };

  // Fetch an image as a blob and convert it to an object URL.
  // This uses the API endpoint as described:
  // static/2_20250208100634_Screenshot 2024-11-10 at 2.29.28 PM.png
  const fetchImage = async (imageName) => {
    const url = `http://35.208.97.216/static/${encodeURIComponent(imageName)}`;
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

  // Fetch reports based on the selected date range.
  // Here we clear any previously loaded images and reset pagination.
  const fetchReports = async (start, end) => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    try {
      const startDate = start.format('YYYY-MM-DD');
      const endDate = end.format('YYYY-MM-DD');
      const response = await fetch(
        `http://35.208.97.216/reports/detections?start_date=${startDate}&end_date=${endDate}`,
        detectionOptions
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setReports(data);
      setImageUrls({}); // clear old images
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Effect: when reports or the current page changes,
  // fetch images only for the 10 rows shown on the current page.
  useEffect(() => {
    const fetchImagesForPage = async () => {
      if (reports.length > 0) {
        const startIndex = (currentPage - 1) * 10;
        const currentReports = reports.slice(startIndex, startIndex + 10);
        currentReports.forEach(async (report) => {
          // Fetch image only if not already loaded.
          if (!imageUrls[report.id]) {
            const objectUrl = await fetchImage(report.image_name);
            setImageUrls((prev) => ({ ...prev, [report.id]: objectUrl }));
          }
        });
      }
    };

    fetchImagesForPage();
  }, [reports, currentPage]);

  // Initial fetch on mount
  useEffect(() => {
    fetchReports(dateRange[0], dateRange[1]);
  }, []);

  // Handle form submission (new date range search)
  const onFinish = (values) => {
    const { dateRange } = values;
    if (dateRange && dateRange.length === 2) {
      setDateRange(dateRange);
      fetchReports(dateRange[0], dateRange[1]);
    }
  };

  // Render detection result by parsing JSON data
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

  // Define table columns
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
          pagination={{
            current: currentPage,
            pageSize: 10,
            total: reports.length,
            onChange: (page) => setCurrentPage(page),
          }}
        />
      )}
    </div>
  );
};

export default ViolationList;
