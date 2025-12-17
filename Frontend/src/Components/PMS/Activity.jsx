import { Card, Typography } from "@material-ui/core";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import FlagIcon from "@mui/icons-material/Flag";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Duration from "@mui/icons-material/QueryBuilder";
import SearchIcon from "@mui/icons-material/Search";
import AddCommentIcon from "@mui/icons-material/SmsOutlined";
import {
  Box,
  Divider,
  InputAdornment,
  Pagination,
  TextField,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import ProgressBar from "@ramonak/react-progress-bar";
import { EditorState } from "draft-js";
import React, { useEffect, useRef, useState } from "react";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Helmet } from "react-helmet-async";
import { FaEdit, FaTrash } from "react-icons/fa";
import PuffLoader from "react-spinners/ClipLoader";
import { PERMISSIONS } from "../../config";
import ActivityAdd from "../PMS/Activityadd";
import Activitycomment from "../PMS/Activitycomment";
import apiService from "../services/apiServices";
import Activitiesdetail from "./Activitiesdetail";
import Activitiesedit from "./Activitiesedit";
import Activitycommentview from "./Activitycommentview";
import Activitydelete from "./Activitydelete";
import "./Tasks.css";
import AdvancedCommentSystem from "./Advancedactivitycomment";

const Activity = (props) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [viewcommentModalOpen, setViewcommentModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [userInfo, setUserInfo] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo")) || [];
  });
  const [permissions, setPermissions] = useState(() => {
    return JSON.parse(localStorage.getItem("permissions")) || [];
  });
  const [projectPermissions, setProjectPermissions] = useState(() => {
    return JSON.parse(localStorage.getItem("project_permissions")) || [];
  });
  const [expandedTeamIndices, setExpandedTeamIndices] = useState(
    Array(activities.length).fill(false)
  );
  const [loading, setLoading] = useState(false);
  const [noActivity, setNoActivity] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRowAllData, setSelectedRowAllData] = useState(null);
  const [createActivity, setCreateActivity] = useState(0);
  const [updateActivity, setUpdateActivity] = useState(0);
  const [commentOnActivity, setCommentOnActivity] = useState(0);
  const [viewCommentOnActivity, setViewCommentOnActivity] = useState(0);
  const [deleteActivity, setDeleteActivity] = useState(0);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [formData, setFormData] = useState({
    is_milestone: false,
  });
  const activitiesPerPage = 8;
  const [openRowMenu, setOpenRowMenu] = useState(null);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const onEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  const totalPages = Math.ceil(activities.length / activitiesPerPage);
  const handleMenuOpen = (rowId) => {
    setOpenRowMenu(rowId);
  };
  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    setFormData({
      ...formData,
      [name]: value,
    });

    fetchActivitiesWithMilestone(value);
  };

  useEffect(() => {
    const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (storedUserInfo) {
      setUserInfo(storedUserInfo);
    }
  }, []);

  const fetchActivitiesWithMilestone = async (isMilestone) => {
    try {
      setLoading(true);
      let activityData = await apiService.getAllActivities(
        props.setSelectedProjectInfo.project_id,
        userInfo.access_token
      );
      const sortedResponse = activityData.sort((a, b) => {
        if (a.activity.createdAt > b.activity.createdAt) {
          return -1;
        }
      });

      const filteredActivities = sortedResponse.filter(
        (activity) => activity.activity.is_milestone === isMilestone
      );

      setActivities(filteredActivities);
      filteredActivities.length === 0
        ? setNoActivity("No Activity Found")
        : setNoActivity("loading ...");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let activityData = await apiService.getAllActivities(
        props.setSelectedProjectInfo.project_id,
        userInfo.access_token
      );
      const sortedResponse = activityData.sort((a, b) => {
        if (a.activity.createdAt > b.activity.createdAt) {
          return -1;
        }
      });

      const filteredActivities = sortedResponse.filter(
        (activity) => activity.activity.is_milestone === formData.is_milestone
      );

      setActivities(filteredActivities);
      activities.length === 0
        ? setNoActivity("No Activity Found")
        : setNoActivity("loading ...");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  };

  const handleEditClick = (row) => {
    setSelectedRow(row);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  const handleDetailClick = (row, data) => {
    setSelectedRow(row);
    setSelectedRowAllData(data);
    setSelectedActivityId(data.activity.activity_id);
    setDetailModalOpen(true);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setEditModalOpen(false);
      setDetailModalOpen(false);
      setAddModalOpen(false);
      setDeleteModalOpen(false);
      setCommentModalOpen(false);
      setViewcommentModalOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDetailModalClose = () => {
    setDetailModalOpen(false);
    setCommentModalOpen(false);
    setViewcommentModalOpen(false);
  };

  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
  };

  const modalRef = useRef(null);

  const handlefetchActivity = async () => {
    try {
      setLoading(true);
      const activityData = await apiService.getAllActivities(
        props.setSelectedProjectInfo.project_id
      );
      const sortedResponse = activityData.sort((a, b) => {
        if (a.activity.createdAt > b.activity.createdAt) {
          return -1;
        }
      });
      setActivities(sortedResponse);
      sortedResponse.length === 0
        ? setNoActivity("No Activity Found")
        : setNoActivity("loading ...");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Activities:", error);
    }
  };

  const handleAddModalClose = () => {
    setAddModalOpen(false);
  };

  const filteredRows =
    statusFilter === "All"
      ? activities
      : activities.filter(
        (row) => row.activity.activity_status === statusFilter
      );

  const search = filteredRows.filter(
    (row) =>
      row.activity.name &&
      row.activity.name
        .toLowerCase()
        .includes(searchTerm ? searchTerm.toLowerCase() : "")
  );

  const handleFilterClick = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  useEffect(() => {
    async function fetchUsers() {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    }
    async function fetchPermissions() {
      localStorage.setItem("permissions", JSON.stringify(permissions));
    }
    async function fetchProjectPermissions() {
      localStorage.setItem(
        "project_permissions",
        JSON.stringify(projectPermissions)
      );
    }
    fetchUsers();
    fetchProjectPermissions();
    fetchPermissions();

    const nonProjectRelatedRoles = userInfo.foundUser.Roles.filter(
      (role) => !role.project_related
    ).map((role) => role.name);

    const isDepartmentAdminRolePresent =
      nonProjectRelatedRoles.includes("Department Admin");

    const isClusterAdminRolePresent =
      nonProjectRelatedRoles.includes("Cluster Admin");

    const isOrganizationAdminRolePresent =
      nonProjectRelatedRoles.includes("Organization Admin");

    const CREATE_ACTIVITY = projectPermissions.filter(
      (permission) => permission.name === PERMISSIONS.CREATE_ACTIVITY
    );
    const UPDATE_ACTIVITY = projectPermissions.filter(
      (permission) => permission.name === PERMISSIONS.UPDATE_ACTIVITY
    );
    const DELETE_ACTIVITY = projectPermissions.filter(
      (permission) => permission.name === PERMISSIONS.DELETE_ACTIVITY
    );
    let selectedPermission;
    if (
      isClusterAdminRolePresent ||
      isDepartmentAdminRolePresent ||
      isOrganizationAdminRolePresent
    ) {
      selectedPermission = permissions;
    } else {
      selectedPermission = projectPermissions;
    }
    const COMMENT_ON_ACTIVITY = selectedPermission.filter(
      (permission) => permission.name === PERMISSIONS.COMMENT_ON_ACTIVITY
    );
    const VIEW_COMMENT_ON_ACTIVITY = selectedPermission.filter(
      (permission) => permission.name === PERMISSIONS.VIEW_COMMENT_ON_ACTIVITY
    );

    setCreateActivity(CREATE_ACTIVITY.length);
    setUpdateActivity(UPDATE_ACTIVITY.length);
    setCommentOnActivity(COMMENT_ON_ACTIVITY.length);
    setViewCommentOnActivity(VIEW_COMMENT_ON_ACTIVITY.length);
    setDeleteActivity(DELETE_ACTIVITY.length);

    handlefetchActivity();
  }, [userInfo]);

  const fetchAllActivities = async () => {
    try {
      setLoading(true);
      let activityData = await apiService.getAllActivities(
        props.setSelectedProjectInfo.project_id,
        userInfo.access_token
      );
      const sortedResponse = activityData.sort((a, b) => {
        if (a.activity.createdAt > b.activity.createdAt) {
          return -1;
        }
      });

      setActivities(sortedResponse);
      activities.length === 0
        ? setNoActivity("No Activity Found")
        : setNoActivity("loading ...");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  };

  const handleAddActivityClick = () => {
    setAddModalOpen(true);
  };

  useEffect(() => {
    const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (storedUserInfo) {
      setUserInfo(storedUserInfo);
    }
  }, []);

  const handleCommentOnActivityClick = (activity) => {
    setSelectedRow(activity);
    setCommentModalOpen(true);
  };

  const handleViewCommentOnActivityClick = (activity) => {
    setSelectedRow(activity);
    setViewcommentModalOpen(true);
  };

  const indexOfLastActivity = currentPage * rowsPerPage;
  const indexOfFirstActivity = indexOfLastActivity - rowsPerPage;

  const currentActivities = search.slice(
    indexOfFirstActivity,
    indexOfLastActivity
  );

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleTeamExpansion = (activityIndex) => {
    const newExpandedTeamIndices = [...expandedTeamIndices];
    newExpandedTeamIndices[activityIndex] =
      !newExpandedTeamIndices[activityIndex];
    setExpandedTeamIndices(newExpandedTeamIndices);
  };

  const handleChange = (event, value) => {
    paginate(value);
  };

  const pageCount = Math.ceil(search.length / rowsPerPage);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "On Progress":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Function to get progress bar color
  const getProgressBarColor = (progress) => {
    if (progress >= 100) return "#10B981";
    if (progress >= 75) return "#3B82F6";
    if (progress >= 50) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="ml-4 md:ml-auto w-full  mr-0 md:mr-5 mt-6 md:mt-6 px-4 md:px-0">
      <Helmet>
        <title>{props.setSelectedProjectInfo.name} - Activities</title>
      </Helmet>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 px-4 md:px-5 py-4 md:py-5 items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div
              className="flex justify-center items-center w-10 h-10 md:w-12 md:h-12 text-white font-semibold rounded-lg"
              style={{ backgroundColor: "#082f49" }}
            >
              {props.setSelectedProjectInfo.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-auto">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              {props.setSelectedProjectInfo.name}
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">
              List of Activities
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 mx-4 md:mx-5">
        {/* Status Filter Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex flex-wrap gap-2 px-4 md:px-6 py-4">
            {["All", "Completed", "On Progress", "Pending"].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterClick(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${statusFilter === status
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Controls */}
        <div className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
              {/* Search Input */}
              <div className="w-full sm:w-64">
                <TextField
                  fullWidth
                  type="text"
                  placeholder="Search by Activity Name"
                  size="small"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon className="text-slate-400" />
                      </InputAdornment>
                    ),
                    className: "rounded-lg bg-white",
                  }}
                />
              </div>

              {/* Milestone Checkbox */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="is_milestone"
                      name="is_milestone"
                      checked={formData.is_milestone}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-5 rounded-full transition-colors ${formData.is_milestone ? "bg-blue-600" : "bg-slate-300"
                        }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.is_milestone ? "transform translate-x-5" : ""
                          }`}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-slate-700">
                    Milestone Activities
                  </span>
                </label>
              </div>

              {/* Show All Button */}
              <button
                onClick={fetchAllActivities}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Show All
              </button>
            </div>

            {/* Add Activity Button */}
            {createActivity !== 0 && (
              <button
                onClick={() => handleAddActivityClick()}
                className="px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                <svg
                  className="w-4 h-4"
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
                Add New Activity
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rows Per Page Selector */}
      {filteredRows.length !== 0 && (
        <div className="flex items-center justify-between px-4 md:px-5 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={8}>8</option>
              <option value={16}>16</option>
              <option value={32}>32</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="text-sm text-slate-500">
            Showing {indexOfFirstActivity + 1}-
            {Math.min(indexOfLastActivity, search.length)} of {search.length}{" "}
            activities
          </div>
        </div>
      )}

      {/* Activities Grid */}
      <div className="px-4 md:px-5 pb-8">
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <PuffLoader color="#fff" />
        </Backdrop>

        {activities.length !== 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {currentActivities.map((data, activityIndex) => {
              const progress = function (start_date, end_date) {
                const currentDate = new Date();
                const totalDuration = new Date(end_date) - new Date(start_date);
                const elapsedDuration = currentDate - new Date(start_date);
                const progress = Math.min(
                  Math.max((elapsedDuration / totalDuration) * 100, 0),
                  100
                );
                return progress;
              };

              const activity = data.activity;
              const Tasklength = data.Tasklength;
              const commentlength = data.commentlength;

              const date_diff_indays = function (date1, date2) {
                const dt1 = new Date(date1);
                const dt2 = new Date(date2);
                return Math.floor(
                  (Date.UTC(
                    dt2.getFullYear(),
                    dt2.getMonth(),
                    dt2.getDate(),
                    dt2.getHours(),
                    dt2.getMinutes()
                  ) -
                    Date.UTC(
                      dt1.getFullYear(),
                      dt1.getMonth(),
                      dt1.getDate(),
                      dt2.getHours(),
                      dt2.getMinutes()
                    )) /
                  (1000 * 60 * 60 * 24)
                );
              };

              const daysBetween = date_diff_indays(
                activity.start_date,
                activity.end_date
              );
              const days_left = date_diff_indays(new Date(), activity.end_date);
              const isActivityStarted = date_diff_indays(
                new Date(),
                activity.start_date
              );
              const daysLeftDisplay =
                days_left > 0
                  ? days_left + (days_left === 1 ? " day" : " days")
                  : "";
              const progress_result = progress(
                activity.start_date,
                activity.end_date
              );
              const activity_progress = activity.activity_status;
              const days = Math.floor((daysBetween % 365) % 30);
              const daysDisplay =
                days > 0 ? days + (days === 1 ? " day" : " days") : "";

              return (
                <div
                  key={activityIndex}
                  className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => handleDetailClick(activity, data)}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-800 text-base truncate">
                            {activity.name}
                          </h3>
                          {activity.is_milestone && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                              <FlagIcon fontSize="inherit" />
                              Milestone
                            </span>
                          )}
                        </div>
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            activity_progress
                          )}`}
                        >
                          {activity_progress}
                        </div>
                      </div>

                      {/* Actions Menu */}
                      <div className="relative">
                        {(updateActivity !== 0 || deleteActivity !== 0) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuOpen(activity.activity_id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreHorizIcon />
                          </button>
                        )}

                        {openRowMenu === activity.activity_id && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 z-10 min-w-[120px] py-1">
                            {updateActivity !== 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(activity);
                                }}
                                className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <FaEdit className="text-blue-600" />
                                Edit
                              </button>
                            )}
                            {deleteActivity !== 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(activity);
                                }}
                                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <FaTrash />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <AssignmentOutlinedIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {Tasklength || 0}
                          </div>
                          <div className="text-xs text-slate-500">
                            {Tasklength === 1 ? "Task" : "Tasks"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <ChatOutlinedIcon className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {commentlength || 0}
                          </div>
                          <div className="text-xs text-slate-500">Comments</div>
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-slate-50 rounded-lg">
                        <Duration className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="text-sm text-slate-700">
                        {daysDisplay}
                      </span>
                    </div>

                    <div className="space-y-3 border-t border-slate-100 items-center justify-between mt-4 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">
                          Progress
                        </span>

                        {/* Status Badge */}
                        {isActivityStarted <= 0 ? (
                          days_left > 0 && activity_progress !== "Completed" ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                              <AccessTimeIcon className="w-3 h-3" />
                              {daysLeftDisplay} left
                            </div>
                          ) : activity_progress === "Completed" ? (
                            <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full">
                              Completed
                            </span>
                          ) : (
                            <span className="text-xs font-medium px-2 py-1 bg-red-50 text-red-700 rounded-full">
                              Deadline Passed
                            </span>
                          )
                        ) : (
                          <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                            Upcoming
                          </span>
                        )}
                      </div>

                      {/* Clock/Speedometer Visual */}
                      <div className="relative flex items-center gap-4">
                        {/* Circular Progress */}
                        <div className="relative w-16 h-16">
                          <svg className="w-full h-full" viewBox="0 0 36 36">
                            {/* Background circle */}
                            <path
                              d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#E2E8F0"
                              strokeWidth="3"
                            />
                            {/* Progress circle */}
                            <path
                              d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={
                                days_left <= 0 &&
                                  activity_progress !== "Completed"
                                  ? "#EF4444" // Red color for deadline passed
                                  : getProgressBarColor(
                                    parseInt(progress_result)
                                  )
                              }
                              strokeWidth="3"
                              strokeDasharray={`${progress_result}, 100`}
                              className="transition-all duration-500"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-700 text-center px-1">
                              {activity_progress === "Completed"
                                ? "Done"
                                : `${parseInt(progress_result)}%`}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex-1">
                          <ProgressBar
                            completed={parseInt(progress_result)}
                            bgColor={
                              days_left <= 0 &&
                                activity_progress !== "Completed"
                                ? "#EF4444" // Red color for deadline passed
                                : getProgressBarColor(parseInt(progress_result))
                            }
                            height="10px"
                            borderRadius="6px"
                            baseBgColor="rgba(226, 232, 240, 0.5)"
                            labelColor="#64748B"
                            className="progress-bar"
                            isLabelVisible={false}
                          />

                          {/* Show time information based on days_left */}
                          <div className="mt-1 text-xs text-slate-600">
                            {activity_progress === "Completed" ? (
                              <div className="text-green-600 flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Completed
                              </div>
                            ) : days_left > 0 ? (
                              <div className="flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {days_left}{" "}
                                {days_left === 1 ? "day left" : "days left"}
                              </div>
                            ) : days_left === 0 ? (
                              <div className="text-amber-600 flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Due today
                              </div>
                            ) : (
                              <div className="text-red-600 flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {Math.abs(days_left)}{" "}
                                {Math.abs(days_left) === 1
                                  ? "day overdue"
                                  : "days overdue"}
                              </div>
                            )}
                          </div>

                          {/* Show percentage progress as small text */}
                          {activity_progress !== "Completed" && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              {parseFloat(progress_result).toFixed(1)}% complete
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCommentOnActivityClick(activity);
                        }}
                        className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800"
                      >
                        <ChatOutlinedIcon fontSize="small" />
                        <span>View Comments</span>
                      </button>


                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AssignmentOutlinedIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                No Activities Found
              </h3>
              <p className="text-slate-500 mb-6">
                {noActivity === "loading ..."
                  ? "Loading activities..."
                  : "Get started by creating your first activity"}
              </p>
              {createActivity !== 0 && noActivity !== "loading ..." && (
                <button
                  onClick={() => handleAddActivityClick()}
                  className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  + Create First Activity
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredRows.length !== 0 && pageCount > 1 && (
        <div className="flex justify-center px-4 md:px-5 pb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <Pagination
              count={pageCount}
              page={currentPage}
              onChange={handleChange}
              variant="outlined"
              shape="rounded"
              color="primary"
              size="small"
              showFirstButton
              showLastButton
              sx={{
                "& .MuiPaginationItem-root": {
                  fontSize: "0.875rem",
                  minWidth: "32px",
                  height: "32px",
                  margin: "0 2px",
                  "&.Mui-selected": {
                    backgroundColor: "#0F172A",
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#1E293B",
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 lg:w-2/3 max-h-[90vh] overflow-hidden mx-4">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h1 className="text-2xl font-bold text-slate-800">
                Add Activity
              </h1>
              <button
                onClick={handleAddModalClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <ActivityAdd
                handlefetchActivity={handlefetchActivity}
                handleCloseModal={handleAddModalClose}
                selectedProject={props.setSelectedProjectInfo}
              />
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 lg:w-2/3 max-h-[90vh] overflow-hidden mx-4">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {/* Edit Activity */}
              </h3>
              <button
                onClick={handleEditModalClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <Activitiesedit
                selectedRow={selectedRow}
                handlefetchActivity={handlefetchActivity}
                handleCloseModal={handleEditModalClose}
                selectedProject={props.setSelectedProjectInfo}
              />
            </div>
          </div>
        </div>
      )}

      {detailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div
            className="bg-white rounded-t-3xl w-full md:w-2/3  overflow-hidden"
            ref={modalRef}
          >
            <Activitiesdetail
              selectedRow={selectedRow}
              selectedRowAllData={selectedRowAllData}
              handleCloseModal={handleDetailModalClose}
            />
          </div>
        </div>
      )}

      {/* {commentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white rounded-xl w-11/12 md:w-1/4 max-w-md"
            ref={modalRef}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Add Comment
              </h3>
              <button
                onClick={handleDetailModalClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <Activitycomment
                handlefetchActivity={handlefetchActivity}
                activityName={selectedRow?.name}
                selectedRow={selectedRow}
                activityId={selectedRow?.activity_id}
                userId={userInfo?.foundUser?.user_id}
                handleCloseModal={handleDetailModalClose}
                selectedProject={props.setSelectedProjectInfo}
              />
            </div>
          </div>
        </div>
      )} */}

      {viewcommentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white rounded-xl w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl max-h-[90vh]"
            ref={modalRef}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-800">
                  Activity Comments
                </h3>
                <span className="text-sm px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {selectedRow?.name}
                </span>
              </div>
              <button
                onClick={handleDetailModalClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 h-[calc(90vh-120px)]">
              <AdvancedCommentSystem
                activityId={selectedRow?.activity_id}
                activityName={selectedRow?.name}
                userId={userInfo?.foundUser?.user_id}
                userRole={userInfo?.foundUser?.role}
                userPermissions={{
                  canAddComment: commentOnActivity !== 0,
                  canEditOwnComments: true,
                  canDeleteOwnComments: true,
                  canPinComments: userInfo?.foundUser?.role === 'admin' || userInfo?.foundUser?.role === 'manager',
                  canViewPrivateComments: userInfo?.foundUser?.role === 'admin' || userInfo?.foundUser?.role === 'manager'
                }}
                handleCloseModal={handleDetailModalClose}
                handlefetchActivity={handlefetchActivity}
              />
            </div>
          </div>
        </div>
      )}

      {/* {viewcommentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white rounded-xl w-11/12 md:w-1/4 max-w-md"
            ref={modalRef}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Comments</h3>
              <button
                onClick={handleDetailModalClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <Activitycommentview
                handlefetchActivity={handlefetchActivity}
                activityName={selectedRow?.name}
                selectedRow={selectedRow}
                activityId={selectedRow?.activity_id}
                userId={userInfo?.foundUser?.user_id}
                handleCloseModal={handleDetailModalClose}
                selectedProject={props.setSelectedProjectInfo}
              />
            </div>
          </div>
        </div>
      )} */}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white rounded-xl w-11/12 md:w-1/2 max-w-lg"
            ref={modalRef}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Delete Activity
              </h3>
              <button
                onClick={handleDeleteModalClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <Activitydelete
                selectedRow={selectedRow}
                handlefetchActivity={handlefetchActivity}
                handleDeleteModalClose={handleDeleteModalClose}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activity;
