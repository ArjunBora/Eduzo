import axios from 'axios';

// AI Service runs on port 8001 directly for dev, or 8080 via gateway
const aiApi = axios.create({
    baseURL: import.meta.env.VITE_AI_API_URL || 'http://localhost:8001',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const askQuestion = async (question: string, studentId: string) => {
    const response = await aiApi.post('/api/ai/ask', {
        question,
        student_id: studentId
    });
    return response.data;
};
