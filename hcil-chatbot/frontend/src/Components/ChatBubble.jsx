import React from 'react';
import { motion } from 'framer-motion';
import { BotAvatar, UserAvatar } from './Avatars';

const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const ChatBubble = ({ msg }) => {
    const { role, content } = msg;
    const isUser = role === 'user';

    return (
        <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4 }}
            className={`flex items-end space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {role === 'bot' && <BotAvatar />}
            <div
                className={`max-w-md p-4 rounded-2xl ${
                    isUser
                        ? 'bg-white text-gray-900 rounded-br-none'
                        : 'bg-gradient-to-br from-red-600 to-rose-800 text-white rounded-bl-none'
                }`}
            >
                <p className="text-sm md:text-base">{content}</p>
            </div>
            {role === 'user' && <UserAvatar />}
        </motion.div>
    );
};

export default ChatBubble;