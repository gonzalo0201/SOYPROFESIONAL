import { Star, ShieldCheck, Clock, Check, X } from 'lucide-react';
import type { ReviewRequest } from '../../contexts/ReviewContext';

interface ReviewRequestBubbleProps {
    request: ReviewRequest;
    isOwnRequest: boolean; // true = the client who requested, false = the professional receiving
    onAccept?: () => void;
    onReject?: () => void;
    onWriteReview?: () => void;
}

export function ReviewRequestBubble({
    request,
    isOwnRequest,
    onAccept,
    onReject,
    onWriteReview,
}: ReviewRequestBubbleProps) {
    if (request.status === 'pending' && !isOwnRequest) {
        // Professional sees: accept or reject
        return (
            <div className="flex justify-center my-3">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 max-w-[85%] shadow-sm animate-[slideUp_0.3s_ease-out]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                            <Star size={18} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Solicitud de reseña</p>
                            <p className="text-xs text-slate-500">
                                <span className="font-semibold text-amber-700">{request.clientName}</span> quiere dejarte una reseña
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                        Al aceptar, {request.clientName} podrá escribir una reseña verificada sobre el trabajo realizado.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={onAccept}
                            className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-600 active:scale-[0.97] transition-all shadow-sm shadow-emerald-500/20"
                        >
                            <Check size={14} />
                            Aceptar
                        </button>
                        <button
                            onClick={onReject}
                            className="flex-1 bg-white text-slate-600 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-100 active:scale-[0.97] transition-all border border-slate-200"
                        >
                            <X size={14} />
                            Rechazar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (request.status === 'pending' && isOwnRequest) {
        // Client sees: waiting for acceptance
        return (
            <div className="flex justify-center my-3">
                <div className="bg-amber-50/80 border border-amber-100 rounded-2xl px-4 py-3 max-w-[80%]">
                    <div className="flex items-center gap-2 text-amber-700">
                        <Clock size={14} className="animate-pulse" />
                        <p className="text-xs font-medium">
                            Esperando que <span className="font-bold">{request.professionalName}</span> acepte tu solicitud de reseña
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (request.status === 'accepted') {
        return (
            <div className="flex justify-center my-3">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 max-w-[85%] shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">
                                {isOwnRequest ? '¡Reseña aceptada!' : `${request.clientName} puede dejar reseña`}
                            </p>
                            <p className="text-xs text-emerald-600">Servicio verificado ✓</p>
                        </div>
                    </div>
                    {isOwnRequest && (
                        <button
                            onClick={onWriteReview}
                            className="w-full bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-[0.97] transition-all shadow-md shadow-emerald-500/20"
                        >
                            <Star size={16} fill="currentColor" />
                            Escribir reseña
                        </button>
                    )}
                    {!isOwnRequest && (
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Aceptaste la solicitud. {request.clientName} tiene 7 días para dejarte una reseña después del servicio.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    if (request.status === 'rejected') {
        return (
            <div className="flex justify-center my-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 max-w-[80%]">
                    <div className="flex items-center gap-2 text-slate-400">
                        <X size={14} />
                        <p className="text-xs font-medium">
                            {isOwnRequest
                                ? 'El trabajo no fue realizado. Solicitud de reseña cancelada.'
                                : 'Solicitud de reseña rechazada — trabajo no realizado.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (request.status === 'completed') {
        return (
            <div className="flex justify-center my-3">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl px-4 py-3 max-w-[80%]">
                    <div className="flex items-center gap-2 text-amber-700">
                        <Star size={14} fill="currentColor" />
                        <p className="text-xs font-bold">
                            {isOwnRequest
                                ? '¡Reseña enviada! Gracias por tu valoración.'
                                : `${request.clientName} te dejó una reseña verificada ⭐`}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
