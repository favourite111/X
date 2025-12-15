import { updateSetting, getSetting } from '../lib/database.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 SET OWNER NAME COMMAND
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const setownername = {
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🤖 SET BOT NAME COMMAND
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const setbotname = {
    name: 'setbotname',
    aliases: ['botname', 'setbot'],
    category: 'OWNER',
    description: 'Set or update the bot display name',
    usage: '.setbotname <new name>',
    
    async execute(sock, message, args, context) {
        const {
            senderIsSudo,
            reply,
            react
        } = context;

        // ✅ Permission check - Only owner/sudo
        if (!senderIsSudo) {
            await react('❌');
            return await reply('⚠️ *Owner Only Command!*\n\nThis command can only be used by the bot owner.');
        }

        // ✅ Check if name provided
        if (args.length === 0) {
            const currentBotName = getSetting('botName', 'Gift-X');
            await react('ℹ️');
            return await reply(
                `🤖 *Current Bot Name:* ${currentBotName}\n\n` +
                `*Usage:* .setbotname <new name>\n` +
                `*Example:* .setbotname GIFT-MD v2.0\n\n` +
                `_This name appears in menus and bot info._`
            );
        }

        try {
            await react('⏳');

            // ✅ Get new bot name from args
            const newBotName = args.join(' ').trim();

            // ✅ Validate name length
            if (newBotName.length < 2) {
                await react('❌');
                return await reply('⚠️ Bot name must be at least 2 characters long!');
            }

            if (newBotName.length > 50) {
                await react('❌');
                return await reply('⚠️ Bot name must be less than 50 characters!');
            }

            // ✅ Get old name for confirmation
            const oldBotName = getSetting('botName', 'Gift-X');

            // ✅ Update database
            const success = updateSetting('botName', newBotName);

            if (success) {
                // ✅ Update global variable
                global.botName = newBotName;

                await react('✅');
                await reply(
                    `✅ *Bot Name Updated Successfully!*\n\n` +
                    `🤖 *Old Name:* ${oldBotName}\n` +
                    `✨ *New Name:* ${newBotName}\n\n` +
                    `_The new name will appear in:_\n` +
                    `• Menu headers\n` +
                    `• Bot info\n` +
                    `• Welcome messages\n` +
                    `• Status updates\n\n` +
                    `_Changes take effect immediately._`
                );
            } else {
                await react('❌');
                await reply('❌ Failed to update bot name. Please try again.');
            }

        } catch (error) {
            console.error('Error in setbotname command:', error);
            await react('❌');
            await reply(`❌ *Error:* ${error.message}`);
        }
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📤 EXPORT COMMANDS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default [setownername, setbotname];
