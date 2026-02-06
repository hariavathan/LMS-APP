import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ProfessionalAnalyticsCharts = ({ data }) => {
    // Enrollment Trend Data (Line Chart)
    const enrollmentTrendData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [
            {
                label: 'New Enrollments',
                data: [12, 19, 15, 25, 22, 30],
                borderColor: 'rgb(250, 204, 21)',
                backgroundColor: 'rgba(250, 204, 21, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: 'rgb(250, 204, 21)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            }
        ]
    };

    // Course Completion Status (Doughnut Chart)
    const completionData = {
        labels: ['Completed', 'In Progress', 'Not Started'],
        datasets: [{
            data: [
                data?.completedEnrollments || 0,
                data?.inProgressEnrollments || 0,
                (data?.totalEnrollments || 0) - (data?.completedEnrollments || 0) - (data?.inProgressEnrollments || 0)
            ],
            backgroundColor: [
                'rgba(16, 185, 129, 0.8)',
                'rgba(250, 204, 21, 0.8)',
                'rgba(100, 116, 139, 0.5)'
            ],
            borderColor: [
                'rgb(16, 185, 129)',
                'rgb(250, 204, 21)',
                'rgb(100, 116, 139)'
            ],
            borderWidth: 2,
        }]
    };

    // Learner Activity (Bar Chart)
    const activityData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Active Learners',
            data: [45, 52, 48, 61, 55, 38, 42],
            backgroundColor: 'rgba(250, 204, 21, 0.6)',
            borderColor: 'rgb(250, 204, 21)',
            borderWidth: 2,
            borderRadius: 8,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    color: '#cbd5e1',
                    padding: 15,
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#facc15',
                bodyColor: '#fff',
                borderColor: 'rgba(250, 204, 21, 0.3)',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += context.parsed.y || context.parsed;
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11 }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                }
            },
            x: {
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11 }
                },
                grid: {
                    display: false
                }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#cbd5e1',
                    padding: 15,
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    generateLabels: function (chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return {
                                    text: `${label}: ${value} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#facc15',
                bodyColor: '#fff',
                borderColor: 'rgba(250, 204, 21, 0.3)',
                borderWidth: 1,
                padding: 12,
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enrollment Trend */}
            <div className="lms-card p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    Enrollment Trends
                </h3>
                <div className="h-64">
                    <Line data={enrollmentTrendData} options={chartOptions} />
                </div>
            </div>

            {/* Completion Status */}
            <div className="lms-card p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Completion Status
                </h3>
                <div className="h-64">
                    <Doughnut data={completionData} options={doughnutOptions} />
                </div>
            </div>

            {/* Learner Activity */}
            <div className="lms-card p-6 lg:col-span-2">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Weekly Learner Activity
                </h3>
                <div className="h-64">
                    <Bar data={activityData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
};

export default ProfessionalAnalyticsCharts;
