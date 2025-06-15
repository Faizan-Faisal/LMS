import React, { useState, useEffect } from 'react';
import { getInstructorCourses, CourseOfferingResponse } from '../../api/instructorCourseApi';
import { toast } from 'react-toastify';
import { getCourseMaterialsByOffering, uploadCourseMaterial, updateCourseMaterial, deleteCourseMaterial, CourseMaterial } from '../../api/InstructorCourseMaterialApi';

const CourseManagement: React.FC = () => {
    const [courses, setCourses] = useState<CourseOfferingResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOfferingForMaterials, setSelectedOfferingForMaterials] = useState<CourseOfferingResponse | null>(null);
    const [selectedCourseBackground, setSelectedCourseBackground] = useState<string | null>(null);
    const [courseBackgrounds, setCourseBackgrounds] = useState<Record<number, string>>(() => {
        // Initialize from localStorage
        const savedBackgrounds = localStorage.getItem('courseBackgrounds');
        return savedBackgrounds ? JSON.parse(savedBackgrounds) : {};
    });
    const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([]);
    const [materialTitle, setMaterialTitle] = useState<string>('');
    const [materialDescription, setMaterialDescription] = useState<string>('');
    const [materialFile, setMaterialFile] = useState<File | null>(null);
    const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [materialToDelete, setMaterialToDelete] = useState<number | null>(null);
    const [showCustomizeModal, setShowCustomizeModal] = useState<boolean>(false);

    const courseThemes = [
        '/images/course_themes/img 1.png',
        '/images/course_themes/img 2.png',
        '/images/course_themes/img 3.png',
        '/images/course_themes/img 4.png',
        '/images/course_themes/img 5.png',
        '/images/course_themes/img 6.png',
    ];

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = sessionStorage.getItem('instructorToken');
                console.log("Instructor Token before API call:", token);
                setLoading(true);
                const data = await getInstructorCourses();
                setCourses(data);
            } catch (err) {
                console.error("Failed to fetch instructor courses:", err);
                setError("Failed to load courses. Please try again.");
                toast.error("Failed to load courses.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Save courseBackgrounds to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('courseBackgrounds', JSON.stringify(courseBackgrounds));
    }, [courseBackgrounds]);

    useEffect(() => {
        if (selectedOfferingForMaterials) {
            fetchCourseMaterials(selectedOfferingForMaterials.offering_id);
        }
    }, [selectedOfferingForMaterials]);

    const fetchCourseMaterials = async (offeringId: number) => {
        try {
            setLoading(true);
            const materials = await getCourseMaterialsByOffering(offeringId);
            setCourseMaterials(materials);
        } catch (error) {
            console.error("Error fetching course materials:", error);
            toast.error("Failed to load course materials.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setMaterialFile(event.target.files[0]);
        }
    };

    const handleUploadMaterial = async () => {
        if (!selectedOfferingForMaterials) {
            toast.error("Please select a course to upload materials.");
            return;
        }
        if (!materialTitle || !materialFile) {
            toast.error("Please provide a title and select a file.");
            return;
        }

        const formData = new FormData();
        formData.append('offering_id', selectedOfferingForMaterials.offering_id.toString());
        formData.append('title', materialTitle);
        if (materialDescription) {
            formData.append('description', materialDescription);
        }
        formData.append('file', materialFile);

        try {
            setLoading(true);
            await uploadCourseMaterial(formData);
            toast.success("Course material uploaded successfully!");
            setMaterialTitle('');
            setMaterialDescription('');
            setMaterialFile(null);
            fetchCourseMaterials(selectedOfferingForMaterials.offering_id); // Refresh list
        } catch (error) {
            console.error("Error uploading material:", error);
            toast.error("Failed to upload course material.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (material: CourseMaterial) => {
        setEditingMaterial(material);
        setMaterialTitle(material.title);
        setMaterialDescription(material.description || '');
        setMaterialFile(null); // Clear file input when editing
    };

    const handleUpdateMaterial = async () => {
        if (!editingMaterial || !selectedOfferingForMaterials) {
            toast.error("No material selected for update or course not selected.");
            return;
        }
        if (!materialTitle) {
            toast.error("Please provide a title for the material.");
            return;
        }

        const formData = new FormData();
        formData.append('title', materialTitle);
        if (materialDescription) {
            formData.append('description', materialDescription);
        } else {
            formData.append('description', ''); // Send empty string if cleared
        }
        if (materialFile) {
            formData.append('file', materialFile);
        }

        try {
            setLoading(true);
            await updateCourseMaterial(editingMaterial.material_id, formData);
            toast.success("Course material updated successfully!");
            setEditingMaterial(null);
            setMaterialTitle('');
            setMaterialDescription('');
            setMaterialFile(null);
            fetchCourseMaterials(selectedOfferingForMaterials.offering_id); // Refresh list
        } catch (error) {
            console.error("Error updating material:", error);
            toast.error("Failed to update course material.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (materialId: number) => {
        setMaterialToDelete(materialId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (materialToDelete !== null && selectedOfferingForMaterials) {
            try {
                setLoading(true);
                await deleteCourseMaterial(materialToDelete);
                toast.success("Course material deleted successfully!");
                fetchCourseMaterials(selectedOfferingForMaterials.offering_id); // Refresh list
            } catch (error) {
                console.error("Error deleting material:", error);
                toast.error("Failed to delete course material.");
            } finally {
                setLoading(false);
                setShowDeleteModal(false);
                setMaterialToDelete(null);
            }
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setMaterialToDelete(null);
    };

    if (loading) {
        return <div className="text-center py-8">Loading courses...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 h-screen overflow-y-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Courses</h1>

            {!selectedOfferingForMaterials ? (
                courses.length === 0 ? (
                    <p className="text-gray-600 text-lg">You are not currently teaching any courses.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((offering) => (
                            <div
                                key={offering.offering_id}
                                className="relative bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-200 text-white overflow-hidden"
                                style={{ backgroundImage: `url('${courseBackgrounds[offering.offering_id] || '/images/default_course_bg.jpg'}')`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '200px' }}
                                onClick={() => {
                                    setSelectedOfferingForMaterials(offering);
                                    setSelectedCourseBackground(courseBackgrounds[offering.offering_id] || null); // Load existing background or null
                                }}
                            >
                                <div className="absolute inset-0 bg-black opacity-40 rounded-xl"></div> {/* Overlay for better text readability */}
                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div>
                                        <h3 className="text-3xl font-bold mb-1">
                                            {offering.course_rel.course_name}
                                        </h3>
                                        <p className="text-lg font-medium">Section: {offering.section_name}</p>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm text-white rounded-full p-2 hover:bg-opacity-30 transition duration-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                // Course Material Management View
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-8">
                        <button
                            onClick={() => setSelectedOfferingForMaterials(null)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition duration-200 flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Back to Courses</span>
                        </button>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition duration-200 flex items-center space-x-2"
                            onClick={() => {
                                if (selectedOfferingForMaterials) {
                                    setShowCustomizeModal(true);
                                }
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span>Customize Background</span>
                        </button>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        Course Materials for {selectedOfferingForMaterials.course_rel.course_name} - {selectedOfferingForMaterials.section_name}
                    </h2>

                    {/* Upload Material Form */}
                    <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8 border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-700 mb-5">{editingMaterial ? 'Edit Material' : 'Upload New Material'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="materialTitle" className="block text-gray-700 text-sm font-semibold mb-2">Title:</label>
                                <input
                                    type="text"
                                    id="materialTitle"
                                    value={materialTitle}
                                    onChange={(e) => setMaterialTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-gray-800"
                                    placeholder="e.g., Lecture 1 Slides"
                                />
                            </div>
                            <div>
                                <label htmlFor="materialDescription" className="block text-gray-700 text-sm font-semibold mb-2">Description (Optional):</label>
                                <textarea
                                    id="materialDescription"
                                    value={materialDescription}
                                    onChange={(e) => setMaterialDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-gray-800 resize-y"
                                    placeholder="e.g., Introduction to AI, key concepts"
                                ></textarea>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="materialFile" className="block text-gray-700 text-sm font-semibold mb-2">File:</label>
                            <input
                                type="file"
                                id="materialFile"
                                onChange={handleFileUpload}
                                className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                            {editingMaterial && !materialFile && (
                                <p className="text-gray-600 text-sm mt-2">Current file: <span className="font-medium">{editingMaterial.file_path.split('/').pop()}</span></p>
                            )}
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={editingMaterial ? handleUpdateMaterial : handleUploadMaterial}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
                            >
                                {editingMaterial ? 'Update Material' : 'Upload Material'}
                            </button>
                            {editingMaterial && (
                                <button
                                    onClick={() => {
                                        setEditingMaterial(null);
                                        setMaterialTitle('');
                                        setMaterialDescription('');
                                        setMaterialFile(null);
                                    }}
                                    className="bg-gray-400 hover:bg-gray-500 text-gray-800 font-semibold py-2 px-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition duration-200"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List Existing Materials */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-700 mb-5">Existing Materials</h3>
                        {courseMaterials.length === 0 ? (
                            <p className="text-gray-600">No materials uploaded for this course yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full leading-normal bg-white rounded-lg">
                                    <thead>
                                        <tr>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">File</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Uploaded At</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courseMaterials.map((material) => (
                                            <tr key={material.material_id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-800 font-medium">{material.title}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-700">{material.description || 'N/A'}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                                    <a
                                                        href={material.file_path} // Assuming file_path is a direct URL
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline flex items-center space-x-1"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                        <span>{material.file_path.split('/').pop()}</span>
                                                    </a>
                                                </td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-700">{new Date(material.uploaded_at).toLocaleString()}</td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm flex gap-3 justify-center">
                                                    <button
                                                        onClick={() => handleEditClick(material)}
                                                        className="flex items-center justify-center w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full text-white transition duration-200 shadow-md hover:shadow-lg"
                                                        title="Edit"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11-11a2.828 2.828 0 00-4-4L5 17v4z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(material.material_id)}
                                                        className="flex items-center justify-center w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full text-white transition duration-200 shadow-md hover:shadow-lg"
                                                        title="Delete"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-60 overflow-y-auto h-full w-full flex justify-center items-center p-4">
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full mx-auto transform transition-all sm:my-8 sm:w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-700 mb-6">Are you sure you want to delete this material? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={cancelDelete} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Customize Background Modal */}
            {showCustomizeModal && selectedOfferingForMaterials && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-60 overflow-y-auto h-full w-full flex justify-center items-center p-4 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full mx-auto transform transition-all sm:my-8 sm:w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Choose a Background for {selectedOfferingForMaterials.course_rel.course_name}</h3>
                        
                        {/* Existing File Upload and Reset Button */}
                        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-700 mb-4">Upload Custom Background</h3>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const newBackground = URL.createObjectURL(e.target.files[0]);
                                        setSelectedCourseBackground(newBackground);
                                        if (selectedOfferingForMaterials) {
                                            setCourseBackgrounds(prev => ({ ...prev, [selectedOfferingForMaterials.offering_id]: newBackground }));
                                        }
                                    }
                                }}
                                className="mb-4 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none"
                            />
                            <button
                                onClick={() => {
                                    setSelectedCourseBackground('/images/default_course_bg.jpg');
                                    if (selectedOfferingForMaterials) {
                                        setCourseBackgrounds(prev => ({ ...prev, [selectedOfferingForMaterials.offering_id]: '/images/default_course_bg.jpg' }));
                                    }
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                            >
                                Reset to Default Background
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-6">Or Select from Themes</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                            {courseThemes.map((theme, index) => (
                                <div
                                    key={index}
                                    className="w-full h-24 bg-gray-200 rounded-lg cursor-pointer overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-all duration-200"
                                    style={{ backgroundImage: `url('${theme}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                    onClick={() => {
                                        setCourseBackgrounds(prev => ({ ...prev, [selectedOfferingForMaterials.offering_id]: theme }));
                                        setSelectedCourseBackground(theme);
                                        // setShowCustomizeModal(false); // Do not close immediately
                                    }}
                                ></div>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowCustomizeModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseManagement; 