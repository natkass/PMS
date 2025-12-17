import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import { useAuth } from "../../context/authContext";
import apiService from "../services/apiServices";

const Departmentaddproject = ({
  handleAddProjecttodepartmentModalClose,
  selectedDepartmentId,
}) => {
  const [title, SetTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [projectManager, setProjectManager] = useState([]);
  const [technicalManager, setTechnicalManager] = useState([]);
  const [members, setMembers] = useState([]);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minEndDate, setMinEndDate] = useState("");
  const [file, setFile] = useState(null);
  const [document_type, setDocument_type] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = useAuth();
  const [userInfo, setUserInfo] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo")) || [];
  });

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "0.5rem",
      minHeight: "44px",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(30, 58, 138, 0.2)" : "none",
      "&:hover": {
        borderColor: "#94a3b8",
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "0.5rem",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "0.25rem",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#1e3a8a"
        : state.isFocused
        ? "#f1f5f9"
        : "white",
      color: state.isSelected ? "white" : "#1e293b",
      padding: "0.625rem 0.75rem",
      fontSize: "0.875rem",
      borderRadius: "0.25rem",
      margin: "0.125rem 0",
      "&:active": {
        backgroundColor: "#1e3a8a",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#e0f2fe",
      borderRadius: "0.375rem",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#0369a1",
      fontWeight: "500",
      padding: "0.25rem 0.5rem",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#0369a1",
      borderRadius: "0 0.375rem 0.375rem 0",
      "&:hover": {
        backgroundColor: "#bae6fd",
        color: "#0c4a6e",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#94a3b8",
      fontSize: "0.875rem",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#64748b",
      "&:hover": {
        color: "#475569",
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: "#64748b",
      "&:hover": {
        color: "#475569",
      },
    }),
  };

  const handleChange = (e) => {
    const { value } = e.target;
    const newValue = value.replace(/(?!^)-/g, "");
    setBudget(newValue);
  };

  useEffect(() => {
    async function fetchUsersAndDocTypes() {
      try {
        const users = await apiService.getAllUsers(userInfo.access_token);

        // Map and sort users alphabetically by full_name
        const options = users
          .map((user) => ({
            value: user.user_id,
            label: user.full_name,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setProjectManagerOptions(options);
        setTechnicalManagerOptions(options);
        setMemberOptions(options);

        const docTypes = await apiService.documentTypegetAll();
        const docTypeOptions = docTypes.map((docType) => ({
          value: docType.document_type_id,
          label: docType.document_type,
        }));

        setDocTypeOptions(docTypeOptions);
      } catch (error) {
        console.error("Error fetching users and document types:", error);
      }
    }
    fetchUsersAndDocTypes();

    async function fetchUsers() {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    }
    fetchUsers();
  }, [userInfo]);

  const [projectManagerOptions, setProjectManagerOptions] = useState([]);
  const [technicalManagerOptions, setTechnicalManagerOptions] = useState([]);
  const [memberOptions, setMemberOptions] = useState([]);
  const [docTypeOptions, setDocTypeOptions] = useState([]);

  const availableProjectManagerOptions = useMemo(
    () =>
      projectManagerOptions.filter(
        (option) => ![...technicalManager, ...members].includes(option.value)
      ),
    [projectManagerOptions, technicalManager, members]
  );

  const availableTechnicalManagerOptions = useMemo(
    () =>
      technicalManagerOptions.filter(
        (option) => ![...projectManager].includes(option.value)
      ),
    [technicalManagerOptions, projectManager]
  );

  const availableMemberOptions = useMemo(
    () =>
      memberOptions.filter(
        (option) => ![...projectManager].includes(option.value)
      ),
    [memberOptions, projectManager]
  );

  const handleProjectManagerChange = (selectedOption) => {
    const selectedValues = selectedOption
      ? selectedOption.map((option) => option.value)
      : [];
    setProjectManager(selectedValues);
  };

  const handleTechnicalManagerChange = (selectedOption) => {
    const selectedValues = selectedOption
      ? selectedOption.map((option) => option.value)
      : [];
    setTechnicalManager(selectedValues);
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    if (endDate && new Date(endDate) < new Date(newStartDate)) {
      setEndDate("");
      Swal.fire({
        icon: "warning",
        title: "Date Conflict",
        text: "End date cannot be before the start date. Please select a valid end date.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }

    setMinEndDate(newStartDate);
  };

  const handleMemberChange = (selectedOption) => {
    const selectedValues = selectedOption
      ? selectedOption.map((option) => option.value)
      : [];
    setMembers(selectedValues);
  };

  const handleDocTypeChange = (selectedOption) => {
    setDocument_type(selectedOption ? selectedOption.value : null);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const resetFormData = () => {
    SetTitle("");
    setBudget("");
    setProjectManager([]);
    setTechnicalManager([]);
    setMembers([]);
    setStartDate("");
    setEndDate("");
    setFile(null);
    setDocument_type(null);
    setDescription("");
    setMinEndDate("");
    if (document.getElementById("fileInput")) {
      document.getElementById("fileInput").value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please enter a project title",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    if (projectManager.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please select at least one project manager",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    if (!startDate || !endDate) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please select both start and end dates",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", title.trim());
    formData.append("budget", budget);
    formData.append("project_managers", JSON.stringify(projectManager));
    formData.append("technical_managers", JSON.stringify(technicalManager));
    formData.append("members", JSON.stringify(members));
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    if (file) {
      formData.append("documents", file);
    }
    if (document_type) {
      formData.append("document_type_id", document_type);
    }
    if (description.trim()) {
      formData.append("description", description.trim());
    }
    formData.append("division_id", selectedDepartmentId);

    try {
      await apiService.projectadd(formData);

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });

      Toast.fire({
        icon: "success",
        title: "Project created successfully!",
      }).then(() => {
        handleAddProjecttodepartmentModalClose();
      });
    } catch (error) {
      console.error("Error creating project:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to create project",
        text: error.response?.data?.message || "An error occurred",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Create New Project
            </h1>
            <p className="text-gray-600 mt-2">
              Fill in the details to create a new project in this department
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Project Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter Project Title"
                      value={title}
                      onChange={(e) => SetTitle(e.target.value)}
                      required
                      className="pl-10 w-full px-4 py-3 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                    />
                  </div>
                </div>

                {/* Project Manager */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Manager <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="projectManager"
                    value={projectManager.map((manager) => ({
                      value: manager,
                      label: availableProjectManagerOptions.find(
                        (option) => option.value === manager
                      )?.label,
                    }))}
                    onChange={handleProjectManagerChange}
                    options={availableProjectManagerOptions}
                    isMulti
                    className="w-full"
                    closeMenuOnSelect={false}
                    styles={customStyles}
                    placeholder="Select project managers..."
                    required
                  />
                </div>

                {/* Technical Manager */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technical Manager
                  </label>
                  <Select
                    name="technicalManager"
                    value={technicalManager.map((manager) => ({
                      value: manager,
                      label: availableTechnicalManagerOptions.find(
                        (option) => option.value === manager
                      )?.label,
                    }))}
                    onChange={handleTechnicalManagerChange}
                    options={availableTechnicalManagerOptions}
                    isMulti
                    className="w-full"
                    closeMenuOnSelect={false}
                    styles={customStyles}
                    placeholder="Select technical managers..."
                  />
                </div>

                {/* Members */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Members
                  </label>
                  <Select
                    name="members"
                    value={members.map((member) => ({
                      value: member,
                      label: availableMemberOptions.find(
                        (option) => option.value === member
                      )?.label,
                    }))}
                    onChange={handleMemberChange}
                    options={availableMemberOptions}
                    isMulti
                    className="w-full"
                    closeMenuOnSelect={false}
                    styles={customStyles}
                    placeholder="Select team members..."
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Budget
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">ETB</span>
                    </div>
                    <input
                      type="number"
                      name="budget"
                      placeholder="Enter amount in numbers"
                      value={budget}
                      onChange={handleChange}
                      className="pl-12 w-full px-4 py-3 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                    />
                  </div>
                </div>

                {/* Dates Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={startDate}
                        onChange={handleStartDateChange}
                        required
                        className="pl-10 w-full px-4 py-3 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={minEndDate}
                        required
                        className="pl-10 w-full px-4 py-3 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <Select
                    name="documentType"
                    value={
                      docTypeOptions.find(
                        (option) => option.value === document_type
                      ) || null
                    }
                    onChange={handleDocTypeChange}
                    options={docTypeOptions}
                    className="w-full"
                    styles={customStyles}
                    placeholder="Select document type..."
                    isClearable
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Documents
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="fileInput"
                      name="documents"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="fileInput"
                      className="cursor-pointer flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <svg
                        className="w-8 h-8 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {file ? file.name : "Click to upload project documents"}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PDF, DOC, JPG, PNG up to 10MB
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                className="w-full px-4 py-3 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50 resize-none"
                placeholder="Write a comprehensive description about the project objectives, scope, and requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-4">
              <button
                type="button"
                onClick={resetFormData}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Project
                  </>
                )}
              </button>
            </div>

            {/* Required Fields Note */}
            <div className="mt-6 text-sm text-gray-500">
              <span className="text-red-500">*</span> Indicates required fields
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Departmentaddproject;
