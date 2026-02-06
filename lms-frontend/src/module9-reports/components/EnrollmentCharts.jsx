// module9-reports/components/EnrollmentCharts.jsx
import { Line, Doughnut, Bar, Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
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
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function EnrollmentCharts({ data }) {
    // Process data for enrollment trends
    const enrollmentTrendData = {
        labels: data.map(course => course.courseTitle.length > 15 ? course.courseTitle.substring(0, 15) + '...' : course.courseTitle),
        datasets: [
            {
                label: 'Total Enrolled',
                data: data.map(course => course.totalEnrolled || 0),
                borderColor: 'rgb(147, 51, 234)',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                fill: false,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: 'rgb(147, 51, 234)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
            {
                label: 'Completed',
                data: data.map(course => course.completed || 0),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: false,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: 'rgb(16, 185, 129)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            }
        ]
    };

    // Completion rate comparison (Bar Chart)
    const completionBarData = {
        labels: data.map(course => course.courseTitle.length > 12 ? course.courseTitle.substring(0, 12) + '...' : course.courseTitle),
        datasets: [{
            label: 'Completion Rate (%)',
            data: data.map(course => course.completionRate || 0),
            backgroundColor: data.map(course => {
                const rate = course.completionRate || 0;
                if (rate >= 70) return 'rgba(16, 185, 129, 0.7)';
                if (rate >= 40) return 'rgba(250, 204, 21, 0.7)';
                return 'rgba(239, 68, 68, 0.7)';
            }),
            borderColor: data.map(course => {
                const rate = course.completionRate || 0;
                if (rate >= 70) return 'rgb(16, 185, 129)';
                if (rate >= 40) return 'rgb(250, 204, 21)';
                return 'rgb(239, 68, 68)';
            }),
            borderWidth: 2,
            borderRadius: 8,
        }]
    };

    // Radar Data - Top 5 Courses Performance Comparison
    const top5 = [...data].sort((a, b) => (b.totalEnrolled || 0) - (a.totalEnrolled || 0)).slice(0, 5);
    const radarData = {
        labels: ['Completion Rate', 'Avg Progress', 'Avg Score', 'Engagement', 'Retention'],
        datasets: top5.map((course, i) => {
            const colors = [
                'rgba(147, 51, 234, 0.5)',
                'rgba(16, 185, 129, 0.5)',
                'rgba(250, 204, 21, 0.5)',
                'rgba(59, 130, 246, 0.5)',
                'rgba(244, 63, 94, 0.5)'
            ];
            const borderColors = [
                'rgb(147, 51, 234)',
                'rgb(16, 185, 129)',
                'rgb(250, 204, 21)',
                'rgb(59, 130, 246)',
                'rgb(244, 63, 94)'
            ];

            // Artificial metrics for engagement/retention based on other stats for variety
            const engagement = Math.min(100, (course.avgProgress || 0) + (course.avgScore || 0) / 2);
            const retention = Math.min(100, (course.completionRate || 0) * 1.2);

            return {
                label: course.courseTitle.substring(0, 15) + '...',
                data: [
                    course.completionRate || 0,
                    course.avgProgress || 0,
                    course.avgScore || 0,
                    engagement,
                    retention
                ],
                backgroundColor: colors[i % colors.length],
                borderColor: borderColors[i % borderColors.length],
                borderWidth: 2,
                pointBackgroundColor: borderColors[i % borderColors.length],
            };
        })
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: { color: '#94a3b8', font: { size: 10 } },
                ticks: { display: false, stepSize: 20 },
                suggestedMin: 0,
                suggestedMax: 100
            }
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#cbd5e1', font: { size: 10 }, usePointStyle: true }
            }
        }
    };

    // Status distribution (Doughnut Chart)
    const totalEnrolled = data.reduce((sum, course) => sum + (course.totalEnrolled || 0), 0);
    const totalCompleted = data.reduce((sum, course) => sum + (course.completed || 0), 0);
    const totalInProgress = data.reduce((sum, course) => sum + (course.inProgress || 0), 0);

    const statusData = {
        labels: ['Completed', 'In Progress', 'Not Started'],
        datasets: [{
            data: [
                totalCompleted,
                totalInProgress,
                totalEnrolled - totalCompleted - totalInProgress
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

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#cbd5e1',
                    padding: 15,
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    usePointStyle: true,
                    pointStyle: 'circle'
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
                    font: { size: 10 },
                    maxRotation: 45,
                    minRotation: 45
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
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
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

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-10 text-slate-400">
                No data available for visualization
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Enrollment Trends Line Chart */}
                <div className="lms-card p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">📈</span>
                        Enrollment & Completion Trends
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Compare total enrollments vs completions across courses</p>
                    <div className="h-80">
                        <Line data={enrollmentTrendData} options={chartOptions} />
                    </div>
                </div>

                {/* Radar Chart - Multi-dimensional Comparison */}
                <div className="lms-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">🕸️</span>
                        Course Matrix
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Top 5 performance metrics comparison</p>
                    <div className="h-80">
                        <Radar data={radarData} options={radarOptions} />
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Completion Rate Bar Chart */}
                <div className="lms-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        Completion Rate Comparison
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Success rates across all courses</p>
                    <div className="h-72">
                        <Bar data={completionBarData} options={chartOptions} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-emerald-500"></div>
                            <span className="text-slate-400">High (70%+)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-brand"></div>
                            <span className="text-slate-400">Medium (40-70%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-red-500"></div>
                            <span className="text-slate-400">Low (&lt;40%)</span>
                        </div>
                    </div>
                </div>

                {/* Status Distribution Doughnut */}
                <div className="lms-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎯</span>
                        Overall Status Distribution
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Platform-wide learning progress</p>
                    <div className="h-72">
                        <Doughnut data={statusData} options={doughnutOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
}
