import React, { useState, useEffect } from 'react';
import { Table, Button, Row, Col } from 'antd';
import axios from 'axios';
import moment from 'moment-timezone';
import './Dashboard.css';

const Dashboard = () => {
    const [sensorData, setSensorData] = useState([]);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sensorResponse = await axios.get('http://localhost:5000/api/sensor/data');
                const sortedSensorData = sensorResponse.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setSensorData(sortedSensorData);

                const logsResponse = (await axios.get('http://localhost:5000/api/sensor/logs'));
                const sortedLogs = logsResponse.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setLogs(sortedLogs);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 1000); // 每秒刷新一次数据
        return () => clearInterval(intervalId);
    }, []);

    const columns = [
        { title: 'Temperature (°C)', dataIndex: 'temperature', key: 'temperature' },
        { title: 'Pressure (kPa)', dataIndex: 'pressure', key: 'pressure' },
        { title: 'Depth (m)', dataIndex: 'depth', key: 'depth' },
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text) => moment(text).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
        },
    ];

    const logsColumns = [
        { title: 'Log', dataIndex: 'action', key: 'action' },
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text) => moment(text).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
        },
    ];

    const handleControl = (action) => {
        axios.post('http://localhost:5000/api/sensor/control', { action })
            .then(response => {
                const sortedSensorData = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setSensorData(sortedSensorData);
                const sortedLogs = [...logs, { action, timestamp: new Date().toISOString() }];
                setLogs(sortedLogs);
            })
            .catch(error => {
                console.error('Error controlling sensor:', error);
            });
    };

    return (
        <div className="dashboard-container">
            <Row gutter={[16, 16]} justify="center">
                <Col span={16}>
                    <Table dataSource={sensorData} columns={columns} rowKey="id" />
                </Col>
                <Col span={16}>
                    <Table dataSource={logs} columns={logsColumns}></Table>
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
