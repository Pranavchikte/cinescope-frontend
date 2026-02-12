import { getAccessToken } from './api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'

interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    movies?: Array<{
        id: number
        title: string
        poster: string
        rating: number
        year: number
        media_type: 'movie' | 'tv'
    }>
}

export const chatAPI = {
    ask: async (query: string): Promise<ChatMessage> => {
        const token = getAccessToken()

        if (!token) {
            throw new Error('Please login to use chat')
        }

        const res = await fetch(`${API_BASE_URL}/chat/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ query }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.detail || 'Chat failed')
        }

        const data = await res.json()

        return {
            role: 'assistant',
            content: data.response,
            movies: data.movies,
        }
    },
}