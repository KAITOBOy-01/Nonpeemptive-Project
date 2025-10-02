import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Upload, Play, Plus, Trash2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
    padding: '2rem'
  },
  maxWidth: {
    maxWidth: '1280px',
    margin: '0 auto'
  },
  header: {
    background: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    marginBottom: '1.5rem'
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#312e81',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#4b5563'
  },
  card: {
    background: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb'
  },
  tab: {
    flex: 1,
    padding: '0.75rem 1rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tabActive: {
    background: '#4f46e5',
    color: 'white'
  },
  tabInactive: {
    background: '#f3f4f6',
    color: '#374151'
  },
  content: {
    padding: '1.5rem'
  },
  buttonContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginBottom: '1.5rem'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  buttonPrimary: {
    background: '#4f46e5',
    color: 'white'
  },
  buttonSuccess: {
    background: '#059669',
    color: 'white'
  },
  buttonInfo: {
    background: '#2563eb',
    color: 'white'
  },
  buttonPurple: {
    background: '#7c3aed',
    color: 'white'
  },
  infoBox: {
    background: '#f9fafb',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1rem'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHead: {
    background: '#e5e7eb'
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontWeight: '600'
  },
  td: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #e5e7eb'
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    outline: 'none'
  },
  deleteButton: {
    color: '#dc2626',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  metricCard: {
    borderRadius: '0.5rem',
    padding: '1rem',
    color: 'white',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  metricTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    opacity: 0.9
  },
  metricValue: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    marginTop: '0.5rem'
  },
  metricSubtext: {
    fontSize: '0.75rem',
    opacity: 0.75
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '1rem'
  },
  ganttContainer: {
    background: '#f9fafb',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    marginBottom: '1.5rem'
  }
};

const LJFScheduler = () => {
  const [processes, setProcesses] = useState([
    { id: 1, name: 'P1', arrivalTime: 0, burstTime: 8, deadline: 40 },
    { id: 2, name: 'P2', arrivalTime: 1, burstTime: 4, deadline: 70 },
    { id: 3, name: 'P3', arrivalTime: 2, burstTime: 9, deadline: 90 },
    { id: 4, name: 'P4', arrivalTime: 3, burstTime: 5, deadline: 140 }
  ]);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('input');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          alert('❌ CSV file is empty');
          return;
        }
        
        const firstLine = lines[0].toLowerCase();
        const hasHeader = firstLine.includes('process') || 
                         firstLine.includes('arrival') || 
                         firstLine.includes('burst') ||
                         firstLine.includes('priority') ||
                         firstLine.includes('deadline');
        
        const dataLines = hasHeader ? lines.slice(1) : lines;
        const newProcesses = dataLines.map((line, index) => {
          const parts = line.split(',').map(p => p.trim());
          
          return {
            id: index + 1,
            name: parts[0] || `P${index + 1}`,
            arrivalTime: parseFloat(parts[2]) || 0,
            burstTime: parseFloat(parts[1]) || 0,
            deadline: parseFloat(parts[3]) || 0
          };
        }).filter(p => p.name && p.burstTime > 0);

        if (newProcesses.length > 0) {
          setProcesses(newProcesses);
          alert(`✅ CSV file loaded successfully! ${newProcesses.length} processes imported.`);
        } else {
          alert('❌ No valid processes found in CSV file');
        }
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const arrayBuffer = await file.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        if (jsonData.length === 0) {
          alert('❌ Excel file is empty');
          return;
        }
        
        const firstRow = jsonData[0];
        const hasHeader = firstRow.some(cell => 
          typeof cell === 'string' && 
          (cell.toLowerCase().includes('process') || 
           cell.toLowerCase().includes('arrival') || 
           cell.toLowerCase().includes('burst') ||
           cell.toLowerCase().includes('priority') ||
           cell.toLowerCase().includes('deadline'))
        );
        
        const dataRows = hasHeader ? jsonData.slice(1) : jsonData;
        const newProcesses = dataRows.map((row, index) => {
          return {
            id: index + 1,
            name: row[0]?.toString() || `P${index + 1}`,
            arrivalTime: parseFloat(row[2]) || 0,
            burstTime: parseFloat(row[1]) || 0,
            deadline: parseFloat(row[3]) || 0
          };
        }).filter(p => p.name && p.burstTime > 0);

        if (newProcesses.length > 0) {
          setProcesses(newProcesses);
          alert(`✅ Excel file loaded successfully! ${newProcesses.length} processes imported.`);
        } else {
          alert('❌ No valid processes found in Excel file');
        }
      }
    } catch (error) {
      alert('❌ Error reading file: ' + error.message);
      console.error(error);
    }
  };

  const addProcess = () => {
    const newId = processes.length > 0 ? Math.max(...processes.map(p => p.id)) + 1 : 1;
    setProcesses([...processes, { id: newId, name: `P${newId}`, arrivalTime: 0, burstTime: 0, deadline: 0 }]);
  };

  const deleteProcess = (id) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  const updateProcess = (id, field, value) => {
    setProcesses(processes.map(p => 
      p.id === id ? { ...p, [field]: field === 'name' ? value : parseFloat(value) || 0 } : p
    ));
  };

  const calculateLJF = () => {
    if (processes.length === 0 || processes.some(p => p.burstTime <= 0)) {
      alert('Please ensure all processes have valid burst times');
      return;
    }

    const processList = [...processes].map(p => ({
      ...p,
      completionTime: 0,
      turnaroundTime: 0,
      waitingTime: 0,
      responseTime: 0,
      startTime: -1
    }));

    let currentTime = 0;
    let completed = 0;
    const n = processList.length;
    const ganttChart = [];
    const executed = new Array(n).fill(false);

    while (completed < n) {
      let availableProcesses = processList
        .map((p, index) => ({ ...p, index }))
        .filter(p => !executed[p.index] && p.arrivalTime <= currentTime);

      if (availableProcesses.length === 0) {
        const nextArrival = Math.min(
          ...processList
            .filter((p, idx) => !executed[idx])
            .map(p => p.arrivalTime)
        );
        currentTime = nextArrival;
        continue;
      }

      availableProcesses.sort((a, b) => {
        if (b.burstTime !== a.burstTime) return b.burstTime - a.burstTime;
        return a.arrivalTime - b.arrivalTime;
      });

      const selectedProcess = availableProcesses[0];
      const idx = selectedProcess.index;

      processList[idx].startTime = currentTime;
      processList[idx].responseTime = currentTime - processList[idx].arrivalTime;
      
      ganttChart.push({
        name: processList[idx].name,
        start: currentTime,
        end: currentTime + processList[idx].burstTime,
        duration: processList[idx].burstTime
      });

      currentTime += processList[idx].burstTime;
      processList[idx].completionTime = currentTime;
      processList[idx].turnaroundTime = processList[idx].completionTime - processList[idx].arrivalTime;
      processList[idx].waitingTime = processList[idx].turnaroundTime - processList[idx].burstTime;
      
      executed[idx] = true;
      completed++;
    }

    const totalBurstTime = processList.reduce((sum, p) => sum + p.burstTime, 0);
    const cpuUtilization = (totalBurstTime / currentTime) * 100;
    const throughput = n / currentTime;
    const avgTurnaroundTime = processList.reduce((sum, p) => sum + p.turnaroundTime, 0) / n;
    const avgWaitingTime = processList.reduce((sum, p) => sum + p.waitingTime, 0) / n;
    const avgResponseTime = processList.reduce((sum, p) => sum + p.responseTime, 0) / n;

    setResults({
      processes: processList,
      ganttChart,
      cpuUtilization,
      throughput,
      avgTurnaroundTime,
      avgWaitingTime,
      avgResponseTime,
      totalTime: currentTime
    });
    setActiveTab('results');
  };

  const downloadCSV = () => {
    const header = 'Process,Burst Time,Arrival Time,Priority\n';
    const rows = processes.map(p => `${p.name},${p.burstTime},${p.arrivalTime},${p.deadline}`).join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'processes.csv';
    a.click();
  };

  const GanttChart = ({ data, processes }) => {
    const maxTime = Math.max(...data.map(d => d.end));
    const maxDeadline = Math.max(...processes.map(p => p.deadline || 0));
    const chartMax = Math.max(maxTime, maxDeadline);
    const timeScale = 800 / chartMax;
    const blockHeight = 50;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

    return (
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
        <div style={{ position: 'relative', height: '200px' }}>
          {/* Deadlines */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Deadlines</div>
            {processes.filter(p => p.deadline > 0).map((process, idx) => {
              const position = process.deadline * timeScale;
              return (
                <div key={idx} style={{ position: 'absolute', left: `${position}px`, top: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>{process.name}</div>
                    <div style={{ width: '2px', height: '24px', background: '#374151' }}></div>
                    <div style={{ width: '8px', height: '8px', background: '#374151', transform: 'rotate(45deg)', marginTop: '-4px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gantt Chart */}
          <div style={{ position: 'absolute', top: '80px', left: 0, right: 0 }}>
            <div style={{ position: 'relative', height: `${blockHeight}px` }}>
              {data.map((item, idx) => {
                const width = item.duration * timeScale;
                const left = item.start * timeScale;
                return (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: `${left}px`,
                      width: `${width}px`,
                      height: `${blockHeight}px`,
                      backgroundColor: colors[idx % colors.length],
                      color: 'white',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '2px solid white'
                    }}
                  >
                    {item.name}
                  </div>
                );
              })}
            </div>

            {/* Time axis */}
            <div style={{ position: 'relative', marginTop: '4px', height: '30px' }}>
              {[...Array(Math.ceil(chartMax / 10) + 1)].map((_, idx) => {
                const time = idx * 10;
                if (time > chartMax) return null;
                return (
                  <div
                    key={idx}
                    style={{ position: 'absolute', left: `${time * timeScale}px`, top: 0, fontSize: '0.75rem', color: '#4b5563' }}
                  >
                    <div style={{ width: '2px', height: '8px', background: '#9ca3af', marginBottom: '4px' }}></div>
                    {time}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        <div style={styles.header}>
          <h1 style={styles.title}>Non-preemptive Longest Job First (LJF) Scheduler</h1>
          <p style={styles.subtitle}>CPU Scheduling Algorithm Simulator with Performance Metrics</p>
        </div>

        <div style={styles.card}>
          <div style={styles.tabContainer}>
            <button
              onClick={() => setActiveTab('input')}
              style={{...styles.tab, ...(activeTab === 'input' ? styles.tabActive : styles.tabInactive)}}
            >
              Input Processes
            </button>
            <button
              onClick={() => setActiveTab('results')}
              style={{...styles.tab, ...(activeTab === 'results' ? styles.tabActive : styles.tabInactive)}}
              disabled={!results}
            >
              Results & Metrics
            </button>
          </div>

          {activeTab === 'input' && (
            <div style={styles.content}>
              <div style={styles.buttonContainer}>
                <label style={{...styles.button, ...styles.buttonPrimary}}>
                  <Upload size={20} />
                  <span>Upload CSV/Excel</span>
                  <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
                <button onClick={addProcess} style={{...styles.button, ...styles.buttonSuccess}}>
                  <Plus size={20} />
                  Add Process
                </button>
                <button onClick={downloadCSV} style={{...styles.button, ...styles.buttonInfo}}>
                  <Download size={20} />
                  Download Template
                </button>
                <button onClick={calculateLJF} style={{...styles.button, ...styles.buttonPurple, marginLeft: 'auto'}}>
                  <Play size={20} />
                  Calculate Schedule
                </button>
              </div>

              <div style={styles.infoBox}>
                <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}><strong>CSV Format:</strong> Process, Burst Time, Arrival Time, Priority/Deadline</p>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0.25rem 0 0 0' }}>Example: P1,10,0,3</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>Column order: Process Name | Burst Time | Arrival Time | Priority</p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead style={styles.tableHead}>
                    <tr>
                      <th style={styles.th}>Process Name</th>
                      <th style={styles.th}>Arrival Time</th>
                      <th style={styles.th}>Burst Time</th>
                      <th style={styles.th}>Deadline</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map(process => (
                      <tr key={process.id} style={{ background: 'white' }}>
                        <td style={styles.td}>
                          <input
                            type="text"
                            value={process.name}
                            onChange={(e) => updateProcess(process.id, 'name', e.target.value)}
                            style={styles.input}
                          />
                        </td>
                        <td style={styles.td}>
                          <input
                            type="number"
                            value={process.arrivalTime}
                            onChange={(e) => updateProcess(process.id, 'arrivalTime', e.target.value)}
                            style={styles.input}
                            min="0"
                            step="0.1"
                          />
                        </td>
                        <td style={styles.td}>
                          <input
                            type="number"
                            value={process.burstTime}
                            onChange={(e) => updateProcess(process.id, 'burstTime', e.target.value)}
                            style={styles.input}
                            min="0"
                            step="0.1"
                          />
                        </td>
                        <td style={styles.td}>
                          <input
                            type="number"
                            value={process.deadline}
                            onChange={(e) => updateProcess(process.id, 'deadline', e.target.value)}
                            style={styles.input}
                            min="0"
                            step="0.1"
                          />
                        </td>
                        <td style={{...styles.td, textAlign: 'center'}}>
                          <button
                            onClick={() => deleteProcess(process.id)}
                            style={styles.deleteButton}
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'results' && results && (
            <div style={styles.content}>
              <div style={styles.metricsGrid}>
                <div style={{...styles.metricCard, background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)'}}>
                  <h3 style={styles.metricTitle}>CPU Utilization</h3>
                  <p style={styles.metricValue}>{results.cpuUtilization.toFixed(2)}%</p>
                </div>
                <div style={{...styles.metricCard, background: 'linear-gradient(to bottom right, #10b981, #059669)'}}>
                  <h3 style={styles.metricTitle}>Throughput</h3>
                  <p style={styles.metricValue}>{results.throughput.toFixed(3)}</p>
                  <p style={styles.metricSubtext}>processes/time unit</p>
                </div>
                <div style={{...styles.metricCard, background: 'linear-gradient(to bottom right, #8b5cf6, #7c3aed)'}}>
                  <h3 style={styles.metricTitle}>Avg Turnaround Time</h3>
                  <p style={styles.metricValue}>{results.avgTurnaroundTime.toFixed(2)}</p>
                </div>
                <div style={{...styles.metricCard, background: 'linear-gradient(to bottom right, #f59e0b, #d97706)'}}>
                  <h3 style={styles.metricTitle}>Avg Waiting Time</h3>
                  <p style={styles.metricValue}>{results.avgWaitingTime.toFixed(2)}</p>
                </div>
              </div>

              <div style={styles.ganttContainer}>
                <h3 style={styles.sectionTitle}>Gantt Chart with Deadlines</h3>
                <GanttChart data={results.ganttChart} processes={processes} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={styles.sectionTitle}>Process Metrics Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={results.processes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="turnaroundTime" fill="#8b5cf6" name="Turnaround Time" />
                    <Bar dataKey="waitingTime" fill="#f59e0b" name="Waiting Time" />
                    <Bar dataKey="responseTime" fill="#10b981" name="Response Time" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <h3 style={styles.sectionTitle}>Detailed Process Statistics</h3>
                <table style={styles.table}>
                  <thead style={{ background: '#4f46e5', color: 'white' }}>
                    <tr>
                      <th style={styles.th}>Process</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Arrival Time</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Burst Time</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Deadline</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Completion Time</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Turnaround Time</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Waiting Time</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Response Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.processes.map((process, idx) => (
                      <tr key={idx} style={{ background: 'white' }}>
                        <td style={{...styles.td, fontWeight: '600'}}>{process.name}</td>
                        <td style={{...styles.td, textAlign: 'center'}}>{process.arrivalTime.toFixed(2)}</td>
                        <td style={{...styles.td, textAlign: 'center'}}>{process.burstTime.toFixed(2)}</td>
                        <td style={{...styles.td, textAlign: 'center'}}>{process.deadline > 0 ? process.deadline.toFixed(2) : '-'}</td>
                        <td style={{...styles.td, textAlign: 'center'}}>{process.completionTime.toFixed(2)}</td>
                        <td style={{...styles.td, textAlign: 'center'}}>{process.turnaroundTime.toFixed(2)}</td>
                        <td style={{...styles.td, textAlign: 'center'}}>{process.waitingTime.toFixed(2)}</td>
                        <td style={{...styles.td, textAlign: 'center'}}>{process.responseTime.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{ background: '#e5e7eb', fontWeight: 'bold' }}>
                    <tr>
                      <td style={styles.td} colSpan="5">Averages</td>
                      <td style={{...styles.td, textAlign: 'center'}}>{results.avgTurnaroundTime.toFixed(2)}</td>
                      <td style={{...styles.td, textAlign: 'center'}}>{results.avgWaitingTime.toFixed(2)}</td>
                      <td style={{...styles.td, textAlign: 'center'}}>{results.avgResponseTime.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LJFScheduler;