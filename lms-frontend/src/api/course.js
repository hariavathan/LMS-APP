import axiosClient from "./axiosClient";

const courseApi = {
    // Course Management
    createCourse: (data) => axiosClient.post("/api/courses", data),
    getAllCourses: () => axiosClient.get("/api/courses"),
    getCourseById: (id) => axiosClient.get(`/api/courses/${id}`),
    updateCourse: (id, data) => axiosClient.put(`/api/courses/${id}`, data),

    // Enrollment Management
    enrollUser: (data) => axiosClient.post("/api/enrollments", data), // { userId, courseId }
    getMyCourses: () => axiosClient.get("/api/enrollments/my-courses"),

    // Learning Flow
    completeLesson: (courseId, lessonId) =>
        axiosClient.post(`/api/enrollments/${courseId}/complete-lesson`, { lessonId }),

    // Enrollment Reports (Admin/Trainer)
    getCourseEnrollments: (courseId) => axiosClient.get(`/api/enrollments/course/${courseId}`)
};

export default courseApi;

