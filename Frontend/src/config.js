//export const BASE_URL = "http://localhost:5000";
export const BASE_URL = "http://196.188.240.102/pms/api/api";
// export const SOCKET_URL = "http://196.188.240.102:5001";
export const SOCKET_URL = "http://localhost:5001";

export const PERMISSIONS = {
  // user permission
  REGISTER_NEW_USER: "register new user",
  GET_ALL_USER: "get all user",
  GET_SPECIFIC_USER: "get specific user",
  GET_PROFILE: "get profile",
  GET_ALL_ROLE: "get all role",
  CHANGE_USER_STATUS: "change user status",
  CHANGE_PASSWORD: "change password",
  UPDATE_USER: "update user",
  DELETE_USER: "delete user",
  VIEW_PASSWORD: "view password",
  VIEW_USERS: "view users",

  // organization permission
  CREATE_ORGANIZATION: "create organization",
  CREATE_ORGANIZATION_UNIT: "create organization unit",
  CREATE_STRUCTURE2: "create structure2",
  CREATE_SECTOR: "create sector",

  GET_STRUCTURE: "get structure",
  GET_STRUCTURE2: "get structure2",
  GET_ORGANIZATION: "get organization",
  GET_ORGANIZATION_UNIT: "get organization unit",
  GET_SECTOR: "get sector",

  UPDATE_ORGANIZATION: "update organization",
  UPDATE_STRUCTURE2: "update structure2",
  UPDATE_ORGANIZATION_UNIT: "update organization unit",
  UPDATE_SECTOR: "update sector",
  ASSIGN_MEMBER_TO_SECTOR: "Assign member to sector",

  DELETE_ORGANIZATION: "delete organization",
  DELETE_ORGANIZATION_UNIT: "delete organization unit",
  DELETE_SECTOR: "delete sector",
  DELETE_STRUCTURE2: "delete structure2",
  ADD_PROJECT_TO_DEPARTMENT: "add project to department",
  // project permission
  CREATE_PROJECT: "create project",
  GET_ALL_PROJECT: "get all project",
  GET_PROJECT: "get specific project",
  UPDATE_PROJECT: "update project",
  DELETE_PROJECT: "Delete project",
  VIEW_PROJECT_MEMBERS: "view project members",
  GET_PROJECT_MEMBERS_PROFILE: "view project members profile",

  // activity permission
  CREATE_ACTIVITY: "create activity",
  GET_ALL_ACTIVITY: "get all activity",
  GET_ACTIVITY: "get activity",
  GET_WORKSPACE: "get workspace",
  UPDATE_ACTIVITY: "update activity",
  DELETE_ACTIVITY: "delete activity",
  COMMENT_ON_ACTIVITY: "comment on activity",
  VIEW_COMMENT_ON_ACTIVITY: "view comment on activity",

  // task permission
  CREATE_TASK: "create task",
  GET_ALL_TASK: "get all task",
  GET_TASK: "get task",
  UPDATE_TASK: "update task",
  DELETE_TASK: "delete task",

  // sub task permission
  CREATE_SUB_TASK: "create sub task",
  GET_ALL_SUB_TASK: "get all sub task",
  GET_SUB_TASK: "get sub task",
  UPDATE_SUB_TASK: "update sub task",
  DELETE_SUB_TASK: "delete sub task",
  COMMENT_ON_SUBTASK: "comment on sub task",
  VIEW_COMMENT_ON_SUBTASK: "view comment on sub task",

  //Milestone permission
  GET_ALL_MILESTONE: "get all milestone",
  GET_MILESTONE: "get milestone",
  DELETE_MILESTONE: "delete milestone",

  // dashboard permission
  GET_HOME: "get home",
  GET_ADMIN_DASHBOARD: "get admin dashboard",
  GET_PROJECT_DASHBOARD: "get project dashboard",

  // teams permission
  GET_TEAM: "get teams",

  //trash permission
  GET_TRASH: "get trash",

  //document permission
  VIEW_DOCUMENT: "view document",
  EDIT_DOCUMENT: "edit document",
  DOWNLOAD_DOCUMENT: "download document",
  DELETE_DOCUMENT: "delete document",
};

export const PROJECT_ROLES = {
  PROJECT_MANAGER: "b459daa4-f776-11ee-baf0-c01803d4a116",
  TECHNICAL_MANAGER: "b459e14e-f776-11ee-baf0-c01803d4a116",
  PROJECT_MEMBER: "09b77e81-f7cf-11ee-aa0f-c01803d4a116",
};

export const USER_ROLES = {
  USER: "636f3125-8244-426c-8905-cf8b5045aacd",
  SYSTEM_ADMIN: "c170f434-248d-4e45-a0b0-5101bab7e8e1",
  DEPARTMENT_ADMIN: "f6936f08-c371-48a9-8a85-fb9e8426ff8a",
  CLUSTER_ADMIN: "9ff7d53d-6aaf-11ef-b1d1-b05cda965850",
  ORGANIZATION_ADMIN: "e09665f2-6aaf-11ef-b1d1-b05cda965850",
};
