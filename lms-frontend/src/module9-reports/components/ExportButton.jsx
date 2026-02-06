// module9-reports/components/ExportButton.jsx
import axiosClient from "../../api/axiosClient";

export default function ExportButton({ type }) {
    const handleExport = async () => {
        try {
            const response = await axiosClient.get(`/api/reports/export/${type}`, {
                responseType: "blob"
            });

            // Create download link
            const blob = new Blob([response.data], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            // Get filename from type
            const filenames = {
                "learning-progress": "learning_progress_report.csv",
                "course-completion": "course_completion_report.csv",
                "user-performance": "user_performance_report.csv"
            };
            link.download = filenames[type] || "report.csv";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed:", err);
            alert("Failed to export report. Please try again.");
        }
    };

    return (
        <button
            onClick={handleExport}
            className="lms-btn-primary px-4 py-2 text-xs flex items-center gap-2"
        >
            <span>📥</span>
            <span>Export CSV</span>
        </button>
    );
}
