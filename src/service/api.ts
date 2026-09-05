const host = window.location.hostname || 'localhost';
const API_BASE_URL = `http://${host}:8080/api/v1`;

export type Role = 'user' | 'admin' | 'verifier';

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
    did?: string;
    country?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
}

export interface AuthResponse {
    token?: string;
    user?: UserProfile;
    requiresMfa?: boolean;
    email?: string;
    message: string;
}

export interface DocumentInfo {
    id: number;
    name: string;
    type: string;
    status: string;
    size: string;
    docHash: string;
    storageUrl: string;
    uploadDate: string;
    remarks?: string;
    rejectedReason?: string;
}

export interface IdentityStatusResponse {
    userStatus: string;
    did: string;
    aadhaar?: string;
    pan?: string;
    passport?: string;
    license?: string;
    submittedAt?: string;
    verifiedAt?: string;
    blockNumber?: number;
    blockchainHash?: string;
    rejectedReason?: string;
    documents: DocumentInfo[];
}

export interface BlockchainBlock {
    id: number;
    blockNumber: number;
    timestamp: string;
    identityId: number;
    previousHash: string;
    currentHash: string;
    sha256Hash: string;
    validationStatus: string;
}

export interface VerificationHistoryItem {
    id: number;
    userId: number;
    userName?: string;
    verifierName?: string;
    purpose: string;
    verificationDate: string;
    status: string;
    duration: string;
    checkedFields: string;
    reportUrl: string;
}

export interface AuditLogItem {
    id: number;
    action: string;
    actor: string;
    target: string;
    timestamp: string;
    ipAddress: string;
    severity: string;
    module: string;
}

export interface NotificationItem {
    id: number;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

// Global tokens helper
export const getAuthToken = () => localStorage.getItem('token') || '';
export const setAuthToken = (token: string) => localStorage.setItem('token', token);
export const getSavedUser = (): UserProfile | null => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
};
export const setSavedUser = (user: UserProfile) => localStorage.setItem('user', JSON.stringify(user));
export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const headers = new Headers(options.headers || {});

    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            clearAuth();
        }
        let errMsg = `Request failed with status ${response.status}`;
        try {
            const errorData = await response.json();
            errMsg = errorData.message || errMsg;
        } catch {
            // ignore
        }
        throw new Error(errMsg);
    }

    // Handle file responses
    if (response.headers.get('content-type')?.includes('application/pdf')) {
        return response.blob() as unknown as T;
    }

    return response.json() as Promise<T>;
}

// ── Auth Endpoints ────────────────────────────────────────────────────────────
export const authApi = {
    login: (email: string, password: string): Promise<AuthResponse> =>
        apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    verifyOtp: (email: string, otp: string): Promise<Required<AuthResponse>> =>
        apiFetch('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        }),

    register: (form: Record<string, string>): Promise<AuthResponse> =>
        apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify(form),
        }),

    check(email: string, phone: string): Promise<{ message: string }> {
        return apiFetch('/auth/check', {
            method: 'POST',
            body: JSON.stringify({ email, phone }),
        });
    },

    forgotPassword(email: string): Promise<{ message: string }> {
        return apiFetch('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    verifyResetOtp(email: string, otp: string): Promise<{ message: string }> {
        return apiFetch('/auth/verify-reset-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        });
    },

    resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
        return apiFetch('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, otp, newPassword }),
        });
    },

    revokeSession(): Promise<{ message: string }> {
        return apiFetch('/auth/revoke-session', {
            method: 'POST'
        });
    }
};

// ── User Endpoints ────────────────────────────────────────────────────────────
export const userApi = {
    getIdentityStatus: (): Promise<IdentityStatusResponse> =>
        apiFetch('/identity/status'),

    uploadDocument: (file: File, type: string): Promise<{ message: string; document: DocumentInfo }> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        return apiFetch('/identity/upload-document', {
            method: 'POST',
            body: formData,
        });
    },

    updateProfile: (profile: { name?: string; phone?: string; country?: string; street?: string; city?: string; state?: string; zip?: string; }): Promise<{ message: string; user: Partial<UserProfile> }> =>
        apiFetch('/identity/profile', {
            method: 'PUT',
            body: JSON.stringify(profile),
        }),

    getMyDocuments: (): Promise<DocumentInfo[]> =>
        apiFetch('/identity/documents'),

    getVerificationHistory: (): Promise<VerificationHistoryItem[]> =>
        apiFetch('/identity/history'),

    getNotifications: (): Promise<NotificationItem[]> =>
        apiFetch('/identity/notifications'),

    markNotificationsRead: (): Promise<{ message: string }> =>
        apiFetch('/identity/notifications/read', {
            method: 'POST',
        }),

    deleteDocument: (documentId: number): Promise<{ message: string }> =>
        apiFetch(`/identity/documents/${documentId}`, {
            method: 'DELETE',
        }),

    updatePassword: (payload: any): Promise<{ message: string }> =>
        apiFetch('/identity/password', {
            method: 'PUT',
            body: JSON.stringify(payload),
        }),

    deleteAccount: (payload: any): Promise<{ message: string }> =>
        apiFetch('/identity/account', {
            method: 'DELETE',
            body: JSON.stringify(payload),
        }),
};

// ── Admin Endpoints ───────────────────────────────────────────────────────────
export const adminApi = {
    getStats: (): Promise<{
        totalUsers: number;
        totalVerified: number;
        pendingVerification: number;
        rejectedRequests: number;
        blockchainBlocks: number;
        todayVerifications: number;
    }> => apiFetch('/admin/stats'),

    getUsers: (search = '', page = 0, size = 10): Promise<{
        users: (UserProfile & { joinDate: string; documentsCount: number })[];
        currentPage: number;
        totalItems: number;
        totalPages: number;
    }> => apiFetch(`/admin/users?search=${encodeURIComponent(search)}&page=${page}&size=${size}`),

    getUserIdentity: (id: number): Promise<{
        user: any;
        record: any;
        documents: any[];
        history: any[];
    }> => apiFetch(`/admin/users/${id}/identity`),

    getPendingRequests: (page = 0, size = 10): Promise<{
        requests: {
            id: number;
            userId: number;
            name: string;
            email: string;
            did: string;
            aadhaar: string;
            pan: string;
            passport: string;
            license: string;
            submittedAt: string;
            documents: DocumentInfo[];
        }[];
        currentPage: number;
        totalItems: number;
        totalPages: number;
    }> => apiFetch(`/admin/pending-requests?page=${page}&size=${size}`),

    approveIdentity: (userId: number, payload?: any): Promise<{ message: string }> =>
        apiFetch(`/admin/approve/${userId}`, {
            method: 'POST',
            body: payload ? JSON.stringify(payload) : undefined
        }),

    rejectIdentity: (userId: number, reason: string): Promise<{ message: string }> =>
        apiFetch(`/admin/reject/${userId}`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        }),

    getBlockchainBlocks: (): Promise<BlockchainBlock[]> =>
        apiFetch('/admin/blockchain/blocks'),

    getAuditLogs: (page = 0, size = 10, severity = ''): Promise<{
        logs: AuditLogItem[];
        currentPage: number;
        totalItems: number;
        totalPages: number;
    }> => apiFetch(`/admin/audit-logs?page=${page}&size=${size}&severity=${severity}`),

    deleteAuditLog: (id: number): Promise<{ message: string }> =>
        apiFetch(`/admin/audit-logs/${id}`, { method: 'DELETE' }),

    getAdminNotifications: (): Promise<any[]> => apiFetch('/admin/notifications'),

    getMonthlyAnalytics: (): Promise<any[]> =>
        apiFetch('/admin/analytics/monthly'),

    deleteUser: (userId: number): Promise<{ message: string }> =>
        apiFetch(`/admin/users/${userId}`, { method: 'DELETE' }),

    updateRole(userId: number, role: string): Promise<{ message: string }> {
        return apiFetch(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    },
    updateStatus(userId: number, status: string): Promise<{ message: string }> {
        return apiFetch(`/admin/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },
    reviewDocuments: (userId: number, decisions: { docId: number; decision: string; validUntil?: string; reason?: string }[]): Promise<{ message: string; approved: number; rejected: number }> =>
        apiFetch(`/admin/review-documents/${userId}`, {
            method: 'POST',
            body: JSON.stringify(decisions),
        }),
};

// ── Verifier Endpoints ────────────────────────────────────────────────────────
export const verifierApi = {
    scanQrCode: (did: string): Promise<{
        name: string;
        email: string;
        phone: string;
        country: string;
        did: string;
        aadhaar?: string;
        pan?: string;
        passport?: string;
        license?: string;
        blockNumber?: number;
        blockchainHash?: string;
        status: string;
        tamperingDetected: boolean;
        message: string;
    }> => apiFetch(`/verify/scan/${did}`),

    verifyIdentity: (did: string, purpose = 'KYC Verification', checkedFields = 'Name, DID, Country'): Promise<{
        message: string;
        verificationId: number;
        status: string;
        duration: string;
        tamperingDetected: boolean;
    }> => apiFetch('/verify/identity', {
        method: 'POST',
        body: JSON.stringify({ did, purpose, checkedFields }),
    }),

    getVerifierHistory: (): Promise<VerificationHistoryItem[]> =>
        apiFetch('/verify/history'),

    deleteVerifierHistory: (historyId: number): Promise<{ message: string }> =>
        apiFetch(`/verify/history/${historyId}`, { method: 'DELETE' }),

    flagFraud: (historyId: number): Promise<{ message: string }> =>
        apiFetch(`/verify/history/${historyId}/flag`, { method: 'PUT' }),

    submitSupportTicket: (subject: string, message: string): Promise<{ message: string }> =>
        apiFetch('/verify/support', {
            method: 'POST',
            body: JSON.stringify({ subject, message })
        })
};

// ── Reports Endpoint ──────────────────────────────────────────────────────────
export const reportsApi = {
    downloadReportUrl: (historyId: number) => `${API_BASE_URL}/reports/verification/${historyId}`,
};
