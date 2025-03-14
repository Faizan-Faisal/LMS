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

    markAttendanceBtn.addEventListener('click', function() {
        if (!courseSelect.value || !attendanceDate.value) {
            alert('Please select a course and date');
            return;
        }
        // Here you would typically make an API call to save attendance
        alert('Attendance marked successfully!');
    });

    // Exam Records functionality
    const examCourseSelect = document.getElementById('exam-course-select');
    const addExamBtn = document.querySelector('.exam-controls .btn-primary');

    addExamBtn.addEventListener('click', function() {
        if (!examCourseSelect.value) {
            alert('Please select a course');
            return;
        }
        // Here you would typically open a modal to add exam details
        alert('Add exam functionality will be implemented here');
    });

    // Course Status functionality
    const addCourseBtn = document.querySelector('.course-controls .btn-primary');
    const updateStatusBtn = document.querySelector('.course-controls .btn-secondary');

    addCourseBtn.addEventListener('click', function() {
        // Here you would typically open a modal to add new course
        alert('Add course functionality will be implemented here');
    });

    updateStatusBtn.addEventListener('click', function() {
        // Here you would typically open a modal to update course status
        alert('Update course status functionality will be implemented here');
    });

    // Student Registration Form Handling
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(studentForm);
            const studentData = Object.fromEntries(formData.entries());
            
            // Here you would typically send this data to your backend
            console.log('Student Data:', studentData);
            
            // Show success message
            alert('Student registered successfully!');
            
            // Reset form
            studentForm.reset();
        });
    }

    // Sample data population (replace with actual API calls)
    function populateSampleData() {
        // Sample attendance data
        const attendanceTable = document.querySelector('.attendance-table tbody');
        attendanceTable.innerHTML = `
            <tr>
                <td>ST001</td>
                <td>John Doe</td>
                <td>Present</td>
                <td>
                    <button class="btn-primary">Edit</button>
                    <button class="btn-secondary">Delete</button>
                </td>
            </tr>
        `;

        // Sample exam records
        const examTable = document.querySelector('.exam-table tbody');
        examTable.innerHTML = `
            <tr>
                <td>ST001</td>
                <td>John Doe</td>
                <td>2024-03-14</td>
                <td>85%</td>
                <td>
                    <button class="btn-primary">Edit</button>
                    <button class="btn-secondary">Delete</button>
                </td>
            </tr>
        `;

        // Sample course status
        const courseTable = document.querySelector('.course-table tbody');
        courseTable.innerHTML = `
            <tr>
                <td>CS101</td>
                <td>Introduction to Programming</td>
                <td>Active</td>
                <td>25</td>
                <td>
                    <button class="btn-primary">Edit</button>
                    <button class="btn-secondary">Update Status</button>
                </td>
            </tr>
        `;
    }

    // Initialize sample data
    populateSampleData();
});

// Student Management Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mock student data (replace with actual API calls)
    let students = [
        {
            id: 'STU001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            course: 'Computer Science 101',
            status: 'active'
        },
        {
            id: 'STU002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            course: 'Mathematics 101',
            status: 'active'
        }
    ];

    // Registration form elements
    const registrationFormContainer = document.getElementById('registrationFormContainer');
    const showRegistrationFormBtn = document.getElementById('showRegistrationForm');
    const cancelRegistrationBtn = document.getElementById('cancelRegistration');
    const studentForm = document.getElementById('studentForm');

    // Show registration form
    showRegistrationFormBtn.addEventListener('click', function() {
        registrationFormContainer.style.display = 'block';
        showRegistrationFormBtn.style.display = 'none';
    });

    // Hide registration form
    cancelRegistrationBtn.addEventListener('click', function() {
        registrationFormContainer.style.display = 'none';
        showRegistrationFormBtn.style.display = 'block';
        studentForm.reset();
    });

    // Handle form submission
    studentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(studentForm);
        const studentData = Object.fromEntries(formData.entries());
        
        // Create new student object
        const newStudent = {
            id: studentData.studentId,
            name: `${studentData.firstName} ${studentData.lastName}`,
            email: studentData.email,
            course: studentData.course,
            status: 'active'
        };
        
        // Add new student to the list
        students.push(newStudent);
        
        // Update the table
        renderStudentTable();
        
        // Hide form and show register button
        registrationFormContainer.style.display = 'none';
        showRegistrationFormBtn.style.display = 'block';
        
        // Reset form
        studentForm.reset();
        
        // Show success message
        alert('Student registered successfully!');
    });

    // Function to render student table
    function renderStudentTable(studentList = students) {
        const tableBody = document.getElementById('studentTableBody');
        tableBody.innerHTML = '';

        studentList.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.course}</td>
                <td><span class="status-badge status-${student.status}">${student.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editStudent('${student.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="deleteStudent('${student.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Search functionality
    const searchInput = document.getElementById('studentSearch');
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredStudents = students.filter(student => 
            student.name.toLowerCase().includes(searchTerm) ||
            student.id.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm)
        );
        renderStudentTable(filteredStudents);
    });

    // Refresh button functionality
    const refreshButton = document.getElementById('refreshStudents');
    refreshButton.addEventListener('click', function() {
        // In a real application, this would fetch fresh data from the server
        renderStudentTable();
        searchInput.value = '';
    });

    // Edit student function
    window.editStudent = function(studentId) {
        const student = students.find(s => s.id === studentId);
        if (student) {
            // In a real application, this would open a modal or redirect to an edit page
            alert(`Edit student: ${student.name}`);
        }
    };

    // Delete student function
    window.deleteStudent = function(studentId) {
        if (confirm('Are you sure you want to delete this student?')) {
            students = students.filter(s => s.id !== studentId);
            renderStudentTable();
        }
    };

    // Initial render
    renderStudentTable();
}); 