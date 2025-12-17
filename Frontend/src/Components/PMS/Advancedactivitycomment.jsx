import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Swal from "sweetalert2";
import apiService from "../services/apiServices";
import {
    Send, X, MessageSquare, User, Calendar,
    Loader2, Search, RefreshCw, Heart, MoreVertical,
    Edit, Trash2, Reply, ThumbsUp, Paperclip, Pin,
    ChevronDown, ChevronUp, Filter, AtSign, Clock,
    CheckCircle, AlertCircle, Eye, EyeOff, Download,
    Lock, Shield, AlertTriangle, File, Image, Video,
    FileText, XCircle, Upload, FileIcon, Zap
} from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';

const AdvancedCommentSystem = ({
    activityId,
    activityName,
    userId,
    userRole,
    userPermissions,
    handleCloseModal,
    handlefetchActivity
}) => {
    const [activeTab, setActiveTab] = useState('view');
    const [comments, setComments] = useState([]);
    const [filteredComments, setFilteredComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [replyTo, setReplyTo] = useState(null);
    const [editCommentId, setEditCommentId] = useState(null);
    const [showReplies, setShowReplies] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [useMockData, setUseMockData] = useState(true);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    // Extract permissions with defaults
    const {
        canAddComment = false,
        canEditOwnComments = true,
        canDeleteOwnComments = true,
        canPinComments = false,
        canViewPrivateComments = false
    } = userPermissions || {};

    // Form states
    const [formData, setFormData] = useState({
        comment: "",
        attachments: [],
        isPrivate: false,
        mentionUsers: []
    });

    const characterCount = formData.comment.length;
    const maxCharacters = 2000;

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "oldest", label: "Oldest First" },
        { value: "most_liked", label: "Most Liked" },
        { value: "most_replied", label: "Most Replies" },
        { value: "pinned", label: "Pinned First" },
    ];

    // Mock users for testing
    const mockUsers = [
        { id: 'user1', name: 'John Doe', role: 'admin' },
        { id: 'user2', name: 'Jane Smith', role: 'manager' },
        { id: 'user3', name: 'Bob Johnson', role: 'user' },
        { id: 'user4', name: 'Alice Brown', role: 'user' },
        { id: userId, name: 'You', role: userRole }
    ];

    // Mock file attachments
    const mockFiles = [
        {
            name: 'project_plan.pdf',
            size: 2048576, // 2MB
            type: 'application/pdf',
            url: '#',
            uploaded: true
        },
        {
            name: 'screenshot.png',
            size: 512000, // 500KB
            type: 'image/png',
            url: '#',
            uploaded: true
        },
        {
            name: 'meeting_notes.docx',
            size: 1048576, // 1MB
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            url: '#',
            uploaded: true
        },
        {
            name: 'data_analysis.xlsx',
            size: 3145728, // 3MB
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            url: '#',
            uploaded: true
        }
    ];

    // Generate mock replies
    const generateMockReplies = (commentId, commentAuthor, depth = 0, maxDepth = 2) => {
        if (depth >= maxDepth) return [];

        const replyCount = Math.floor(Math.random() * 3) + 1; // 1-3 replies
        const replies = [];

        for (let i = 0; i < replyCount; i++) {
            const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
            const hasAttachments = Math.random() > 0.7;
            const hasNestedReplies = depth < maxDepth - 1 && Math.random() > 0.5;

            const reply = {
                id: `reply-${commentId}-${i}-${Date.now()}`,
                content: `This is a mock reply to ${commentAuthor}'s comment. ${hasAttachments ? 'I\'ve attached some files for review.' : ''}`,
                userId: user.id,
                userName: user.name,
                createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last week
                likes: Math.floor(Math.random() * 10),
                likedByUser: Math.random() > 0.8,
                replies: hasNestedReplies ? generateMockReplies(`nested-${commentId}-${i}`, user.name, depth + 1) : [],
                isPinned: false,
                isPrivate: Math.random() > 0.9,
                attachments: hasAttachments ? [mockFiles[Math.floor(Math.random() * mockFiles.length)]] : [],
                editedAt: Math.random() > 0.8 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : null
            };

            replies.push(reply);
        }

        return replies;
    };

    // Generate mock comments
    const generateMockComments = () => {
        const commentCount = Math.floor(Math.random() * 5) + 3; // 3-7 comments
        const comments = [];

        for (let i = 0; i < commentCount; i++) {
            const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
            const hasAttachments = Math.random() > 0.6;
            const hasReplies = Math.random() > 0.4;
            const isPinned = i === 0; // First comment is pinned

            const comment = {
                id: `mock-comment-${i}-${Date.now()}`,
                content: `This is a mock comment about "${activityName}". ${hasAttachments ? 'I\'ve included some relevant documents.' : 'This needs attention.'}`,
                userId: user.id,
                userName: user.name,
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last month
                likes: Math.floor(Math.random() * 20),
                likedByUser: user.id === userId ? Math.random() > 0.5 : false,
                replies: hasReplies ? generateMockReplies(`mock-comment-${i}`, user.name) : [],
                isPinned: isPinned,
                isPrivate: Math.random() > 0.85,
                attachments: hasAttachments ? mockFiles.slice(0, Math.floor(Math.random() * 3) + 1) : [],
                editedAt: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null
            };

            comments.push(comment);
        }

        return comments;
    };

    // File type detection
    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
            case 'webp':
                return <Image className="w-4 h-4" />;
            case 'mp4':
            case 'mov':
            case 'avi':
            case 'mkv':
                return <Video className="w-4 h-4" />;
            case 'pdf':
                return <FileText className="w-4 h-4" />;
            case 'doc':
            case 'docx':
            case 'txt':
            case 'rtf':
                return <FileText className="w-4 h-4" />;
            case 'xls':
            case 'xlsx':
            case 'csv':
                return <FileText className="w-4 h-4" />;
            case 'ppt':
            case 'pptx':
                return <FileText className="w-4 h-4" />;
            default:
                return <File className="w-4 h-4" />;
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Handle file selection
    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);

        // Validate file sizes (max 10MB per file)
        const maxSize = 10 * 1024 * 1024; // 10MB
        const oversizedFiles = files.filter(file => file.size > maxSize);

        if (oversizedFiles.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'File Too Large',
                text: `Some files exceed the 10MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`,
                confirmButtonColor: '#3B82F6',
            });
            return;
        }

        // Validate total size (max 50MB)
        const totalSize = files.reduce((acc, file) => acc + file.size, 0);
        const currentAttachmentsSize = formData.attachments.reduce((acc, att) => acc + (att.size || 0), 0);

        if (totalSize + currentAttachmentsSize > 50 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'Total Size Exceeded',
                text: 'Total attachments size cannot exceed 50MB',
                confirmButtonColor: '#3B82F6',
            });
            return;
        }

        // Add files to attachments
        const newAttachments = files.map(file => ({
            id: `file-${Date.now()}-${Math.random()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
            uploaded: false
        }));

        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...newAttachments]
        }));

        // Clear file input
        event.target.value = '';
    };

    // Remove attachment
    const removeAttachment = (attachmentId) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter(att => att.id !== attachmentId)
        }));
    };

    // Upload attachments to server
    const uploadAttachments = async (attachments) => {
        if (useMockData) {
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            return attachments.map(att => ({
                ...att,
                url: '#',
                uploaded: true
            }));
        }

        const uploadedAttachments = [];

        for (const attachment of attachments) {
            if (attachment.uploaded) {
                uploadedAttachments.push(attachment);
                continue;
            }

            try {
                const formData = new FormData();
                formData.append('file', attachment.file);
                formData.append('activityId', activityId);
                formData.append('userId', userId);

                const response = await apiService.uploadFile(formData);

                if (response.status === 200 || response.status === 201) {
                    uploadedAttachments.push({
                        name: attachment.name,
                        url: response.data.url,
                        type: attachment.type,
                        size: attachment.size,
                        uploaded: true
                    });
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                uploadedAttachments.push({
                    name: attachment.name,
                    url: '#',
                    type: attachment.type,
                    size: attachment.size,
                    uploaded: false,
                    error: true
                });
            }
        }

        return uploadedAttachments;
    };

    const fetchComments = useCallback(async () => {
        if (!activityId && !useMockData) return;

        try {
            setLoading(true);

            let commentsData = [];

            if (useMockData) {
                // Use mock data
                commentsData = generateMockComments();
            } else {
                // Fetch from API
                const response = await apiService.getAllActivityComments(activityId);

                if (response && typeof response === 'object' && !Array.isArray(response)) {
                    if (response.data && Array.isArray(response.data)) {
                        commentsData = response.data;
                    }
                    else if (response.comments && Array.isArray(response.comments)) {
                        commentsData = response.comments;
                    }
                    else if (response.comment_id) {
                        commentsData = [response];
                    }
                } else if (Array.isArray(response)) {
                    commentsData = response;
                }

                if (!Array.isArray(commentsData) || commentsData.length === 0) {
                    // If no real data, offer to use mock data
                    setUseMockData(true);
                    commentsData = generateMockComments();
                }
            }

            const processedComments = commentsData
                .map(item => {
                    const commentData = item.comment || item;

                    return {
                        id: commentData.comment_id || commentData.id || `comment-${Date.now()}-${Math.random()}`,
                        content: commentData.comment || commentData.content || '',
                        userId: commentData.created_by || commentData.user_id || commentData.userId || 'unknown',
                        userName: commentData.commentedBy || commentData.userName || 'Unknown User',
                        createdAt: commentData.createdAt || new Date().toISOString(),
                        likes: commentData.likes || 0,
                        likedByUser: commentData.likedBy?.includes(userId) || false,
                        replies: commentData.replies || [],
                        isPinned: commentData.isPinned || false,
                        isPrivate: commentData.isPrivate || false,
                        attachments: commentData.attachments || [],
                        editedAt: commentData.updatedAt || commentData.editedAt
                    };
                })
                .filter(comment => {
                    if (comment.isPrivate && !canViewPrivateComments && comment.userId !== userId) {
                        return false;
                    }
                    return true;
                })
                .map(comment => ({
                    ...comment,
                    replies: (comment.replies || []).filter(reply => {
                        if (reply.isPrivate && !canViewPrivateComments && reply.userId !== userId) {
                            return false;
                        }
                        return true;
                    }).map(reply => ({
                        id: reply.comment_id || reply.id || `reply-${Date.now()}-${Math.random()}`,
                        content: reply.comment || reply.content || '',
                        userId: reply.created_by || reply.user_id || reply.userId || 'unknown',
                        userName: reply.commentedBy || reply.userName || 'Unknown User',
                        createdAt: reply.createdAt || new Date().toISOString(),
                        likes: reply.likes || 0,
                        likedByUser: reply.likedBy?.includes(userId) || false,
                        replies: reply.replies || [],
                        isPinned: reply.isPinned || false,
                        isPrivate: reply.isPrivate || false,
                        attachments: reply.attachments || [],
                        editedAt: reply.updatedAt || reply.editedAt
                    }))
                }));

            const sortedComments = sortComments(processedComments, sortBy);

            setComments(sortedComments);
            setFilteredComments(sortedComments);
        } catch (error) {
            console.error("Error fetching comments:", error);

            // If API fails, offer mock data
            if (!useMockData) {
                const useMock = await Swal.fire({
                    title: 'API Error',
                    text: 'Failed to load comments. Would you like to see demo data instead?',
                    icon: 'error',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, show demo',
                    cancelButtonText: 'No, try again',
                    confirmButtonColor: '#3B82F6',
                });

                if (useMock.isConfirmed) {
                    setUseMockData(true);
                    fetchComments(); // Retry with mock data
                    return;
                }
            }

            Swal.fire({
                icon: "error",
                title: "Failed to load comments",
                text: "Please try again later",
                confirmButtonColor: "#3B82F6",
            });
        } finally {
            setLoading(false);
        }
    }, [activityId, userId, sortBy, canViewPrivateComments, useMockData, activityName]);

    const sortComments = (comments, sortMethod) => {
        const commentsCopy = [...comments];

        switch (sortMethod) {
            case "newest":
                return commentsCopy.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
            case "oldest":
                return commentsCopy.sort((a, b) =>
                    new Date(a.createdAt) - new Date(b.createdAt)
                );
            case "most_liked":
                return commentsCopy.sort((a, b) =>
                    (b.likes || 0) - (a.likes || 0)
                );
            case "most_replied":
                return commentsCopy.sort((a, b) =>
                    (b.replies?.length || 0) - (a.replies?.length || 0)
                );
            case "pinned":
                return commentsCopy.sort((a, b) =>
                    (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)
                );
            default:
                return commentsCopy;
        }
    };

    useEffect(() => {
        if (activityId || useMockData) {
            fetchComments();
        }
    }, [activityId, fetchComments, useMockData]);

    useEffect(() => {
        let result = [...comments];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(comment =>
                comment.content.toLowerCase().includes(query) ||
                comment.userName.toLowerCase().includes(query) ||
                (comment.replies?.some(reply =>
                    reply.content.toLowerCase().includes(query) ||
                    reply.userName.toLowerCase().includes(query)
                ))
            );
        }

        setFilteredComments(result);
    }, [comments, searchQuery, sortBy]);

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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
                userId: userId
            };

            if (useMockData) {
                // Simulate API delay for mock data
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Add mock comment to state
                const newComment = {
                    id: `mock-new-${Date.now()}`,
                    content: formData.comment.trim(),
                    userId: userId,
                    userName: 'You',
                    createdAt: new Date().toISOString(),
                    likes: 0,
                    likedByUser: false,
                    replies: [],
                    isPinned: false,
                    isPrivate: formData.isPrivate,
                    attachments: uploadedAttachments,
                    editedAt: null
                };

                setComments(prev => [...prev, newComment]);

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
                    mentionUsers: []
                });
                setReplyTo(null);
                setEditCommentId(null);

                handlefetchActivity?.();
                setActiveTab('view');
            } else {
                let response;
                if (editCommentId) {
                    const commentToEdit = comments.find(c => c.id === editCommentId);
                    if (!commentToEdit || (commentToEdit.userId !== userId && !canEditOwnComments)) {
                        Swal.fire({
                            icon: "error",
                            title: "Permission Denied",
                            text: "You can only edit your own comments",
                            confirmButtonColor: "#3B82F6",
                        });
                        return;
                    }

                    response = await apiService.updateComment(editCommentId, commentData);
                } else {
                    response = await apiService.addComment(commentData, { activity_id: activityId });
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
                        mentionUsers: []
                    });
                    setReplyTo(null);
                    setEditCommentId(null);

                    fetchComments();
                    handlefetchActivity?.();
                    setActiveTab('view');
                }
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
        if (useMockData) {
            // Mock like functionality
            setComments(prev => prev.map(comment => {
                if (comment.id === commentId) {
                    const alreadyLiked = comment.likedByUser;
                    return {
                        ...comment,
                        likes: alreadyLiked ? comment.likes - 1 : comment.likes + 1,
                        likedByUser: !alreadyLiked
                    };
                }
                return comment;
            }));
            return;
        }

        try {
            const response = await apiService.likeComment(commentId, userId);
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
        setActiveTab('add');
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const handleEdit = (comment) => {
        if (!canEditOwnComments || (comment.userId !== userId && !canViewPrivateComments)) {
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
            mentionUsers: []
        });
        setActiveTab('add');
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const handleDelete = async (commentId) => {
        const comment = comments.find(c => c.id === commentId);
        if (!comment) return;

        if (!canDeleteOwnComments || (comment.userId !== userId && !canViewPrivateComments)) {
            Swal.fire({
                icon: "warning",
                title: "Cannot Delete",
                text: "You can only delete your own comments",
                confirmButtonColor: "#3B82F6",
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This comment and all attachments will be permanently deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            if (useMockData) {
                // Mock delete
                setComments(prev => prev.filter(c => c.id !== commentId));
                Swal.fire('Deleted!', 'Comment has been deleted.', 'success');
                handlefetchActivity?.();
            } else {
                try {
                    await apiService.deleteComment(commentId);
                    Swal.fire('Deleted!', 'Comment has been deleted.', 'success');
                    fetchComments();
                    handlefetchActivity?.();
                } catch (error) {
                    Swal.fire('Error!', 'Failed to delete comment.', 'error');
                }
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

        if (useMockData) {
            // Mock pin functionality
            setComments(prev => prev.map(comment => {
                if (comment.id === commentId) {
                    return { ...comment, isPinned: !currentPinStatus };
                }
                return comment;
            }));

            Swal.fire({
                position: "top-end",
                icon: "success",
                title: currentPinStatus ? "Comment Unpinned" : "Comment Pinned",
                showConfirmButton: false,
                timer: 1500,
                toast: true,
            });
            return;
        }

        try {
            await apiService.pinComment(commentId, !currentPinStatus);
            fetchComments();
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: currentPinStatus ? "Comment Unpinned" : "Comment Pinned",
                showConfirmButton: false,
                timer: 1500,
                toast: true,
            });
        } catch (error) {
            Swal.fire('Error!', 'Failed to update pin status.', 'error');
        }
    };

    const toggleReplies = (commentId) => {
        setShowReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, 'MMM dd, yyyy • h:mm a');
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

    const stats = useMemo(() => ({
        total: comments.length,
        totalReplies: comments.reduce((acc, comment) => acc + (comment.replies?.length || 0), 0),
        totalLikes: comments.reduce((acc, comment) => acc + (comment.likes || 0), 0),
        pinned: comments.filter(c => c.isPinned).length,
        private: comments.filter(c => c.isPrivate).length,
        attachments: comments.reduce((acc, comment) => acc + (comment.attachments?.length || 0), 0)
    }), [comments]);

    // Cleanup preview URLs
    useEffect(() => {
        return () => {
            formData.attachments.forEach(att => {
                if (att.preview && att.preview.startsWith('blob:')) {
                    URL.revokeObjectURL(att.preview);
                }
            });
        };
    }, []);

    // Render attachments in view mode
    const renderAttachments = (attachments, commentId) => {
        if (!attachments || attachments.length === 0) return null;

        return (
            <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">Attachments ({attachments.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {attachments.map((attachment, idx) => (
                        <div
                            key={`${commentId}-attachment-${idx}`}
                            className="group relative"
                        >
                            <a
                                href={attachment.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                            >
                                <div className="flex-shrink-0 p-2 bg-white rounded border border-slate-300">
                                    {getFileIcon(attachment.name || attachment.file?.name || 'file')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-slate-700 truncate">
                                            {attachment.name || attachment.file?.name || `Attachment ${idx + 1}`}
                                        </p>
                                        {attachment.error && (
                                            <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                        <span>{formatFileSize(attachment.size || 0)}</span>
                                        <span>•</span>
                                        <span>{attachment.type?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                                    </div>
                                </div>
                                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                            </a>

                            {/* Image preview tooltip */}
                            {attachment.preview && (
                                <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 z-10">
                                    <div className="bg-white p-1 rounded-lg shadow-lg border border-slate-200">
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
                    <label className="text-sm font-medium text-slate-700">
                        Attachments
                    </label>
                    <span className="text-sm text-slate-500">
                        {formData.attachments.length} files • {formatFileSize(
                            formData.attachments.reduce((acc, att) => acc + (att.size || 0), 0)
                        )}
                    </span>
                </div>

                {/* File upload area */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 font-medium mb-1">
                        Click to upload files
                    </p>
                    <p className="text-xs text-slate-500">
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
                                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex-shrink-0 p-1.5 bg-white rounded border border-slate-300">
                                        {getFileIcon(attachment.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">
                                            {attachment.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
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
                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
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
        const isExpanded = expandedComments[comment.id] || !isReply;
        const showAllReplies = showReplies[comment.id];
        const hasReplies = comment.replies?.length > 0;
        const isOwnComment = comment.userId === userId;
        const canEditThis = canEditOwnComments && isOwnComment;
        const canDeleteThis = canDeleteOwnComments && isOwnComment;
        const hasAttachments = comment.attachments?.length > 0;

        return (
            <div className={`${isReply ? 'ml-8 mt-3' : 'mb-4'}`}>
                <div className={`bg-white rounded-lg border ${comment.isPinned ? 'border-yellow-300 border-2 bg-yellow-50' :
                    comment.isPrivate ? 'border-purple-200 bg-purple-50' : 'border-slate-200'
                    } hover:border-slate-300 transition-colors p-4`}>
                    {/* Comment header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-slate-800">{comment.userName}</span>
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
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    <span title={formatDate(comment.createdAt)}>
                                        {formatTimeAgo(comment.createdAt)}
                                    </span>
                                    {comment.editedAt && (
                                        <span className="text-slate-400">• Edited</span>
                                    )}
                                    {useMockData && comment.id.startsWith('mock-') && (
                                        <span className="text-blue-400">• Demo</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Comment actions */}
                        <div className="flex items-center gap-1">
                            {canPinComments && !isReply && (
                                <button
                                    onClick={() => handlePinComment(comment.id, comment.isPinned)}
                                    className={`p-1 hover:bg-slate-100 rounded ${comment.isPinned ? 'text-yellow-500 hover:text-yellow-600' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    title={comment.isPinned ? "Unpin comment" : "Pin comment"}
                                >
                                    <Pin className="w-4 h-4" />
                                </button>
                            )}

                            {canEditThis && (
                                <button
                                    onClick={() => handleEdit(comment)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                                    title="Edit comment"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            )}

                            {canDeleteThis && (
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-600"
                                    title="Delete comment"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}

                            {canAddComment && (
                                <button
                                    onClick={() => handleReply(comment)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600"
                                    title="Reply to comment"
                                >
                                    <Reply className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Comment content */}
                    <div className="mb-3">
                        <p className={`text-slate-700 ${!isExpanded && !isReply && comment.content.length > 300 ? 'line-clamp-3' : ''}`}>
                            {comment.content}
                        </p>
                        {!isReply && comment.content.length > 300 && (
                            <button
                                onClick={() => setExpandedComments(prev => ({
                                    ...prev,
                                    [comment.id]: !prev[comment.id]
                                }))}
                                className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                            >
                                {isExpanded ? 'Show less' : 'Read more'}
                            </button>
                        )}
                    </div>

                    {/* Attachments */}
                    {renderAttachments(comment.attachments, comment.id)}

                    {/* Comment footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleLikeComment(comment.id)}
                                className={`flex items-center gap-1.5 text-sm ${comment.likedByUser ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <ThumbsUp className="w-4 h-4" />
                                <span>{comment.likes || 0}</span>
                            </button>

                            {hasReplies && !isReply && (
                                <button
                                    onClick={() => toggleReplies(comment.id)}
                                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                                    {showAllReplies ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Replies */}
                {hasReplies && showAllReplies && !isReply && (
                    <div className="mt-3">
                        {comment.replies.map((reply, index) => (
                            <div key={reply.id || `reply-${comment.id}-${index}`}>
                                {renderComment(reply, true)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderAddCommentTab = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-800">
                    {editCommentId ? 'Edit Comment' : replyTo ? `Reply to ${replyTo.userName}` : 'Add New Comment'}
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
                {/* Demo mode indicator */}
                {useMockData && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-600" />
                            <p className="text-blue-800 text-sm font-medium">
                                Demo Mode: Using sample data
                            </p>
                        </div>
                    </div>
                )}

                {/* Permission warning */}
                {!canAddComment && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-yellow-800 font-medium">Commenting Disabled</p>
                                <p className="text-yellow-700 text-sm mt-1">
                                    You don't have permission to add comments. Contact your administrator if you believe this is an error.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Textarea with character counter */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700">
                            Your {replyTo ? 'reply' : 'comment'}
                        </label>
                        <span className={`text-sm ${characterCount > maxCharacters ? 'text-red-500' : 'text-slate-500'}`}>
                            {characterCount}/{maxCharacters}
                        </span>
                    </div>
                    <textarea
                        ref={textareaRef}
                        name="comment"
                        rows="5"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none disabled:bg-slate-50 disabled:text-slate-500"
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
                {(userRole === 'admin' || userRole === 'manager') && canAddComment ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isPrivate"
                            name="isPrivate"
                            checked={formData.isPrivate}
                            onChange={handleInputChange}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            disabled={!canAddComment}
                        />
                        <label htmlFor="isPrivate" className="text-sm text-slate-600 flex items-center gap-1">
                            <Lock className="w-4 h-4" />
                            Private comment (visible only to managers/admins)
                        </label>
                    </div>
                ) : null}

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('view');
                            setEditCommentId(null);
                            setReplyTo(null);
                            setFormData({ comment: "", attachments: [], isPrivate: false, mentionUsers: [] });
                        }}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>

                    {canAddComment ? (
                        <button
                            onClick={handleSubmitComment}
                            disabled={(!formData.comment.trim() && formData.attachments.length === 0) || isSubmitting || isUploading || characterCount > maxCharacters}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${(!formData.comment.trim() && formData.attachments.length === 0) || isSubmitting || isUploading || characterCount > maxCharacters
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                                }`}
                        >
                            {(isSubmitting || isUploading) ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{isUploading ? 'Uploading...' : editCommentId ? 'Updating...' : 'Submitting...'}</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>{editCommentId ? 'Update Comment' : replyTo ? 'Post Reply' : 'Post Comment'}</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            disabled
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-slate-300 text-slate-500 cursor-not-allowed"
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
            <div className="mb-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search comments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all duration-150 text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative min-w-[140px]">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none appearance-none text-sm transition-all duration-150"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={fetchComments}
                            disabled={loading}
                            className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                            title="Refresh comments"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        {useMockData && (
                            <button
                                onClick={() => {
                                    setUseMockData(false);
                                    if (activityId) {
                                        fetchComments();
                                    }
                                }}
                                className="px-3 py-2.5 bg-blue-100 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Switch to real data"
                            >
                                <Zap className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Demo mode banner */}
            {useMockData && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Zap className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-blue-800 font-medium">Demo Mode Active</p>
                                <p className="text-blue-600 text-sm">
                                    Showing sample comments with replies and attachments.
                                    <button
                                        onClick={() => setUseMockData(false)}
                                        className="ml-2 text-blue-700 hover:text-blue-900 font-medium"
                                    >
                                        Switch to real data
                                    </button>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                // Generate fresh mock data
                                const newMockComments = generateMockComments();
                                setComments(newMockComments);
                                setFilteredComments(newMockComments);
                            }}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                            Refresh Demo
                        </button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                    <div className="text-sm text-blue-600">Total Comments</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-700">{stats.totalReplies}</div>
                    <div className="text-sm text-green-600">Replies</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-700">{stats.totalLikes}</div>
                    <div className="text-sm text-purple-600">Likes</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-700">{stats.pinned}</div>
                    <div className="text-sm text-yellow-600">Pinned</div>
                </div>
                <div className="bg-cyan-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-cyan-700">{stats.attachments}</div>
                    <div className="text-sm text-cyan-600">Files</div>
                </div>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
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
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <MessageSquare className="w-12 h-12 mb-3" />
                        <p className="font-medium">No comments yet</p>
                        <p className="text-sm mt-1">
                            {searchQuery ? "Try a different search term" : "Be the first to comment"}
                        </p>
                        {canAddComment && !searchQuery && (
                            <button
                                onClick={() => setActiveTab('add')}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Comment
                            </button>
                        )}
                        {!useMockData && (
                            <button
                                onClick={() => {
                                    setUseMockData(true);
                                    fetchComments();
                                }}
                                className="mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                            >
                                <Zap className="w-4 h-4" />
                                Load Demo Data
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-4">
                <button
                    onClick={() => setActiveTab('view')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'view'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        View Comments ({comments.length})
                    </div>
                </button>

                <button
                    onClick={() => canAddComment && setActiveTab('add')}
                    disabled={!canAddComment}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'add'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 disabled:hover:text-slate-500 disabled:cursor-not-allowed'
                        } ${!canAddComment ? 'opacity-50' : ''}`}
                >
                    <div className="flex items-center gap-2">
                        {canAddComment ? (
                            <Send className="w-4 h-4" />
                        ) : (
                            <Lock className="w-4 h-4" />
                        )}
                        {canAddComment ? 'Add Comment' : 'Add Comment (Disabled)'}
                    </div>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'add' ? renderAddCommentTab() : renderViewTab()}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm text-slate-500">
                    <div>
                        <span className="font-medium">{filteredComments.length}</span> comments shown
                        {searchQuery && <span> • Searching for "{searchQuery}"</span>}
                        {stats.private > 0 && canViewPrivateComments && (
                            <span> • <Lock className="w-3 h-3 inline ml-1" /> {stats.private} private</span>
                        )}
                        {stats.attachments > 0 && (
                            <span> • <Paperclip className="w-3 h-3 inline ml-1" /> {stats.attachments} files</span>
                        )}
                        {useMockData && (
                            <span> • <Zap className="w-3 h-3 inline ml-1" /> Demo Mode</span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                const dataStr = JSON.stringify(filteredComments, null, 2);
                                const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                                const link = document.createElement('a');
                                link.setAttribute('href', dataUri);
                                link.setAttribute('download', `comments-${activityId || 'demo'}-${new Date().toISOString().split('T')[0]}.json`);
                                link.click();
                            }}
                            className="flex items-center gap-1 hover:text-slate-700"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedCommentSystem;