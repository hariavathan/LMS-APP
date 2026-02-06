import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import courseApi from "../api/course";

const MyCoursesPage = ({ auth }) => {
    const user = auth?.user;
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const res = await courseApi.getMyCourses();
                setEnrollments(res.data);
            } catch (err) {
                setError("Failed to load your courses");
            } finally {
                setLoading(false);
            }
        };
        fetchEnrollments();
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold lms-text-brand mb-1 font-outfit">My Learning Activity</h1>
            <p className="text-slate-400 text-sm mb-8">Manage your active enrollments and track your progress across all learning paths.</p>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment) => {
                    const course = enrollment.courseId;
                    if (!course) return null; // Safety check

                    return (
                        <div key={enrollment._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
                            {course.thumbnail && (
                                <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
                            )}
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="mb-auto">
                                    <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                                    <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                                </div>

                                <div className="mt-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Progress</span>
                                        <span>{enrollment.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                        <div
                                            className="bg-green-600 h-2.5 rounded-full"
                                            style={{ width: `${enrollment.progress}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => navigate(`/learn/${course._id}`)}
                                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                                        >
                                            {enrollment.progress > 0 ? "Continue Learning" : "Start Learning"}
                                        </button>

                                        {user && user.role === 'trainer' && course.createdBy === user.id && (
                                            <button
                                                onClick={() => navigate(`/courses/${course._id}/edit`)}
                                                className="w-full bg-amber-500 text-white py-2 rounded hover:bg-amber-600 transition font-bold"
                                            >
                                                Edit Course
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {enrollments.length === 0 && (
                    <div className="col-span-3 text-center py-10">
                        <p className="text-gray-500 text-lg">You are not enrolled in any courses yet.</p>
                        <p className="text-gray-400">Ask your admin to enroll you!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCoursesPage;
