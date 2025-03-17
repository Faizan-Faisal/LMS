// Sample data for testing
let students = [
    {
        id: "STD001",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        cnic: "12345-1234567-1",
        dob: "2000-01-01",
        gender: "male",
        class: "9",
        section: "Computer Science",
        address: "123 Main St",
        status: "Active"
    }
];

let instructors = [
    {
        id: "INS001",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        phone: "123-456-7890",
        cnic: "12345-1234567-2",
        department: "Computer Science",
        qualification: "Ph.D.",
        specialization: "Machine Learning",
        experience: 5,
        courses: ["Computer Science 101", "Computer Science 102"],
        status: "Active"
    }
];

let courses = [
    {
        id: "CS101",
        name: "Computer Science 101",
        class: "9",
        section: "Computer Science",
        instructor: "Jane Smith",
        students: 25,
        capacity: 30,
        schedule: "Mon, Wed 10:00 AM - 11:30 AM",
        room: "Room 101",
        description: "Introduction to Computer Science",
        status: "Active"
    }
];

let attendanceRecords = [
    {
        date: "2024-03-20",
        class: "9",
        section: "Computer Science",
        totalStudents: 30,
        present: 25,
        absent: 3,
        late: 2,
        percentage: 83.33
    }
];

let examRecords = [
    {
        studentId: "STD001",
        name: "John Doe",
        class: "9",
        section: "Computer Science",
        examType: "Mid Term",
        subject: "Computer Science",
        marks: 85,
        totalMarks: 100,
        percentage: 85,
        grade: "A",
        status: "Pass"
    }
];

let studentFeedback = [
    {
        date: "2024-03-19",
        studentId: "STD001",
        name: "John Doe",
        class: "9",
        section: "Computer Science",
        category: "Academic",
        issue: "Difficulty understanding programming concepts",
        solution: "Additional practice sessions scheduled",
        status: "In Progress"
    }
];

// Section Navigation
document.addEventListener('DOMContentLoaded', function() {
    // Get all sections
    const sections = document.querySelectorAll('.dashboard-section');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Initially hide all sections except dashboard
    sections.forEach(section => {
        if (section.id !== 'dashboard') {
            section.style.display = 'none';
        }
    });

    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            
            // Add active class to clicked link
            link.parentElement.classList.add('active');
            
            // Get the section id from href
            const sectionId = link.getAttribute('href').substring(1);
            
            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show the selected section
            const selectedSection = document.getElementById(sectionId);
            if (selectedSection) {
                selectedSection.style.display = 'block';
                
                // If it's the dashboard section, refresh the stats
                if (sectionId === 'dashboard') {
                    updateDashboardStats();
                }
                // If it's the student section, refresh the table
                else if (sectionId === 'student-management') {
                    updateStudentTable();
                }
                // If it's the instructor section, refresh the table
                else if (sectionId === 'instructor-management') {
                    updateInstructorTable();
                }
            }
        });
    });

    // Function to update dashboard stats
    function updateDashboardStats() {
        document.querySelector('.stat-card:nth-child(1) p').textContent = instructors.length;
        document.querySelector('.stat-card:nth-child(2) p').textContent = students.length;
        document.querySelector('.stat-card:nth-child(3) p').textContent = instructors.reduce((total, instructor) => total + instructor.courses.length, 0);
        
        // Calculate total unique sections
        const sections = new Set([
            'Computer Science',
            'Biology',
            'Pre-Medical',
            'Pre-Engineering'
        ]);
        document.querySelector('.stat-card:nth-child(4) p').textContent = sections.size;
    }

    // Student Management Functions
    const studentForm = document.getElementById('studentForm');
    const showStudentForm = document.getElementById('showStudentForm');
    const cancelStudentForm = document.getElementById('cancelStudentForm');
    const studentFormContainer = document.getElementById('studentFormContainer');
    const studentSearch = document.getElementById('studentSearch');
    const refreshStudents = document.getElementById('refreshStudents');

    // Show/Hide student registration form
    showStudentForm?.addEventListener('click', () => {
        studentFormContainer.style.display = 'block';
        studentForm.reset();
        clearValidationStates(studentForm);
    });

    cancelStudentForm?.addEventListener('click', () => {
        studentFormContainer.style.display = 'none';
        studentForm.reset();
        clearValidationStates(studentForm);
    });

    // Handle student form submission
    studentForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateStudentForm(studentForm)) {
            showNotification('Please fill all required fields correctly', 'error');
            return;
        }

        const formData = new FormData(studentForm);
        const newStudent = {
            id: formData.get('studentId'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            cnic: formData.get('cnic'),
            dob: formData.get('dob'),
            gender: formData.get('gender'),
            class: formData.get('class'),
            section: formData.get('section'),
            address: formData.get('address'),
            status: 'Active'
        };

        const existingIndex = students.findIndex(s => s.id === newStudent.id);
        if (existingIndex >= 0) {
            students[existingIndex] = newStudent;
            showNotification('Student information updated successfully!', 'success');
        } else {
            students.push(newStudent);
            showNotification('Student registered successfully!', 'success');
        }

        updateStudentTable();
        studentForm.reset();
        studentFormContainer.style.display = 'none';
        clearValidationStates(studentForm);
        updateDashboardStats();
    });

    // Student search functionality
    studentSearch?.addEventListener('input', () => {
        const searchTerm = studentSearch.value.toLowerCase();
        const filteredStudents = students.filter(student => 
            student.firstName.toLowerCase().includes(searchTerm) ||
            student.lastName.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            student.id.toLowerCase().includes(searchTerm) ||
            student.class.toString().includes(searchTerm) ||
            student.section.toLowerCase().includes(searchTerm)
        );
        updateStudentTable(filteredStudents);
    });

    // Refresh student list
    refreshStudents?.addEventListener('click', () => {
        updateStudentTable();
        showNotification('Student list refreshed!', 'info');
    });

    // Initial student table population
    updateStudentTable();

    // Instructor Management Functions
    const instructorForm = document.getElementById('instructorForm');
    const showInstructorForm = document.getElementById('showInstructorForm');
    const cancelInstructorForm = document.getElementById('cancelInstructorForm');
    const instructorFormContainer = document.getElementById('instructorFormContainer');
    const instructorSearch = document.getElementById('instructorSearch');
    const refreshInstructors = document.getElementById('refreshInstructors');

    // Show/Hide instructor registration form
    showInstructorForm?.addEventListener('click', () => {
        instructorFormContainer.style.display = 'block';
        instructorForm.reset();
    });

    cancelInstructorForm?.addEventListener('click', () => {
        instructorFormContainer.style.display = 'none';
        instructorForm.reset();
    });

    // Handle instructor form submission
    instructorForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(instructorForm);
        const selectedCourses = Array.from(document.getElementById('assignedCourses').selectedOptions).map(option => option.text);
        
        const newInstructor = {
            id: formData.get('instructorId'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            cnic: formData.get('cnic'),
            department: formData.get('department'),
            qualification: formData.get('qualification'),
            specialization: formData.get('specialization'),
            experience: formData.get('experience'),
            courses: selectedCourses,
            status: 'Active'
        };

        const existingIndex = instructors.findIndex(i => i.id === newInstructor.id);
        if (existingIndex >= 0) {
            instructors[existingIndex] = newInstructor;
            showNotification('Instructor information updated successfully!', 'success');
        } else {
            instructors.push(newInstructor);
            showNotification('Instructor registered successfully!', 'success');
        }

        updateInstructorTable();
        instructorForm.reset();
        instructorFormContainer.style.display = 'none';
        updateDashboardStats();
    });

    // Instructor search functionality
    instructorSearch?.addEventListener('input', () => {
        const searchTerm = instructorSearch.value.toLowerCase();
        const filteredInstructors = instructors.filter(instructor => 
            instructor.firstName.toLowerCase().includes(searchTerm) ||
            instructor.lastName.toLowerCase().includes(searchTerm) ||
            instructor.email.toLowerCase().includes(searchTerm) ||
            instructor.id.toLowerCase().includes(searchTerm) ||
            instructor.department.toLowerCase().includes(searchTerm)
        );
        updateInstructorTable(filteredInstructors);
    });

    // Refresh instructor list
    refreshInstructors?.addEventListener('click', () => {
        updateInstructorTable();
        showNotification('Instructor list refreshed!', 'info');
    });

    // Initial instructor table population
    updateInstructorTable();

    // Course Management Functions
    const courseForm = document.getElementById('courseForm');
    const showCourseForm = document.getElementById('showCourseForm');
    const cancelCourseForm = document.getElementById('cancelCourseForm');
    const courseFormContainer = document.getElementById('courseFormContainer');
    const courseSearch = document.getElementById('courseSearch');
    const refreshCourses = document.getElementById('refreshCourses');
    const courseClass = document.getElementById('courseClass');
    const courseSection = document.getElementById('courseSection');

    // Show/Hide course registration form
    showCourseForm?.addEventListener('click', () => {
        courseFormContainer.style.display = 'block';
        courseForm.reset();
        clearValidationStates(courseForm);
        updateInstructorOptions();
    });

    cancelCourseForm?.addEventListener('click', () => {
        courseFormContainer.style.display = 'none';
        courseForm.reset();
        clearValidationStates(courseForm);
    });

    // Handle course form submission
    courseForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateCourseForm(courseForm)) {
            showNotification('Please fill all required fields correctly', 'error');
            return;
        }

        const formData = new FormData(courseForm);
        const newCourse = {
            id: formData.get('courseCode'),
            name: formData.get('courseName'),
            class: formData.get('courseClass'),
            section: formData.get('courseSection'),
            instructor: formData.get('courseInstructor'),
            students: 0,
            capacity: parseInt(formData.get('courseCapacity')),
            schedule: formData.get('courseSchedule'),
            room: formData.get('courseRoom'),
            description: formData.get('courseDescription'),
            status: 'Active'
        };

        const existingIndex = courses.findIndex(c => c.id === newCourse.id);
        if (existingIndex >= 0) {
            courses[existingIndex] = newCourse;
            showNotification('Course information updated successfully!', 'success');
        } else {
            courses.push(newCourse);
            showNotification('Course added successfully!', 'success');
        }

        updateCourseTable();
        courseForm.reset();
        courseFormContainer.style.display = 'none';
        clearValidationStates(courseForm);
    });

    // Course search functionality
    courseSearch?.addEventListener('input', () => {
        const searchTerm = courseSearch.value.toLowerCase();
        const filteredCourses = courses.filter(course => 
            course.name.toLowerCase().includes(searchTerm) ||
            course.id.toLowerCase().includes(searchTerm) ||
            course.instructor.toLowerCase().includes(searchTerm) ||
            course.class.toString().includes(searchTerm) ||
            course.section.toLowerCase().includes(searchTerm)
        );
        updateCourseTable(filteredCourses);
    });

    // Refresh course list
    refreshCourses?.addEventListener('click', () => {
        updateCourseTable();
        showNotification('Course list refreshed!', 'info');
    });

    // Update section options based on class selection
    courseClass?.addEventListener('change', () => {
        updateCourseSectionOptions();
    });

    // Initial course table population
    updateCourseTable();

    // Initial dashboard stats update
    updateDashboardStats();

    // Reports Section Functions
    const attendanceClass = document.getElementById('attendanceClass');
    const attendanceSection = document.getElementById('attendanceSection');
    const attendanceMonth = document.getElementById('attendanceMonth');
    const generateAttendanceReport = document.getElementById('generateAttendanceReport');
    const attendanceSearch = document.getElementById('attendanceSearch');

    const examClass = document.getElementById('examClass');
    const examSection = document.getElementById('examSection');
    const examType = document.getElementById('examType');
    const generateExamReport = document.getElementById('generateExamReport');
    const examSearch = document.getElementById('examSearch');

    const feedbackClass = document.getElementById('feedbackClass');
    const feedbackSection = document.getElementById('feedbackSection');
    const feedbackStatus = document.getElementById('feedbackStatus');
    const generateFeedbackReport = document.getElementById('generateFeedbackReport');
    const feedbackSearch = document.getElementById('feedbackSearch');

    // Attendance Report Functions
    attendanceClass?.addEventListener('change', () => {
        updateAttendanceSectionOptions();
        filterAttendanceRecords();
    });

    attendanceSection?.addEventListener('change', () => {
        filterAttendanceRecords();
    });

    attendanceMonth?.addEventListener('change', () => {
        filterAttendanceRecords();
    });

    generateAttendanceReport?.addEventListener('click', () => {
        filterAttendanceRecords();
        showNotification('Attendance report generated successfully!', 'success');
    });

    attendanceSearch?.addEventListener('input', () => {
        filterAttendanceRecords();
    });

    // Exam Report Functions
    examClass?.addEventListener('change', () => {
        updateExamSectionOptions();
        filterExamRecords();
    });

    examSection?.addEventListener('change', () => {
        filterExamRecords();
    });

    examType?.addEventListener('change', () => {
        filterExamRecords();
    });

    generateExamReport?.addEventListener('click', () => {
        filterExamRecords();
        showNotification('Exam report generated successfully!', 'success');
    });

    examSearch?.addEventListener('input', () => {
        filterExamRecords();
    });

    // Feedback Report Functions
    feedbackClass?.addEventListener('change', () => {
        updateFeedbackSectionOptions();
        filterFeedbackRecords();
    });

    feedbackSection?.addEventListener('change', () => {
        filterFeedbackRecords();
    });

    feedbackStatus?.addEventListener('change', () => {
        filterFeedbackRecords();
    });

    generateFeedbackReport?.addEventListener('click', () => {
        filterFeedbackRecords();
        showNotification('Feedback report generated successfully!', 'success');
    });

    feedbackSearch?.addEventListener('input', () => {
        filterFeedbackRecords();
    });

    // Filter Functions
    function filterAttendanceRecords() {
        const selectedClass = attendanceClass?.value;
        const selectedSection = attendanceSection?.value;
        const selectedMonth = attendanceMonth?.value;
        const searchTerm = attendanceSearch?.value.toLowerCase();

        let filteredRecords = [...attendanceRecords];

        // Filter by class
        if (selectedClass) {
            filteredRecords = filteredRecords.filter(record => record.class === selectedClass);
        }

        // Filter by section
        if (selectedSection) {
            filteredRecords = filteredRecords.filter(record => record.section === selectedSection);
        }

        // Filter by month
        if (selectedMonth) {
            filteredRecords = filteredRecords.filter(record => record.date.startsWith(selectedMonth));
        }

        // Filter by search term
        if (searchTerm) {
            filteredRecords = filteredRecords.filter(record => 
                record.class.toLowerCase().includes(searchTerm) ||
                record.section.toLowerCase().includes(searchTerm) ||
                record.date.includes(searchTerm)
            );
        }

        // Sort by date (newest first)
        filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        updateAttendanceTable(filteredRecords);
    }

    function filterExamRecords() {
        const selectedClass = examClass?.value;
        const selectedSection = examSection?.value;
        const selectedType = examType?.value;
        const searchTerm = examSearch?.value.toLowerCase();

        let filteredRecords = [...examRecords];

        // Filter by class
        if (selectedClass) {
            filteredRecords = filteredRecords.filter(record => record.class === selectedClass);
        }

        // Filter by section
        if (selectedSection) {
            filteredRecords = filteredRecords.filter(record => record.section === selectedSection);
        }

        // Filter by exam type
        if (selectedType) {
            filteredRecords = filteredRecords.filter(record => record.examType === selectedType);
        }

        // Filter by search term
        if (searchTerm) {
            filteredRecords = filteredRecords.filter(record => 
                record.name.toLowerCase().includes(searchTerm) ||
                record.studentId.toLowerCase().includes(searchTerm) ||
                record.subject.toLowerCase().includes(searchTerm)
            );
        }

        // Sort by percentage (highest first)
        filteredRecords.sort((a, b) => b.percentage - a.percentage);

        updateExamTable(filteredRecords);
        updateExamStatistics(filteredRecords);
    }

    function updateExamStatistics(records) {
        const totalStudents = records.length;
        const passedStudents = records.filter(record => record.status === 'Pass').length;
        const failedStudents = records.filter(record => record.status === 'Fail').length;
        const absentStudents = records.filter(record => record.status === 'Absent').length;

        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('passedStudents').textContent = passedStudents;
        document.getElementById('failedStudents').textContent = failedStudents;
        document.getElementById('absentStudents').textContent = absentStudents;
    }

    function showStudentDetails(status) {
        const modal = document.getElementById('studentDetailsModal');
        const modalTitle = document.getElementById('modalTitle');
        const tbody = document.getElementById('studentDetailsBody');
        const filteredRecords = examRecords.filter(record => record.status === status.charAt(0).toUpperCase() + status.slice(1));

        // Set modal title based on status
        modalTitle.textContent = `${status.charAt(0).toUpperCase() + status.slice(1)} Students Details`;

        // Clear existing content
        tbody.innerHTML = '';

        if (filteredRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No ${status} students found</td>
                </tr>
            `;
        } else {
            filteredRecords.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.studentId}</td>
                    <td>${record.name}</td>
                    <td>${record.marks}</td>
                    <td>${record.totalMarks}</td>
                    <td>${record.percentage}%</td>
                    <td>${record.grade}</td>
                `;
                tbody.appendChild(row);
            });
        }

        // Show modal
        modal.style.display = 'block';

        // Add close button functionality
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    }

    function filterFeedbackRecords() {
        const selectedClass = feedbackClass?.value;
        const selectedSection = feedbackSection?.value;
        const selectedStatus = feedbackStatus?.value;
        const searchTerm = feedbackSearch?.value.toLowerCase();

        let filteredRecords = [...studentFeedback];

        // Filter by class
        if (selectedClass) {
            filteredRecords = filteredRecords.filter(record => record.class === selectedClass);
        }

        // Filter by section
        if (selectedSection) {
            filteredRecords = filteredRecords.filter(record => record.section === selectedSection);
        }

        // Filter by status
        if (selectedStatus) {
            filteredRecords = filteredRecords.filter(record => record.status === selectedStatus);
        }

        // Filter by search term
        if (searchTerm) {
            filteredRecords = filteredRecords.filter(record => 
                record.issue.toLowerCase().includes(searchTerm) ||
                record.solution.toLowerCase().includes(searchTerm) ||
                record.category.toLowerCase().includes(searchTerm)
            );
        }

        // Sort by date (newest first)
        filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        updateFeedbackTable(filteredRecords);
    }

    // Initial table population
    filterAttendanceRecords();
    filterExamRecords();
    filterFeedbackRecords();
});

// Helper Functions
function updateStudentTable(studentList = students) {
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (studentList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No students found</td>
            </tr>
        `;
        return;
    }
    
    studentList.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.class}th Class</td>
            <td>${student.section}</td>
            <td><span class="status-${student.status.toLowerCase()}">${student.status}</span></td>
            <td>
                <button class="btn-action btn-view" onclick="viewStudent('${student.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-edit" onclick="editStudent('${student.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteStudent('${student.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateInstructorTable(instructorList = instructors) {
    const tbody = document.getElementById('instructorTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (instructorList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No instructors found</td>
            </tr>
        `;
        return;
    }
    
    instructorList.forEach(instructor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${instructor.id}</td>
            <td>${instructor.firstName} ${instructor.lastName}</td>
            <td>${instructor.department}</td>
            <td>${instructor.courses.join(', ')}</td>
            <td><span class="status-${instructor.status.toLowerCase()}">${instructor.status}</span></td>
            <td>
                <button class="btn-action btn-view" onclick="viewInstructor('${instructor.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-edit" onclick="editInstructor('${instructor.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteInstructor('${instructor.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function viewStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        const details = `
            Student Details:
            - ID: ${student.id}
            - Name: ${student.firstName} ${student.lastName}
            - Email: ${student.email}
            - Phone: ${student.phone}
            - CNIC: ${student.cnic}
            - Date of Birth: ${student.dob}
            - Gender: ${student.gender}
            - Class: ${student.class}th Class
            - Section: ${student.section}
            - Address: ${student.address}
            - Status: ${student.status}
        `;
        alert(details); // In a real app, use a modal or detailed view
    }
}

function viewInstructor(instructorId) {
    const instructor = instructors.find(i => i.id === instructorId);
    if (instructor) {
        const details = `
            Instructor Details:
            - ID: ${instructor.id}
            - Name: ${instructor.firstName} ${instructor.lastName}
            - Email: ${instructor.email}
            - Phone: ${instructor.phone}
            - CNIC: ${instructor.cnic}
            - Department: ${instructor.department}
            - Qualification: ${instructor.qualification}
            - Specialization: ${instructor.specialization}
            - Experience: ${instructor.experience}
            - Courses: ${instructor.courses.join(', ')}
            - Status: ${instructor.status}
        `;
        alert(details); // In a real app, use a modal or detailed view
    }
}

function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        const form = document.getElementById('studentForm');
        form.studentId.value = student.id;
        form.firstName.value = student.firstName;
        form.lastName.value = student.lastName;
        form.email.value = student.email;
        form.phone.value = student.phone;
        form.cnic.value = student.cnic;
        form.dob.value = student.dob;
        form.gender.value = student.gender;
        form.class.value = student.class;
        
        // Update section options before setting the value
        updateSectionOptions();
        form.section.value = student.section;
        
        form.address.value = student.address;
        
        document.getElementById('studentFormContainer').style.display = 'block';
        showNotification('Edit student information', 'info');
    }
}

function editInstructor(instructorId) {
    const instructor = instructors.find(i => i.id === instructorId);
    if (instructor) {
        // Populate form with instructor data
        const form = document.getElementById('instructorForm');
        form.instructorId.value = instructor.id;
        form.firstName.value = instructor.firstName;
        form.lastName.value = instructor.lastName;
        form.email.value = instructor.email;
        form.phone.value = instructor.phone;
        form.cnic.value = instructor.cnic;
        form.department.value = instructor.department;
        form.qualification.value = instructor.qualification;
        form.specialization.value = instructor.specialization;
        form.experience.value = instructor.experience;
        
        // Handle multiple course selection
        const courseSelect = form.assignedCourses;
        Array.from(courseSelect.options).forEach(option => {
            option.selected = instructor.courses.includes(option.text);
        });
        
        // Show form
        document.getElementById('instructorFormContainer').style.display = 'block';
        showNotification('Edit instructor information');
    }
}

function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        const initialLength = students.length;
        students = students.filter(s => s.id !== studentId);
        
        if (students.length < initialLength) {
            updateStudentTable();
            showNotification('Student deleted successfully!', 'success');
        } else {
            showNotification('Error deleting student', 'error');
        }
    }
}

function deleteInstructor(instructorId) {
    if (confirm('Are you sure you want to delete this instructor?')) {
        instructors = instructors.filter(i => i.id !== instructorId);
        updateInstructorTable();
        showNotification('Instructor deleted successfully!');
    }
}

function validateStudentForm(form) {
    let isValid = true;
    
    // Required fields
    const requiredFields = ['studentId', 'firstName', 'lastName', 'email', 'phone', 'cnic', 'dob', 'gender', 'class'];
    
    requiredFields.forEach(field => {
        const input = form[field];
        if (!input.value.trim()) {
            markInvalid(input, 'This field is required');
            isValid = false;
        } else {
            markValid(input);
        }
    });

    // Email validation
    const emailInput = form['email'];
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value && !emailPattern.test(emailInput.value)) {
        markInvalid(emailInput, 'Please enter a valid email address');
        isValid = false;
    }

    // Phone validation
    const phoneInput = form['phone'];
    const phonePattern = /^3\d{2}-\d{4}-\d{3}$/;
    if (phoneInput.value && !phonePattern.test(phoneInput.value)) {
        markInvalid(phoneInput, 'Please enter phone in format: 3XX-XXXX-XXX');
        isValid = false;
    }

    // CNIC validation
    const cnicInput = form['cnic'];
    const cnicPattern = /^\d{5}-\d{7}-\d{1}$/;
    if (cnicInput.value && !cnicPattern.test(cnicInput.value)) {
        markInvalid(cnicInput, 'Please enter CNIC in format: 12345-1234567-1');
        isValid = false;
    }

    // Student ID validation
    const studentIdInput = form['studentId'];
    const studentIdPattern = /^STD\d{3}$/;
    if (studentIdInput.value && !studentIdPattern.test(studentIdInput.value)) {
        markInvalid(studentIdInput, 'Student ID must be in format: STD001');
        isValid = false;
    }

    return isValid;
}

function markInvalid(input, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    
    // Create or update error message
    let errorDiv = input.parentElement.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        input.parentElement.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function markValid(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    
    // Remove error message if exists
    const errorDiv = input.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function clearValidationStates(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
        const errorDiv = input.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    });
}

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

// Add this function to handle section options based on class selection
function updateSectionOptions() {
    const classSelect = document.getElementById('class');
    const sectionSelect = document.getElementById('section');
    const selectedClass = classSelect.value;

    // Clear existing options
    sectionSelect.innerHTML = '<option value="">Select Section</option>';

    if (selectedClass === '9' || selectedClass === '10') {
        // Add sections for 9th and 10th
        const sections = ['Computer Science', 'Biology'];
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            sectionSelect.appendChild(option);
        });
    } else if (selectedClass === '11' || selectedClass === '12') {
        // Add sections for 11th and 12th
        const sections = ['Pre-Medical', 'Pre-Engineering'];
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            sectionSelect.appendChild(option);
        });
    }
}

function updateCourseTable(courseList = courses) {
    const tbody = document.getElementById('courseTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (courseList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center">No courses found</td>
            </tr>
        `;
        return;
    }
    
    courseList.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.id}</td>
            <td>${course.name}</td>
            <td>${course.class}th Class</td>
            <td>${course.section}</td>
            <td>${course.instructor}</td>
            <td>${course.students}/${course.capacity}</td>
            <td>${course.schedule}</td>
            <td>${course.room}</td>
            <td><span class="status-${course.status.toLowerCase()}">${course.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewCourse('${course.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="editCourse('${course.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteCourse('${course.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function viewCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        const details = `
            Course Details:
            - Code: ${course.id}
            - Name: ${course.name}
            - Class: ${course.class}th Class
            - Section: ${course.section}
            - Instructor: ${course.instructor}
            - Students: ${course.students}/${course.capacity}
            - Schedule: ${course.schedule}
            - Room: ${course.room}
            - Description: ${course.description}
            - Status: ${course.status}
        `;
        alert(details); // In a real app, use a modal or detailed view
    }
}

function editCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        const form = document.getElementById('courseForm');
        form.courseCode.value = course.id;
        form.courseName.value = course.name;
        form.courseClass.value = course.class;
        
        // Update section options before setting the value
        updateCourseSectionOptions();
        form.courseSection.value = course.section;
        
        form.courseInstructor.value = course.instructor;
        form.courseCapacity.value = course.capacity;
        form.courseSchedule.value = course.schedule;
        form.courseRoom.value = course.room;
        form.courseDescription.value = course.description;
        
        document.getElementById('courseFormContainer').style.display = 'block';
        showNotification('Edit course information', 'info');
    }
}

function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
        courses = courses.filter(c => c.id !== courseId);
        updateCourseTable();
        showNotification('Course deleted successfully!', 'success');
    }
}

function validateCourseForm(form) {
    let isValid = true;
    
    // Required fields
    const requiredFields = ['courseCode', 'courseName', 'courseClass', 'courseSection', 'courseInstructor', 'courseCapacity', 'courseSchedule', 'courseRoom'];
    
    requiredFields.forEach(field => {
        const input = form[field];
        if (!input.value.trim()) {
            markInvalid(input, 'This field is required');
            isValid = false;
        } else {
            markValid(input);
        }
    });

    // Course Code validation
    const courseCodeInput = form['courseCode'];
    const courseCodePattern = /^[A-Z]{2,3}\d{3}$/;
    if (courseCodeInput.value && !courseCodePattern.test(courseCodeInput.value)) {
        markInvalid(courseCodeInput, 'Course code must be in format: CS101');
        isValid = false;
    }

    // Capacity validation
    const capacityInput = form['courseCapacity'];
    if (capacityInput.value && parseInt(capacityInput.value) < 1) {
        markInvalid(capacityInput, 'Capacity must be at least 1');
        isValid = false;
    }

    return isValid;
}

function updateCourseSectionOptions() {
    const classSelect = document.getElementById('courseClass');
    const sectionSelect = document.getElementById('courseSection');
    const selectedClass = classSelect.value;

    // Clear existing options
    sectionSelect.innerHTML = '<option value="">Select Section</option>';

    if (selectedClass === '9' || selectedClass === '10') {
        // Add sections for 9th and 10th
        const sections = ['Computer Science', 'Biology'];
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            sectionSelect.appendChild(option);
        });
    } else if (selectedClass === '11' || selectedClass === '12') {
        // Add sections for 11th and 12th
        const sections = ['Pre-Medical', 'Pre-Engineering'];
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            sectionSelect.appendChild(option);
        });
    }
}

function updateInstructorOptions() {
    const instructorSelect = document.getElementById('courseInstructor');
    if (!instructorSelect) return;

    // Clear existing options
    instructorSelect.innerHTML = '<option value="">Select Instructor</option>';

    // Add instructor options
    instructors.forEach(instructor => {
        const option = document.createElement('option');
        option.value = `${instructor.firstName} ${instructor.lastName}`;
        option.textContent = `${instructor.firstName} ${instructor.lastName}`;
        instructorSelect.appendChild(option);
    });
}

function updateAttendanceTable(records = attendanceRecords) {
    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">No attendance records found</td>
            </tr>
        `;
        return;
    }
    
    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.class}th Class</td>
            <td>${record.section}</td>
            <td>${record.totalStudents}</td>
            <td>${record.present}</td>
            <td>${record.absent}</td>
            <td>${record.late}</td>
            <td>${record.percentage}%</td>
        `;
        tbody.appendChild(row);
    });
}

function updateExamTable(records = examRecords) {
    const tbody = document.getElementById('examTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center">No exam records found</td>
            </tr>
        `;
        return;
    }
    
    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.studentId}</td>
            <td>${record.name}</td>
            <td>${record.class}th Class</td>
            <td>${record.section}</td>
            <td>${record.examType}</td>
            <td>${record.subject}</td>
            <td>${record.marks}</td>
            <td>${record.totalMarks}</td>
            <td>${record.percentage}%</td>
            <td>${record.grade}</td>
            <td><span class="status-${record.status.toLowerCase()}">${record.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function updateFeedbackTable(records = studentFeedback) {
    const tbody = document.getElementById('feedbackTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center">No feedback records found</td>
            </tr>
        `;
        return;
    }
    
    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.studentId}</td>
            <td>${record.name}</td>
            <td>${record.class}th Class</td>
            <td>${record.section}</td>
            <td>${record.category}</td>
            <td>${record.issue}</td>
            <td>${record.solution}</td>
            <td><span class="status-${record.status.toLowerCase()}">${record.status}</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="updateFeedbackStatus('${record.studentId}')" title="Update Status">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateAttendanceSectionOptions() {
    const classSelect = document.getElementById('attendanceClass');
    const sectionSelect = document.getElementById('attendanceSection');
    const selectedClass = classSelect.value;

    // Clear existing options
    sectionSelect.innerHTML = '<option value="">Select Section</option>';

    if (selectedClass === '9' || selectedClass === '10') {
        // Add sections for 9th and 10th
        const sections = ['Computer Science', 'Biology'];
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            sectionSelect.appendChild(option);
        });
    } else if (selectedClass === '11' || selectedClass === '12') {
        // Add sections for 11th and 12th
        const sections = ['Pre-Medical', 'Pre-Engineering'];
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            sectionSelect.appendChild(option);
        });
    }
}

function updateExamSectionOptions() {
    const classSelect = document.getElementById('examClass');
    const sectionSelect = document.getElementById('examSection');
    const selectedClass = classSelect.value;

    // Clear existing options
    sectionSelect.innerHTML = '<option value="">Select Section</option>';

    if (selectedClass === '9' || selectedClass === '10') {
        // Add sections for 9th and 10th
        const sections = ['Computer Science', 'Biology'];
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            sectionSelect.appendChild(option);
        });
    } else if (selectedClass === '11' || selectedClass === '12') {
        // Add sections for 11th and 12th
        const sections = ['Pre-Medical', 'Pre-Engineering'];
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            sectionSelect.appendChild(option);
        });
    }
}

function updateFeedbackSectionOptions() {
    const classSelect = document.getElementById('feedbackClass');
    const sectionSelect = document.getElementById('feedbackSection');
    const selectedClass = classSelect.value;

    // Clear existing options
    sectionSelect.innerHTML = '<option value="">Select Section</option>';

    if (selectedClass === '9' || selectedClass === '10') {
        // Add sections for 9th and 10th
        const sections = ['Computer Science', 'Biology'];
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            sectionSelect.appendChild(option);
        });
    } else if (selectedClass === '11' || selectedClass === '12') {
        // Add sections for 11th and 12th
        const sections = ['Pre-Medical', 'Pre-Engineering'];
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            sectionSelect.appendChild(option);
        });
    }
}

function updateFeedbackStatus(studentId) {
    const feedback = studentFeedback.find(f => f.studentId === studentId);
    if (feedback) {
        const newStatus = prompt('Update status (pending/resolved/in-progress):', feedback.status);
        if (newStatus && ['pending', 'resolved', 'in-progress'].includes(newStatus.toLowerCase())) {
            feedback.status = newStatus;
            updateFeedbackTable();
            showNotification('Feedback status updated successfully!', 'success');
        }
    }
} 