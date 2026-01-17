const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'

// Token management
export const getAccessToken = () => localStorage.getItem('access_token')
export const getRefreshToken = () => localStorage.getItem('refresh_token')
export const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
}
export const clearTokens = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
}

// Auth API
export const authAPI = {
    register: async (data: { username: string; email: string; password: string }) => {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    login: async (data: { email: string; password: string }) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(await res.text())
        const tokens = await res.json()
        setTokens(tokens.access_token, tokens.refresh_token)
        return tokens
    },

    logout: () => {
        clearTokens()
    },

    forgotPassword: async (email: string) => {
        const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    resetPassword: async (token: string, newPassword: string) => {
        const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, new_password: newPassword }),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    verifyEmail: async (token: string) => {
        const res = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
            method: 'POST',
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    resendVerification: async () => {
        const token = getAccessToken()
        const res = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    getCurrentUser: async () => {
        const token = getAccessToken()
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },
}


// Movies API
export const moviesAPI = {
    getTrending: async () => {
        const res = await fetch(`${API_BASE_URL}/movies/trending`)
        return res.json()
    },

    getPopular: async () => {
        const res = await fetch(`${API_BASE_URL}/movies/popular`)
        return res.json()
    },

    search: async (query: string) => {
        const res = await fetch(`${API_BASE_URL}/movies/search?query=${encodeURIComponent(query)}`)
        return res.json()
    },

    getDetails: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/movies/${id}`)
        return res.json()
    },

    getCredits: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/movies/${id}/credits`)
        return res.json()
    },

    getVideos: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/movies/${id}/videos`)
        return res.json()
    },
}

// TV Shows API
export const tvAPI = {
    getTrending: async () => {
        const res = await fetch(`${API_BASE_URL}/tv/trending`)
        return res.json()
    },

    getPopular: async () => {
        const res = await fetch(`${API_BASE_URL}/tv/popular`)
        return res.json()
    },

    search: async (query: string) => {
        const res = await fetch(`${API_BASE_URL}/tv/search?query=${encodeURIComponent(query)}`)
        return res.json()
    },

    getDetails: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/tv/${id}`)
        return res.json()
    },

    getCredits: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/tv/${id}/credits`)
        return res.json()
    },

    getVideos: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/tv/${id}/videos`)
        return res.json()
    },
}

// Watchlist API (protected)
export const watchlistAPI = {
    get: async () => {
        const token = getAccessToken()
        const res = await fetch(`${API_BASE_URL}/watchlist`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return res.json()
    },

    add: async (data: { tmdb_id: number; media_type: 'movie' | 'tv' }) => {
        const token = getAccessToken()
        const res = await fetch(`${API_BASE_URL}/watchlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    remove: async (id: string) => {
        const token = getAccessToken()
        const res = await fetch(`${API_BASE_URL}/watchlist/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        })
        return res.json()
    },
}

// Ratings API (protected)
export const ratingsAPI = {
    get: async () => {
        const token = getAccessToken()
        const res = await fetch(`${API_BASE_URL}/ratings`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        return res.json()
    },

    create: async (data: { tmdb_id: number; media_type: 'movie' | 'tv'; rating: string }) => {
        const token = getAccessToken()
        const res = await fetch(`${API_BASE_URL}/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    update: async (id: string, rating: string) => {
        const token = getAccessToken()
        const res = await fetch(`${API_BASE_URL}/ratings/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rating }),
        })
        return res.json()
    },

    delete: async (id: string) => {
        const token = getAccessToken()
        const res = await fetch(`${API_BASE_URL}/ratings/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        })
        return res.json()
    },
}