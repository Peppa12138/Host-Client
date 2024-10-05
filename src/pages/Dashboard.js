import React, { useState, useEffect } from 'react';
import { Table, Button, Row, Col } from 'antd';
import axios from 'axios';
import './Dashboard.css'; // 引入 CSS 文件

const Dashboard = () => {
    const [sensorData, setSensorData] = useState([]);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sensorResponse = await axios.get('http://localhost:5000/api/sensor/data');
                console.log(sensorResponse.data);
                setSensorData(sensorResponse.data);
                const logsResponse = await axios.get('http://localhost:5000/api/sensor/logs');
                setLogs(logsResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData,10000); // 每10秒调用
        return () => clearInterval(intervalId); 
    }, []);

    const columns = [
        { title: 'Temperature (°C)', dataIndex: 'temperature', key: 'temperature' },
        { title: 'Pressure (kPa)', dataIndex: 'pressure', key: 'pressure' },
        { title: 'Depth (m)', dataIndex: 'depth', key: 'depth' },
        { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
    ];

    const handleControl = (action) => {
        axios.post('http://localhost:5000/api/sensor/control', { action })
            .then(response => {
                // 假设返回了传感器的最新状态
                setSensorData(response.data); // 更新传感器数据
            })
            .catch(error => {
                console.error('Error controlling sensor:', error);
            });
    };

    return (
        <div className="dashboard-container">
            <Row gutter={[16, 16]} justify="center">
                <Col span={12}>
                    <Table dataSource={sensorData} columns={columns} rowKey="id" />
                </Col>
                <Col span={12} className="control-column">
                    <h3>Control Actions</h3>
                    <Button onClick={() => handleControl('FORWARD')}>Forward</Button>
                    <Button onClick={() => handleControl('BACKWARD')}>Backward</Button>
                    <Button onClick={() => handleControl('LEFT')}>Left</Button>
                    <Button onClick={() => handleControl('RIGHT')}>Right</Button>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
