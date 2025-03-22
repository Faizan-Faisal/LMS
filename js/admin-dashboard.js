// Sample data for testing
let students = [];

let instructors = [];

let courses = [];

let attendanceRecords = [
    {
        date: "2024-03-20",
        department: "Computer Science",
        semester: 1,
        totalStudents: 30,
        present: 25,
        absent: 3,
        late: 2,
        percentage: 83.33
    }
];

// Sample exam records data - Replace with empty array for real data
let examRecords = [];

// Function to add exam record
function addExamRecord(record) {
    examRecords.push(record);
    filterExamRecords(); // Refresh the table
    updateExamStatistics(examRecords);
}

// Function to filter exam records
function filterExamRecords() {
    const selectedDepartment = document.getElementById('examDepartment')?.value;
    const selectedSemester = document.getElementById('examSemester')?.value;
    const selectedType = document.getElementById('examType')?.value;
    const searchTerm = document.getElementById('examSearch')?.value.toLowerCase();

    let filteredRecords = [...examRecords];

    // Filter by department
    if (selectedDepartment) {
        filteredRecords = filteredRecords.filter(record => record.department === selectedDepartment);
    }

    // Filter by semester
    if (selectedSemester) {
        filteredRecords = filteredRecords.filter(record => record.semester.toString() === selectedSemester);
    }

    // Filter by exam type
    if (selectedType) {
        filteredRecords = filteredRecords.filter(record => record.examType === selectedType);
    }

    // Filter by search term
    if (searchTerm) {
        filteredRecords = filteredRecords.filter(record => 
            record.studentId.toLowerCase().includes(searchTerm) ||
            record.name.toLowerCase().includes(searchTerm) ||
            record.subject.toLowerCase().includes(searchTerm) ||
            record.department.toLowerCase().includes(searchTerm)
        );
    }

    // Sort by percentage (highest first)
    filteredRecords.sort((a, b) => b.percentage - a.percentage);

    updateExamTable(filteredRecords);
    updateExamStatistics(filteredRecords);
}

// Function to update exam table
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
            <td>${record.department}</td>
            <td>${record.semester}${getOrdinalSuffix(record.semester)} Semester</td>
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

// Function to update exam statistics
function updateExamStatistics(records) {
    const totalStudents = records.length;
    const passedStudents = records.filter(record => record.status === 'Pass').length;
    const failedStudents = records.filter(record => record.status === 'Fail').length;
    const absentStudents = records.filter(record => record.status === 'Absent').length;

    // Update statistics cards
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('passedStudents').textContent = passedStudents;
    document.getElementById('failedStudents').textContent = failedStudents;
    document.getElementById('absentStudents').textContent = absentStudents;

    // Update pass percentage
    const passPercentage = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(2) : 0;
    document.getElementById('passPercentage').textContent = `${passPercentage}%`;
}

// Function to calculate grade based on percentage
function calculateGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    return 'F';
}

// Function to add a new exam record
function addNewExamRecord(studentId, name, department, semester, examType, subject, marks, totalMarks) {
    const percentage = ((marks / totalMarks) * 100).toFixed(2);
    const grade = calculateGrade(percentage);
    const status = percentage >= 50 ? 'Pass' : 'Fail';

    const newRecord = {
        studentId,
        name,
        department,
        semester: parseInt(semester),
        examType,
        subject,
        marks: parseInt(marks),
        totalMarks: parseInt(totalMarks),
        percentage: parseFloat(percentage),
        grade,
        status
    };

    addExamRecord(newRecord);
}

// Initialize exam records with some sample data for testing
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for exam filters
    document.getElementById('examDepartment')?.addEventListener('change', filterExamRecords);
    document.getElementById('examSemester')?.addEventListener('change', filterExamRecords);
    document.getElementById('examType')?.addEventListener('change', filterExamRecords);
    document.getElementById('examSearch')?.addEventListener('input', filterExamRecords);
    
    // Add event listener for generate report button
    document.getElementById('generateExamReport')?.addEventListener('click', () => {
        filterExamRecords();
        showNotification('Exam report generated successfully!', 'success');
    });

    // Initialize the exam records table and statistics
    filterExamRecords();
});

let studentFeedback = [
    {
        date: "2024-03-19",
        studentId: "STD001",
        name: "John Doe",
        department: "Computer Science",
        semester: 1,
        category: "Academic",
        issue: "Difficulty understanding programming concepts",
        solution: "Additional practice sessions scheduled",
        status: "In Progress"
    }
];

// Sample data for course assignments
let courseAssignments = [];

// Add this at the top with other data arrays
let departments = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English'
];

// Add this with other data arrays at the top
let announcements = [];

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
        resetStudentForm();
        document.getElementById('studentFormContainer').style.display = 'block';
    });

    cancelStudentForm?.addEventListener('click', () => {
        resetStudentForm();
        document.getElementById('studentFormContainer').style.display = 'none';
    });

    // Handle student form submission
    studentForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateStudentForm(studentForm)) {
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
            program: formData.get('program'),
            semester: formData.get('semester'),
            enrollmentYear: formData.get('enrollmentYear'),
            address: formData.get('address'),
            status: formData.get('studentStatus') || 'Active'
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
            student.id.toLowerCase().includes(searchTerm)
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
        resetInstructorForm();
        document.getElementById('instructorFormContainer').style.display = 'block';
    });

    cancelInstructorForm?.addEventListener('click', () => {
        resetInstructorForm();
        document.getElementById('instructorFormContainer').style.display = 'none';
    });

    // Handle instructor form submission
    instructorForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateInstructorForm(instructorForm)) {
            return;
        }

        const formData = new FormData(instructorForm);
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
            status: formData.get('instructorStatus') || 'Active'
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
        clearValidationStates(instructorForm);
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
    const courseFormContainer = document.getElementById('courseFormContainer');
    const assignCourseFormContainer = document.getElementById('assignCourseFormContainer');
    const courseSearch = document.getElementById('courseSearch');
    const refreshCourses = document.getElementById('refreshCourses');

    // Add event listeners for the course management buttons
    document.getElementById('addCourseBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        courseFormContainer.style.display = 'block';
        courseForm.reset();
        clearValidationStates(courseForm);
        updateInstructorOptions();
    });

    document.getElementById('assignCourseBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('assignCourseFormContainer').style.display = 'block';
        loadCourseList();
        loadDepartments();
        updateInstructorList();
    });

    // Cancel buttons for forms
    document.getElementById('cancelCourseForm')?.addEventListener('click', () => {
        courseFormContainer.style.display = 'none';
        courseForm.reset();
        clearValidationStates(courseForm);
    });

    document.getElementById('cancelAssignCourseForm')?.addEventListener('click', () => {
        document.getElementById('assignCourseFormContainer').style.display = 'none';
        document.getElementById('assignCourseForm').reset();
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
            creditHours: parseInt(formData.get('creditHours')),
            description: formData.get('courseDescription'),
            status: formData.get('courseStatus') || 'Active'
        };

        const existingIndex = courses.findIndex(c => c.id === newCourse.id);
        if (existingIndex >= 0) {
            // Preserve existing fields that aren't in the form
            const existingCourse = courses[existingIndex];
            courses[existingIndex] = {
                ...existingCourse,
                ...newCourse
            };
            showNotification('Course information updated successfully!', 'success');
        } else {
            courses.push(newCourse);
            showNotification('Course added successfully!', 'success');
        }

        updateCourseTable();
        courseForm.reset();
        courseFormContainer.style.display = 'none';
        clearValidationStates(courseForm);
        
        // Remove read-only state from course code field
        courseForm.courseCode.readOnly = false;
        courseForm.courseCode.style.backgroundColor = '';
        
        // Remove status field if it was added for editing
        const statusGroup = courseForm.querySelector('.status-group');
        if (statusGroup) {
            statusGroup.remove();
        }
    });

    // Course search functionality
    courseSearch?.addEventListener('input', () => {
        const searchTerm = courseSearch.value.toLowerCase();
        const filteredCourses = courses.filter(course => 
            course.name.toLowerCase().includes(searchTerm) ||
            course.id.toLowerCase().includes(searchTerm) ||
            (course.instructor && course.instructor.toLowerCase().includes(searchTerm)) ||
            (course.department && course.department.toLowerCase().includes(searchTerm))
        );
        updateCourseTable(filteredCourses);
    });

    // Refresh course list
    refreshCourses?.addEventListener('click', () => {
        updateCourseTable();
        showNotification('Course list refreshed!', 'info');
    });

    // Update section options based on class selection
    document.getElementById('courseClass')?.addEventListener('change', () => {
        updateCourseSectionOptions();
    });

    // Initial course table population
    updateCourseTable();

    // Initial dashboard stats update
    updateDashboardStats();

    // Reports Section Functions
    function initializeReportSection() {
        // Get all the report section elements
        const attendanceDepartment = document.getElementById('attendanceDepartment');
        const attendanceSemester = document.getElementById('attendanceSemester');
    const attendanceMonth = document.getElementById('attendanceMonth');
    const generateAttendanceReport = document.getElementById('generateAttendanceReport');
    const attendanceSearch = document.getElementById('attendanceSearch');

        const examDepartment = document.getElementById('examDepartment');
        const examSemester = document.getElementById('examSemester');
    const examType = document.getElementById('examType');
    const generateExamReport = document.getElementById('generateExamReport');
    const examSearch = document.getElementById('examSearch');

        const feedbackDepartment = document.getElementById('feedbackDepartment');
        const feedbackSemester = document.getElementById('feedbackSemester');
    const feedbackStatus = document.getElementById('feedbackStatus');
    const generateFeedbackReport = document.getElementById('generateFeedbackReport');
    const feedbackSearch = document.getElementById('feedbackSearch');

        // Initialize dropdowns
        populateDepartmentDropdowns();
        populateSemesterDropdowns();

        // Add event listeners
        // Attendance Report
        attendanceDepartment?.addEventListener('change', filterAttendanceRecords);
        attendanceSemester?.addEventListener('change', filterAttendanceRecords);
        attendanceMonth?.addEventListener('change', filterAttendanceRecords);
    generateAttendanceReport?.addEventListener('click', () => {
        filterAttendanceRecords();
        showNotification('Attendance report generated successfully!', 'success');
    });
        attendanceSearch?.addEventListener('input', filterAttendanceRecords);

        // Exam Report
        examDepartment?.addEventListener('change', filterExamRecords);
        examSemester?.addEventListener('change', filterExamRecords);
        examType?.addEventListener('change', filterExamRecords);
        generateExamReport?.addEventListener('click', () => {
        filterExamRecords();
            showNotification('Exam report generated successfully!', 'success');
        });
        examSearch?.addEventListener('input', filterExamRecords);

        // Feedback Report
        feedbackDepartment?.addEventListener('change', filterFeedbackRecords);
        feedbackSemester?.addEventListener('change', filterFeedbackRecords);
        feedbackStatus?.addEventListener('change', filterFeedbackRecords);
        generateFeedbackReport?.addEventListener('click', () => {
            filterFeedbackRecords();
            showNotification('Feedback report generated successfully!', 'success');
        });
        feedbackSearch?.addEventListener('input', filterFeedbackRecords);

        // Initial table population
        filterAttendanceRecords();
        filterExamRecords();
        filterFeedbackRecords();
    }

    // Add function to populate department dropdowns
    function populateDepartmentDropdowns() {
        const departmentDropdowns = [
            document.getElementById('attendanceDepartment'),
            document.getElementById('examDepartment'),
            document.getElementById('feedbackDepartment')
        ];

        departmentDropdowns.forEach(dropdown => {
            if (dropdown) {
                dropdown.innerHTML = '<option value="">Select Department</option>';
                departments.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept;
                    option.textContent = dept;
                    dropdown.appendChild(option);
                });
            }
        });
    }

    // Add function to populate semester dropdowns
    function populateSemesterDropdowns() {
        const semesterDropdowns = [
            document.getElementById('attendanceSemester'),
            document.getElementById('examSemester'),
            document.getElementById('feedbackSemester')
        ];

        semesterDropdowns.forEach(dropdown => {
            if (dropdown) {
                dropdown.innerHTML = '<option value="">Select Semester</option>';
                for (let i = 1; i <= 8; i++) {
                    const option = document.createElement('option');
                    option.value = i.toString();
                    option.textContent = `${i}${getOrdinalSuffix(i)} Semester`;
                    dropdown.appendChild(option);
                }
            }
        });
    }

    // Update the DOMContentLoaded event listener
    document.addEventListener('DOMContentLoaded', function() {
        // ... existing code ...

        // Initialize report section
        initializeReportSection();
    });

    // Filter Functions
    function filterAttendanceRecords() {
        const selectedDepartment = document.getElementById('attendanceDepartment')?.value;
        const selectedSemester = document.getElementById('attendanceSemester')?.value;
        const selectedMonth = document.getElementById('attendanceMonth')?.value;
        const searchTerm = document.getElementById('attendanceSearch')?.value.toLowerCase();

        let filteredRecords = [...attendanceRecords];

        // Filter by department
        if (selectedDepartment) {
            filteredRecords = filteredRecords.filter(record => record.department === selectedDepartment);
        }

        // Filter by semester
        if (selectedSemester) {
            filteredRecords = filteredRecords.filter(record => record.semester.toString() === selectedSemester);
        }

        // Filter by month
        if (selectedMonth) {
            filteredRecords = filteredRecords.filter(record => record.date.startsWith(selectedMonth));
        }

        // Filter by search term
        if (searchTerm) {
            filteredRecords = filteredRecords.filter(record => 
                record.department.toLowerCase().includes(searchTerm) ||
                record.semester.toString().includes(searchTerm) ||
                record.date.includes(searchTerm)
            );
        }

        // Sort by date (newest first)
        filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        updateAttendanceTable(filteredRecords);
    }

    function filterExamRecords() {
        const selectedDepartment = document.getElementById('examDepartment')?.value;
        const selectedSemester = document.getElementById('examSemester')?.value;
        const selectedType = document.getElementById('examType')?.value;
        const searchTerm = document.getElementById('examSearch')?.value.toLowerCase();

        let filteredRecords = [...examRecords];

        // Filter by department
        if (selectedDepartment) {
            filteredRecords = filteredRecords.filter(record => record.department === selectedDepartment);
        }

        // Filter by semester
        if (selectedSemester) {
            filteredRecords = filteredRecords.filter(record => record.semester.toString() === selectedSemester);
        }

        // Filter by exam type
        if (selectedType) {
            filteredRecords = filteredRecords.filter(record => record.examType === selectedType);
        }

        // Filter by search term
        if (searchTerm) {
            filteredRecords = filteredRecords.filter(record => 
                record.studentId.toLowerCase().includes(searchTerm) ||
                record.name.toLowerCase().includes(searchTerm) ||
                record.subject.toLowerCase().includes(searchTerm) ||
                record.department.toLowerCase().includes(searchTerm)
            );
        }

        updateExamTable(filteredRecords);
        updateExamStatistics(filteredRecords);
    }

    function filterFeedbackRecords() {
        const selectedDepartment = document.getElementById('feedbackDepartment')?.value;
        const selectedSemester = document.getElementById('feedbackSemester')?.value;
        const selectedStatus = document.getElementById('feedbackStatus')?.value;
        const searchTerm = document.getElementById('feedbackSearch')?.value.toLowerCase();

        let filteredRecords = [...studentFeedback];

        // Filter by department
        if (selectedDepartment) {
            filteredRecords = filteredRecords.filter(record => record.department === selectedDepartment);
        }

        // Filter by semester
        if (selectedSemester) {
            filteredRecords = filteredRecords.filter(record => record.semester.toString() === selectedSemester);
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
                record.category.toLowerCase().includes(searchTerm) ||
                record.department.toLowerCase().includes(searchTerm)
            );
        }

        // Sort by date (newest first)
        filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        updateFeedbackTable(filteredRecords);
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

    function showStudentDetails(type) {
        const modal = document.getElementById('studentDetailsModal');
        const modalTitle = document.getElementById('modalTitle');
        const tbody = document.getElementById('studentDetailsBody');
        
        let filteredStudents = [];
        switch(type) {
            case 'pass':
                modalTitle.textContent = 'Passed Students';
                filteredStudents = examRecords.filter(record => record.status === 'Pass');
                break;
            case 'fail':
                modalTitle.textContent = 'Failed Students';
                filteredStudents = examRecords.filter(record => record.status === 'Fail');
                break;
            case 'absent':
                modalTitle.textContent = 'Absent Students';
                filteredStudents = examRecords.filter(record => record.status === 'Absent');
                break;
        }
        
        tbody.innerHTML = '';
        filteredStudents.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${student.studentId}</td>
                <td>${student.name}</td>
                <td>${student.marks}</td>
                <td>${student.totalMarks}</td>
                <td>${student.percentage}%</td>
                <td>${student.grade}</td>
                `;
                tbody.appendChild(row);
            });

        modal.style.display = 'block';
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
                <td>${record.department}</td>
                <td>${record.semester}${getOrdinalSuffix(record.semester)} Semester</td>
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

    // Initial table population
    filterAttendanceRecords();
    filterExamRecords();
    filterFeedbackRecords();

    // Update Course Form Event Handlers
    const updateCourseForm = document.getElementById('updateCourseForm');
    const cancelUpdateCourseForm = document.getElementById('cancelUpdateCourseForm');

    // Cancel Update Course Form
    cancelUpdateCourseForm?.addEventListener('click', () => {
        document.getElementById('updateCourseFormContainer').style.display = 'none';
        document.getElementById('updateCourseError').style.display = 'none';
        updateCourseForm.reset();
    });

    // Handle Update Course Form Submission
    updateCourseForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const courseId = document.getElementById('updateCourseId').value;
        const courseName = document.getElementById('updateCourseName').value;
        
        // Find the course in our data
        const course = courses.find(c => c.id === courseId);
        const errorDiv = document.getElementById('updateCourseError');
        
        if (!course) {
            errorDiv.textContent = 'Error: Course ID not found!';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (course.name !== courseName) {
            errorDiv.textContent = 'Error: Course name does not match with the provided Course ID!';
            errorDiv.style.display = 'block';
            return;
        }

        // If validation passes, collect the updated data
        const updatedCourse = {
            id: courseId,
            name: courseName,
            class: document.getElementById('updateCourseClass').value,
            section: document.getElementById('updateCourseSection').value,
            instructor: document.getElementById('updateCourseInstructor').value,
            students: course.students, // Preserve current student count
            capacity: parseInt(document.getElementById('updateCourseCapacity').value),
            schedule: document.getElementById('updateCourseSchedule').value,
            room: document.getElementById('updateCourseRoom').value,
            description: document.getElementById('updateCourseDescription').value,
            status: course.status // Preserve current status
        };

        // Update the course in our data
        const index = courses.findIndex(c => c.id === courseId);
        if (index !== -1) {
            courses[index] = updatedCourse;
            
            // Show success message
            errorDiv.style.color = 'green';
            errorDiv.textContent = 'Course updated successfully!';
            errorDiv.style.display = 'block';

            // Reset form after 2 seconds
            setTimeout(() => {
                document.getElementById('updateCourseFormContainer').style.display = 'none';
                errorDiv.style.display = 'none';
                updateCourseForm.reset();
            }, 2000);

            // Refresh the course table
            updateCourseTable();
            showNotification('Course updated successfully!', 'success');
        }
    });

    // Update section options when class is changed in update form
    document.getElementById('updateCourseClass')?.addEventListener('change', () => {
        const classSelect = document.getElementById('updateCourseClass');
        const sectionSelect = document.getElementById('updateCourseSection');
        const selectedClass = classSelect.value;

        // Clear existing options
        sectionSelect.innerHTML = '<option value="">Select Section</option>';

        if (selectedClass === '9' || selectedClass === '10') {
            const sections = ['Computer Science', 'Biology'];
            sections.forEach(section => {
                const option = document.createElement('option');
                option.value = section;
                option.textContent = section;
                sectionSelect.appendChild(option);
            });
        } else if (selectedClass === '11' || selectedClass === '12') {
            const sections = ['Pre-Medical', 'Pre-Engineering'];
            sections.forEach(section => {
                const option = document.createElement('option');
                option.value = section;
                option.textContent = section;
                sectionSelect.appendChild(option);
            });
        }
    });

    // Assign Course Form Functions
    function showAssignCourseForm() {
        document.getElementById('assignCourseFormContainer').style.display = 'block';
        loadCourseList();
        loadDepartments();
    }

    function hideAssignCourseForm() {
        document.getElementById('assignCourseFormContainer').style.display = 'none';
        document.getElementById('assignCourseForm').reset();
        document.getElementById('assignCourse').value = '';
        document.getElementById('assignDepartment').value = '';
        document.getElementById('assignInstructor').value = '';
        document.getElementById('assignSchedule').value = '';
    }

    function handleAssignCourseSubmit(event) {
        event.preventDefault();
        
        // Get form values
        const courseId = document.getElementById('assignCourse').value;
        const departmentValue = document.getElementById('assignDepartment').value;
        const instructorId = document.getElementById('assignInstructor').value;
        const semester = document.getElementById('assignSemester').value;
        const schedule = document.getElementById('assignSchedule').value;
        const preRequisite = document.getElementById('assignPreRequisite').value;

        // Validate required fields
        if (!courseId || !departmentValue || !instructorId || !semester || !schedule) {
            showNotification('Please fill all required fields', 'error');
            return;
        }

        // Find the course and instructor
        const course = courses.find(c => c.id === courseId);
        const instructor = instructors.find(i => i.id === instructorId);


        if (!course || !instructor) {
            showNotification('Invalid course or instructor selection', 'error');
            return;
        }

        // Create the course assignment
        const assignment = {
            courseId: courseId,
            courseName: course.name,
            department: departmentValue,
            instructorId: instructorId,
            instructorName: `${instructor.firstName} ${instructor.lastName}`,
            semester: semester,
            schedule: schedule,
            preRequisite: preRequisite || null,
            status: 'Active',
            dateAssigned: new Date().toISOString().split('T')[0]
        };

        // Add to course assignments
        courseAssignments.push(assignment);

        // Update the course with instructor information
        const courseIndex = courses.findIndex(c => c.id === courseId);
        if (courseIndex !== -1) {
            courses[courseIndex] = {
                ...courses[courseIndex],
                instructor: `${instructor.firstName} ${instructor.lastName}`,
                department: departmentValue,
                semester: semester,
                schedule: schedule
            };
        }

        // Update the instructor's courses
        const instructorIndex = instructors.findIndex(i => i.id === instructorId);
        if (instructorIndex !== -1) {
            if (!instructors[instructorIndex].courses) {
                instructors[instructorIndex].courses = [];
            }
            instructors[instructorIndex].courses.push(courseId);
        }

        // Update tables
        updateCourseTable();
        updateInstructorTable();
        
        // Show success message
        showNotification('Course assigned successfully!', 'success');
        
        // Hide and reset the form
        document.getElementById('assignCourseFormContainer').style.display = 'none';
        document.getElementById('assignCourseForm').reset();
    }

    function loadCourseList() {
        const courseSelect = document.getElementById('assignCourse');
        if (!courseSelect) return;

        courseSelect.innerHTML = '<option value="">Select Course</option>';
        
        // Use the actual courses array instead of sample data
        if (courses.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No courses available";
            option.disabled = true;
            courseSelect.appendChild(option);
        } else {
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = `${course.id} - ${course.name}`;
                courseSelect.appendChild(option);
            });
        }
    }

    function loadDepartments() {
        const deptSelect = document.getElementById('assignDepartment');
        deptSelect.innerHTML = '<option value="">Select Department</option>';
        
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            deptSelect.appendChild(option);
        });
    }

    function updateInstructorList() {
        const department = document.getElementById('assignDepartment').value;
        if (!department) return;

        const instructorSelect = document.getElementById('assignInstructor');
        instructorSelect.innerHTML = '<option value="">Select Instructor</option>';
        
        // Show all active instructors, with their departments in the dropdown
        const activeInstructors = instructors.filter(inst => inst.status === 'Active');
        
        if (activeInstructors.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No instructors available";
            option.disabled = true;
            instructorSelect.appendChild(option);
        } else {
            // Group instructors by department
            const departmentGroups = {};
            activeInstructors.forEach(instructor => {
                if (!departmentGroups[instructor.department]) {
                    departmentGroups[instructor.department] = [];
                }
                departmentGroups[instructor.department].push(instructor);
            });

            // Create option groups for each department
            Object.keys(departmentGroups).sort().forEach(dept => {
                const group = document.createElement('optgroup');
                group.label = dept;
                
                // Sort instructors within each department by name
                departmentGroups[dept]
                    .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
                    .forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor.id;
                        option.textContent = `${instructor.firstName} ${instructor.lastName}`;
                        // Highlight instructors from the selected department
                        if (instructor.department === department) {
                            option.style.fontWeight = 'bold';
                        }
                        group.appendChild(option);
                    });
                
                instructorSelect.appendChild(group);
            });
        }

        // Add help text below the select
        let helpText = instructorSelect.nextElementSibling;
        if (!helpText || !helpText.classList.contains('help-text')) {
            helpText = document.createElement('small');
            helpText.classList.add('help-text');
            helpText.style.display = 'block';
            helpText.style.marginTop = '5px';
            helpText.style.color = '#666';
            instructorSelect.parentNode.insertBefore(helpText, instructorSelect.nextSibling);
        }
        helpText.textContent = 'Instructors from the selected department are shown in bold. You can assign instructors from other departments as well.';
    }

    function updatePreRequisites() {
        const courseId = document.getElementById('assignCourse').value;
        const department = document.getElementById('assignDepartment').value;
        const semester = document.getElementById('assignSemester').value;
        
        if (!courseId || !department || !semester) return;

        const preReqSelect = document.getElementById('assignPreRequisite');
        preReqSelect.innerHTML = '<option value="">Select Pre-requisite (Optional)</option>';
        
        // Filter courses that could be prerequisites (all courses except the current one)
        const possiblePreReqs = courses.filter(course => course.id !== courseId);
        
        if (possiblePreReqs.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No courses available";
            option.disabled = true;
            preReqSelect.appendChild(option);
        } else {
            possiblePreReqs.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = `${course.id} - ${course.name}`;
                preReqSelect.appendChild(option);
            });
        }
    }

    // Add event listeners for the assign course form
    document.getElementById('assignCourseForm')?.addEventListener('submit', handleAssignCourseSubmit);

    // Add event listeners for form field changes
    document.getElementById('assignDepartment')?.addEventListener('change', function() {
        updateInstructorList();
        updatePreRequisites();
    });

    document.getElementById('assignSemester')?.addEventListener('change', function() {
        updatePreRequisites();
    });

    // Add event listener for Assign Course button
    const showAssignCourseBtn = document.getElementById('showAssignCourseForm');
    const cancelAssignCourseBtn = document.getElementById('cancelAssignCourseForm');

    showAssignCourseBtn?.addEventListener('click', () => {
        showAssignCourseForm();
    });

    cancelAssignCourseBtn?.addEventListener('click', () => {
        hideAssignCourseForm();
    });

    // Initialize department management
    initializeDepartmentManagement();
    
    // Update all department dropdowns initially
    updateAllDepartmentDropdowns();

    // Announcement Management Functions
    const newAnnouncementBtn = document.getElementById('newAnnouncementBtn');
    const announcementForm = document.getElementById('announcementForm');
    const announcementFormContainer = document.getElementById('announcementFormContainer');
    const cancelAnnouncementForm = document.getElementById('cancelAnnouncementForm');
    const allStudentsCheckbox = document.getElementById('allStudents');
    const studentFilters = document.getElementById('studentFilters');

    // Show/Hide announcement form
    newAnnouncementBtn?.addEventListener('click', () => {
        announcementFormContainer.style.display = 'block';
    });

    cancelAnnouncementForm?.addEventListener('click', () => {
        announcementFormContainer.style.display = 'none';
        announcementForm.reset();
    });

    // Show/Hide student filters based on checkbox and update department dropdown
    allStudentsCheckbox?.addEventListener('change', (e) => {
        studentFilters.style.display = e.target.checked ? 'block' : 'none';
        
        // Update department dropdown when student checkbox changes
        if (e.target.checked) {
            const departmentFilter = document.getElementById('departmentFilter');
            if (departmentFilter) {
                // Clear existing options
                departmentFilter.innerHTML = '<option value="">Select Department</option>';
                
                // Add "All Departments" option
                const allDeptOption = document.createElement('option');
                allDeptOption.value = "all";
                allDeptOption.textContent = "All Departments";
                departmentFilter.appendChild(allDeptOption);
                
                // Add individual departments
                departments.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept;
                    option.textContent = dept;
                    departmentFilter.appendChild(option);
                });
            }
        }
    });

    // Handle announcement form submission
    announcementForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(announcementForm);
        const newAnnouncement = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            title: formData.get('announcementTitle'),
            message: formData.get('announcementMessage'),
            recipients: {
                allStudents: allStudentsCheckbox.checked,
                allInstructors: document.getElementById('allInstructors').checked,
                department: formData.get('departmentFilter'),
                semester: formData.get('semesterFilter')
            },
            priority: formData.get('priority'),
            validUntil: formData.get('validUntil'),
            status: 'Active'
        };

        // Validate form
        if (!newAnnouncement.title.trim()) {
            showNotification('Please enter an announcement title', 'error');
            return;
        }

        if (!newAnnouncement.message.trim()) {
            showNotification('Please enter an announcement message', 'error');
            return;
        }

        if (!newAnnouncement.recipients.allStudents && !newAnnouncement.recipients.allInstructors) {
            showNotification('Please select at least one recipient group', 'error');
            return;
        }

        announcements.unshift(newAnnouncement);
        updateAnnouncementsTable();
        showNotification('Announcement sent successfully!', 'success');
        
        announcementForm.reset();
        announcementFormContainer.style.display = 'none';
        studentFilters.style.display = 'none';
    });

    // Initial announcements table population
    updateAnnouncementsTable();

    // Function to populate department dropdowns in announcement form
    function populateAnnouncementDepartments() {
        const studentDeptFilter = document.getElementById('departmentFilter');
        const instructorDeptFilter = document.getElementById('instructorDepartmentFilter');
        
        if (studentDeptFilter && instructorDeptFilter) {
            // Clear existing options
            studentDeptFilter.innerHTML = '<option value="">All Departments</option>';
            instructorDeptFilter.innerHTML = '<option value="">All Departments</option>';
            
            // Add department options from the global departments array
            departments.sort().forEach(dept => {
                // Add to student department filter
                const studentOption = document.createElement('option');
                studentOption.value = dept;
                studentOption.textContent = dept;
                studentDeptFilter.appendChild(studentOption);
                
                // Add to instructor department filter
                const instructorOption = document.createElement('option');
                instructorOption.value = dept;
                instructorOption.textContent = dept;
                instructorDeptFilter.appendChild(instructorOption);
            });
        }
    }

    // Add event listeners for announcement form checkboxes
    document.getElementById('allStudents')?.addEventListener('change', function() {
        const studentFilters = document.getElementById('studentFilters');
        studentFilters.style.display = this.checked ? 'flex' : 'none';
        
        // Uncheck all instructors if students are selected
        if (this.checked) {
            document.getElementById('allInstructors').checked = false;
            document.getElementById('instructorFilters').style.display = 'none';
        }
        
        // Populate departments when student checkbox is checked
        if (this.checked) {
            populateAnnouncementDepartments();
        }
    });

    document.getElementById('allInstructors')?.addEventListener('change', function() {
        const instructorFilters = document.getElementById('instructorFilters');
        instructorFilters.style.display = this.checked ? 'flex' : 'none';
        
        // Uncheck all students if instructors are selected
        if (this.checked) {
            document.getElementById('allStudents').checked = false;
            document.getElementById('studentFilters').style.display = 'none';
        }
        
        // Populate departments when instructor checkbox is checked
        if (this.checked) {
            populateAnnouncementDepartments();
        }
    });

    // Function to get recipient text for announcements
    function getRecipientText(form) {
        const allStudents = form.querySelector('#allStudents').checked;
        const allInstructors = form.querySelector('#allInstructors').checked;
        const studentDept = form.querySelector('#departmentFilter').value;
        const instructorDept = form.querySelector('#instructorDepartmentFilter').value;
        const semester = form.querySelector('#semesterFilter').value;
        
        let recipients = [];
        
        if (allStudents) {
            if (studentDept && semester) {
                recipients.push(`Students (${studentDept} - ${semester}${getOrdinalSuffix(semester)} Semester)`);
            } else if (studentDept) {
                recipients.push(`Students (${studentDept})`);
            } else if (semester) {
                recipients.push(`Students (${semester}${getOrdinalSuffix(semester)} Semester)`);
            } else {
                recipients.push('All Students');
            }
        }
        
        if (allInstructors) {
            if (instructorDept) {
                recipients.push(`Instructors (${instructorDept})`);
            } else {
                recipients.push('All Instructors');
            }
        }
        
        return recipients.join(', ');
    }

    // Initialize announcement form
    document.addEventListener('DOMContentLoaded', function() {
        // Populate department dropdowns when the announcement form is shown
        document.getElementById('newAnnouncementBtn')?.addEventListener('click', function() {
            document.getElementById('announcementFormContainer').style.display = 'block';
            populateAnnouncementDepartments();
        });

        // Add event listener for department changes in settings
        const departmentForm = document.getElementById('departmentForm');
        if (departmentForm) {
            departmentForm.addEventListener('submit', function(e) {
                // After adding a new department, update announcement dropdowns
                setTimeout(() => {
                    populateAnnouncementDepartments();
                }, 0);
            });
        }
    });
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
            <td>${student.program}</td>
            <td>${student.semester}${getOrdinalSuffix(student.semester)} Semester</td>
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

// Add some CSS styles to ensure proper alignment
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .student-table table {
            width: 100%;
            border-collapse: collapse;
        }
        .student-table th,
        .student-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }
        .student-table th {
            background-color: #f5f5f5;
            font-weight: 600;
        }
        .student-table td {
            vertical-align: middle;
        }
        .btn-action {
            padding: 6px;
            margin: 0 3px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            background: transparent;
        }
        .btn-view { color: #2196F3; }
        .btn-edit { color: #4CAF50; }
        .btn-delete { color: #F44336; }
        .status-active {
            background-color: #4CAF50;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.9em;
        }
        .status-inactive {
            background-color: #F44336;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.9em;
        }
    `;
    document.head.appendChild(style);
});

// Add helper function for ordinal suffixes
function getOrdinalSuffix(n) {
    const j = n % 10;
    const k = n % 100;
    if (j == 1 && k != 11) return "st";
    if (j == 2 && k != 12) return "nd";
    if (j == 3 && k != 13) return "rd";
    return "th";
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
            <td>${instructor.email || 'null'}</td>
            <td>No courses assigned</td>
            <td><span class="status-${instructor.status.toLowerCase()}">${instructor.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewInstructor('${instructor.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="editInstructor('${instructor.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteInstructor('${instructor.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function viewInstructor(instructorId) {
    const instructor = instructors.find(i => i.id === instructorId);
    if (instructor) {
        // Create modal HTML
        const modalHTML = `
            <div id="instructorDetailsModal" class="modal" style="display: block; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); z-index: 1000;">
                <div class="modal-content" style="background-color: #fefefe; margin: 5% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 700px; border-radius: 8px;">
                    <span class="close" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer; position: absolute; right: 20px; top: 10px;">&times;</span>
                    <div class="instructor-details" style="display: flex; gap: 20px;">
                        <div class="instructor-image" style="flex: 0 0 200px;">
                            <img src="${instructor.picture || './images/default-avatar.png'}" alt="Instructor Picture" style="width: 200px; height: 200px; object-fit: cover; border-radius: 8px;">
                        </div>
                        <div class="instructor-info" style="flex: 1;">
                            <h2 style="margin-bottom: 20px;">Instructor Details</h2>
                            <div class="info-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                                <div class="info-item">
                                    <strong>Instructor ID:</strong> ${instructor.id}
                                </div>
                                <div class="info-item">
                                    <strong>Name:</strong> ${instructor.firstName} ${instructor.lastName}
                                </div>
                                <div class="info-item">
                                    <strong>Email:</strong> ${instructor.email}
                                </div>
                                <div class="info-item">
                                    <strong>Phone:</strong> ${instructor.phone}
                                </div>
                                <div class="info-item">
                                    <strong>CNIC:</strong> ${instructor.cnic}
                                </div>
                                <div class="info-item">
                                    <strong>Department:</strong> ${instructor.department}
                                </div>
                                <div class="info-item">
                                    <strong>Qualification:</strong> ${instructor.qualification}
                                </div>
                                <div class="info-item">
                                    <strong>Experience:</strong> ${instructor.experience} years
                                </div>
                                <div class="info-item">
                                    <strong>Status:</strong> <span class="status-${instructor.status.toLowerCase()}" style="padding: 3px 8px; border-radius: 4px; background-color: ${instructor.status === 'Active' ? '#28a745' : '#dc3545'}; color: white;">${instructor.status}</span>
                                </div>
                                <div class="info-item" style="grid-column: 1 / -1;">
                                    <strong>Specialization:</strong> ${instructor.specialization}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing modal
        const existingModal = document.getElementById('instructorDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get modal elements
        const modal = document.getElementById('instructorDetailsModal');
        const closeBtn = modal.querySelector('.close');

        // Close modal when clicking X
        closeBtn.addEventListener('click', function() {
            modal.remove();
        });

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.remove();
            }
        });
    }
}

function viewStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        // Create modal HTML
        const modalHTML = `
            <div id="studentDetailsModal" class="modal" style="display: block; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); z-index: 1000;">
                <div class="modal-content" style="background-color: #fefefe; margin: 5% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 700px; border-radius: 8px; position: relative;">
                    <span class="close" style="position: absolute; right: 10px; top: 5px; color: #aaa; font-size: 28px; font-weight: bold; cursor: pointer; padding: 0 5px;">&times;</span>
                    <h2 style="margin-bottom: 20px;">Student Details</h2>
                    <div class="student-details" style="display: grid; grid-template-columns: auto 1fr 1fr; gap: 20px;">
                        <div class="student-image" style="grid-row: span 2;">
                            <img src="${student.picture || './images/default-avatar.png'}" alt="Student Picture" style="width: 200px; height: 200px; object-fit: cover; border-radius: 8px;">
                        </div>
                        <div class="student-info">
                            <div style="margin-bottom: 15px;">
                                <strong>Student ID:</strong> ${student.id}
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Name:</strong> ${student.firstName} ${student.lastName}
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Email:</strong> ${student.email}
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Phone:</strong> ${student.phone}
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>CNIC:</strong> ${student.cnic}
                            </div>
                        </div>
                        <div class="student-info">
                            <div style="margin-bottom: 15px;">
                                <strong>Program:</strong> ${student.program}
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Semester:</strong> ${student.semester}${getOrdinalSuffix(student.semester)} Semester
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Enrollment Year:</strong> ${student.enrollmentYear}
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Status:</strong> <span class="status-${student.status.toLowerCase()}" style="padding: 3px 8px; border-radius: 4px; background-color: ${student.status === 'Active' ? '#28a745' : '#dc3545'}; color: white;">${student.status}</span>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Address:</strong> ${student.address}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing modal
        const existingModal = document.getElementById('studentDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get modal elements
        const modal = document.getElementById('studentDetailsModal');
        const closeBtn = modal.querySelector('.close');

        // Close modal when clicking X
        closeBtn.addEventListener('click', function() {
            modal.remove();
        });

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.remove();
            }
        });
    }
}

function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        const form = document.getElementById('studentForm');
        
        // Set values
        form.studentId.value = student.id;
        form.studentId.readOnly = true; // Make ID field read-only
        form.studentId.style.backgroundColor = '#f0f0f0'; // Visual indication that field is read-only
        
        form.firstName.value = student.firstName;
        form.lastName.value = student.lastName;
        form.email.value = student.email;
        form.phone.value = student.phone;
        form.cnic.value = student.cnic;
        form.program.value = student.program;
        form.semester.value = student.semester;
        form.enrollmentYear.value = student.enrollmentYear;
        form.address.value = student.address;

        // Add status selection for edit mode
        const statusContainer = document.createElement('div');
        statusContainer.className = 'form-group';
        statusContainer.innerHTML = `
            <label for="studentStatus">Status</label>
            <select id="studentStatus" name="studentStatus" required>
                <option value="Active" ${student.status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Inactive" ${student.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
        `;
        
        // Find where to insert the status field (after enrollment year)
        const enrollmentYearField = form.querySelector('[name="enrollmentYear"]').closest('.form-group');
        enrollmentYearField.parentNode.insertBefore(statusContainer, enrollmentYearField.nextSibling);
        
        document.getElementById('studentFormContainer').style.display = 'block';
        showNotification('Edit student information', 'info');
    }
}

function editInstructor(instructorId) {
    const instructor = instructors.find(i => i.id === instructorId);
    if (instructor) {
        const form = document.getElementById('instructorForm');
        
        // Set values
        form.instructorId.value = instructor.id;
        form.instructorId.readOnly = true; // Make ID field read-only
        form.instructorId.style.backgroundColor = '#f0f0f0'; // Visual indication that field is read-only
        
        form.firstName.value = instructor.firstName;
        form.lastName.value = instructor.lastName;
        form.email.value = instructor.email;
        form.phone.value = instructor.phone;
        form.cnic.value = instructor.cnic;
        form.department.value = instructor.department;
        form.qualification.value = instructor.qualification;
        form.specialization.value = instructor.specialization;
        form.experience.value = instructor.experience;
        
        // Add status selection for edit mode
        const statusContainer = document.createElement('div');
        statusContainer.className = 'form-group';
        statusContainer.innerHTML = `
            <label for="instructorStatus">Status</label>
            <select id="instructorStatus" name="instructorStatus" required>
                <option value="Active" ${instructor.status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Inactive" ${instructor.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
        `;
        
        // Find where to insert the status field (after experience field)
        const experienceField = form.querySelector('[name="experience"]').closest('.form-group');
        experienceField.parentNode.insertBefore(statusContainer, experienceField.nextSibling);
        
        document.getElementById('instructorFormContainer').style.display = 'block';
        showNotification('Edit instructor information', 'info');
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
    clearValidationStates(form);
    
    // Required fields validation
    const requiredFields = ['studentId', 'firstName', 'lastName', 'email', 'phone', 'cnic', 'program', 'enrollmentYear', 'address'];
    requiredFields.forEach(field => {
        const input = form[field];
        if (!input.value.trim()) {
            markInvalid(input, 'This field is required');
            isValid = false;
        }
    });

    // Student ID validation
    const studentIdInput = form['studentId'];
    if (studentIdInput.value) {
        const studentIdPattern = /^STD\d+$/;
        if (!studentIdPattern.test(studentIdInput.value)) {
            markInvalid(studentIdInput, 'Student ID must start with STD followed by numbers');
            isValid = false;
        } else {
            markValid(studentIdInput);
        }
    }

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
        markInvalid(cnicInput, 'Please enter CNIC in format: XXXXX-XXXXXXX-X');
        isValid = false;
    }

    return isValid;
}

function validateInstructorForm(form) {
    let isValid = true;
    clearValidationStates(form);
    
    // Required fields validation
    const requiredFields = ['instructorId', 'firstName', 'lastName', 'email', 'phone', 'cnic'];
    requiredFields.forEach(field => {
        const input = form[field];
        if (!input.value.trim()) {
            markInvalid(input, 'This field is required');
            isValid = false;
        }
    });

    // Instructor ID validation
    const instructorIdInput = form['instructorId'];
    if (instructorIdInput.value) {
        const instructorIdPattern = /^INS\d+$/;
        if (!instructorIdPattern.test(instructorIdInput.value)) {
            markInvalid(instructorIdInput, 'Instructor ID must start with INS followed by numbers');
        isValid = false;
        } else {
            markValid(instructorIdInput);
        }
    }

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
        markInvalid(cnicInput, 'Please enter CNIC in format: XXXXX-XXXXXXX-X');
        isValid = false;
    }

    return isValid;
}

function markInvalid(input, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    
    // Remove any existing error messages
    const existingErrors = input.parentElement.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
    
    // Create new error message
    const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '4px';
    errorDiv.style.display = 'block';
    
    // Add error message after the input
        input.parentElement.appendChild(errorDiv);
    
    // Style the input
    input.style.borderColor = '#dc3545';
    input.style.backgroundColor = '#fff';
}

function markValid(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    
    // Remove any existing error message
    const errorDiv = input.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
    
    // Reset input styling
    input.style.borderColor = '#28a745';
    input.style.backgroundColor = '#fff';
}

function clearValidationStates(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
        input.style.borderColor = '';
        input.style.backgroundColor = '';
        
        // Remove any existing error messages
        const errorDiv = input.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    });
}

function showNotification(message, type = 'success') {
    // Remove any existing notifications first
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles directly to the element
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '250px';
    notification.style.textAlign = 'center';
    notification.style.fontWeight = '500';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    // Set colors based on type
    switch(type) {
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            notification.style.color = '#fff';
            break;
        case 'success':
            notification.style.backgroundColor = '#28a745';
            notification.style.color = '#fff';
            break;
        case 'info':
            notification.style.backgroundColor = '#17a2b8';
            notification.style.color = '#fff';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#000';
            break;
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add this function to handle form validation errors
function handleFormValidationError(formId, error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.style.color = '#dc3545';
    errorDiv.style.marginBottom = '10px';
    errorDiv.style.padding = '8px';
    errorDiv.style.borderRadius = '4px';
    errorDiv.textContent = error;

    const form = document.getElementById(formId);
    const existingError = form.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    form.insertBefore(errorDiv, form.firstChild);
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
                <td colspan="6" class="text-center">No courses found</td>
            </tr>
        `;
        return;
    }
    
    courseList.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.id}</td>
            <td>${course.name}</td>
            <td>${course.instructor || 'Not Assigned'}</td>
            <td>${course.department || 'Not Assigned'}</td>
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
        // Create modal HTML
        const modalHTML = `
            <div id="courseDetailsModal" class="modal" style="display: block; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); z-index: 1000;">
                <div class="modal-content" style="background-color: #fefefe; margin: 5% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 700px; border-radius: 8px; position: relative;">
                    <span class="close" style="position: absolute; right: 10px; top: 5px; color: #aaa; font-size: 28px; font-weight: bold; cursor: pointer; padding: 0 5px;">&times;</span>
                    <h2 style="margin-bottom: 20px;">Course Details</h2>
                    <div class="course-details" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                        <div class="course-info">
                            <div style="margin-bottom: 15px;">
                                <strong>Code:</strong> ${course.id}
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Name:</strong> ${course.name}
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Instructor:</strong> ${course.instructor || 'Not Assigned'}
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Schedule:</strong> ${course.schedule || 'Not Scheduled'}
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Room:</strong> ${course.room || 'Not Assigned'}
                            </div>
                        </div>
                        <div class="course-info">
                            <div style="margin-bottom: 15px;">
                                <strong>Credit Hours:</strong> ${course.creditHours || 'Not Specified'}
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Department:</strong> ${course.department || 'Not Assigned'}
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Students:</strong> ${course.students || '0'}/${course.capacity || 'N/A'}
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>Status:</strong> <span class="status-${course.status.toLowerCase()}" style="padding: 3px 8px; border-radius: 4px; background-color: ${course.status === 'Active' ? '#28a745' : '#dc3545'}; color: white;">${course.status}</span>
                            </div>
                        </div>
                        <div class="course-description" style="grid-column: 1 / -1;">
                            <strong>Description:</strong>
                            <p style="margin-top: 5px;">${course.description || 'No description available.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing modal
        const existingModal = document.getElementById('courseDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get modal elements
        const modal = document.getElementById('courseDetailsModal');
        const closeBtn = modal.querySelector('.close');

        // Close modal when clicking X
        closeBtn.addEventListener('click', function() {
            modal.remove();
        });

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.remove();
            }
        });
    }
}

function editCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        const form = document.getElementById('courseForm');
        
        // Set values
        form.courseCode.value = course.id;
        form.courseCode.readOnly = true; // Make ID field read-only
        form.courseCode.style.backgroundColor = '#f0f0f0'; // Visual indication that field is read-only
        
        form.courseName.value = course.name;
        form.creditHours.value = course.creditHours || '';
        form.courseDescription.value = course.description || '';
        
        // Add status selection for edit mode if it doesn't exist
        let statusContainer = form.querySelector('.form-group.status-group');
        if (!statusContainer) {
            statusContainer = document.createElement('div');
            statusContainer.className = 'form-group status-group';
            statusContainer.innerHTML = `
                <label for="courseStatus">Status</label>
                <select id="courseStatus" name="courseStatus" required>
                    <option value="Active" ${course.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Inactive" ${course.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            `;
            
            // Insert status field before form actions
            const formActions = form.querySelector('.form-actions');
            formActions.parentNode.insertBefore(statusContainer, formActions);
        } else {
            form.courseStatus.value = course.status;
        }
        
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
    const requiredFields = ['courseCode', 'courseName', 'creditHours', 'courseDescription'];
    
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
    const courseCodePattern = /^[A-Z]{2,3}\d+$/;
    if (courseCodeInput.value && !courseCodePattern.test(courseCodeInput.value)) {
        markInvalid(courseCodeInput, 'Course Code must start with 2-3 letters followed by numbers');
        isValid = false;
    }

    // Credit Hours validation
    const creditHoursInput = form['creditHours'];
    if (creditHoursInput.value && (parseInt(creditHoursInput.value) < 1 || parseInt(creditHoursInput.value) > 6)) {
        markInvalid(creditHoursInput, 'Credit hours must be between 1 and 6');
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
            <td>${record.department}</td>
            <td>${record.semester}${getOrdinalSuffix(record.semester)} Semester</td>
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
            <td>${record.department}</td>
            <td>${record.semester}${getOrdinalSuffix(record.semester)} Semester</td>
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
            <td>${record.department}</td>
            <td>${record.semester}${getOrdinalSuffix(record.semester)} Semester</td>
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

// Function to preview uploaded images
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = 'images/default-avatar.png';
    }
}

// Add these functions after other initialization code
function initializeDepartmentManagement() {
    const departmentForm = document.getElementById('departmentForm');
    const newDepartmentInput = document.getElementById('newDepartment');
    const departmentList = document.getElementById('departmentList');

    if (!departmentForm || !newDepartmentInput || !departmentList) return;

    // Initial population of department list
    updateDepartmentList();

    departmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newDepartment = newDepartmentInput.value.trim();

        if (!newDepartment) {
            showNotification('Please enter a department name', 'error');
            return;
        }

        if (departments.includes(newDepartment)) {
            showNotification('Department already exists', 'error');
            return;
        }

        departments.push(newDepartment);
        updateDepartmentList();
        updateAllDepartmentDropdowns(); // This will now update the program dropdown too
        newDepartmentInput.value = '';
        showNotification('Department added successfully');
    });
}

function updateDepartmentList() {
    const departmentList = document.getElementById('departmentList');
    if (!departmentList) return;

    departmentList.innerHTML = '';
    departments.forEach(dept => {
        const deptElement = document.createElement('div');
        deptElement.className = 'department-item';
        deptElement.innerHTML = `
            <span>${dept}</span>
            <button type="button" class="btn-delete" onclick="deleteDepartment('${dept}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        departmentList.appendChild(deptElement);
    });
}

function deleteDepartment(departmentName) {
    if (!confirm(`Are you sure you want to delete the department "${departmentName}"?`)) {
        return;
    }

        const index = departments.indexOf(departmentName);
        if (index > -1) {
            departments.splice(index, 1);
            updateDepartmentList();
        updateAllDepartmentDropdowns(); // This will now update the program dropdown too
        showNotification('Department deleted successfully');
    }
}

function updateAllDepartmentDropdowns() {
    // Update department dropdowns in various forms
    const departmentDropdowns = [
        document.getElementById('department'),
        document.getElementById('assignDepartment'),
        document.getElementById('departmentFilter'),
        document.getElementById('program') // Add program dropdown to the list
    ];

    departmentDropdowns.forEach(dropdown => {
        if (dropdown) {
            const currentValue = dropdown.value;
            dropdown.innerHTML = '<option value="">Select Department</option>';
            
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
                dropdown.appendChild(option);
            });

            // Restore the previously selected value if it still exists
            if (currentValue && departments.includes(currentValue)) {
                dropdown.value = currentValue;
            }
        }
    });
}

// Add function to update student status
function updateStudentStatus(studentId, newStatus) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        student.status = newStatus;
        updateStudentTable(); // Refresh the table to show the updated status
        showNotification(`Student status updated to ${newStatus}`, 'success');
    }
}

// Add function to reset form and remove read-only state
function resetStudentForm() {
    const form = document.getElementById('studentForm');
    if (form) {
        form.reset();
        form.studentId.readOnly = false;
        form.studentId.style.backgroundColor = ''; // Reset background color
        clearValidationStates(form);
    }
}

function resetInstructorForm() {
    const form = document.getElementById('instructorForm');
    if (form) {
        form.reset();
        form.instructorId.readOnly = false;
        form.instructorId.style.backgroundColor = ''; // Reset background color
        clearValidationStates(form);
    }
}

// Add this with other update functions
function updateAnnouncementsTable(announcementsList = announcements) {
    const tbody = document.getElementById('announcementsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (announcementsList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No announcements found</td>
            </tr>
        `;
        return;
    }
    
    announcementsList.forEach(announcement => {
        const row = document.createElement('tr');
        const recipientText = getRecipientText(announcement.recipients);
        const isExpired = announcement.validUntil && new Date(announcement.validUntil) < new Date();
        const status = isExpired ? 'Expired' : announcement.status;
        
        row.innerHTML = `
            <td>${announcement.date}</td>
            <td>${announcement.title}</td>
            <td>${recipientText}</td>
            <td><span class="priority-${announcement.priority.toLowerCase()}">${announcement.priority}</span></td>
            <td>${announcement.validUntil || 'No expiry'}</td>
            <td><span class="status-${status.toLowerCase()}">${status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewAnnouncement('${announcement.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteAnnouncement('${announcement.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getRecipientText(recipients) {
    const parts = [];
    if (recipients.allStudents) {
        let text = 'All Students';
        if (recipients.department) {
            if (recipients.department === 'all') {
                text += ' (All Departments';
            } else {
                text += ` (${recipients.department}`;
            }
            if (recipients.semester) {
                text += `, Semester ${recipients.semester}`;
            }
            text += ')';
        } else if (recipients.semester) {
            text += ` (Semester ${recipients.semester})`;
        }
        parts.push(text);
    }
    if (recipients.allInstructors) {
        parts.push('All Instructors');
    }
    return parts.join(', ') || 'None selected';
}

function viewAnnouncement(announcementId) {
    const announcement = announcements.find(a => a.id === announcementId);
    if (announcement) {
        // Create modal HTML
        const modalHTML = `
            <div id="announcementDetailsModal" class="modal" style="display: block; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); z-index: 1000;">
                <div class="modal-content" style="background-color: #fefefe; margin: 5% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 700px; border-radius: 8px; position: relative;">
                    <span class="close" style="position: absolute; right: 10px; top: 5px; color: #aaa; font-size: 28px; font-weight: bold; cursor: pointer; padding: 0 5px;">&times;</span>
                    <h2 style="margin-bottom: 20px;">${announcement.title}</h2>
                    <div class="announcement-details">
                        <div style="margin-bottom: 15px;">
                            <strong>Date:</strong> ${announcement.date}
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong>Recipients:</strong> ${getRecipientText(announcement.recipients)}
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong>Priority:</strong> <span class="priority-${announcement.priority.toLowerCase()}">${announcement.priority}</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong>Valid Until:</strong> ${announcement.validUntil || 'No expiry'}
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong>Status:</strong> <span class="status-${announcement.status.toLowerCase()}">${announcement.status}</span>
                        </div>
                        <div style="margin-top: 20px;">
                            <strong>Message:</strong>
                            <p style="margin-top: 10px; white-space: pre-wrap;">${announcement.message}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing modal
        const existingModal = document.getElementById('announcementDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get modal elements
        const modal = document.getElementById('announcementDetailsModal');
        const closeBtn = modal.querySelector('.close');

        // Close modal when clicking X
        closeBtn.addEventListener('click', function() {
            modal.remove();
        });

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.remove();
            }
        });
    }
}

function deleteAnnouncement(announcementId) {
    if (confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
        announcements = announcements.filter(a => a.id !== announcementId);
        updateAnnouncementsTable();
        showNotification('Announcement deleted successfully!', 'success');
    }
}

// Add CSS styles for form validation and notifications
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .form-group {
            margin-bottom: 1rem;
            position: relative;
        }
        
        .error-message {
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        }
        
        .is-invalid {
            border-color: #dc3545 !important;
            padding-right: calc(1.5em + 0.75rem);
            background-repeat: no-repeat;
            background-position: right calc(0.375em + 0.1875rem) center;
            background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
        }
        
        .is-valid {
            border-color: #28a745 !important;
            padding-right: calc(1.5em + 0.75rem);
            background-repeat: no-repeat;
            background-position: right calc(0.375em + 0.1875rem) center;
            background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 9999;
            min-width: 250px;
            text-align: center;
            font-weight: 500;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notification-success {
            background-color: #28a745;
            color: #fff;
        }
        
        .notification-error {
            background-color: #dc3545;
            color: #fff;
        }
        
        .notification-info {
            background-color: #17a2b8;
            color: #fff;
        }
        
        .notification-warning {
            background-color: #ffc107;
            color: #000;
        }
    `;
    document.head.appendChild(style);
});

// Add function to populate department dropdowns
function populateDepartmentDropdowns() {
    const departmentDropdowns = [
        document.getElementById('attendanceDepartment'),
        document.getElementById('examDepartment'),
        document.getElementById('feedbackDepartment')
    ];

    departmentDropdowns.forEach(dropdown => {
        if (dropdown) {
            dropdown.innerHTML = '<option value="">Select Department</option>';
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
                dropdown.appendChild(option);
            });
        }
    });
}

// Add function to populate semester dropdowns
function populateSemesterDropdowns() {
    const semesterDropdowns = [
        document.getElementById('attendanceSemester'),
        document.getElementById('examSemester'),
        document.getElementById('feedbackSemester')
    ];

    semesterDropdowns.forEach(dropdown => {
        if (dropdown) {
            dropdown.innerHTML = '<option value="">Select Semester</option>';
            for (let i = 1; i <= 8; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `${i}${getOrdinalSuffix(i)} Semester`;
                dropdown.appendChild(option);
            }
        }
    });
}

// Call these functions when the page loads
document.addEventListener('DOMContentLoaded', function() {
    populateDepartmentDropdowns();
    populateSemesterDropdowns();
});
  