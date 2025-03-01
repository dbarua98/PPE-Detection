import React, { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Form, DatePicker, Button } from "antd";
import moment from "moment";

const { RangePicker } = DatePicker;

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ReportsCharts = () => {
  // State for Summary Data
  const [summaryData, setSummaryData] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState(null);
  const [summaryDateRange, setSummaryDateRange] = useState([
    moment("2025-01-01"),
    moment("2025-03-31"),
  ]);

  // State for Daily Data
  const [dailyData, setDailyData] = useState([]);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [errorDaily, setErrorDaily] = useState(null);
  const [dailyDateRange, setDailyDateRange] = useState([
    moment("2023-01-01"),
    moment("2025-03-31"),
  ]);
  const baseURL = process.env.REACT_APP_BASE_URL;
  // Helper function to create common request options
  const getRequestOptions = () => {
    const myHeaders = new Headers();
    myHeaders.append("X-Session-Token", "bb86b35928774a05a615e6f0a6d1c031");
    return {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
  };

  // Fetch Summary Data based on the provided date range
  const fetchSummaryData = (range) => {
    setLoadingSummary(true);
    const startDate = range[0].format("YYYY-MM-DD");
    const endDate = range[1].format("YYYY-MM-DD");

    fetch(
      `${baseURL}/reports/summary?start_date=${startDate}&end_date=${endDate}`,
      getRequestOptions()
    )
      .then((response) => {
        if (!response.ok) throw new Error("Error fetching summary data");
        return response.json();
      })
      .then((data) => {
        setSummaryData(data);
        setLoadingSummary(false);
      })
      .catch((error) => {
        console.error("Error fetching summary data:", error);
        setErrorSummary(error);
        setLoadingSummary(false);
      });
  };

  // Fetch Daily Data based on the provided date range
  const fetchDailyData = (range) => {
    setLoadingDaily(true);
    const startDate = range[0].format("YYYY-MM-DD");
    const endDate = range[1].format("YYYY-MM-DD");
    fetch(
      `${baseURL}/reports/daily?start_date=${startDate}&end_date=${endDate}`,
      getRequestOptions()
    )
      .then((response) => response.text())
      .then((result) => {
        try {
          const data = JSON.parse(result);
          setDailyData(data);
        } catch (err) {
          console.error("Error parsing daily data:", err);
          setDailyData([]);
        }
        setLoadingDaily(false);
      })
      .catch((error) => {
        console.error("Error fetching daily data:", error);
        setErrorDaily(error);
        setLoadingDaily(false);
      });
  };

  // Initial data fetch on mount using the default date ranges
  useEffect(() => {
    fetchSummaryData(summaryDateRange);
    fetchDailyData(dailyDateRange);
  }, []);

  // Handle Summary Date Range form submission
  const handleSummaryDateSubmit = (values) => {
    if (values.dateRange && values.dateRange.length === 2) {
      setSummaryDateRange(values.dateRange);
      fetchSummaryData(values.dateRange);
    }
  };

  // Handle Daily Date Range form submission
  const handleDailyDateSubmit = (values) => {
    if (values.dateRange && values.dateRange.length === 2) {
      setDailyDateRange(values.dateRange);
      fetchDailyData(values.dateRange);
    }
  };

  // Prepare Summary Chart Data
  const summaryChartData = {
    labels: summaryData.map((item) => item.camera_id),
    datasets: [
      {
        label: "Total Detections",
        data: summaryData.map((item) => item.total_detections),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  // Prepare Daily Chart Data using the key "detection_date"
  const dailyChartData = {
    labels: dailyData.map((item) => item.detection_date),
    datasets: [
      {
        label: "Daily Total Detections",
        data: dailyData.map((item) => item.total_detections),
        borderColor: "rgba(255,159,64,1)",
        backgroundColor: "rgba(255,159,64,0.6)",
        fill: false,
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Reports</h1>

      {/* Summary Section */}
      <div style={{ width: "80%", margin: "20px auto" }}>
        <h2>Camera Detections Summary</h2>
        <Form
          layout="inline"
          onFinish={handleSummaryDateSubmit}
          initialValues={{ dateRange: summaryDateRange }}
          style={{ marginBottom: "20px" }}
        >
          <Form.Item name="dateRange" label="Date Range">
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Summary
            </Button>
          </Form.Item>
        </Form>
        {errorSummary && <p>Error: {errorSummary.message}</p>}
        {loadingSummary ? (
          <p>Loading summary data...</p>
        ) : (
          <Bar data={summaryChartData} options={{ responsive: true }} />
        )}
      </div>

      {/* Daily Section */}
      <div style={{ width: "80%", margin: "20px auto" }}>
        <h2>Daily Data</h2>
        <Form
          layout="inline"
          onFinish={handleDailyDateSubmit}
          initialValues={{ dateRange: dailyDateRange }}
          style={{ marginBottom: "20px" }}
        >
          <Form.Item name="dateRange" label="Date Range">
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Daily
            </Button>
          </Form.Item>
        </Form>
        {errorDaily && <p>Error: {errorDaily.message}</p>}
        {loadingDaily ? (
          <p>Loading daily data...</p>
        ) : dailyData.length > 0 ? (
          <Line data={dailyChartData} options={{ responsive: true }} />
        ) : (
          <p>No daily data available.</p>
        )}
      </div>
    </div>
  );
};

export default ReportsCharts;
