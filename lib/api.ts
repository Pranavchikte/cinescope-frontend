const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'

// Token management
// Token management (localStorage + cookies for middleware)
export const getAccessToken = () => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('refresh_token') || localStorage.getItem('refresh_token');
};

export const setTokens = (accessToken: string, refreshToken: string, remember: boolean = true) => {
    if (typeof window === 'undefined') return;

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('access_token', accessToken);
    storage.setItem('refresh_token', refreshToken);

    if (remember) {
        document.cookie = `access_token=${accessToken}; path=/; max-age=${60 * 60}`; // 1 hour
        document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    } else {
        document.cookie = `access_token=${accessToken}; path=/`;
        document.cookie = `refresh_token=${refreshToken}; path=/`;
    }
};

export const clearTokens = () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');

    // Clear cookies
    document.cookie = 'access_token=; path=/; max-age=0';
    document.cookie = 'refresh_token=; path=/; max-age=0';
};
// Refresh token logic
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

const refreshAccessToken = async (): Promise<boolean> => {
    if (isRefreshing && refreshPromise) {
        return refreshPromise
    }

    isRefreshing = true
    refreshPromise = (async () => {
        try {
            const refreshToken = getRefreshToken()
            if (!refreshToken) return false

            const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            })

            if (!res.ok) {
                clearTokens()
                return false
            }

            const tokens = await res.json()
            setTokens(tokens.access_token, tokens.refresh_token)
            return true
        } catch {
            clearTokens()
            return false
        } finally {
            isRefreshing = false
            refreshPromise = null
        }
    })()

    return refreshPromise
}

// Authenticated fetch wrapper
const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = getAccessToken()

    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    })

    // If 401, try refresh and retry once
    if (res.status === 401) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
            const newToken = getAccessToken()
            return fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${newToken}`,
                },
            })
        }
    }

    return res
}

const getErrorMessageFromResponse = async (res: Response): Promise<string> => {
    const rawText = await res.text()
    if (!rawText) return res.statusText || 'Request failed'

    try {
        const data = JSON.parse(rawText)
        if (typeof data.detail === 'string') return data.detail
        if (Array.isArray(data.detail)) return data.detail.join(', ')
        if (typeof data.message === 'string') return data.message
    } catch {
        // Fall through to rawText
    }

    return rawText
}

type MediaTypeKey = 'movie' | 'tv'
type MediaIdSets = { movie: Set<number>; tv: Set<number> }
type MediaIdMaps = { movie: Map<number, string>; tv: Map<number, string> }

const createEmptyMediaIdSets = (): MediaIdSets => ({ movie: new Set<number>(), tv: new Set<number>() })

const buildMediaIdSets = (items: Array<{ tmdb_id: number; media_type: MediaTypeKey }>): MediaIdSets => {
    const sets: MediaIdSets = { movie: new Set(), tv: new Set() }
    for (const item of items) {
        if (item.media_type === 'movie' || item.media_type === 'tv') {
            sets[item.media_type].add(item.tmdb_id)
        }
    }
    return sets
}

const buildWatchlistIdMap = (items: Array<{ id: string; tmdb_id: number; media_type: MediaTypeKey }>): MediaIdMaps => {
    const maps: MediaIdMaps = { movie: new Map(), tv: new Map() }
    for (const item of items) {
        if (item.media_type === 'movie' || item.media_type === 'tv') {
            maps[item.media_type].set(item.tmdb_id, item.id)
        }
    }
    return maps
}

let watchlistIdsCache: MediaIdSets | null = null
let watchlistIdsPromise: Promise<MediaIdSets> | null = null
let watchlistItemIdCache: MediaIdMaps | null = null
let ratingIdsCache: MediaIdSets | null = null
let ratingIdsPromise: Promise<MediaIdSets> | null = null

export const getCachedWatchlistIds = async (): Promise<MediaIdSets> => {
    if (!getAccessToken()) return createEmptyMediaIdSets()
    if (watchlistIdsCache) return watchlistIdsCache
    if (watchlistIdsPromise) return watchlistIdsPromise

    watchlistIdsPromise = (async () => {
        const items = await watchlistAPI.get()
        const sets = buildMediaIdSets(items)
        watchlistItemIdCache = buildWatchlistIdMap(items)
        watchlistIdsCache = sets
        return sets
    })()
        .catch(() => createEmptyMediaIdSets())
        .finally(() => {
            watchlistIdsPromise = null
        })

    return watchlistIdsPromise
}

export const getCachedWatchlistItemId = async (tmdbId: number, mediaType: MediaTypeKey): Promise<string | null> => {
    if (!getAccessToken()) return null
    if (!watchlistIdsCache || !watchlistItemIdCache) {
        await getCachedWatchlistIds()
    }
    return watchlistItemIdCache?.[mediaType].get(tmdbId) ?? null
}

export const getCachedRatingIds = async (): Promise<MediaIdSets> => {
    if (!getAccessToken()) return createEmptyMediaIdSets()
    if (ratingIdsCache) return ratingIdsCache
    if (ratingIdsPromise) return ratingIdsPromise

    ratingIdsPromise = (async () => {
        const items = await ratingsAPI.get()
        const sets = buildMediaIdSets(items)
        ratingIdsCache = sets
        return sets
    })()
        .catch(() => createEmptyMediaIdSets())
        .finally(() => {
            ratingIdsPromise = null
        })

    return ratingIdsPromise
}

const addToWatchlistCache = (tmdbId: number, mediaType: MediaTypeKey) => {
    if (!watchlistIdsCache) return
    watchlistIdsCache[mediaType].add(tmdbId)
}

export const removeFromWatchlistCache = (tmdbId: number, mediaType: MediaTypeKey) => {
    if (!watchlistIdsCache) return
    watchlistIdsCache[mediaType].delete(tmdbId)
    if (watchlistItemIdCache) {
        watchlistItemIdCache[mediaType].delete(tmdbId)
    }
}

const addToRatingsCache = (tmdbId: number, mediaType: MediaTypeKey) => {
    if (!ratingIdsCache) return
    ratingIdsCache[mediaType].add(tmdbId)
}

// Auth API
// Auth API
export const authAPI = {
    register: async (data: { username: string; email: string; password: string }) => {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.detail || 'Registration failed')
        }
        return res.json()
    },

    login: async (data: { email: string; password: string; remember?: boolean }) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.detail || 'Login failed')
        }
        const tokens = await res.json()
        setTokens(tokens.access_token, tokens.refresh_token, data.remember !== false)
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
        const res = await authFetch(`${API_BASE_URL}/auth/resend-verification`, {
            method: 'POST',
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    getCurrentUser: async () => {
        const res = await authFetch(`${API_BASE_URL}/auth/me`)
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

    getImages: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/movies/${id}/images`)
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
        const res = await authFetch(
            `${API_BASE_URL}/movies/personalized?page=${page}&vote_count_min=${vote_count_min}&vote_average_min=${vote_average_min}`
        )
        if (!res.ok) {
            console.error('Personalized API failed:', res.status, await res.text())
            return { results: [] } // Return empty array instead of nothing
        }
        return res.json()
    },
    discover: async (params: {
        genre?: string
        provider?: string
        page?: number
    }) => {
        const queryParams = new URLSearchParams()
        if (params.genre) queryParams.append('genre', params.genre)
        if (params.provider) queryParams.append('provider', params.provider)
        if (params.page) queryParams.append('page', params.page.toString())

        // Hardcoded values
        queryParams.append('sort_by', 'popularity.desc')
        queryParams.append('vote_count_min', '100')

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

    // ADD THIS NEW METHOD
    getBatchDetails: async (ids: number[]) => {
        const res = await fetch(`${API_BASE_URL}/movies/batch-details?ids=${ids.join(',')}`)
        return res.json()
    },

    getFullDetails: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/movies/full-details/${id}`)
        if (!res.ok) {
            console.error('Full details API failed:', res.status, await res.text())
            throw new Error('Failed to fetch movie details')
        }
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

    getImages: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/tv/${id}/images`)
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
        const res = await authFetch(
            `${API_BASE_URL}/tv/personalized?page=${page}&vote_count_min=${vote_count_min}&vote_average_min=${vote_average_min}`
        )
        return res.json()
    },

    discover: async (params: {
        genre?: string
        provider?: string
        page?: number
    }) => {
        const queryParams = new URLSearchParams()
        if (params.genre) queryParams.append('genre', params.genre)
        if (params.provider) queryParams.append('provider', params.provider)
        if (params.page) queryParams.append('page', params.page.toString())

        // Hardcoded values
        queryParams.append('sort_by', 'popularity.desc')
        queryParams.append('vote_count_min', '100')

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

    getSeason: async (id: number, seasonNumber: number) => {
        const res = await fetch(`${API_BASE_URL}/tv/${id}/season/${seasonNumber}`)
        return res.json()
    },

    // ADD THIS NEW METHOD to tvAPI
    getBatchDetails: async (ids: number[]) => {
        const res = await fetch(`${API_BASE_URL}/tv/batch-details?ids=${ids.join(',')}`)
        return res.json()
    },

    getFullDetails: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/tv/full-details/${id}`)
        if (!res.ok) {
            console.error('TV full details API failed:', res.status, await res.text())
            throw new Error('Failed to fetch TV details')
        }
        return res.json()
    },
}

// Watchlist API (protected)
export const watchlistAPI = {
    get: async () => {
        const res = await authFetch(`${API_BASE_URL}/watchlist`)
        const data = await res.json()
        return data.results || []  // <- CHANGED: extract results array
    },

    add: async (data: { tmdb_id: number; media_type: 'movie' | 'tv' }) => {
        const res = await authFetch(`${API_BASE_URL}/watchlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(await getErrorMessageFromResponse(res))
        const created = await res.json()
        addToWatchlistCache(data.tmdb_id, data.media_type)
        if (!watchlistItemIdCache) {
            watchlistItemIdCache = { movie: new Map(), tv: new Map() }
        }
        watchlistItemIdCache[data.media_type].set(data.tmdb_id, created.id)
        return created
    },

    remove: async (id: string) => {
        const res = await authFetch(`${API_BASE_URL}/watchlist/${id}`, {
            method: 'DELETE',
        })
        if (!res.ok) throw new Error(await getErrorMessageFromResponse(res))
        return res.json()
    },
}


// Ratings API (protected)
export const ratingsAPI = {
    get: async () => {
        const res = await authFetch(`${API_BASE_URL}/ratings`)
        const data = await res.json()
        return data.results || []  // <- CHANGED: extract results array
    },

    create: async (data: { tmdb_id: number; media_type: 'movie' | 'tv'; rating: string }) => {
        const res = await authFetch(`${API_BASE_URL}/ratings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(await getErrorMessageFromResponse(res))
        const created = await res.json()
        addToRatingsCache(data.tmdb_id, data.media_type)
        return created
    },

    update: async (id: string, rating: string) => {
        const res = await authFetch(`${API_BASE_URL}/ratings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating }),
        })
        if (!res.ok) throw new Error(await getErrorMessageFromResponse(res))
        return res.json()
    },

    delete: async (id: string) => {
        const res = await authFetch(`${API_BASE_URL}/ratings/${id}`, {
            method: 'DELETE',
        })
        if (!res.ok) throw new Error(await getErrorMessageFromResponse(res))
        return res.json()
    },
}

// Creator Requests API
export const creatorRequestsAPI = {
    create: async (message?: string) => {
        const res = await authFetch(`${API_BASE_URL}/creator-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    getMyRequest: async () => {
        const res = await authFetch(`${API_BASE_URL}/creator-requests/my-request`)
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    getAll: async (statusFilter?: string) => {
        const url = statusFilter
            ? `${API_BASE_URL}/creator-requests?status_filter=${statusFilter}`
            : `${API_BASE_URL}/creator-requests`
        const res = await authFetch(url)
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    approve: async (requestId: string) => {
        const res = await authFetch(`${API_BASE_URL}/creator-requests/${requestId}/approve`, {
            method: 'PATCH',
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    reject: async (requestId: string) => {
        const res = await authFetch(`${API_BASE_URL}/creator-requests/${requestId}/reject`, {
            method: 'PATCH',
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

// People API
export const peopleAPI = {
    getDetails: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/people/${id}`)
        return res.json()
    },

    getMovieCredits: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/people/${id}/movie-credits`)
        return res.json()
    },

    getTVCredits: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/people/${id}/tv-credits`)
        return res.json()
    },
}


// Update profile API
export const profileAPI = {
    update: async (data: { is_public_profile?: boolean }) => {
        const res = await authFetch(`${API_BASE_URL}/auth/me`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },
}
