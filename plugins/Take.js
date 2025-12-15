import { updateSetting, getSetting } from '../lib/database.js';

export default {
    name: 'setownername',
    aliases: ['setowner', 'ownername'],
    category: 'OWNER',
    description: 'Set or update the bot owner name',
    usage: '.setownername <new name>',
    
    async execute(sock, message, args, context) {
        const {
            senderIsSudo,
            reply,
            react,
            userMessage
        } = context;

        // ✅ Permission check - Only owner/sudo
        if (!senderIsSudo) {
            await react('❌');
            return await reply('⚠️ *Owner Only Command!*\n\nThis command can only be used by the bot owner.');
        }

        // ✅ Check if name provided
        if (args.length === 0) {
            const currentOwner = getSetting('botOwner', 'Not Set');
            await react('ℹ️');
            return await reply(
                `📝 *Current Owner Name:* ${currentOwner}\n\n` +
                `*Usage:* .setownername <new name>\n` +
                `*Example:* .setownername Isaac Favour`
            );
        }

        try {
            await react('⏳');

            // ✅ Get new owner name from args
            const newOwnerName = args.join(' ').trim();

            // ✅ Validate name length
            if (newOwnerName.length < 2) {
                await react('❌');
                return await reply('⚠️ Owner name must be at least 2 characters long!');
            }

            if (newOwnerName.length > 50) {
                await react('❌');
                return await reply('⚠️ Owner name must be less than 50 characters!');
            }

            // ✅ Get old name for confirmation
            const oldOwnerName = getSetting('botOwner', 'Not Set');

            // ✅ Update database
            const success = updateSetting('botOwner', newOwnerName);

            if (success) {
                // ✅ Update global variable
                global.botOwner = newOwnerName;

                await react('✅');
                await reply(
                    `✅ *Owner Name Updated Successfully!*\n\n` +
                    `📝 *Old Name:* ${oldOwnerName}\n` +
                    `✨ *New Name:* ${newOwnerName}\n\n` +
                    `_Changes will reflect immediately._`
                );
            } else {
                await react('❌');
                await reply('❌ Failed to update owner name. Please try again.');
            }

        } catch (error) {
            console.error('Error in setownername command:', error);
            await react('❌');
            await reply(`❌ *Error:* ${error.message}`);
        }
    }
};
