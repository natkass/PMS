import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CircleIcon from "@mui/icons-material/AccountBalance";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import Backdrop from "@mui/material/Backdrop";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { FaEdit, FaTrash } from "react-icons/fa";
import PuffLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";
import { BASE_URL, PERMISSIONS } from "../../config";
import apiService from "../services/apiServices";
import Addorganization from "./Addorganization.jsx";
import Addprojecttodepartment from "./Departmentaddproject.jsx";
import Departmentassignmembers from "./Departmentassignmembers.jsx";
import DivisionAdd from "./DivisionAdd.jsx";
import Editorganization from "./Editorganization";
import OrganizationalUnitdelete from "./OrganizationalUnitdelete.jsx";
import Organizationaluniteditt from "./Organizationaluniteditt.jsx";
import SectorAdd from "./SectorAdd.jsx";
import SectorEdit from "./SectorEdit.jsx";
import Sectordelete from "./Sectordelete.jsx";

const useStyles = makeStyles({
  "@global": {
    ".MuiTreeItem-root.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label":
      {
        backgroundColor: "white",
      },
    ".MuiTreeItem-root.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label:hover, .MuiTreeItem-root.Mui-selected:focus > .MuiTreeItem-content .MuiTreeItem-label":
      {
        backgroundColor: "blue",
      },
  },
});

const Structure = (props) => {
  const [formData, setFormData] = useState({
    subtask_status: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditMajorTaskModal, setShowEditMajorTaskModal] = useState(false);
  const [showAddSubTaskModal, setShowAddSubTaskModal] = useState(false);
  const [showMajorTaskTrashModal, setShowMajorTaskTrashModal] = useState(false);
  const [showSubtasktrashModal, setShowSubtasktrashModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedItems, setExpandedItems] = useState([]);
  const [showOptions, setShowOptions] = useState({});
  const [showSubtaskOptions, setShowSubtaskOptions] = useState({});
  const [showSubsubtaskOptions, setShowSubsubtaskOptions] = useState({});
  const [createDepartment, setCreateDepartment] = useState(0);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [selectedSubtaskIndex, setSelectedSubtaskIndex] = useState(null);

  const [expandedOrganization, setExpandedOrganization] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState([]);
  const [showEditSubtaskModal, setShowEditSubtaskModal] = useState(false);
  const [expandedSubtasks, setExpandedSubtasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [subTasks, setSubTasks] = useState([]);
  const [updateDepartment, setUpdateDepartment] = useState(0);
  const [deleteDepartment, setDeleteDepartment] = useState(0);
  const [sectorAssignmemberModalOpen, setSectorAssignmemberModalOpen] =
    useState(false);

  //orgn
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editClusterModalOpen, setEditClusterModalOpen] = useState(false);
  const [deleteClusterModalOpen, setDeleteClusterModalOpen] = useState(false);

  const [leader, setLeader] = useState("");
  const [structureName, setStructureName] = useState(
    "Organizational Structure"
  );
  const [noOrganization, setNoOrganization] = useState("loading ...");
  const [organizationData, setOrganizationData] = useState([]);
  const [clusterData, setClusterData] = useState([]);
  const [updateOrganization, setUpdateOrganization] = useState(0);
  const [createOrganization, setCreateOrganization] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deleteDepartmentModalOpen, setDeleteDepartmentModalOpen] =
    useState(false);

  const [createSector, setCreateSector] = useState(0);
  const [updateSector, setUpdateSector] = useState(0);
  const [deleteSector, setDeleteSector] = useState(0);
  const [assignmembertosector, setAssignmembertosector] = useState(0);
  const [assignmembertodepartment, setAssignmembertodepartment] = useState(0);
  const [addprojecttodepartment, setAddprojecttodepartment] = useState(0);
  const [addprojecttodepartmentOpen, setAddProjecttodepartmentOpen] =
    useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addSectorModalOpen, setAddSectorModalOpen] = useState(false);
  const [editDepartmentModalOpen, setEditDepartmentModalOpen] = useState(false);

  const [permissions, setPermissions] = useState(() => {
    return JSON.parse(localStorage.getItem("permissions")) || [];
  });
  const [userInfo, setUserInfo] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo")) || [];
  });
  const [projectPermissions, setProjectPermissions] = useState(() => {
    return JSON.parse(localStorage.getItem("project_permissions")) || [];
  });
  const [loading, setLoading] = useState(false);
  const [noActivity, setNoActivity] = useState();
  const [selectedActivity, setSelectedActivity] = useState({});
  const [selectedTask, setSelectedTask] = useState({});
  const [selectedSubTask, setSelectedSubTask] = useState({});
  const [organizationaddModalOpen, setOrganizationAddModalOpen] =
    useState(false);
  const [addDepartmentModalOpen, setAddDepartmentModalOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);

  const [selectedSectorId, setSelectedSectorId] = useState(null);
  const modalRef = useRef(null);

  const handleToggle = (itemId) => {
    setExpandedItems((prevExpanded) => {
      if (prevExpanded.includes(itemId)) {
        return prevExpanded.filter((item) => item !== itemId);
      } else {
        return [...prevExpanded, itemId];
      }
    });
  };

  const toggleModal = () => setShowModal(!showModal);
  const toggleEditMajorTaskModal = (index) => {
    setSelectedTaskIndex(index);
    setShowEditMajorTaskModal(!showEditMajorTaskModal);
  };

  const handleSectorAssignmemberModalClose = () => {
    setSectorAssignmemberModalOpen(false);
  };
  const handleAddProjecttodepartmentModalClose = () => {
    setAddProjecttodepartmentOpen(false);
  };

  const handleSectorAssignMemberClick = (row) => {
    setSelectedRow(row);
    setSectorAssignmemberModalOpen(true);
  };

  const toggleAddTaskModal = () => setShowAddTaskModal(!showAddTaskModal);
  const toggleAddSubTaskModal = () =>
    setShowAddSubTaskModal(!showAddSubTaskModal);
  const toggleMajorTaskTrashModal = (index) => {
    setSelectedTaskIndex(index);
    setShowMajorTaskTrashModal(!showMajorTaskTrashModal);
  };
  const handleDeleteDepartmentClick = (row) => {
    setSelectedRow(row);
    setDeleteDepartmentModalOpen(true);
  };
  const toggleSubtasktrashModal = (index) => {
    setSelectedTaskIndex(index);
    setShowSubtasktrashModal(!showSubtasktrashModal);
  };
  const toggleEditSubtaskModal = () => {
    setShowEditSubtaskModal(!showEditSubtaskModal);
  };

  const toggleSubtask = (
    organizationIndex,
    clusterIndex,
    selectedDepartmentIndex
  ) => {
    const subtaskKey = `${organizationIndex}-${clusterIndex}-${selectedDepartmentIndex}`;
    setExpandedSubtasks((prevState) => {
      if (prevState.includes(subtaskKey)) {
        return prevState.filter((item) => item !== subtaskKey);
      } else {
        return [...prevState, subtaskKey];
      }
    });
  };

  const handlefetchTask = async () => {
    try {
      const taskData = await apiService.getAllTasks(
        props.setSelectedProjectInfo.project_id,
        userInfo.access_token
      );
      const sortedResponse = taskData.sort((a, b) => {
        if (a.createdAt > b.createdAt) {
          return -1;
        }
      });
      setTasks(sortedResponse);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handlefetchSubTask = async () => {
    try {
      const taskData = await apiService.getAllSubTasks(
        props.setSelectedProjectInfo.project_id,
        userInfo.access_token
      );
      const sortedResponse = taskData.sort((a, b) => {
        if (a.createdAt > b.createdAt) {
          return -1;
        }
      });
      setSubTasks(sortedResponse);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
  const handleAddTaskModalClose = () => {
    setShowAddTaskModal(false);
  };
  const handleAddDepartmentClick = (sectorId) => {
    setSelectedSectorId(sectorId);
    setAddDepartmentModalOpen(true);
  };
  const handleAddProjecttodepartment = (selectedDepartment) => {
    setSelectedDepartmentId(selectedDepartment.division_id);
    setAddProjecttodepartmentOpen(true);
  };

  const handleEditDepartmentClick = (row) => {
    setSelectedRow(row);
    setEditDepartmentModalOpen(true);
  };
  const handleEditDepartmentModalClose = () => {
    setEditDepartmentModalOpen(false);
  };
  const handleDeleteDepartmentModalClose = () => {
    setDeleteDepartmentModalOpen(false);
  };

  const handleAddDepartmentModalClose = () => {
    setAddDepartmentModalOpen(false);
  };
  const handleStatusChange = async (selectedStatus, sub_task_id) => {
    formData.subtask_status = selectedStatus;
    try {
      const response = await apiService.updateSubTaskStatus(
        formData,
        sub_task_id
      );

      if (response.status === 200) {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });

        Toast.fire({
          icon: "success",
          title: "Sub Task Updated Successfully",
        }).then(() => {
          fetchData();
        });
      } else {
        console.error("failed : ", response);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Sub Task Status Update Failed",
          showConfirmButton: true,
          timer: 1500,
          customClass: {
            popup: "custom-popup-style",
          },
        });
      }
    } catch (error) {
      console.error("Sub Task Status Update failed:", error.message);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Sub Task Status Update Failed",
        showConfirmButton: true,
        timer: 1500,
        customClass: {
          popup: "custom-popup-style",
        },
      });
    }
  };
  const handleEditTaskModalClose = () => {
    setShowEditMajorTaskModal(false);
  };
  const handleClusterDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteClusterModalOpen(true);
  };
  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };
  const handleEditSubTaskModalClose = () => {
    setShowEditSubtaskModal(false);
  };
  const handleAddSectorClick = () => {
    setAddSectorModalOpen(true);
  };
  const handleAddSubModalClose = () => {
    setShowAddSubTaskModal(false);
  };

  const toggleAddSubSubTaskModal = () => {};

  const handleClickOutsideModal = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShowModal(false);
      setShowEditMajorTaskModal(false);
      setShowAddTaskModal(false);
      setShowAddSubTaskModal(false);
      setShowMajorTaskTrashModal(false);
      setShowSubtasktrashModal(false);
      setShowEditSubtaskModal(false);
      setShowOptions({});
      setShowSubtaskOptions({});
      setSelectedTaskIndex(null);
      setSelectedSubtaskIndex(null);
    }
  };

  const toggleOptions = (
    organizationIndex,
    clusterIndex,
    selectedDepartmentIndex,
    subselectedDepartmentIndex
  ) => {
    setSelectedTaskIndex(clusterIndex);
    setShowOptions((prevOptions) => ({
      ...prevOptions,
      [`${organizationIndex}-${clusterIndex}`]:
        !prevOptions[`${organizationIndex}-${clusterIndex}`],
    }));
  };

  const toggleSubtaskOptions = (
    organizationIndex,
    clusterIndex,
    selectedDepartmentIndex
  ) => {
    setSelectedSubtaskIndex(selectedDepartmentIndex);
    setShowSubtaskOptions((prevOptions) => ({
      ...prevOptions,
      [`${organizationIndex}-${clusterIndex}-${selectedDepartmentIndex}`]:
        !prevOptions[
          `${organizationIndex}-${clusterIndex}-${selectedDepartmentIndex}`
        ],
    }));
  };

  const toggleActivity = async (index) => {
    if (expandedOrganization.includes(index)) {
      setExpandedOrganization(
        expandedOrganization.filter((item) => item !== index)
      );
    } else {
      setExpandedOrganization([...expandedOrganization, index]);
    }
  };
  const toggleTask = (organizationIndex, clusterIndex) => {
    const taskKey = `${organizationIndex}-${clusterIndex}`;
    if (expandedTasks.includes(taskKey)) {
      setExpandedTasks(expandedTasks.filter((item) => item !== taskKey));
    } else {
      setExpandedTasks([...expandedTasks, taskKey]);
    }
  };
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrganization();

      const sortedResponse = response.organization.sort((a, b) => {
        if (a.createdAt > b.createdAt) {
          return -1;
        }
      });
      console.log(sortedResponse);
      setOrganizationData(sortedResponse);
      setLeader(response.leader);
      organizationData.length === 0
        ? setNoOrganization("No Organization Found")
        : setNoOrganization("loading ...");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchClusters = async () => {
    try {
      setLoading(true);
      const organizationsData = await apiService.getallOrganizations(
        userInfo.access_token
      );
      console.log("Fetched organizations:", organizationsData);
      const sortedResponse = organizationsData.sort((a, b) => {
        if (a.sector.createdAt > b.sector.createdAt) {
          return -1;
        }
      });
      setTimeout(() => {
        setClusterData(sortedResponse);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const search = organizationData.filter(
    (row) =>
      row.name &&
      row.name
        .toLowerCase()
        .includes(searchTerm ? searchTerm.toLowerCase() : "")
  );
  const handleEditClick = (row) => {
    setSelectedRow(row);
    console.log("dfv", row);
    setEditModalOpen(true);
  };
  const handleClusterEditClick = (row) => {
    setSelectedRow(row);
    setEditClusterModalOpen(true);
  };
  const handleClusterDeleteModalClose = () => {
    setDeleteClusterModalOpen(false);
  };
  const handleOrganizationAddClick = (row) => {
    setSelectedRow(row);
    setOrganizationAddModalOpen(true);
  };
  const handleAddProjecttodepartmentClick = (row) => {
    setSelectedRow(row);
    setAddProjecttodepartmentOpen(true);
  };
  const handleOrganizationAddModalClose = () => {
    setOrganizationAddModalOpen(false);
  };
  const handleAddSectorModalClose = () => {
    setAddSectorModalOpen(false);
  };

  const handleEditClusterModalClose = () => {
    setEditClusterModalOpen(false);
  };

  const indexOfLastActivity = currentPage;
  const indexOfFirstActivity = indexOfLastActivity;

  const currentOrganization = search.slice(currentPage);

  const handleFilterClick = (status) => {
    setStatusFilter(status);
    setCurrentPage();
  };
  useEffect(() => {
    fetchData();
    fetchClusters();

    async function fetchUsers() {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    }
    async function fetchProjectPermissions() {
      localStorage.setItem(
        "project_permissions",
        JSON.stringify(projectPermissions)
      );
    }

    fetchUsers();
    fetchProjectPermissions();

    const CREATE_ORGANIZATION = permissions.filter(
      (permission) => permission.name === PERMISSIONS.CREATE_ORGANIZATION
    );

    const UPDATE_ORGANIZATION = permissions.filter(
      (permission) => permission.name === PERMISSIONS.UPDATE_ORGANIZATION
    );

    const CREATE_SECTOR = permissions.filter(
      (permission) => permission.name === PERMISSIONS.CREATE_SECTOR
    );

    const UPDATE_SECTOR = permissions.filter(
      (permission) => permission.name === PERMISSIONS.UPDATE_SECTOR
    );

    const DELETE_SECTOR = permissions.filter(
      (permission) => permission.name === PERMISSIONS.DELETE_SECTOR
    );

    const ASSIGN_MEMBER_TO_SECTOR = permissions.filter(
      (permission) => permission.name === PERMISSIONS.ASSIGN_MEMBER_TO_SECTOR
    );
    const CREATE_ORGANIZATION_UNIT = permissions.filter(
      (permission) => permission.name === PERMISSIONS.CREATE_ORGANIZATION_UNIT
    );

    const UPDATE_ORGANIZATION_UNIT = permissions.filter(
      (permission) => permission.name === PERMISSIONS.UPDATE_ORGANIZATION_UNIT
    );

    const DELETE_ORGANIZATION_UNIT = permissions.filter(
      (permission) => permission.name === PERMISSIONS.DELETE_ORGANIZATION_UNIT
    );
    const ADD_PROJECT_TO_DEPARTMENT = permissions.filter(
      (permission) => permission.name === PERMISSIONS.ADD_PROJECT_TO_DEPARTMENT
    );

    setCreateDepartment(CREATE_ORGANIZATION_UNIT.length);
    setUpdateDepartment(UPDATE_ORGANIZATION_UNIT.length);
    setDeleteDepartment(DELETE_ORGANIZATION_UNIT.length);
    setCreateOrganization(CREATE_ORGANIZATION.length);
    setUpdateOrganization(UPDATE_ORGANIZATION.length);
    setCreateSector(CREATE_SECTOR.length);
    setUpdateSector(UPDATE_SECTOR.length);
    setDeleteSector(DELETE_SECTOR.length);
    setAssignmembertosector(ASSIGN_MEMBER_TO_SECTOR.length);
    setAddprojecttodepartment(ADD_PROJECT_TO_DEPARTMENT.length);

    setAssignmembertodepartment(ASSIGN_MEMBER_TO_SECTOR.length);
  }, [userInfo, permissions]);

  const handleSubtaskAssigneeClick = () => {
    setShowModal(true);
  };

  const classes = useStyles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <Helmet>
        <title>PMS - Organizational Structure</title>
      </Helmet>

      <div className=" mx-auto">
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
          className="backdrop-blur-sm"
        >
          <PuffLoader color="#3b82f6" size={60} />
        </Backdrop>

        {/* Header */}
        <div className="">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 bg-black bg-clip-text text-transparent">
                Organizational Structure
              </h1>
              <p className="text-gray-600 mt-2">
                Visualize and manage your company hierarchy with precision
              </p>
            </div>

            {organizationData.length === 0 && createOrganization !== 0 && (
              <button
                onClick={() => handleOrganizationAddClick()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <AddCircleOutlineIcon />
                <span>Add Organization</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl  border border-gray-200 overflow-hidden">
          {organizationData.length !== 0 ? (
            <div className="p-4 md:p-8">
              <Box
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "24px",
                  backgroundColor: "white",
                }}
                className="overflow-x-auto"
              >
                <SimpleTreeView className="min-w-[600px] lg:min-w-full">
                  {organizationData.map(
                    (organizationItem, organizationIndex) => (
                      <TreeItem
                        key={organizationItem.id}
                        itemId={organizationItem.id}
                        label={
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-colors duration-200">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                                <img
                                  className="w-8 h-8 object-contain"
                                  src={`${BASE_URL}/images/${organizationItem.logo}`}
                                  alt={`${organizationItem.name} logo`}
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/32";
                                  }}
                                />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {organizationItem.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {
                                    clusterData.filter(
                                      (cluster) =>
                                        cluster.sector.organization_id ===
                                        organizationItem.id
                                    ).length
                                  }{" "}
                                  clusters
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              {createSector !== 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddSectorClick();
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                                >
                                  <AddCircleOutlineIcon
                                    style={{ fontSize: 18 }}
                                  />
                                  <span>Add Cluster</span>
                                </button>
                              )}

                              {updateOrganization !== 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(organizationItem);
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-blue-600 hover:text-blue-800"
                                  title="Edit Organization"
                                >
                                  <FaEdit size={18} />
                                </button>
                              )}
                            </div>
                          </div>
                        }
                      >
                        {clusterData
                          .filter(
                            (clusterItem) =>
                              clusterItem.sector.organization_id ===
                              organizationItem.id
                          )
                          .map((clusterItem, clusterIndex) => (
                            <TreeItem
                              key={`task-${organizationIndex}-${clusterIndex}`}
                              itemId={`task-${organizationIndex}-${clusterIndex}`}
                              label={
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200 ml-0 md:ml-6 mt-2">
                                  <div className="md:col-span-5">
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg border border-gray-200 shadow-sm">
                                        <CircleIcon
                                          className="text-blue-500 text-opacity-70"
                                          style={{ fontSize: 16 }}
                                        />
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-800">
                                          {clusterItem.sector.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                          {clusterItem.sector.Divisions
                                            ?.length || 0}{" "}
                                          departments
                                        </p>
                                      </div>
                                      {createSector !== 0 && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddDepartmentClick(
                                              clusterItem.sector.sector_id
                                            );
                                          }}
                                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-xs font-medium ml-2"
                                        >
                                          <AddCircleOutlineIcon
                                            style={{ fontSize: 16 }}
                                          />
                                          <span>Add Department</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="md:col-span-3">
                                    <div className="flex items-center gap-2 text-gray-700">
                                      <AccountCircleIcon className="text-blue-500" />
                                      <span className="font-medium">
                                        {clusterItem.leader.length !== 0 ? (
                                          clusterItem.leader[0].full_name
                                        ) : (
                                          <span className="text-gray-400 italic">
                                            To be assigned
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="md:col-span-4">
                                    <div className="flex items-center justify-end gap-3">
                                      {updateSector !== 0 && (
                                        <button
                                          onClick={() =>
                                            handleClusterEditClick(clusterItem)
                                          }
                                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-blue-600 hover:text-blue-800"
                                          title="Edit Cluster"
                                        >
                                          <FaEdit size={16} />
                                        </button>
                                      )}
                                      {deleteSector !== 0 && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleClusterDeleteClick(
                                              clusterItem
                                            );
                                          }}
                                          className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 text-red-500 hover:text-red-700"
                                          title="Delete Cluster"
                                        >
                                          <FaTrash size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              }
                            >
                              {clusterItem.sector.Divisions &&
                                clusterItem.sector.Divisions.map(
                                  (
                                    selectedDepartment,
                                    selectedDepartmentIndex
                                  ) => (
                                    <TreeItem
                                      key={`subtask-${organizationIndex}-${clusterIndex}-${selectedDepartmentIndex}`}
                                      itemId={`subtask-${organizationIndex}-${clusterIndex}-${selectedDepartmentIndex}`}
                                      label={
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors duration-200 ml-0 md:ml-12 mt-2">
                                          <div className="md:col-span-4">
                                            <div className="flex items-center gap-3">
                                              <div className="flex items-center justify-center w-6 h-6 bg-white rounded-md border border-gray-200 shadow-sm">
                                                <span className="text-xs font-medium text-gray-600">
                                                  {selectedDepartmentIndex + 1}
                                                </span>
                                              </div>
                                              <div>
                                                <h5 className="font-medium text-gray-800">
                                                  {selectedDepartment.name}
                                                </h5>
                                                <p className="text-sm text-gray-600 mt-1">
                                                  {selectedDepartment.Users
                                                    ?.length || 0}{" "}
                                                  members
                                                </p>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="md:col-span-3">
                                            <div className="flex items-center gap-2 text-gray-700">
                                              <AccountCircleIcon className="text-blue-500" />
                                              <span className="font-medium">
                                                {selectedDepartment.Users &&
                                                selectedDepartment.Users
                                                  .length !== 0 ? (
                                                  selectedDepartment.Users.find(
                                                    (user) =>
                                                      user.is_division_leader
                                                  )?.full_name || (
                                                    <span className="text-gray-400 italic">
                                                      To be assigned
                                                    </span>
                                                  )
                                                ) : (
                                                  <span className="text-gray-400 italic">
                                                    To be assigned
                                                  </span>
                                                )}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="md:col-span-5">
                                            <div className="flex flex-wrap items-center justify-end gap-3">
                                              {addprojecttodepartment !== 0 && (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddProjecttodepartment(
                                                      selectedDepartment
                                                    );
                                                  }}
                                                  className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 transition-colors duration-200 text-xs font-medium"
                                                >
                                                  <AddCircleOutlineIcon
                                                    style={{ fontSize: 14 }}
                                                  />
                                                  <span>Add Project</span>
                                                </button>
                                              )}

                                              {assignmembertodepartment !==
                                                0 && (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSectorAssignMemberClick(
                                                      selectedDepartment
                                                    );
                                                  }}
                                                  className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 transition-colors duration-200 text-xs font-medium"
                                                >
                                                  <PersonAddAlt1Icon
                                                    style={{ fontSize: 14 }}
                                                  />
                                                  <span>Assign Members</span>
                                                </button>
                                              )}

                                              <div className="flex items-center gap-2">
                                                {updateDepartment !== 0 && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleEditDepartmentClick(
                                                        selectedDepartment
                                                      );
                                                    }}
                                                    className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-blue-600 hover:text-blue-800"
                                                    title="Edit Department"
                                                  >
                                                    <FaEdit size={14} />
                                                  </button>
                                                )}
                                                {deleteDepartment !== 0 && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDeleteDepartmentClick(
                                                        selectedDepartment
                                                      );
                                                    }}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors duration-200 text-red-500 hover:text-red-700"
                                                    title="Delete Department"
                                                  >
                                                    <FaTrash size={12} />
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      }
                                    />
                                  )
                                )}
                            </TreeItem>
                          ))}
                      </TreeItem>
                    )
                  )}
                </SimpleTreeView>
              </Box>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <AccountCircleIcon
                  className="text-gray-400"
                  style={{ fontSize: 48 }}
                />
              </div>
              <Typography variant="h6" className="text-gray-500 mb-4">
                {noOrganization}
              </Typography>
              {createOrganization !== 0 && (
                <button
                  onClick={() => handleOrganizationAddClick()}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create Your First Organization
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {organizationaddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Add Organization
                </h2>
                <button
                  onClick={handleOrganizationAddModalClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <Addorganization
                handleCloseModal={handleOrganizationAddModalClose}
                handlefetchOrganization={fetchData}
              />
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Edit Organization
                </h2>
                <button
                  onClick={handleEditModalClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <Editorganization
                leader={leader}
                selectedRow={selectedRow}
                handleCloseModal={handleEditModalClose}
                handlefetchOrganization={fetchData}
              />
            </div>
          </div>
        </div>
      )}

      {addSectorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Add Cluster
                </h2>
                <button
                  onClick={handleAddSectorModalClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <SectorAdd
                handlefetchSectors={fetchClusters}
                handleCloseModal={handleAddSectorModalClose}
              />
            </div>
          </div>
        </div>
      )}

      {addDepartmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Add Department
                </h2>
                <button
                  onClick={handleAddDepartmentModalClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <DivisionAdd
                handlefetchClusters={fetchClusters}
                selectedSectorId={selectedSectorId}
                handleCloseModal={handleAddDepartmentModalClose}
              />
            </div>
          </div>
        </div>
      )}

      {editClusterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Edit Cluster
                </h2>
                <button
                  onClick={handleEditClusterModalClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <SectorEdit
                handlefetchClusters={fetchClusters}
                handleCloseModal={handleEditClusterModalClose}
                selectedRow={selectedRow}
              />
            </div>
          </div>
        </div>
      )}

      {deleteClusterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Delete Cluster
                </h2>
                <button
                  onClick={handleClusterDeleteModalClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <Sectordelete
                handlefetchClusters={fetchClusters}
                handleDeleteModalClose={handleClusterDeleteModalClose}
                selectedRow={selectedRow}
              />
            </div>
          </div>
        </div>
      )}

      {editDepartmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Edit Department
                </h2>
                <button
                  onClick={handleEditDepartmentModalClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <Organizationaluniteditt
                selectedRow={selectedRow}
                selectedDepartmentId={selectedDepartmentId}
                handlefetchOrganizationalunit={fetchClusters}
                handleCloseModal={handleEditDepartmentModalClose}
              />
            </div>
          </div>
        </div>
      )}

      {deleteDepartmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Delete Department
                </h2>
                <button
                  onClick={handleDeleteDepartmentModalClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <OrganizationalUnitdelete
                selectedRow={selectedRow}
                handlefetchClusters={fetchClusters}
                handleDeleteDepartmentModalClose={
                  handleDeleteDepartmentModalClose
                }
              />
            </div>
          </div>
        </div>
      )}

      {addprojecttodepartmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Add Project to Department
                </h2>
                <button
                  onClick={handleAddProjecttodepartmentModalClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <Addprojecttodepartment
                selectedRow={selectedRow}
                selectedDepartmentId={selectedDepartmentId}
                handleAddProjecttodepartmentModalClose={
                  handleAddProjecttodepartmentModalClose
                }
              />
            </div>
          </div>
        </div>
      )}

      {sectorAssignmemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Assign Members to Department
                </h2>
                <button
                  onClick={handleSectorAssignmemberModalClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <Departmentassignmembers
                selectedRow={selectedRow}
                handlefetchOrganizationalunit={fetchClusters}
                handleSectorAssignmemberModalClose={
                  handleSectorAssignmemberModalClose
                }
                selectedDepartmentId={selectedDepartmentId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Structure;
