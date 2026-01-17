import axios from 'axios';

// Analytics Service runs on port 8002 directly for dev
const analyticsApi = axios.create({
    baseURL: import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:8002',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const logEvent = async (eventType: string, userId: string = 'guest', metadata: any = {}) => {
    try {
        await analyticsApi.post('/api/analytics/event', {
            event_type: eventType,
            user_id: userId,
            metadata: metadata
        });
    } catch (error) {
        // Silently fail for analytics to not disrupt user experience
        console.warn("Failed to log analytics event", error);
    }
};

export const getDashboardStats = async () => {
    const response = await analyticsApi.get('/api/analytics/dashboard');
    return response.data;
};
