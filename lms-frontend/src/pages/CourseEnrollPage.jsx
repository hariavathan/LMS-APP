import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import courseApi from "../api/course";
import axiosClient from "../api/axiosClient"; // Need to fetch users directly for now

const CourseEnrollPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const courseRes = await courseApi.getCourseById(courseId);
                setCourse(courseRes.data);

                // Fetch all users (Learners only ideally)
                const usersRes = await axiosClient.get("/users");
                // Filter for learners only? Or allow any. Let's filter if possible, but API returns all.
                // Let's filter client side for now.
                const learners = usersRes.data.filter(u => u.role === 'learner');
                setUsers(learners);
            } catch (err) {
                console.error(err);
                setMessage({ type: "error", text: "Failed to load data" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId]);

    const handleEnroll = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        setSubmitting(true);
        setMessage({ type: "", text: "" });

        try {
            await courseApi.enrollUser({
                userId: selectedUser,
                courseId: courseId
            });
            setMessage({ type: "success", text: "User enrolled successfully!" });
            setSelectedUser(""); // Reset selection
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to enroll user" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!course) return <div className="p-8">Course not found</div>;

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <button onClick={() => navigate('/courses')} className="mb-4 text-blue-600 hover:underline">← Back to Courses</button>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h1 className="text-2xl font-bold mb-2">Enroll Learner</h1>
                <p className="text-gray-600 mb-6">Course: <span className="font-semibold">{course.title}</span></p>

                {message.text && (
                    <div className={`p-3 rounded mb-4 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleEnroll} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Learner</label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        >
                            <option value="">-- Select a Learner --</option>
                            {users.map(u => (
                                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting ? "Enrolling..." : "Enroll Learner"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CourseEnrollPage;
