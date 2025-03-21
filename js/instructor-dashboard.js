// Simulated logged-in instructor (this will be replaced with PHP session data later)
const loggedInInstructor = {
    id: 'INS001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+92 300 1234567',
    cnic: '12345-1234567-1',
    department: 'Computer Science',
    qualification: 'MSc Computer Science',
    specialization: 'Software Engineering',
    experience: '5 years',
    status: 'Active',
    courses: ['CS101', 'CS102']
};

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing dashboard...');
    updateInstructorProfile();
    updateDashboardStats();
    updateCourseSchedule();
    setupEventListeners();
});

// Update instructor profile information
function updateInstructorProfile() {
    console.log('Updating instructor profile...');
    document.getElementById('instructorName').textContent = `${loggedInInstructor.firstName} ${loggedInInstructor.lastName}`;
    document.getElementById('instructorId').textContent = loggedInInstructor.id;
    document.getElementById('instructorEmail').textContent = loggedInInstructor.email;
    document.getElementById('instructorPhone').textContent = loggedInInstructor.phone;
    document.getElementById('instructorCNIC').textContent = loggedInInstructor.cnic;
    document.getElementById('instructorDepartment').textContent = loggedInInstructor.department;
    document.getElementById('instructorQualification').textContent = loggedInInstructor.qualification;
    document.getElementById('instructorSpecialization').textContent = loggedInInstructor.specialization;
    document.getElementById('instructorExperience').textContent = loggedInInstructor.experience;
    document.getElementById('instructorStatus').textContent = loggedInInstructor.status;
}

// Update dashboard statistics
function updateDashboardStats() {
    console.log('Updating dashboard stats...');
    // Get assigned courses count
    const assignedCoursesCount = loggedInInstructor.courses.length;
    document.getElementById('assignedCoursesCount').textContent = assignedCoursesCount;

    // Calculate total students (this will be replaced with actual data from PHP)
    const totalStudents = 150; // Example value
    document.getElementById('totalStudentsCount').textContent = totalStudents;

    // Get today's classes (this will be replaced with actual data from PHP)
    const todaysClasses = 3; // Example value
    document.getElementById('todaysClassesCount').textContent = todaysClasses;

    // Calculate total hours per week
    const totalHours = calculateTotalHours();
    document.getElementById('totalHoursCount').textContent = totalHours;
}

// Calculate total teaching hours per week
function calculateTotalHours() {
    let totalHours = 0;
    const assignedCourses = courses.filter(course => 
        loggedInInstructor.courses.includes(course.id)
    );

    assignedCourses.forEach(course => {
        // Parse schedule to get hours (e.g., "Mon, Wed 10:00 AM - 11:30 AM")
        const schedule = course.schedule;
        const days = schedule.split(',')[0].trim(); // Get first day
        const timeRange = schedule.split(',')[1].trim(); // Get time range
        const [startTime, endTime] = timeRange.split(' - ');
        
        // Convert times to 24-hour format and calculate duration
        const start = new Date(`1970-01-01 ${startTime}`);
        const end = new Date(`1970-01-01 ${endTime}`);
        const duration = (end - start) / (1000 * 60 * 60); // Duration in hours
        
        // Multiply by number of days per week
        const daysPerWeek = days.split(',').length;
        totalHours += duration * daysPerWeek;
    });

    return totalHours.toFixed(1);
}

// Update course schedule
function updateCourseSchedule(courseList = null) {
    console.log('Updating course schedule...');
    const scheduleGrid = document.getElementById('courseScheduleGrid');
    if (!scheduleGrid) {
        console.error('Could not find courseScheduleGrid element');
        return;
    }

    // If no courseList provided, filter courses for logged-in instructor
    if (!courseList) {
        courseList = courses.filter(course => 
            loggedInInstructor.courses.includes(course.id)
        );
    }

    scheduleGrid.innerHTML = '';

    if (courseList.length === 0) {
        scheduleGrid.innerHTML = `
            <div class="no-courses">
                <i class="fas fa-calendar-times"></i>
                <p>No courses assigned</p>
            </div>
        `;
        return;
    }

    courseList.forEach(course => {
        const scheduleCard = document.createElement('div');
        scheduleCard.className = 'schedule-card';
        scheduleCard.innerHTML = `
            <div class="schedule-card-header">
                <h4>${course.name}</h4>
                <span class="course-code">${course.id}</span>
            </div>
            <div class="schedule-card-body">
                <div class="schedule-info">
                    <p><i class="fas fa-users"></i> ${course.students}/${course.capacity} Students</p>
                    <p><i class="fas fa-door-open"></i> Room ${course.room}</p>
                    <p><i class="fas fa-calendar"></i> ${course.schedule}</p>
                </div>
                <div class="schedule-actions">
                    <button class="btn-action btn-view" onclick="viewCourseDetails('${course.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="manageAttendance('${course.id}')" title="Manage Attendance">
                        <i class="fas fa-calendar-check"></i>
                    </button>
                </div>
            </div>
        `;
        scheduleGrid.appendChild(scheduleCard);
    });
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    // Schedule search functionality
    const scheduleSearch = document.getElementById('scheduleSearch');
    if (scheduleSearch) {
        scheduleSearch.addEventListener('input', () => {
            const searchTerm = scheduleSearch.value.toLowerCase();
            const filteredCourses = courses.filter(course => 
                loggedInInstructor.courses.includes(course.id) &&
                (course.name.toLowerCase().includes(searchTerm) ||
                course.id.toLowerCase().includes(searchTerm) ||
                course.class.toString().includes(searchTerm) ||
                course.section.toLowerCase().includes(searchTerm))
            );
            updateCourseSchedule(filteredCourses);
        });
    }
}

// View course details
function viewCourseDetails(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        const details = `
            Course Details:
            - Code: ${course.id}
            - Name: ${course.name}
            - Class: ${course.class}th Class
            - Section: ${course.section}
            - Students: ${course.students}/${course.capacity}
            - Schedule: ${course.schedule}
            - Room: ${course.room}
            - Description: ${course.description}
        `;
        alert(details); // In a real app, use a modal
    }
}

// Manage attendance for a course
function manageAttendance(courseId) {
    // This will be implemented later with PHP
    alert('Attendance management will be implemented soon!');
}

// Refresh dashboard
function refreshDashboard() {
    updateInstructorProfile();
    updateDashboardStats();
    updateCourseSchedule();
    showNotification('Dashboard refreshed!', 'success');
}

// Refresh schedule
function refreshSchedule() {
    updateCourseSchedule();
    showNotification('Schedule refreshed!', 'success');
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    
    notification.style.backgroundColor = colors[type];
    notification.style.color = type === 'warning' ? '#000' : '#fff';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '1000';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 