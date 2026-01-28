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

    getGenres: async () => {
        const res = await fetch(`${API_BASE_URL}/movies/genres`)
        return res.json()
    },

    getRecommendations: async (id: number, page: number = 1) => {
        const res = await fetch(`${API_BASE_URL}/movies/${id}/recommendations?page=${page}`)
        return res.json()
    },

    getSimilar: async (id: number, page: number = 1) => {
        const res = await fetch(`${API_BASE_URL}/movies/${id}/similar?page=${page}`)
        return res.json()
    },

    getPersonalized: async (page: number = 1, vote_count_min: number = 500, vote_average_min: number = 6.5) => {
        const token = getAccessToken()
        const res = await fetch(
            `${API_BASE_URL}/movies/personalized?page=${page}&vote_count_min=${vote_count_min}&vote_average_min=${vote_average_min}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        )
        return res.json()
    },

    discover: async (params: {
        genre?: string
        year?: number
        language?: string
        country?: string
        provider?: string
        sort_by?: string
        page?: number
        vote_count_min?: number
        vote_average_min?: number
        vote_average_max?: number
        runtime_min?: number
        runtime_max?: number
    }) => {
        const queryParams = new URLSearchParams()
        if (params.genre) queryParams.append('genre', params.genre)
        if (params.year) queryParams.append('year', params.year.toString())
        if (params.language) queryParams.append('language', params.language)
        if (params.country) queryParams.append('country', params.country)
        if (params.provider) queryParams.append('provider', params.provider)
        if (params.sort_by) queryParams.append('sort_by', params.sort_by)
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.vote_count_min !== undefined) queryParams.append('vote_count_min', params.vote_count_min.toString())
        if (params.vote_average_min !== undefined) queryParams.append('vote_average_min', params.vote_average_min.toString())
        if (params.vote_average_max !== undefined) queryParams.append('vote_average_max', params.vote_average_max.toString())
        if (params.runtime_min !== undefined) queryParams.append('runtime_min', params.runtime_min.toString())
        if (params.runtime_max !== undefined) queryParams.append('runtime_max', params.runtime_max.toString())

        const res = await fetch(`${API_BASE_URL}/movies/discover?${queryParams}`)
        return res.json()
    },

    getProviders: async (region: string = "IN") => {
        const res = await fetch(`${API_BASE_URL}/movies/providers?region=${region}`)
        return res.json()
    },

    getMovieProviders: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/movies/${id}/providers`)
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

    getGenres: async () => {
        const res = await fetch(`${API_BASE_URL}/tv/genres`)
        return res.json()
    },

    getRecommendations: async (id: number, page: number = 1) => {
        const res = await fetch(`${API_BASE_URL}/tv/${id}/recommendations?page=${page}`)
        return res.json()
    },

    getSimilar: async (id: number, page: number = 1) => {
        const res = await fetch(`${API_BASE_URL}/tv/${id}/similar?page=${page}`)
        return res.json()
    },

    getPersonalized: async (page: number = 1, vote_count_min: number = 500, vote_average_min: number = 6.5) => {
        const token = getAccessToken()
        const res = await fetch(
            `${API_BASE_URL}/tv/personalized?page=${page}&vote_count_min=${vote_count_min}&vote_average_min=${vote_average_min}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        )
        return res.json()
    },

    discover: async (params: {
        genre?: string
        year?: number
        language?: string
        country?: string
        provider?: string
        sort_by?: string
        page?: number
        vote_count_min?: number
        vote_average_min?: number
        vote_average_max?: number
    }) => {
        const queryParams = new URLSearchParams()
        if (params.genre) queryParams.append('genre', params.genre)
        if (params.year) queryParams.append('year', params.year.toString())
        if (params.language) queryParams.append('language', params.language)
        if (params.country) queryParams.append('country', params.country)
        if (params.provider) queryParams.append('provider', params.provider)
        if (params.sort_by) queryParams.append('sort_by', params.sort_by)
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.vote_count_min !== undefined) queryParams.append('vote_count_min', params.vote_count_min.toString())
        if (params.vote_average_min !== undefined) queryParams.append('vote_average_min', params.vote_average_min.toString())
        if (params.vote_average_max !== undefined) queryParams.append('vote_average_max', params.vote_average_max.toString())

        const res = await fetch(`${API_BASE_URL}/tv/discover?${queryParams}`)
        return res.json()
    },

    getProviders: async (region: string = "IN") => {
        const res = await fetch(`${API_BASE_URL}/tv/providers?region=${region}`)
        return res.json()
    },

    getTVProviders: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/tv/${id}/providers`)
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

// Creator Requests API
export const creatorRequestsAPI = {
    create: async (message?: string) => {
        const token = getAccessToken()
        const res = await fetch(`${API_BASE_URL}/creator-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    getMyRequest: async () => {
        const token = getAccessToken()
        const res = await fetch(`${API_BASE_URL}/creator-requests/my-request`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    getAll: async (statusFilter?: string) => {
        const token = getAccessToken()
        const url = statusFilter
            ? `${API_BASE_URL}/creator-requests?status_filter=${statusFilter}`
            : `${API_BASE_URL}/creator-requests`
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    approve: async (requestId: string) => {
        const token = getAccessToken()
        const res = await fetch(`${API_BASE_URL}/creator-requests/${requestId}/approve`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    reject: async (requestId: string) => {
        const token = getAccessToken()
        const res = await fetch(`${API_BASE_URL}/creator-requests/${requestId}/reject`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },
}

// Creators API
export const creatorsAPI = {
    getAll: async () => {
        const res = await fetch(`${API_BASE_URL}/creators`)
        return res.json()
    },

    getRatings: async (username: string, ratingFilter?: string, mediaType?: string) => {
        const params = new URLSearchParams()
        if (ratingFilter) params.append('rating_filter', ratingFilter)
        if (mediaType) params.append('media_type', mediaType)

        const url = params.toString()
            ? `${API_BASE_URL}/creators/${username}/ratings?${params}`
            : `${API_BASE_URL}/creators/${username}/ratings`

        const res = await fetch(url)
        return res.json()
    },
}

// Update profile API
export const profileAPI = {
    update: async (data: { is_public_profile?: boolean }) => {
        const token = getAccessToken()
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },
}