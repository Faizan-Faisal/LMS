// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Navigation handling
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.dashboard-section');
    
    // Show dashboard section by default
    document.getElementById('dashboard').classList.add('active');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Hide all sections
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Update active state in navigation
                navLinks.forEach(l => l.parentElement.classList.remove('active'));
                this.parentElement.classList.add('active');
            }
        });
    });

    // Attendance functionality
    const courseSelect = document.getElementById('course-select');
    const attendanceDate = document.getElementById('attendance-date');
    const markAttendanceBtn = document.querySelector('.attendance-controls .btn-primary');
    const attendanceTable = document.querySelector('.attendance-table tbody');

    // Sample attendance data
    let attendanceData = [
        {
            studentId: 'ST001',
            name: 'John Doe',
            status: 'Present',
            date: '2024-03-14'
        }
    ];

    markAttendanceBtn.addEventListener('click', function() {
        if (!courseSelect.value || !attendanceDate.value) {
            alert('Please select a course and date');
            return;
        }
        // Here you would typically make an API call to save attendance
        alert('Attendance marked successfully!');
    });

    // Function to update attendance table
    function updateAttendanceTable() {
        attendanceTable.innerHTML = attendanceData.map(record => `
            <tr>
                <td>${record.studentId}</td>
                <td>${record.name}</td>
                <td>${record.status}</td>
                <td>
                    <button class="btn-primary" onclick="editAttendance('${record.studentId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Initial attendance table population
    updateAttendanceTable();

    // Exam Records functionality
    const examCourseSelect = document.getElementById('exam-course-select');
    const addExamBtn = document.querySelector('.exam-controls .btn-primary');
    const examTable = document.querySelector('.exam-table tbody');

    // Sample exam data
    let examData = [
        {
            studentId: 'ST001',
            name: 'John Doe',
            date: '2024-03-14',
            score: 85
        }
    ];

    addExamBtn.addEventListener('click', function() {
        if (!examCourseSelect.value) {
            alert('Please select a course');
            return;
        }
        // Here you would typically open a modal to add exam details
        alert('Add exam functionality will be implemented here');
    });

    // Function to update exam table
    function updateExamTable() {
        examTable.innerHTML = examData.map(record => `
            <tr>
                <td>${record.studentId}</td>
                <td>${record.name}</td>
                <td>${record.date}</td>
                <td>${record.score}%</td>
                <td>
                    <button class="btn-primary" onclick="editExam('${record.studentId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Initial exam table population
    updateExamTable();

    // Course Status functionality
    const courseStatusTable = document.querySelector('#course-status table tbody');
    
    // Sample course data
    const courses = [
        {
            id: 'CS101',
            name: 'Computer Science 101',
            status: 'Active',
            enrolledStudents: 45
        },
        {
            id: 'MATH101',
            name: 'Mathematics 101',
            status: 'Active',
            enrolledStudents: 38
        }
    ];
    
    // Update course status table
    function updateCourseTable() {
        courseStatusTable.innerHTML = courses.map(course => `
            <tr>
                <td>${course.id}</td>
                <td>${course.name}</td>
                <td>${course.status}</td>
                <td>${course.enrolledStudents}</td>
                <td>
                    <button class="btn-primary" onclick="editCourse('${course.id}')">
                        <i class="fas fa-edit"></i>
                        </button>
                    <button class="btn-secondary" onclick="updateStatus('${course.id}')">
                        <i class="fas fa-sync"></i>
                        </button>
                </td>
            </tr>
        `).join('');
    }
    
    // Initial course table population
    updateCourseTable();

    // Global edit functions
    window.editAttendance = function(studentId) {
        alert(`Edit attendance for student: ${studentId}`);
    };

    window.editExam = function(studentId) {
        alert(`Edit exam for student: ${studentId}`);
    };

    window.editCourse = function(courseId) {
        alert(`Edit course: ${courseId}`);
    };

    window.updateStatus = function(courseId) {
        alert(`Update status for course: ${courseId}`);
    };
}); 