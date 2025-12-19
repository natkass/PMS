import axios from "axios";
import { BASE_URL } from "../../config";
// import { useAuth } from "../PMS/AuthContext";
// const userInfo=JSON.parse(localStorage.getItem("userInfo"))
// const token=userInfo.access_token||null
const instance = axios.create({
  baseURL: BASE_URL,
  // headers: { "Content-Type": "multipart/form-data" },
});
let refreshAccessToken = null;
export const setRefreshAccessToken = (refreshFunction) => {
  refreshAccessToken = refreshFunction;
};
const apiService = {
  login: async (email, password) => {
    try {
      const response = await instance.post("/ums/login", { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  handleTokenRefresh: async (originalRequest) => {
    try {
      if (!refreshAccessToken) {
        throw new Error("Refresh token function not set");
      }

      await refreshAccessToken();
      const accessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return instance(originalRequest);
    } catch (refreshError) {
      throw refreshError;
    }
  },

  getDivisions: async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await instance.get(
        "/organization/division/getalldivision",
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSectors: async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await instance.get(
        "/organization/sector/getallsector",
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getRoleById: async (roleId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await instance.get(
        `/organization/role/${roleId}/getallpermissions`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateOrganization: async (data) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await instance.post(
        `/settings/updateOrganization/${data.selectedRow.organization_id}`,
        data,
        config
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateSector: async (data, sector_id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await instance.put(
        `/organization/sector/updatesector/${sector_id}`,
        data,
        config
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateDepartment: async (selectedRow, formData) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      console.log(formData);
      const response = await instance.put(
        `/organization/division/updatedivision/${selectedRow.division.division_id}`,
        formData,
        config
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getRoles: async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get(
        "/organization/role/getallroles",
        config
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getprojectRoles: async () => {
    try {
      const response = await instance.get(
        "/organization/role/getallprojectroles"
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getOrganization: async () => {
    try {
      const response = await instance.get("/settings/getOrganization");
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  Organizationadd: async (organizationData) => {
    try {
      console.log("orgn calling ...");
      console.log(organizationData);
      const response = await instance.post(
        "/settings/AddOrganization",
        organizationData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getallRoles: async () => {
    try {
      const response = await instance.get("/organization/role/getallroles");
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getPermission: async () => {
    try {
      const response = await instance.get("/organization/getallpermissions");
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchEmployees: async (id) => {
    try {
      const response = await instance.get("/organization/division/users/" + id);
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  addRole: async (newRole) => {
    try {
      const response = await instance.post("organization/role/add", newRole);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addorganizationalunit: async (Division) => {
    try {
      const response = await instance.post(
        "organization/division/newdivision",
        Division
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  assigntodepartment: async (division_id, formData) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = {
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },
      };

      // Log FormData entries for debugging purposes
      console.log("Form Data before sending:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Log the endpoint URL
      const url = `/organization/division/assignUser/${division_id}`;
      console.log("Endpoint URL:", url);

      const response = await instance.post(url, formData, config); // Use instance here
      return response;
    } catch (error) {
      console.error("Error in assigntodepartment:", error);
      throw error;
    }
  },
  updateRole: async (data) => {
    try {
      const response = await instance.put(
        `/organization/role/${data.id}/update`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getAllUsers: async (token) => {
    // const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    // const token = userInfo.access_token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const response = await instance.get("/ums/findalluser", config);
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUsers: async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const token = userInfo.access_token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const response = await instance.get(
        `/ums/finduser/${userInfo.foundUser.user_id}`,
        config
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getSpecificRolePermission: async (id) => {
    console.log(id);
    try {
      const response = await instance.get(
        "/organization/role/" + id + "/getallpermissions"
      );
      // console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  registerUser: async (userData) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await instance.post(
        "/ums/registerUser",
        userData,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  projectadd: async (projectData) => {
    try {
      console.log("project calling ...");
      console.log(projectData);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await instance.post(
        "/project/project/add",
        projectData,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  milestoneadd: async (milestonesData) => {
    try {
      console.log("milestone calling ...");
      console.log(milestonesData);
      const response = await instance.post(
        "/project/milestone/newMilestone",
        milestonesData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  activityadd: async (activityData, selectedProject) => {
    try {
      console.log("activity calling ...");
      console.log(activityData);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await instance.post(
        `/project/activity/newactivity/${selectedProject}`,
        activityData,
        config
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // addComment: async (commentData, params) => {
  //   console.log(params);
  //   try {
  //     const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  //     const token = userInfo?.access_token;
  //     if (!token) {
  //       throw new Error("No token found");
  //     }
  //     const config = { headers: { Authorization: `Bearer ${token}` } };
  //     const response = await instance.post(
  //       `/project/newcommentactivity/${params.activity_id}`,
  //       commentData,
  //       config
  //     );
  //     return response;
  //   } catch (error) {
  //     throw error;
  //   }
  // },
  // getAllActivityComments: async (activity_id) => {
  //   try {
  //     const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  //     const token = userInfo?.access_token;
  //     if (!token) {
  //       throw new Error("No token found");
  //     }
  //     const config = { headers: { Authorization: `Bearer ${token}` } };
  //     const response = await instance.get(
  //       `/project/getAllacommentOfActivity/${activity_id}`,
  //       config
  //     );

  //     return response.data;
  //   } catch (error) {
  //     console.error("Error fetching activity comments:", error);
  //     throw error;
  //   }
  // },
  // getAllSubtaskComments: async (sub_task_id) => {
  //   try {
  //     const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  //     const token = userInfo?.access_token;
  //     if (!token) {
  //       throw new Error("No token found");
  //     }
  //     const config = { headers: { Authorization: `Bearer ${token}` } };
  //     if (!sub_task_id) {
  //       throw new Error("sub_task_id is undefined");
  //     }
  //     const response = await instance.get(
  //       `/project/getAllacommentOfSubtask/${sub_task_id}`,
  //       config
  //     );
  //     console.log("API response:", response); // Log the API response
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error fetching subtask comments:", error);
  //     throw error;
  //   }
  // },

  // addSubtaskComment: async (commentData, params) => {
  //   console.log(params);
  //   try {
  //     const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  //     const token = userInfo?.access_token;
  //     if (!token) {
  //       throw new Error("No token found");
  //     }
  //     const config = { headers: { Authorization: `Bearer ${token}` } };
  //     const response = await instance.post(
  //       `/project/newcommentsubtask/${params.sub_task_id}`,
  //       commentData,
  //       config
  //     );
  //     return response;
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  // Get comments with advanced filtering
  getComments: async (params = {}) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;
      if (!token) {
        throw new Error("No token found");
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params,
      };

      const response = await instance.get("/comments", config);
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  // Create a new comment
  createComment: async (commentData) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;
      if (!token) {
        throw new Error("No token found");
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      let endpoint = "/comments/comment";
      if (commentData.activity_id) {
        endpoint = `/comments/comment/activity/${commentData.activity_id}`;
      } else if (commentData.sub_task_id) {
        endpoint = `/comments/comment/subtask/${commentData.sub_task_id}`;
      } else if (commentData.project_id) {
        endpoint = `/comments/comment/project/${commentData.project_id}`;
      }

      const response = await instance.post(endpoint, commentData, config);
      return response;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  },

  // Update a comment
  updateComment: async (commentId, updateData) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;
      if (!token) {
        throw new Error("No token found");
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.put(
        `/comments/comment/${commentId}`,
        updateData,
        config
      );
      return response;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;
      if (!token) {
        throw new Error("No token found");
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.delete(
        `/comments/comment/${commentId}`,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  // Toggle like on a comment
  toggleLike: async (commentId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;
      if (!token) {
        throw new Error("No token found");
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await instance.post(
        `/comments/comment/${commentId}/like`,
        {},
        config
      );

      return response;
    } catch (error) {
      console.error("Error liking comment:", error);
      throw error;
    }
  },

  // Toggle pin status
  togglePin: async (commentId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;
      if (!token) {
        throw new Error("No token found");
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.post(
        `/comments/comment/${commentId}/pin`,
        {},
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error toggling pin:", error);
      throw error;
    }
  },

  // Upload attachment
  uploadAttachment: async (commentId, file) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;
      if (!token) {
        throw new Error("No token found");
      }

      const formData = new FormData();
      formData.append("file", file);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await instance.post(
        `/comments/${commentId}/attachments`,
        formData,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading attachment:", error);
      throw error;
    }
  },

  // Remove attachment
  removeAttachment: async (attachmentId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;
      if (!token) {
        throw new Error("No token found");
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.delete(
        `/comments/attachments/${attachmentId}`,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error removing attachment:", error);
      throw error;
    }
  },

  // Get comment statistics
  getCommentStats: async (params = {}) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;
      if (!token) {
        throw new Error("No token found");
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params,
      };

      const response = await instance.get("/comments/stats", config);
      return response.data;
    } catch (error) {
      console.error("Error fetching comment stats:", error);
      throw error;
    }
  },

  // Get user comments
  getUserComments: async (userId, params = {}) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;
      if (!token) {
        throw new Error("No token found");
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params,
      };

      const response = await instance.get(`/comments/user/${userId}`, config);
      return response.data;
    } catch (error) {
      console.error("Error fetching user comments:", error);
      throw error;
    }
  },

  // Legacy methods for backward compatibility
  getAllActivityComments: async (activity_id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;
      if (!token) {
        throw new Error("No token found");
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { activity_id },
      };
      const response = await instance.get("/comments/comment", config);
      return response.data;
    } catch (error) {
      console.error("Error fetching activity comments:", error);
      throw error;
    }
  },

  getAllSubtaskComments: async (sub_task_id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;
      if (!token) {
        throw new Error("No token found");
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { sub_task_id },
      };
      const response = await instance.get("/comments/comment", config);
      return response.data;
    } catch (error) {
      console.error("Error fetching subtask comments:", error);
      throw error;
    }
  },

  addComment: async (commentData, params) => {
    return apiService.createComment({
      ...commentData,
      activity_id: params?.activity_id,
      sub_task_id: params?.sub_task_id,
      project_id: params?.project_id,
    });
  },

  addSubtaskComment: async (commentData, params) => {
    return apiService.createComment({
      ...commentData,
      sub_task_id: params?.sub_task_id,
    });
  },
  updateSubTask: async (commentData, params) => {
    return apiService.createComment({
      ...commentData,
      sub_task_id: params?.sub_task_id,
    });
  },

  taskadd: async (taskData, activity_id) => {
    try {
      console.log("task calling ...");
      console.log(taskData);
      const response = await instance.post(
        `/project/task/newTask/${activity_id}`,
        taskData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTask: async (data, task_id) => {
    try {
      const response = await instance.post(
        `/project/updateTask/${task_id}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  subtaskadd: async (subTaskData, task_id) => {
    try {
      console.log("task calling ...");
      console.log(subTaskData);
      const response = await instance.post(
        `/project/sub_task/newSubTask/${task_id}`,
        subTaskData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateSubTask: async (data, sub_task_id) => {
    try {
      const response = await instance.post(
        `/project/updateSub_task/${sub_task_id}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateSubTaskStatus: async (data, id) => {
    try {
      const response = await instance.post(
        `project/updateSub_taskstatus/${id}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  firstlogin: async (data) => {
    const currentPassword = data.currentPassword;
    const newPassword = data.newPassword;
    const userId = data.userId;

    try {
      const response = await instance.put(
        `/ums/profile/changepassword/${userId}`,
        { current_password: currentPassword, new_password: newPassword }
      );

      return response;
    } catch (error) {
      throw error.response.data;
    }
  },

  resetpassword: async ({ email, hash, password }) => {
    try {
      const response = await instance.post(
        `/ums/resetPassword?email=${email}&hash=${hash}`,
        {
          password,
        }
      );

      return response;
    } catch (error) {
      throw error.response.data;
    }
  },
  forgotpassword: async (email) => {
    try {
      const response = await instance.post(`/ums/forgotPassword`, { email });
      return response.data;
    } catch (error) {
      console.error("API error:", error.message);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        throw error.response.data;
      } else {
        throw new Error(
          "An unexpected error occurred. Please check the server and try again."
        );
      }
    }
  },

  updateUsers: async (user_id, data) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.put(
        `/ums/profile/update/${user_id}`,
        data,
        config
      );
      return response;
    } catch (error) {
      throw error.response.data;
    }
  },

  updateUserProfile: async (user_id, data) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.post(
        `/ums/profile/update_user_profile/${user_id}`,
        data,
        config
      );
      return response;
    } catch (error) {
      throw error.response;
    }
  },

  updateUserStatus: async (data) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log(config);
      const response = await instance.get(
        `/ums/profile/changeStatus/${data}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  updateActivity: async (data, activity_id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.post(
        `/project/updateactivity/${activity_id}`,
        data,
        config
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  getallOrganizations: async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get(
        "/organization/sector/getallsector",
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getAllProjects: async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get("/project/getAll", config);
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllProjectMembers: async (project_id) => {
    try {
      const response = await instance.get(
        `/project/getAllProjectMembers/${project_id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllSubTasksByMember: async (project_member_id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await instance.get(
        `/project/getsub_taskofmember/${project_member_id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateProject: async (selectedRow, newDataToSend) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      console.log(newDataToSend);

      const response = await instance.post(
        `/project/updateProject/${selectedRow.project_id}`,
        newDataToSend,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // getAllMilestones : async ( id, idType,token) => {
  //   let endpoint;

  //   switch(idType) {
  //     case 'project_id':
  //       endpoint = `/project/getAllmilestone/${idType}/${id}`;
  //       break;
  //     case 'activity_id':
  //       endpoint = `/project/getAllmilestone/${idType}/${id}`;
  //       break;
  //     case 'task_id':
  //       endpoint = `/project/getAllmilestone/${idType}/${id}`;
  //       break;
  //     default:
  //       throw new Error('Invalid ID type');
  //   }

  //   try {
  //     const response = await instance.get(endpoint, {
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       }
  //     });
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  getAllMilestone: async (idType, id, token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const endpoint = `project/getAllmilestone/${idType}/${id}`;
      const response = await instance.get(endpoint, config);
      console.log("API service response:", response);
      return response.data;
    } catch (error) {
      console.error(
        "API Error:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },

  getAllActivities: async (project_id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await instance.get(
        `/project/getAllactivity/${project_id}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getAllTasks: async (activity_id, token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await instance.get(
        `/project/getalltask/${activity_id}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // getAllMilestone: async (idType, id, token) => {
  //   try {
  //     const config = { headers: { Authorization: `Bearer ${token}` } };

  //     const response = await instance.get(
  //       `/project/getAllmilestone/${idType}/${id}`,
  //       config
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error('API Error:', error.response ? error.response.data : error.message);
  //     throw error;
  //   }
  // },

  getAllSubTasks: async (task_id, token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get(
        `/project/getAllSub_task/${task_id}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllSubTasks2: async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get(`/project/getAllSub_task`, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  documentTypegetAll: async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get(
        "/project/documentType/getAll",
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addDocumentType: async (userData) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await instance.post(
        "/project/documentType/add",
        userData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  documentgetAll: async (projectId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await instance.get(
        `/project/document/get/${projectId}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addDocument: async (documentData, projectId) => {
    try {
      const response = await instance.post(
        `/project/document/add/${projectId}`,
        documentData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  updateDocument: async (projectId, documentId, documentData) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.access_token;

      if (!token) {
        throw new Error("No token found");
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await instance.put(
        `/project/document/update/${projectId}/${documentId}`,
        documentData,
        config
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  addSectors: async (userData, token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.post(
        "/organization/sector/newsector",
        userData,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteSector: async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.delete(
        `/trash/deleteSector/${id}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteUser: async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.delete(`/trash/deleteUser/${id}`, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDeletedSectors: async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await instance.get("/trash/getDeletedSectors", config);
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  restoreSector: async (token, sectorId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get(
        `trash/restoreSector/${sectorId}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteDivision: async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.delete(
        `/trash/deleteDivision/${id}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDeletedDivisions: async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get("/trash/getDeletedDivisions", config);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  restoreDivision: async (token, divisionId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get(
        `/trash/restoreDivision/${divisionId}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteRole: async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.delete(`/trash/deleteRole/${id}`, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDeletedRoles: async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await instance.get("/trash/getDeletedRoles", config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  restoreRoles: async (token, roleId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get(
        `/trash/restoreRole/${roleId}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDeletedMembers: async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await instance.get("/trash/getDeletedUsers", config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteProject: async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.delete(
        `/trash/deleteProject/${id}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDeletedProjects: async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await instance.get("/trash/getDeletedProjects", config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  restoreProjects: async (token, project_id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get(
        `/trash/restoreProject/${project_id}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteActivity: async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.delete(
        `/trash/deleteActivity/${id}`,
        config
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  getDeletedActivities: async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get(`/trash/getDeletedActivity`, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  restoreActivities: async (token, activity_id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get(
        `/trash/restoreActivity/${activity_id}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.delete(`/trash/deleteTask/${id}`, config);
      return response;
    } catch (error) {
      throw error;
    }
  },
  getDeletedTasks: async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get(`/trash/getDeletedTask`, config);
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  restoreTasks: async (token, task_id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.get(
        `/trash/restoreTask/${task_id}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteSubTask: async (sub_task_id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await instance.delete(
        `/trash/deleteSubTask/${sub_task_id}`,
        config
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  getDeletedSubtasks: async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await instance.get(`/trash/getDeletedSubTask`, config);
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getAllNotifications: async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await instance.get("/project/notification", config);
      console.log(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  NotificationUpdate: async (user_id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo.access_token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await instance.put(
        `/project/notification/markasread/${user_id}`,
        config
      );
      console.log("notification responce ", response.data.message);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default apiService;
