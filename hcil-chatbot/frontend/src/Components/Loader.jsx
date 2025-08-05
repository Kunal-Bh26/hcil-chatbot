import React from 'react';
import { BotAvatar } from './Avatars';

export const SkeletonLoader = () => (
    <div className="flex items-end space-x-3">
        <BotAvatar />
        <div className="p-4 rounded-2xl bg-white/20 w-48">
            <div className="animate-pulse flex space-x-2">
                <div className="rounded-full bg-slate-400 h-2 w-2"></div>
                <div className="rounded-full bg-slate-400 h-2 w-2"></div>
                <div className="rounded-full bg-slate-400 h-2 w-2"></div>
            </div>
        </div>
    </div>
);