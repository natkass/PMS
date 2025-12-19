import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import apiService from "../services/apiServices";
import {
  X,
  MessageSquare,
  User,
  Calendar,
  AlertCircle,
  Loader2,
  Clock,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  FileText,
  TrendingUp,
  BarChart3,
  Copy,
  Sparkles,
  FileIcon,
  Send,
  Paperclip,
  Trash2,
  Edit,
  Reply,
  ThumbsUp,
  Upload,
  XCircle,
  File,
  Image,
  Video,
  Download,
  AtSign,
  Zap,
  Shield,
  Lock,
  Pin,
} from "lucide-react";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import Swal from "sweetalert2";

const SubtaskCommentView = ({
  subtaskId,
  selectedRow,
  handleCloseModal,
  userId,
  userRole,
  userPermissions,
  handlefetchSubtasks,
}) => {
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedComment, setExpandedComment] = useState(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editCommentId, setEditCommentId] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const modalRef = useRef();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({
    comment: "",
    attachments: [],
    isPrivate: false,
    mentionUsers: [],
  });

  // Extract permissions with defaults
  const {
    canAddComment = true,
    canEditOwnComments = true,
    canDeleteOwnComments = true,
    canPinComments = false,
    canViewPrivateComments = false,
  } = userPermissions || {};

  const characterCount = formData.comment.length;
  const maxCharacters = 2000;

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "author", label: "By Author" },
    { value: "length", label: "By Length" },
    { value: "most_liked", label: "Most Liked" },
  ];

  // File type detection
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "webp":
        return <Image className="w-4 h-4" />;
      case "mp4":
      case "mov":
      case "avi":
      case "mkv":
        return <Video className="w-4 h-4" />;
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "doc":
      case "docx":
      case "txt":
      case "rtf":
        return <FileText className="w-4 h-4" />;
      case "xls":
      case "xlsx":
      case "csv":
        return <FileText className="w-4 h-4" />;
      case "ppt":
      case "pptx":
        return <FileText className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Calculate metrics
  const calculateMetrics = useCallback((comments) => {
    const stats = {
      total: comments.length,
      authors: new Set(),
      timeline: [],
      avgCommentLength: 0,
      recentActivity: 0,
      totalLikes: 0,
      totalReplies: 0,
      attachments: 0,
    };

    let totalLength = 0;
    const authorSet = new Set();
    const timelineData = [];
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    let recentCount = 0;
    let totalLikes = 0;
    let totalReplies = 0;
    let attachmentsCount = 0;

    comments.forEach((comment) => {
      authorSet.add(comment.userId);
      totalLength += comment.length;
      totalLikes += comment.likes || 0;
      totalReplies += comment.replies?.length || 0;
      attachmentsCount += comment.attachments?.length || 0;

      // Check for recent activity
      const commentDate = new Date(comment.createdAt);
      if (commentDate > oneWeekAgo) {
        recentCount++;
      }

      // Add to timeline for chart
      timelineData.push({
        date: commentDate,
        author: comment.userId,
      });
    });

    stats.authors = authorSet.size;
    stats.avgCommentLength =
      stats.total > 0 ? Math.round(totalLength / stats.total) : 0;
    stats.timeline = timelineData;
    stats.recentActivity = recentCount;
    stats.totalLikes = totalLikes;
    stats.totalReplies = totalReplies;
    stats.attachments = attachmentsCount;

    return stats;
  }, []);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!subtaskId) return;

    try {
      if (refreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await apiService.getAllSubtaskComments(subtaskId);

      // Process comments to match our structure
      const processedComments = response.data.map((item) => ({
        id: item?.comment_id || item.comment_id,
        content: item?.comment || item.comment || "",
        userId: item?.user.user_id || userId,
        userName: item?.user.full_name || "Unknown User",
        createdAt: item?.createdAt || new Date().toISOString(),
        likes: item.likes_count || 0,
        likedByUser: item.liked_by_user || false,
        replies: item.replies || [],
        isPinned: item.is_pinned || false,
        isPrivate: item.is_private || false,
        attachments: item.attachments || [],
        editedAt: item.updatedAt || item.editedAt,
      }));

      const sortedResponse = processedComments.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setComments(sortedResponse);
      setFilteredComments(sortedResponse);
      setCommentStats(calculateMetrics(sortedResponse));
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError(
        "Unable to load comments. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [subtaskId, refreshing, calculateMetrics, userId]);

  // Initial fetch
  useEffect(() => {
    if (subtaskId) {
      fetchComments();
    }
  }, [subtaskId, fetchComments]);

  // Filter and sort comments
  useEffect(() => {
    let result = [...comments];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (comment) =>
          comment.content.toLowerCase().includes(query) ||
          comment.userName.toLowerCase().includes(query) ||
          comment.replies?.some(
            (reply) =>
              reply.content.toLowerCase().includes(query) ||
              reply.userName.toLowerCase().includes(query)
          )
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "author":
          return a.userName.localeCompare(b.userName);
        case "length":
          return b.content.length - a.content.length;
        case "most_liked":
          return (b.likes || 0) - (a.likes || 0);
        default:
          return 0;
      }
    });

    setFilteredComments(result);
    setCommentStats(calculateMetrics(result));
  }, [comments, searchQuery, sortBy, calculateMetrics]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseModal();
      }
      if (event.key === "m" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setShowMetrics(!showMetrics);
      }
      if (event.key === "f" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        document.getElementById("search-input")?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleCloseModal, showMetrics]);

  const [commentStats, setCommentStats] = useState(calculateMetrics([]));

  const handleRefresh = () => {
    setRefreshing(true);
    fetchComments();
  };

  const handleCopyComment = (comment) => {
    navigator.clipboard.writeText(comment.content);
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Comment copied!",
      showConfirmButton: false,
      timer: 1500,
      toast: true,
    });
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: `Some files exceed the 10MB limit: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`,
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    // Validate total size (max 50MB)
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const currentAttachmentsSize = formData.attachments.reduce(
      (acc, att) => acc + (att.size || 0),
      0
    );

    if (totalSize + currentAttachmentsSize > 50 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Total Size Exceeded",
        text: "Total attachments size cannot exceed 50MB",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    // Add files to attachments
    const newAttachments = files.map((file) => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      uploaded: false,
    }));

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }));

    // Clear file input
    event.target.value = "";
  };

  // Remove attachment
  const removeAttachment = (attachmentId) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== attachmentId),
    }));
  };

  // Upload attachments to server
  const uploadAttachments = async (attachments) => {
    const uploadedAttachments = [];

    for (const attachment of attachments) {
      if (attachment.uploaded) {
        uploadedAttachments.push(attachment);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append("file", attachment.file);
        formData.append("subtaskId", subtaskId);
        formData.append("userId", userId);

        const response = await apiService.uploadFile(formData);

        if (response.status === 200 || response.status === 201) {
          uploadedAttachments.push({
            name: attachment.name,
            url: response.data.url,
            type: attachment.type,
            size: attachment.size,
            uploaded: true,
          });
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        uploadedAttachments.push({
          name: attachment.name,
          url: "#",
          type: attachment.type,
          size: attachment.size,
          uploaded: false,
          error: true,
        });
      }
    }

    return uploadedAttachments;
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!canAddComment) {
      Swal.fire({
        icon: "error",
        title: "Permission Denied",
        text: "You don't have permission to add comments",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    if (!formData.comment.trim() && formData.attachments.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Empty Comment",
        text: "Please add a comment or attachment",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    if (isSubmitting || isUploading) return;

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      let uploadedAttachments = [];

      // Upload attachments if any
      if (formData.attachments.length > 0) {
        uploadedAttachments = await uploadAttachments(formData.attachments);
      }

      const commentData = {
        comment: formData.comment.trim(),
        isPrivate: formData.isPrivate,
        attachments: uploadedAttachments,
        parentId: replyTo?.id || null,
        userId: userId,
      };

      let response;
      if (editCommentId) {
        response = await apiService.updateComment(editCommentId, commentData);
      } else {
        response = await apiService.addSubtaskComment(commentData, {
          sub_task_id: subtaskId,
        });
      }

      if (response.status === 201 || response.status === 200) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: editCommentId ? "Comment Updated" : "Comment Added",
          showConfirmButton: false,
          timer: 2000,
          background: "#10B981",
          color: "#FFFFFF",
          toast: true,
        });

        // Reset form
        setFormData({
          comment: "",
          attachments: [],
          isPrivate: false,
          mentionUsers: [],
        });
        setReplyTo(null);
        setEditCommentId(null);

        fetchComments();
        handlefetchSubtasks?.();
        setActiveTab("view");
      }
    } catch (error) {
      console.error("Error saving comment:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to save comment",
        text: error.response?.data?.message || "Please try again",
        confirmButtonColor: "#3B82F6",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await apiService.toggleLike(commentId, userId);
      if (response.status === 200) {
        fetchComments();
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleReply = (comment) => {
    if (!canAddComment) {
      Swal.fire({
        icon: "warning",
        title: "Permission Required",
        text: "You need permission to reply to comments",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }
    setReplyTo(comment);
    setEditCommentId(null);
    setActiveTab("add");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleEdit = (comment) => {
    if (
      !canEditOwnComments ||
      (comment.userId !== userId && !canViewPrivateComments)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Edit",
        text: "You can only edit your own comments",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }
    setEditCommentId(comment.id);
    setReplyTo(null);
    setFormData({
      comment: comment.content,
      attachments: comment.attachments || [],
      isPrivate: comment.isPrivate || false,
      mentionUsers: [],
    });
    setActiveTab("add");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleDelete = async (commentId) => {
    const allComments = [
      ...comments,
      ...comments.flatMap((c) => c.replies || []),
    ];

    const comment = allComments.find((c) => c.id === commentId);
    if (!comment) return;

    if (
      !canDeleteOwnComments ||
      (comment.userId !== userId && !canViewPrivateComments)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Delete",
        text: "You can only delete your own comments",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Delete Comment?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await apiService.deleteComment(commentId);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Comment has been deleted.",
          showConfirmButton: false,
          timer: 2000,
          background: "#10B981",
          color: "#FFFFFF",
          toast: true,
        });
        fetchComments();
      } catch (error) {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Failed to delete comment.",
          showConfirmButton: false,
          timer: 2000,
          background: "#EF4444",
          color: "#FFFFFF",
          toast: true,
        });
      }
    }
  };

  const handlePinComment = async (commentId, currentPinStatus) => {
    if (!canPinComments) {
      Swal.fire({
        icon: "warning",
        title: "Permission Required",
        text: "Only admins and managers can pin comments",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    try {
      await apiService.togglePin(commentId, !currentPinStatus);
      fetchComments();
    } catch (error) {
      Swal.fire("Error!", "Failed to update pin status.", "error");
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();

      if (isToday(date)) {
        return `Today at ${format(date, "h:mm a")}`;
      } else if (isYesterday(date)) {
        return `Yesterday at ${format(date, "h:mm a")}`;
      } else if ((now - date) / (1000 * 60 * 60 * 24) < 7) {
        return format(date, "EEEE") + " at " + format(date, "h:mm a");
      } else {
        return format(date, "MMM d, yyyy • h:mm a");
      }
    } catch {
      return "Invalid date";
    }
  };

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const getFullDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "PPPPpp");
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Render attachments in view mode
  const renderAttachments = (attachments, commentId) => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Paperclip className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            Attachments ({attachments.length})
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {attachments.map((attachment, idx) => (
            <div
              key={`${commentId}-attachment-${idx}`}
              className="group relative"
            >
              <a
                href={attachment.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="flex-shrink-0 p-2 bg-white rounded border border-gray-300">
                  {getFileIcon(
                    attachment.name || attachment.file?.name || "file"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {attachment.name ||
                        attachment.file?.name ||
                        `Attachment ${idx + 1}`}
                    </p>
                    {attachment.error && (
                      <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>{formatFileSize(attachment.size || 0)}</span>
                    <span>•</span>
                    <span>
                      {attachment.type?.split("/")[1]?.toUpperCase() || "FILE"}
                    </span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
              </a>

              {/* Image preview tooltip */}
              {attachment.preview && (
                <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 z-10">
                  <div className="bg-white p-1 rounded-lg shadow-lg border border-gray-200">
                    <img
                      src={attachment.preview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render attachments in edit mode
  const renderAttachmentUpload = () => {
    if (!canAddComment) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Attachments
          </label>
          <span className="text-sm text-gray-500">
            {formData.attachments.length} files •{" "}
            {formatFileSize(
              formData.attachments.reduce(
                (acc, att) => acc + (att.size || 0),
                0
              )
            )}
          </span>
        </div>

        {/* File upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium mb-1">
            Click to upload files
          </p>
          <p className="text-xs text-gray-500">
            Supports images, documents, videos (Max 10MB per file, 50MB total)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
          />
        </div>

        {/* Selected files */}
        {formData.attachments.length > 0 && (
          <div className="space-y-2">
            {formData.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 p-1.5 bg-white rounded border border-gray-300">
                    {getFileIcon(attachment.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {attachment.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatFileSize(attachment.size)}</span>
                      {isUploading && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Uploading...
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  disabled={isUploading}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderComment = (comment, isReply = false) => {
    const isExpanded = expandedComment === comment.id;
    const showAllReplies = showReplies[comment.id];
    const hasReplies = comment.replies?.length > 0;
    const isOwnComment = comment.userId === userId;
    const canEditThis = canEditOwnComments && isOwnComment;
    const canDeleteThis = canDeleteOwnComments && isOwnComment;
    const hasAttachments = comment.attachments?.length > 0;
    const isLongComment = comment.content?.length > 200;

    return (
      <div className={`${isReply ? "ml-8 mt-3" : "mb-4"}`}>
        <div
          className={`bg-white rounded-lg border ${
            comment.isPinned
              ? "border-yellow-300 border-2 bg-yellow-50"
              : comment.isPrivate
              ? "border-purple-200 bg-purple-50"
              : "border-gray-200"
          } hover:border-gray-300 transition-colors p-4`}
        >
          {/* Comment header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                <User className="w-4 h-4 text-gray-700" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">
                    {comment.userName}
                  </span>
                  {comment.isPinned && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                      <Pin className="w-3 h-3" />
                      Pinned
                    </span>
                  )}
                  {comment.isPrivate && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                      <Lock className="w-3 h-3" />
                      Private
                    </span>
                  )}
                  {isOwnComment && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                      You
                    </span>
                  )}
                  {hasAttachments && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">
                      <Paperclip className="w-3 h-3" />
                      {comment.attachments.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span
                    className="flex items-center gap-1 cursor-help"
                    title={getFullDate(comment.createdAt)}
                  >
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(comment.createdAt)}</span>
                  </span>
                  {comment.editedAt && (
                    <span className="text-gray-400">• Edited</span>
                  )}
                </div>
              </div>
            </div>

            {/* Comment actions */}
            <div className="flex items-center gap-1">
              {canPinComments && !isReply && (
                <button
                  onClick={() => handlePinComment(comment.id, comment.isPinned)}
                  className={`p-1 hover:bg-gray-100 rounded ${
                    comment.isPinned
                      ? "text-yellow-500 hover:text-yellow-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title={comment.isPinned ? "Unpin comment" : "Pin comment"}
                >
                  <Pin className="w-4 h-4" />
                </button>
              )}

              {canEditThis && (
                <button
                  onClick={() => handleEdit(comment)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                  title="Edit comment"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}

              {canDeleteThis && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600"
                  title="Delete comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {canAddComment && !isReply && (
                <button
                  onClick={() => handleReply(comment)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"
                  title="Reply to comment"
                >
                  <Reply className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Comment content */}
          <div className="mb-3">
            <div className="bg-white/80 rounded-lg p-3.5 border border-gray-100">
              <p
                className={`text-gray-700 leading-relaxed whitespace-pre-wrap ${
                  !isExpanded && isLongComment ? "max-h-24 overflow-hidden" : ""
                }`}
              >
                {comment.content}
              </p>
              {isLongComment && (
                <button
                  onClick={() =>
                    setExpandedComment(isExpanded ? null : comment.id)
                  }
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Read more
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Attachments */}
          {renderAttachments(comment.attachments, comment.id)}

          {/* Comment footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`flex items-center gap-1.5 text-sm ${
                  comment.likedByUser
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{comment.likes || 0}</span>
              </button>

              {hasReplies && !isReply && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {comment.replies?.length}{" "}
                    {comment.replies?.length === 1 ? "reply" : "replies"}
                  </span>
                  {showAllReplies ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyComment(comment)}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors"
                title="Copy comment"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Replies */}
        {hasReplies && showAllReplies && !isReply && (
          <div className="mt-3">
            {comment.replies.map((reply, index) => (
              <div key={reply.id || `reply-${comment.id}-${index}`}>
                {renderComment(
                  {
                    id: reply?.id,
                    content: reply?.comment || "",
                    userId: reply?.user.user_id,
                    userName: reply?.user.full_name || "Unknown User",
                    createdAt: reply?.createdAt || new Date().toISOString(),
                    likes: reply?.likes || 0,
                    likedByUser: reply?.likedByUser || false,
                    replies: reply?.replies || [],
                    isPinned: reply?.isPinned || false,
                    isPrivate: reply?.isPrivate || false,
                    attachments: reply?.attachments || [],
                    editedAt: reply?.editedAt,
                  },
                  true
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAddCommentTab = () => (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">
          {editCommentId
            ? "Edit Comment"
            : replyTo
            ? `Reply to ${replyTo.userName}`
            : "Add New Comment"}
        </h4>
        {replyTo && (
          <button
            onClick={() => setReplyTo(null)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Cancel reply
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Permission warning */}
        {!canAddComment && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">
                  Commenting Disabled
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  You don't have permission to add comments. Contact your
                  administrator if you believe this is an error.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Textarea with character counter */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Your {replyTo ? "reply" : "comment"}
            </label>
            <span
              className={`text-sm ${
                characterCount > maxCharacters
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {characterCount}/{maxCharacters}
            </span>
          </div>
          <textarea
            ref={textareaRef}
            name="comment"
            rows="5"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none disabled:bg-gray-50 disabled:text-gray-500"
            placeholder={
              !canAddComment
                ? "You don't have permission to add comments"
                : replyTo
                ? `Reply to ${replyTo.userName}...`
                : "Write your comment here..."
            }
            value={formData.comment}
            onChange={handleInputChange}
            maxLength={maxCharacters}
            autoFocus={canAddComment}
            disabled={!canAddComment}
          />
        </div>

        {/* File upload section */}
        {renderAttachmentUpload()}

        {/* Privacy option - only for admins/managers */}
        {(userRole === "admin" || userRole === "manager") && canAddComment ? (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrivate"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={!canAddComment}
            />
            <label
              htmlFor="isPrivate"
              className="text-sm text-gray-600 flex items-center gap-1"
            >
              <Lock className="w-4 h-4" />
              Private comment (visible only to managers/admins)
            </label>
          </div>
        ) : null}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              setActiveTab("view");
              setEditCommentId(null);
              setReplyTo(null);
              setFormData({
                comment: "",
                attachments: [],
                isPrivate: false,
                mentionUsers: [],
              });
            }}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>

          {canAddComment ? (
            <button
              onClick={handleSubmitComment}
              disabled={
                (!formData.comment.trim() &&
                  formData.attachments.length === 0) ||
                isSubmitting ||
                isUploading ||
                characterCount > maxCharacters
              }
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                (!formData.comment.trim() &&
                  formData.attachments.length === 0) ||
                isSubmitting ||
                isUploading ||
                characterCount > maxCharacters
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"
              }`}
            >
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {isUploading
                      ? "Uploading..."
                      : editCommentId
                      ? "Updating..."
                      : "Submitting..."}
                  </span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {editCommentId
                      ? "Update Comment"
                      : replyTo
                      ? "Post Reply"
                      : "Post Comment"}
                  </span>
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              <span>No Permission</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderViewTab = () => (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="search-input"
              type="text"
              placeholder="Search comments or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[140px]">
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh comments"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-600 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700 font-medium">
                  Total Comments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {commentStats.total || 0}
                </p>
              </div>
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-700 font-medium">
                  Unique Authors
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {commentStats.authors || 0}
                </p>
              </div>
              <User className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-700 font-medium">Likes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {commentStats.totalLikes || 0}
                </p>
              </div>
              <ThumbsUp className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-700 font-medium">
                  Attachments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {commentStats.attachments || 0}
                </p>
              </div>
              <Paperclip className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-400 blur-xl opacity-20 animate-pulse"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading comments...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-600 font-bold text-lg mb-2">
              Connection Error
            </p>
            <p className="text-gray-600 text-center mb-6 max-w-md">{error}</p>
            <button
              onClick={fetchComments}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
            >
              Retry Loading
            </button>
          </div>
        ) : filteredComments.length > 0 ? (
          <div className="space-y-4">
            {filteredComments.map((comment, index) => (
              <div key={comment.id || `comment-${index}-${comment.userId}`}>
                {renderComment(comment)}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageSquare className="w-12 h-12 mb-3" />
            <p className="font-medium">No comments yet</p>
            <p className="text-sm mt-1">
              {searchQuery
                ? "Try a different search term"
                : "Be the first to comment"}
            </p>
            {canAddComment && !searchQuery && (
              <button
                onClick={() => setActiveTab("add")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Comment
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (!subtaskId) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
      >
        {/* Header with tabs */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">
                  Subtask Comments
                </h2>
                {selectedRow && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-600 truncate max-w-md">
                      {selectedRow.subtaskName || "Subtask Details"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className={`p-2 rounded-lg transition-colors ${
                  showMetrics
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                title="Toggle metrics (Ctrl+M)"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6">
            <button
              onClick={() => setActiveTab("view")}
              className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                activeTab === "view"
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                View Comments ({comments.length})
              </div>
              {activeTab === "view" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>

            <button
              onClick={() => canAddComment && setActiveTab("add")}
              disabled={!canAddComment}
              className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                activeTab === "add"
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              } ${!canAddComment ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-2">
                {canAddComment ? (
                  <Send className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {canAddComment ? "Add Comment" : "Add Comment (Disabled)"}
              </div>
              {activeTab === "add" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div
            className={`flex-1 overflow-hidden flex flex-col ${
              showMetrics ? "lg:w-2/3" : "w-full"
            }`}
          >
            {activeTab === "add" ? renderAddCommentTab() : renderViewTab()}
          </div>

          {/* Metrics Sidebar */}
          {showMetrics && (
            <div className="lg:w-1/3 border-l border-gray-200 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Insights
                </h3>

                <div className="space-y-4">
                  {/* Author Distribution */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Author Distribution
                    </h4>
                    <div className="space-y-2">
                      {commentStats.authors > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-600">
                            Unique Authors
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              {commentStats.authors || 0}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Total Comments
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            {commentStats.total || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Engagement
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-amber-600">
                          Total Likes
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            {commentStats.totalLikes || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">
                          Total Replies
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            {commentStats.totalReplies || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-600">
                          Attachments
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            {commentStats.attachments || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Latest Activity */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Latest Activity
                    </h4>
                    <div className="space-y-3">
                      {filteredComments.slice(0, 3).map((comment, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="p-1.5 bg-gray-100 rounded">
                            <User className="w-3 h-3 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {comment.userName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {truncateText(comment.content, 50)}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/50 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-4 flex-wrap">
                <span>
                  Subtask ID:{" "}
                  <code className="px-2 py-1 bg-gray-200 rounded text-gray-800 font-mono text-xs">
                    {subtaskId?.slice(0, 8)}
                  </code>
                </span>
                {selectedRow?.dueDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      Due:{" "}
                      {format(new Date(selectedRow.dueDate), "MMM dd, yyyy")}
                    </span>
                  </span>
                )}
                <span className="text-gray-500">
                  Showing {filteredComments.length} of {comments.length}{" "}
                  comments
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+F</kbd>
              <span>Search</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+M</kbd>
              <span>Metrics</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtaskCommentView;
