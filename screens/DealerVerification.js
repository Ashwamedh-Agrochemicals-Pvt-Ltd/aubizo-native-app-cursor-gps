import { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Image,
    Linking,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import DESIGN from '../src/theme';
import { useRoute } from '@react-navigation/native';
import apiClient from '../src/api/client';
import { SafeAreaView } from 'react-native-safe-area-context';

const DealerVerificationScreen = () => {
    const route = useRoute();
    const { dealer } = route.params;
    const [dealerData, setDealerData] = useState(null);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [viewingDocument, setViewingDocument] = useState(null);
    const [documentModalVisible, setDocumentModalVisible] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});

    const fetchDealerDetails = async () => {
        try {
            const response = await apiClient.get(`dealer/${dealer}/`);
            setDealerData(response.data);
        } catch (error) {
            console.error("Error fetching dealer details:", error);
            Alert.alert('Error', 'Failed to load dealer information');
        }
    };

    const initializeDocumentTypes = async () => {
        try {
            setLoading(true);

            const typesResponse = await apiClient.get(`dealer/filters/document-types/`);
            const availableTypes = typesResponse.data.document_types;

            const documentsResponse = await apiClient.get(`dealer/${dealer}/documents/`);
            const existingDocs = documentsResponse.data;

            setUploadedDocuments(existingDocs);

            const docs = availableTypes.map((type) => {
                const existingDoc = existingDocs.find(doc => doc.document_type === type.value);

                let docStatus = 'pending';
                if (existingDoc) {
                    docStatus = existingDoc.status === 'rejected' ? 'rejected' : 'uploaded';
                }

                return {
                    id: type.value,
                    name: type.label,
                    value: type.value,
                    status: docStatus,
                    document: existingDoc || null,
                };
            });

            setDocumentTypes(docs);
        } catch (error) {
            console.error("Error initializing document types:", error);
            Alert.alert('Error', 'Failed to load document information');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDealerDetails();
    }, [dealer]);

    useEffect(() => {
        if (dealerData) {
            initializeDocumentTypes();
        }
    }, [dealerData]);

    const totalDocuments = documentTypes.length;
    const uploadedCount = documentTypes.filter(doc => doc.status === 'uploaded').length;
    const uploadingCount = documentTypes.filter(doc => doc.status === 'uploading').length;
    const remainingCount = totalDocuments - uploadedCount - uploadingCount;

    const handleDocumentUpload = async (documentType) => {
        if (documentType.status === 'uploading') {
            Alert.alert('Upload in Progress', 'Please wait for the current upload to complete.');
            return;
        }

        if (documentType.status === 'uploaded') {
            Alert.alert(
                'Document Already Uploaded',
                'Do you want to replace this document?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Replace',
                        onPress: () => openFilePicker(documentType),
                        style: 'destructive'
                    },
                ]
            );
            return;
        }

        await openFilePicker(documentType);
    };

    const openFilePicker = async (documentType) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'image/*',
                ],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets?.[0]) {
                const fileAsset = result.assets[0];

                Alert.alert(
                    'Confirm Upload',
                    `Do you want to upload this document?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Upload',
                            onPress: async () => {
                                if (documentType.status === 'rejected') {
                                    await deleteRejectedDocument(documentType);
                                }
                                await uploadDocument(documentType, fileAsset);
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            if (error.code === 'E_DOCUMENT_PICKER_CANCELLED') {
                console.log('Document picker was cancelled');
                return;
            }

            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to select document. Please try again.');
        }
    };

    const deleteRejectedDocument = async (documentType) => {
        try {
            if (documentType.document?.id) {
                await apiClient.delete(`dealer/${dealer}/documents/${documentType.document.id}/`);

                updateDocumentStatus(documentType.id, 'pending', { document: null });
                setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentType.document.id));
            }
        } catch (error) {
            console.error('Error deleting rejected document:', error);
            Alert.alert('Error', 'Failed to delete rejected document');
            throw error;
        }
    };

    const uploadDocument = async (documentType, fileAsset) => {
        try {
            // Set uploading status immediately
            updateDocumentStatus(documentType.id, 'uploading');
            setUploadProgress(prev => ({ ...prev, [documentType.id]: 0 }));

            console.log('📤 Starting upload for:', documentType.name);

            const formData = new FormData();
            formData.append('dealer', dealer);
            formData.append('document_type', documentType.value);

            let mimeType = fileAsset.mimeType || fileAsset.type;
            let fileName = fileAsset.fileName || fileAsset.name;

            if (!mimeType) {
                const ext = fileAsset.uri.split('.').pop().toLowerCase();
                const mimeTypes = {
                    'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
                    'gif': 'image/gif', 'pdf': 'application/pdf'
                };
                mimeType = mimeTypes[ext] || 'image/jpeg';
            }

            if (!fileName) {
                const extension = mimeType.split('/')[1] || 'jpg';
                fileName = `document_${documentType.value}_${Date.now()}.${extension}`;
            }

            formData.append('document_file', {
                uri: fileAsset.uri,
                type: mimeType,
                name: fileName,
            });

            // 🔥 SIMULATE PROGRESS (since onUploadProgress doesn't work in RN)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const currentProgress = prev[documentType.id] || 0;
                    // Increment by 10% every 200ms, but stop at 90%
                    const newProgress = Math.min(currentProgress + 10, 90);
                    console.log(`📊 Upload progress: ${newProgress}%`);
                    return { ...prev, [documentType.id]: newProgress };
                });
            }, 200);

            try {
                const response = await apiClient.post(
                    `dealer/${dealer}/documents/`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        timeout: 60000, // 60 second timeout
                    }
                );

                // Clear the progress interval
                clearInterval(progressInterval);

                // Set to 100% when upload completes
                setUploadProgress(prev => ({ ...prev, [documentType.id]: 100 }));
                console.log('✅ Upload complete: 100%');

                // Give a small delay to show 100% before changing status
                setTimeout(() => {
                    if (response.data) {
                        updateDocumentStatus(documentType.id, 'uploaded', {
                            document: response.data,
                        });
                        setUploadedDocuments(prev => [...prev, response.data]);

                        Alert.alert('Success', 'Document uploaded successfully!');

                        // Clear progress after successful upload
                        setTimeout(() => {
                            setUploadProgress(prev => {
                                const { [documentType.id]: _, ...rest } = prev;
                                return rest;
                            });
                        }, 1000);
                    }
                }, 500);

            } catch (uploadError) {
                clearInterval(progressInterval);
                throw uploadError;
            }

        } catch (error) {
            console.error('❌ Upload error:', error);

            // Revert status on error
            updateDocumentStatus(documentType.id, documentType.document ? 'uploaded' : 'pending');

            // Clear progress on error
            setUploadProgress(prev => {
                const { [documentType.id]: _, ...rest } = prev;
                return rest;
            });

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.detail ||
                'Failed to upload document. Please try again.';

            Alert.alert('Upload Failed', errorMessage);
        }
    };

    const updateDocumentStatus = (id, status, additionalData = {}) => {
        setDocumentTypes(prevDocs =>
            prevDocs.map(doc => doc.id === id ? { ...doc, status, ...additionalData } : doc)
        );
    };

    const handleViewDocument = async (doc) => {
        try {
            if (!doc.document?.id) {
                Alert.alert('Error', 'Document information not available');
                return;
            }

            setLoading(true);
            const response = await apiClient.get(`dealer/${dealer}/documents/${doc.document.id}/`);

            if (response.data) {
                setViewingDocument(response.data);
                setDocumentModalVisible(true);
            }
        } catch (error) {
            console.error('Error fetching document:', error);
            Alert.alert('Error', 'Failed to load document details');
        } finally {
            setLoading(false);
        }
    };

    const getApprovalBadge = (status) => {
        const badges = {
            approved: { bg: DESIGN.colors.success, text: 'Approved' },
            rejected: { bg: DESIGN.colors.error, text: 'Rejected' },
            pending: { bg: DESIGN.colors.warning, text: 'Pending' },
        };

        const badge = badges[status];
        if (!badge) return null;

        return (
            <View style={[styles.approvedBadge, { backgroundColor: badge.bg }]}>
                <Text style={styles.approvedText}>{badge.text}</Text>
            </View>
        );
    };

    const currentUploadedDocs = documentTypes.filter(doc => doc.status === 'uploaded');
    const pendingDocuments = documentTypes.filter(doc => doc.status === 'pending' || doc.status === 'rejected');

    const onRefresh = async () => {
        setRefreshing(true);
        await initializeDocumentTypes();
        setRefreshing(false);
    };

    if (loading && !dealerData) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={DESIGN.colors.primary} />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    const handleCallDealer = (phoneNumber) => {
        if (!phoneNumber) {
            Alert.alert("Error", "Phone number not available");
            return;
        }

        const phoneUrl = `tel:${phoneNumber}`;
        Linking.openURL(phoneUrl).catch((error) => {
            console.error("Error opening dialer:", error);
            Alert.alert("Error", "Failed to open phone dialer.");
        });
    };

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: DESIGN.colors.background }}
            edges={['bottom']}
        >
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[DESIGN.colors.primary]} />
                }
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Dealer Info Card */}
                <View style={styles.dealerCard}>
                    <View style={styles.dealerHeader}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={28} color="#fff" />
                        </View>
                        <View style={styles.dealerInfo}>
                            <Text style={styles.dealerName}>{dealerData?.shop_name}</Text>
                            <Text style={styles.dealerCompany}>{dealerData?.owner_name}</Text>
                            {dealerData?.registration_status === 'registered' && (
                                <View style={styles.verifiedBadge}>
                                    <MaterialIcons name="verified" size={14} color={DESIGN.colors.success} />
                                    <Text style={styles.verifiedText}>Verified</Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={styles.contactInfo}>
                        <View style={[styles.contactRow, {
                            justifyContent: "space-between",
                            paddingVertical: 6,
                        }]}>
                            <View style={styles.phoneSection}>
                                <MaterialIcons name="phone" size={16} color={DESIGN.colors.textSecondary} />
                                <Text style={styles.contactText}>{dealerData?.phone}</Text>
                            </View>

                            {dealerData?.phone && (
                                <TouchableOpacity
                                    style={styles.callButton}
                                    onPress={() => handleCallDealer(dealerData?.phone)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons name="call" size={18} color="#fff" />
                                    <Text style={styles.callButtonText}>Call</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.contactRow}>
                            <MaterialIcons name="calendar-today" size={16} color={DESIGN.colors.textSecondary} />
                            <Text style={styles.contactText}>
                                Registered: {dealerData?.registration_date}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Statistics Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, styles.uploadedCard]}>
                        <Text style={styles.statNumber}>{uploadedCount}</Text>
                        <Text style={styles.statLabel}>Uploaded</Text>
                    </View>
                    <View style={[styles.statCard, styles.uploadingCard]}>
                        <Text style={styles.statNumber}>{uploadingCount}</Text>
                        <Text style={styles.statLabel}>Uploading</Text>
                    </View>
                    <View style={[styles.statCard, styles.remainingCard]}>
                        <Text style={styles.statNumber}>{remainingCount}</Text>
                        <Text style={styles.statLabel}>Remaining</Text>
                    </View>
                </View>

                {/* Instructions */}
                <View style={styles.instructionsCard}>
                    <View style={styles.instructionsHeader}>
                        <MaterialIcons name="info" size={20} color={DESIGN.colors.info} />
                        <Text style={styles.instructionsTitle}>How to Upload</Text>
                    </View>
                    <Text style={styles.instructionItem}>• Tap on any document type to upload</Text>
                    <Text style={styles.instructionItem}>• Select the document and confirm</Text>
                    <Text style={styles.instructionItem}>• Wait for verification approval</Text>
                </View>

                {/* Pending Documents */}
                {pendingDocuments.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Documents to Upload</Text>
                            <Text style={styles.sectionSubtitle}>Tap to upload documents</Text>
                        </View>
                        <View style={styles.documentList}>
                            {pendingDocuments.map((doc) => (
                                <View key={doc.id} style={styles.documentItemWrapper}>
                                    <TouchableOpacity
                                        style={[
                                            styles.documentItem,
                                            doc.status === 'uploading' && styles.documentItemUploading,
                                            doc.status === 'rejected' && styles.documentItemRejected
                                        ]}
                                        onPress={() => handleDocumentUpload(doc)}
                                        disabled={doc.status === 'uploading'}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.documentLeft}>
                                            <MaterialIcons
                                                name="description"
                                                size={24}
                                                color={
                                                    doc.status === 'uploading' ? DESIGN.colors.primary :
                                                        doc.status === 'rejected' ? DESIGN.colors.error :
                                                            DESIGN.colors.textSecondary
                                                }
                                            />
                                            <View style={styles.documentInfo}>
                                                <Text style={styles.documentName}>{doc.name}</Text>
                                                {doc.status === 'uploading' && uploadProgress[doc.id] !== undefined ? (
                                                    <View style={styles.uploadingContainer}>
                                                        <ActivityIndicator
                                                            size="small"
                                                            color={DESIGN.colors.primary}
                                                            style={{ marginRight: 8 }}
                                                        />
                                                        <Text style={styles.uploadingStatusText}>
                                                            Uploading {uploadProgress[doc.id]}%
                                                        </Text>
                                                    </View>
                                                ) : doc.status === 'rejected' ? (
                                                    <Text style={styles.rejectedStatusText}>
                                                        Rejected - Tap to re-upload
                                                    </Text>
                                                ) : (
                                                    <Text style={styles.documentStatus}>Not uploaded</Text>
                                                )}
                                            </View>
                                        </View>
                                        {doc.status !== 'uploading' && (
                                            <MaterialIcons
                                                name={doc.status === 'rejected' ? "refresh" : "add-circle-outline"}
                                                size={24}
                                                color={doc.status === 'rejected' ? DESIGN.colors.error : DESIGN.colors.info}
                                            />
                                        )}
                                    </TouchableOpacity>

                                    {/* 🔥 PROGRESS BAR */}
                                    {doc.status === 'uploading' && uploadProgress[doc.id] !== undefined && (
                                        <View style={styles.progressBarContainer}>
                                            <View
                                                style={[
                                                    styles.progressBarFill,
                                                    { width: `${uploadProgress[doc.id]}%` }
                                                ]}
                                            />
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Uploaded Documents */}
                {currentUploadedDocs.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Uploaded Documents</Text>
                            <Text style={styles.sectionSubtitle}>Tap to view details</Text>
                        </View>
                        <View style={styles.documentList}>
                            {currentUploadedDocs.map((doc) => (
                                <TouchableOpacity
                                    key={doc.id}
                                    style={styles.uploadedDocumentItem}
                                    onPress={() => handleViewDocument(doc)}
                                >
                                    <View style={styles.documentLeft}>
                                        <MaterialIcons name="description" size={24} color={DESIGN.colors.info} />
                                        <View style={styles.documentInfo}>
                                            <Text style={styles.documentName}>{doc.name}</Text>
                                            <Text style={styles.uploadDate}>
                                                {doc.document?.uploaded_at &&
                                                    new Date(doc.document.uploaded_at).toLocaleDateString()
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.documentRight}>
                                        {getApprovalBadge(doc.document?.status)}
                                        <MaterialIcons name="chevron-right" size={24} color={DESIGN.colors.textSecondary} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Document View Modal */}
            <Modal
                visible={documentModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setDocumentModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Document Details</Text>
                            <TouchableOpacity onPress={() => setDocumentModalVisible(false)}>
                                <Ionicons name="close" size={28} color={DESIGN.colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {viewingDocument && (
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.modalBody}
                            >
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Document Type</Text>
                                    <Text style={styles.detailValue}>
                                        {viewingDocument.document_type?.toUpperCase()}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Uploaded At</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(viewingDocument.uploaded_at).toLocaleString()}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Status</Text>
                                    {getApprovalBadge(viewingDocument.status)}
                                </View>

                                {viewingDocument.approved_by_details && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Approved By</Text>
                                        <Text style={styles.detailValue}>
                                            {viewingDocument.approved_by_details.first_name} {viewingDocument.approved_by_details.last_name}
                                        </Text>
                                    </View>
                                )}

                                {viewingDocument.approved_at && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Approved At</Text>
                                        <Text style={styles.detailValue}>
                                            {new Date(viewingDocument.approved_at).toLocaleString()}
                                        </Text>
                                    </View>
                                )}

                                {viewingDocument.notes && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Notes</Text>
                                        <Text style={styles.detailValue}>{viewingDocument.notes}</Text>
                                    </View>
                                )}

                                {viewingDocument.document_url && (
                                    <View style={styles.previewSection}>
                                        <Text style={styles.detailLabel}>Preview</Text>
                                        {(() => {
                                            const url = viewingDocument.document_url.toLowerCase();
                                            const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
                                            const isPdf = /\.pdf$/i.test(url);

                                            if (isImage) {
                                                return (
                                                    <Image
                                                        source={{ uri: viewingDocument.document_url }}
                                                        style={styles.documentPreview}
                                                        resizeMode="contain"
                                                    />
                                                );
                                            } else if (isPdf) {
                                                return (
                                                    <View style={styles.filePlaceholder}>
                                                        <MaterialIcons name="picture-as-pdf" size={80} color={DESIGN.colors.error} />
                                                        <Text style={styles.fileText}>PDF Document</Text>
                                                    </View>
                                                );
                                            } else {
                                                return (
                                                    <View style={styles.filePlaceholder}>
                                                        <MaterialIcons name="description" size={80} color={DESIGN.colors.info} />
                                                        <Text style={styles.fileText}>Document File</Text>
                                                    </View>
                                                );
                                            }
                                        })()}
                                    </View>
                                )}

                                {viewingDocument.status === 'rejected' && (
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => {
                                            Alert.alert(
                                                'Delete Document',
                                                'Delete this rejected document to upload a new one?',
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'Delete',
                                                        style: 'destructive',
                                                        onPress: async () => {
                                                            setDocumentModalVisible(false);
                                                            const docType = documentTypes.find(
                                                                d => d.document?.id === viewingDocument.id
                                                            );
                                                            if (docType) {
                                                                try {
                                                                    await deleteRejectedDocument(docType);
                                                                    Alert.alert('Success', 'Document deleted. You can upload a new one.');
                                                                } catch (error) {
                                                                    // Error handled in deleteRejectedDocument
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            );
                                        }}
                                    >
                                        <MaterialIcons name="delete" size={20} color="#fff" />
                                        <Text style={styles.deleteButtonText}>Delete Document</Text>
                                    </TouchableOpacity>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DESIGN.colors.background,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: DESIGN.colors.textSecondary,
    },
    dealerCard: {
        backgroundColor: DESIGN.colors.surface,
        margin: DESIGN.spacing.md,
        padding: DESIGN.spacing.md,
        borderRadius: DESIGN.borderRadius.lg,
        ...DESIGN.shadows.medium,
    },
    dealerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: DESIGN.spacing.md,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: DESIGN.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: DESIGN.spacing.md,
    },
    dealerInfo: {
        flex: 1,
    },
    dealerName: {
        fontSize: 18,
        fontWeight: '600',
        color: DESIGN.colors.textPrimary,
        marginBottom: 4,
    },
    dealerCompany: {
        fontSize: 14,
        color: DESIGN.colors.textSecondary,
        marginBottom: 6,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: DESIGN.spacing.sm,
        paddingVertical: 4,
        borderRadius: DESIGN.borderRadius.md,
        alignSelf: 'flex-start',
    },
    verifiedText: {
        fontSize: 11,
        color: DESIGN.colors.success,
        marginLeft: 4,
        fontWeight: '500',
    },
    contactInfo: {
        marginTop: 10,
        gap: 6,
    },
    contactRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    phoneSection: {
        flexDirection: "row",
        alignItems: "center",
    },
    contactText: {
        marginLeft: 6,
        color: DESIGN.colors.textSecondary,
        fontSize: 15,
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginLeft: 8,
    },
    callButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: DESIGN.spacing.md,
        marginBottom: DESIGN.spacing.md,
        gap: DESIGN.spacing.md,
    },
    statCard: {
        flex: 1,
        padding: DESIGN.spacing.md,
        borderRadius: DESIGN.borderRadius.md,
        alignItems: 'center',
        ...DESIGN.shadows.subtle,
    },
    uploadedCard: {
        backgroundColor: '#E8F5E9',
    },
    uploadingCard: {
        backgroundColor: '#E3F2FD',
    },
    remainingCard: {
        backgroundColor: '#F5F5F5',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: DESIGN.colors.textSecondary,
        fontWeight: '500',
    },
    instructionsCard: {
        backgroundColor: '#E3F2FD',
        margin: DESIGN.spacing.md,
        padding: DESIGN.spacing.md,
        borderRadius: DESIGN.borderRadius.md,
        borderLeftWidth: 3,
        borderLeftColor: DESIGN.colors.info,
    },
    instructionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: DESIGN.spacing.sm,
    },
    instructionsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: DESIGN.colors.info,
        marginLeft: DESIGN.spacing.sm,
    },
    instructionItem: {
        fontSize: 12,
        color: DESIGN.colors.textPrimary,
        marginBottom: 2,
        lineHeight: 18,
    },
    sectionHeader: {
        marginHorizontal: DESIGN.spacing.md,
        marginBottom: DESIGN.spacing.md,
        marginTop: DESIGN.spacing.sm,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: DESIGN.colors.textPrimary,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: DESIGN.colors.textSecondary,
    },
    documentList: {
        marginHorizontal: DESIGN.spacing.md,
    },
    documentItemWrapper: {
        marginBottom: DESIGN.spacing.sm,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: DESIGN.colors.surface,
        padding: DESIGN.spacing.md,
        borderRadius: DESIGN.borderRadius.md,
        ...DESIGN.shadows.subtle,
    },
    documentItemUploading: {
        borderWidth: 2,
        borderColor: DESIGN.colors.primary,
        backgroundColor: '#F5F9FF',
    },
    documentItemRejected: {
        borderWidth: 1,
        borderColor: DESIGN.colors.error,
        backgroundColor: '#FFEBEE',
    },
    documentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    documentInfo: {
        marginLeft: DESIGN.spacing.md,
        flex: 1,
    },
    documentName: {
        fontSize: 15,
        fontWeight: '600',
        color: DESIGN.colors.textPrimary,
        marginBottom: 4,
    },
    documentStatus: {
        fontSize: 12,
        color: DESIGN.colors.textSecondary,
    },
    uploadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    uploadingStatusText: {
        fontSize: 13,
        color: DESIGN.colors.primary,
        fontWeight: '700',
    },
    rejectedStatusText: {
        fontSize: 12,
        color: DESIGN.colors.error,
        fontWeight: '600',
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderBottomLeftRadius: DESIGN.borderRadius.md,
        borderBottomRightRadius: DESIGN.borderRadius.md,
        overflow: 'hidden',
        marginTop: -6,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: DESIGN.colors.primary,
    },
    uploadedDocumentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E8F5E9',
        padding: DESIGN.spacing.md,
        borderRadius: DESIGN.borderRadius.md,
        marginBottom: DESIGN.spacing.sm,
        ...DESIGN.shadows.subtle,
    },
    uploadDate: {
        fontSize: 11,
        color: DESIGN.colors.textSecondary,
        marginTop: 2,
    },
    documentRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    approvedBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: DESIGN.spacing.sm,
        paddingVertical: 4,
        borderRadius: DESIGN.borderRadius.md,
    },
    approvedText: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: DESIGN.colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        minHeight: '50%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: DESIGN.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: DESIGN.colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: DESIGN.colors.textPrimary,
    },
    modalBody: {
        padding: DESIGN.spacing.lg,
        paddingBottom: 40,
    },
    detailRow: {
        marginBottom: DESIGN.spacing.lg,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: DESIGN.colors.textSecondary,
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 15,
        color: DESIGN.colors.textPrimary,
        fontWeight: '500',
    },
    previewSection: {
        marginTop: DESIGN.spacing.md,
    },
    documentPreview: {
        width: '100%',
        height: 300,
        borderRadius: DESIGN.borderRadius.md,
        marginTop: DESIGN.spacing.sm,
        backgroundColor: DESIGN.colors.border,
    },
    filePlaceholder: {
        width: '100%',
        height: 200,
        borderRadius: DESIGN.borderRadius.md,
        marginTop: DESIGN.spacing.sm,
        backgroundColor: DESIGN.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileText: {
        marginTop: DESIGN.spacing.sm,
        fontSize: 14,
        color: DESIGN.colors.textSecondary,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: DESIGN.colors.error,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: DESIGN.spacing.md,
        borderRadius: DESIGN.borderRadius.md,
        marginTop: DESIGN.spacing.xl,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default DealerVerificationScreen;