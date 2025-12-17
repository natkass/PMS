import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Tooltip,
  Drawer,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  NotificationsOutlined,
  AccountCircle,
  Logout,
  Person,
  Settings,
  Close,
} from "@mui/icons-material";
import { SOCKET_URL } from "../../config";
import { useAuth } from "../../context/authContext";
import apiService from "../services/apiServices";
import ProfileUpdate from "./Myprofile";
import EaiiIcon from "../Assets/Eaii.png";
import ECSCIcon from "../Assets/ethiopian_civil_service_commistion_logo.png";
import { Divider } from "@material-ui/core";

const Navbar = ({ drawer, mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const auth = useAuth();

  // State management
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mainRole, setMainRole] = useState({});
  const [socket, setSocket] = useState(null);
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);
  const [userInfo, setUserInfo] = useState(
    () => JSON.parse(localStorage.getItem("userInfo")) || {}
  );
  const [permissions] = useState(
    () => JSON.parse(localStorage.getItem("permissions")) || []
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Event handlers
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    markAllNotificationsAsSeen();
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const openProfileModal = () => {
    setProfileAnchorEl(null);
    setModalOpen(true);
  };

  const closeProfileModal = () => {
    setModalOpen(false);
  };

  const handleLogout = () => {
    auth.logout();
    navigate("/");
    handleProfileMenuClose();
  };

  const markNotificationAsSeen = (id) => {
    setRealtimeNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, seen: true } : notification
      )
    );
  };

  const markAllNotificationsAsSeen = async () => {
    try {
      await apiService.NotificationUpdate(userInfo.foundUser?.user_id);
      setRealtimeNotifications((prev) =>
        prev.map((notification) => ({ ...notification, seen: true }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = realtimeNotifications.filter((n) => !n.seen).length;

  // Initialize socket and user data
  useEffect(() => {
    const initializeSocket = () => {
      const socket = io(SOCKET_URL);

      socket.on("connect", () => {
        console.log("Connected to server");
      });

      socket.on("notification", (notification) => {
        const filteredNotifications = notification.filter(
          (n) => n.user_id === userInfo.foundUser?.user_id
        );
        setRealtimeNotifications(filteredNotifications);
      });

      setSocket(socket);

      return () => {
        socket.disconnect();
      };
    };

    if (userInfo.foundUser?.user_id) {
      const filteredRole = userInfo.foundUser.Roles?.find(
        (role) => role.project_related === false
      );
      setMainRole(filteredRole || {});
      initializeSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userInfo.foundUser?.user_id]);

  // Render notifications menu
  const renderNotificationsMenu = () => (
    <Menu
      anchorEl={notificationAnchorEl}
      open={Boolean(notificationAnchorEl)}
      onClose={handleNotificationClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      className="mt-12"
      PaperProps={{
        className: "w-80 max-h-96 shadow-xl rounded-lg border border-gray-200",
      }}
    >
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-primary-25">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Latest updates from your projects
        </p>
      </div>

      <div className="overflow-y-auto max-h-72">
        {realtimeNotifications.length > 0 ? (
          realtimeNotifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => markNotificationAsSeen(notification.id)}
              className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                !notification.seen ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`mt-1 w-2 h-2 rounded-full ${
                    !notification.seen ? "bg-primary-500" : "bg-transparent"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.date}
                  </p>
                </div>
              </div>
            </MenuItem>
          ))
        ) : (
          <div className="px-4 py-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <NotificationsOutlined className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No notifications yet</p>
            <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <button
          onClick={handleNotificationClose}
          className="text-sm text-primary-600 hover:text-primary-800 font-medium w-full text-center py-2"
        >
          View all notifications
        </button>
      </div>
    </Menu>
  );

  // Render profile menu
  const renderProfileMenu = () => (
    <Menu
      anchorEl={profileAnchorEl}
      open={Boolean(profileAnchorEl)}
      onClose={handleProfileMenuClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      className="mt-12"
      PaperProps={{
        className: "w-64 shadow-xl rounded-lg border border-gray-200",
      }}
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Avatar
            className="h-10 w-10 bg-gradient-to-r from-primary-500 to-primary-700"
            alt={userInfo.foundUser?.full_name}
          >
            {userInfo.foundUser?.full_name?.charAt(0) || "U"}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userInfo.foundUser?.full_name || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {mainRole.name || "Member"}
            </p>
          </div>
        </div>
      </div>

      <MenuItem
        onClick={openProfileModal}
        className="px-4 py-3 hover:bg-gray-50"
      >
        <ListItemIcon className="min-w-9">
          <Person className="text-gray-600" fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="My Profile" className="text-gray-700" />
      </MenuItem>

      {/* <MenuItem className="px-4 py-3 hover:bg-gray-50">
        <ListItemIcon className="min-w-9">
          <Settings className="text-gray-600" fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Settings" className="text-gray-700" />
      </MenuItem> */}

      <Divider className="my-1" />

      <MenuItem
        onClick={handleLogout}
        className="px-4 py-3 hover:bg-red-50 text-red-600"
      >
        <ListItemIcon className="min-w-9">
          <Logout className="text-red-600" fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </MenuItem>
    </Menu>
  );

  // Render search bar
  const renderSearchBar = () => (
    <div
      className={`hidden lg:flex items-center transition-all duration-300 ${
        searchOpen ? "flex-1 max-w-2xl" : "w-64"
      }`}
    >
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-white placeholder-white/70 transition-all duration-300 ${
            searchOpen ? "opacity-100" : "opacity-0 lg:opacity-100"
          }`}
          placeholder="Search projects, users, tasks..."
        />
        {searchOpen && (
          <button
            onClick={() => setSearchOpen(false)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <Close className="h-5 w-5 text-white/70 hover:text-white" />
          </button>
        )}
      </div>
      {!searchOpen && (
        <button
          onClick={() => setSearchOpen(true)}
          className="lg:hidden ml-2 p-2 text-white/80 hover:text-white"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Main Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-sky-900 via-sky-800 to-sky-900 border-b border-white/10 shadow-lg backdrop-blur-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section - Menu & Logo */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={handleDrawerToggle}
                className="lg:hidden p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
              >
                <MenuIcon className="h-6 w-6" />
              </button>

              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="hidden lg:flex items-center space-x-2">
                  <img
                    src={EaiiIcon}
                    alt="EAII Logo"
                    className="h-8 w-8 object-contain"
                  />
                  <div className="h-6 w-px bg-white/30" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-lg tracking-tight">
                    EAII-PMS
                  </span>
                  <span className="text-white/80 text-xs">
                    Project Management System
                  </span>
                </div>
              </div>
            </div>

            {/* Middle section - Search */}
            {renderSearchBar()}

            {/* Right section - Notifications & Profile */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search toggle for mobile */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="lg:hidden p-2 rounded-md text-white hover:bg-white/10"
              >
                <SearchIcon className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <Tooltip title="Notifications" arrow>
                <button
                  onClick={handleNotificationClick}
                  className="relative p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
                >
                  <NotificationsOutlined className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-sky-900">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </Tooltip>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={handleProfileMenuOpen}
                  className="flex items-center space-x-3 p-1 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors group"
                >
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-white font-medium text-sm">
                      {userInfo.foundUser?.full_name || "User"}
                    </span>
                    <span className="text-white/70 text-xs">
                      {mainRole.name || "Member"}
                    </span>
                  </div>
                  <div className="relative">
                    <Avatar
                      className="h-9 w-9 ring-2 ring-white/20 group-hover:ring-white/30 transition-all bg-gradient-to-r from-primary-500 to-primary-700"
                      alt={userInfo.foundUser?.full_name}
                    >
                      {userInfo.foundUser?.full_name?.charAt(0) || "U"}
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-sky-900"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {searchOpen && (
            <div className="lg:hidden pb-3 px-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  placeholder="Search projects, users, tasks..."
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <Close className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        classes={{
          paper: "w-72",
        }}
      >
        <div className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50">
          {/* Drawer Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={EaiiIcon}
                  alt="EAII Logo"
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <h2 className="text-white font-bold text-lg">EAII PMS</h2>
                  <p className="text-white/80 text-xs">Project Management</p>
                </div>
              </div>
              <button
                onClick={handleDrawerToggle}
                className="p-1 rounded-md text-white hover:bg-white/10"
              >
                <Close className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto py-4">{drawer}</div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <Avatar
                className="h-10 w-10 bg-gradient-to-r from-primary-500 to-primary-700"
                alt={userInfo.foundUser?.full_name}
              >
                {userInfo.foundUser?.full_name?.charAt(0) || "U"}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userInfo.foundUser?.full_name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {mainRole.name || "Member"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Menus */}
      {renderNotificationsMenu()}
      {renderProfileMenu()}

      {/* Profile Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
              <button
                onClick={closeProfileModal}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Close className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <ProfileUpdate closeModal={closeProfileModal} />
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;
