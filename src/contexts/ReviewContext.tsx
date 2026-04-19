/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface ReviewRequest {
    id: string;
    clientId: number;
    clientName: string;
    clientAvatar: string;
    professionalId: number;
    professionalName: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    createdAt: string;
    acceptedAt?: string;
    expiresAt?: string;
}

export interface Review {
    id: string;
    professionalId: number;
    clientName: string;
    clientAvatar: string;
    rating: number;
    comment: string;
    tags: string[];
    isVerified: boolean;
    createdAt: string;
    requestId: string;
}

interface ReviewContextType {
    requests: ReviewRequest[];
    reviews: Review[];
    requestReview: (professionalId: number, professionalName: string) => ReviewRequest;
    acceptReview: (requestId: string) => void;
    rejectReview: (requestId: string) => void;
    submitReview: (requestId: string, rating: number, comment: string, tags: string[]) => Review;
    getReviewsFor: (professionalId: number) => Review[];
    getRequestsForChat: (professionalId: number) => ReviewRequest[];
    hasActiveRequest: (professionalId: number) => boolean;
}

const ReviewContext = createContext<ReviewContextType | null>(null);

const CURRENT_USER = {
    id: 99,
    name: 'Santiago',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
};

// Default verified reviews (pre-existing)
const DEFAULT_REVIEWS: Review[] = [
    {
        id: 'default-1',
        professionalId: 1,
        clientName: 'María García',
        clientAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
        rating: 5,
        comment: 'Excelente profesional, muy puntual y prolijo. Recomiendo 100%.',
        tags: ['Puntual', 'Prolijo'],
        isVerified: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        requestId: 'legacy-1',
    },
    {
        id: 'default-2',
        professionalId: 1,
        clientName: 'Pedro Suárez',
        clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
        rating: 5,
        comment: 'Hizo un trabajo impecable. Precio justo y cumplió con los tiempos.',
        tags: ['Precio justo', 'Recomendable'],
        isVerified: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        requestId: 'legacy-2',
    },
    {
        id: 'default-3',
        professionalId: 1,
        clientName: 'Laura Martínez',
        clientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop',
        rating: 4,
        comment: 'Muy buen trabajo, volvería a contratarlo sin dudarlo.',
        tags: ['Recomendable'],
        isVerified: true,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        requestId: 'legacy-3',
    },
    {
        id: 'default-4',
        professionalId: 2,
        clientName: 'Roberto Díaz',
        clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
        rating: 5,
        comment: 'Cambió las térmicas rapidísimo y dejó todo funcionando perfecto.',
        tags: ['Puntual', 'Prolijo', 'Precio justo'],
        isVerified: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        requestId: 'legacy-4',
    },
];

export function ReviewProvider({ children }: { children: ReactNode }) {
    const [requests, setRequests] = useState<ReviewRequest[]>(() => {
        const saved = localStorage.getItem('oficios_review_requests');
        return saved ? JSON.parse(saved) : [];
    });

    const [reviews, setReviews] = useState<Review[]>(() => {
        const saved = localStorage.getItem('oficios_reviews');
        return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    });

    useEffect(() => {
        localStorage.setItem('oficios_review_requests', JSON.stringify(requests));
    }, [requests]);

    useEffect(() => {
        localStorage.setItem('oficios_reviews', JSON.stringify(reviews));
    }, [reviews]);

    const requestReview = (professionalId: number, professionalName: string): ReviewRequest => {
        const newRequest: ReviewRequest = {
            id: `req-${Date.now()}`,
            clientId: CURRENT_USER.id,
            clientName: CURRENT_USER.name,
            clientAvatar: CURRENT_USER.avatar,
            professionalId,
            professionalName,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        setRequests(prev => [...prev, newRequest]);
        return newRequest;
    };

    const acceptReview = (requestId: string) => {
        setRequests(prev =>
            prev.map(r =>
                r.id === requestId
                    ? {
                        ...r,
                        status: 'accepted' as const,
                        acceptedAt: new Date().toISOString(),
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    }
                    : r
            )
        );
    };

    const rejectReview = (requestId: string) => {
        setRequests(prev =>
            prev.map(r => (r.id === requestId ? { ...r, status: 'rejected' as const } : r))
        );
    };

    const submitReview = (requestId: string, rating: number, comment: string, tags: string[]): Review => {
        const request = requests.find(r => r.id === requestId);
        if (!request) throw new Error('Request not found');

        const newReview: Review = {
            id: `rev-${Date.now()}`,
            professionalId: request.professionalId,
            clientName: CURRENT_USER.name,
            clientAvatar: CURRENT_USER.avatar,
            rating,
            comment,
            tags,
            isVerified: true,
            createdAt: new Date().toISOString(),
            requestId,
        };

        setReviews(prev => [...prev, newReview]);
        setRequests(prev =>
            prev.map(r => (r.id === requestId ? { ...r, status: 'completed' as const } : r))
        );

        return newReview;
    };

    const getReviewsFor = (professionalId: number): Review[] => {
        return reviews.filter(r => r.professionalId === professionalId);
    };

    const getRequestsForChat = (professionalId: number): ReviewRequest[] => {
        return requests.filter(r => r.professionalId === professionalId);
    };

    const hasActiveRequest = (professionalId: number): boolean => {
        return requests.some(
            r => r.professionalId === professionalId && (r.status === 'pending' || r.status === 'accepted')
        );
    };

    return (
        <ReviewContext.Provider
            value={{
                requests,
                reviews,
                requestReview,
                acceptReview,
                rejectReview,
                submitReview,
                getReviewsFor,
                getRequestsForChat,
                hasActiveRequest,
            }}
        >
            {children}
        </ReviewContext.Provider>
    );
}

export function useReviews() {
    const context = useContext(ReviewContext);
    if (!context) throw new Error('useReviews must be used within ReviewProvider');
    return context;
}
