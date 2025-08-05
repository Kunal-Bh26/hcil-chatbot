import React from 'react';
import { motion } from 'framer-motion';

export const UserAvatar = () => (
    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg shadow-md border-2 border-white flex-shrink-0">
        🧑‍💻
    </div>
);

export const BotAvatar = () => (
    <motion.div 
        className="w-10 h-10 rounded-full bg-red-800 flex items-center justify-center text-2xl shadow-md border-2 border-red-300 flex-shrink-0"
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
        🤖
    </motion.div>
);