import React from 'react';
import { motion } from 'framer-motion';

const smartReplies = ["Reset password", "VPN issues", "Software install"];

export const SmartReplies = ({ onReplyClick }) => (
    <div className="px-6 pb-2 flex flex-wrap gap-2">
        {smartReplies.map((reply, index) => (
            <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onReplyClick(reply)}
                className="px-4 py-2 text-sm bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors"
            >
                {reply}
            </motion.button>
        ))}
    </div>
);