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
  // Summary data state
  const [summaryData, setSummaryData] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState(null);

  // Detections data state
  const [detectionsData, setDetectionsData] = useState([]);
  const [loadingDetections, setLoadingDetections] = useState(true);
  const [errorDetections, setErrorDetections] = useState(null);

  // Daily data state
  const [dailyData, setDailyData] = useState([]);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [errorDaily, setErrorDaily] = useState(null);

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

  // Fetch Summary Data
  useEffect(() => {
    fetch(
      "http://34.46.36.202/reports/summary?start_date=2025-01-01&end_date=2025-03-31",
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
  }, []);

  // Fetch Detections Data
  useEffect(() => {
    fetch(
      "http://34.46.36.202/reports/detections?start_date=2025-01-01&end_date=2025-03-31",
      getRequestOptions()
    )
      .then((response) => response.text())
      .then((result) => {
        console.log("Detections raw result:", result);
        try {
          const data = JSON.parse(result);
          setDetectionsData(data);
        } catch (err) {
          console.error("Error parsing detections data:", err);
          setDetectionsData([]);
        }
        setLoadingDetections(false);
      })
      .catch((error) => {
        console.error("Error fetching detections data:", error);
        setErrorDetections(error);
        setLoadingDetections(false);
      });
  }, []);

  // Fetch Daily Data
  useEffect(() => {
    fetch(
      "http://34.46.36.202/reports/daily?start_date=2023-01-01&end_date=2025-03-31",
      getRequestOptions()
    )
      .then((response) => response.text())
      .then((result) => {
        console.log("Daily raw result:", result);
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
  }, []);

  // Show loading message if any fetch is in progress
  if (loadingSummary || loadingDetections || loadingDaily) {
    return <p>Loading data...</p>;
  }

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

  // Prepare Daily Chart Data using the correct key "detection_date"
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

  // Helper function to format detection result string into pretty JSON
  const formatDetectionResult = (resultStr) => {
    try {
      // Convert Python-like quotes and booleans to JSON valid strings
      let validJson = resultStr.replace(/'/g, '"');
      validJson = validJson.replace(/True/g, "true").replace(/False/g, "false");
      const parsed = JSON.parse(validJson);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      return resultStr;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Reports</h1>

      {/* Summary Chart */}
      <div style={{ width: "80%", margin: "20px auto" }}>
        <h2>Camera Detections Summary</h2>
        {errorSummary && <p>Error: {errorSummary.message}</p>}
        <Bar data={summaryChartData} options={{ responsive: true }} />
      </div>

      {/* Detections Data Cards */}
      <div style={{ width: "80%", margin: "20px auto" }}>
        <h2>Detections Data</h2>
        {errorDetections && <p>Error: {errorDetections.message}</p>}
        {detectionsData.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {detectionsData.map((record) => (
              <div
                key={record.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "#fff",
                }}
              >
                <h3>Detection #{record.id}</h3>
                <p>
                  <strong>Camera ID:</strong> {record.camera_id}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(record.created_at).toLocaleString()}
                </p>
                <p>
                  <strong>Image:</strong> {record.image_name}
                </p>
                <p>
                  <strong>Detection Result:</strong>
                </p>
                <pre
                  style={{
                    backgroundColor: "#f9f9f9",
                    padding: "8px",
                    borderRadius: "4px",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                  }}
                >
                  {formatDetectionResult(record.detection_result)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <p>No detections data available.</p>
        )}
      </div>

      {/* Daily Chart */}
      <div style={{ width: "80%", margin: "20px auto" }}>
        <h2>Daily Data</h2>
        {errorDaily && <p>Error: {errorDaily.message}</p>}
        {dailyData.length > 0 ? (
          <Line data={dailyChartData} options={{ responsive: true }} />
        ) : (
          <p>No daily data available.</p>
        )}
      </div>
    </div>
  );
};

export default ReportsCharts;
