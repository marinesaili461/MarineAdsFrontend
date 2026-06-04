import api from "./axiosApi";

// ── AUTH ──────────────────────────────────────────────────────
export const registerUser     = (data)          => api.post("/auth/register", data).then(r => r.data);
export const loginUser        = (data)          => api.post("/auth/login", data).then(r => r.data);
export const getProfile       = ()              => api.get("/auth/me").then(r => r.data);
export const resendVerify     = (email)         => api.post("/auth/resend-verification", { email }).then(r => r.data);
export const forgotPassword   = (email)         => api.post("/auth/forgot-password", { email }).then(r => r.data);
export const resetPassword    = (token, pass)   => api.post(`/auth/reset-password/${token}`, { password: pass }).then(r => r.data);

// ── WALLET ────────────────────────────────────────────────────
export const getWallet            = ()          => api.get("/wallet").then(r => r.data);
export const withdrawAmount       = (amount)    => api.post("/wallet/withdraw", { amount }).then(r => r.data);
export const depositAmount        = (amount)    => api.post("/wallet/deposit", { amount }).then(r => r.data);
export const getTransactions      = ()          => api.get("/wallet/transactions").then(r => r.data);
export const getWithdrawalHistory = ()          => api.get("/wallet/withdrawal-history").then(r => r.data);

// ── DAILY CHECK-IN ────────────────────────────────────────────
export const claimCheckIn = () => api.post("/checkin").then(r => r.data);

// ── REFERRAL ──────────────────────────────────────────────────
export const getReferralStats   = () => api.get("/referrals/me").then(r => r.data);
export const getReferralMembers = () => api.get("/referrals/members").then(r => r.data);

// ── REWARD CODES ──────────────────────────────────────────────
export const redeemCode = (code) => api.post("/rewards/redeem", { code }).then(r => r.data);
export const getMyCodes = ()     => api.get("/rewards/my-codes").then(r => r.data);

// ── TASKS ─────────────────────────────────────────────────────
export const getTasks         = ()            => api.get("/tasks").then(r => r.data);
export const getTaskById      = (id)          => api.get(`/tasks/${id}`).then(r => r.data);
export const submitTask       = (id, data)    => api.post(`/submissions/${id}`, data).then(r => r.data);
export const getMySubmissions = ()            => api.get("/submissions/my").then(r => r.data);

// ── CAMPAIGNS ─────────────────────────────────────────────────
export const getCampaigns     = ()            => api.get("/campaigns").then(r => r.data);
export const getCampaignById  = (id)          => api.get(`/campaigns/${id}`).then(r => r.data);
export const submitCampaign   = (id, data)    => api.post(`/campaigns/${id}/submit`, data).then(r => r.data);

// ── CHAT ──────────────────────────────────────────────────────
export const getMessages  = (roomId) => api.get(`/chat/messages/${roomId}`).then(r => r.data);
export const sendMessage  = (data)   => api.post("/chat/message", data).then(r => r.data);

// ── PROFILE ───────────────────────────────────────────────────
export const updateProfile  = (data) => api.put("/users/profile", data).then(r => r.data);
export const changePassword = (data) => api.put("/users/change-password", data).then(r => r.data);

// ── SETTINGS (public) ─────────────────────────────────────────
export const getPublicSettings = () => api.get("/admin/settings").then(r => r.data);

// ── POLLS ─────────────────────────────────────────────────────
export const votePoll = (pollId, optionId) => api.post(`/polls/${pollId}/vote/${optionId}`).then(r => r.data);

// ── ADMIN ─────────────────────────────────────────────────────
export const adminGetSettings        = ()       => api.get("/admin/settings").then(r => r.data);
export const adminUpdateSettings     = (data)   => api.put("/admin/settings", data).then(r => r.data);
export const adminGetUsers           = (params) => api.get("/admin/users", { params }).then(r => r.data);
export const adminBlockUser          = (data)   => api.put("/admin/block-user", data).then(r => r.data);
export const adminChangeRole         = (data)   => api.put("/admin/change-role", data).then(r => r.data);
export const adminAssignBadge        = (data)   => api.put("/admin/assign-badge", data).then(r => r.data);
export const adminGetAnalytics       = ()       => api.get("/admin/analytics").then(r => r.data);
export const adminUpdateBadgeTiers   = (tiers)  => api.put("/admin/badge-tiers", { tiers }).then(r => r.data);
export const adminAddAnnouncement    = (text)   => api.post("/admin/announcements", { text }).then(r => r.data);
export const adminUpdateAnnouncement = (id, data) => api.put(`/admin/announcements/${id}`, data).then(r => r.data);
export const adminDeleteAnnouncement = (id)     => api.delete(`/admin/announcements/${id}`).then(r => r.data);
export const adminCreatePoll         = (data)   => api.post("/admin/polls", data).then(r => r.data);
export const adminClosePoll          = (id)     => api.put(`/admin/polls/${id}/close`).then(r => r.data);
export const adminDeletePoll         = (id)     => api.delete(`/admin/polls/${id}`).then(r => r.data);
export const adminEditWallet         = (data)   => api.put("/admin/wallet/edit", data).then(r => r.data);
export const adminProcessWithdrawal  = (data)   => api.put("/admin/wallet/process-withdrawal", data).then(r => r.data);
export const adminSetPermissions     = (data)   => api.put("/admin/admin-permissions", data).then(r => r.data);
export const adminGetWithdrawals     = ()       => api.get("/admin/withdrawals").then(r => r.data);
export const adminCreateRewardCode   = (data)   => api.post("/rewards", data).then(r => r.data);
export const adminGetRewardCodes     = ()       => api.get("/rewards").then(r => r.data);
export const adminDeactivateCode     = (id)     => api.patch(`/rewards/${id}/deactivate`).then(r => r.data);
