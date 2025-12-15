import { updateSetting, getSetting } from '../lib/database.js';

// ━━━━━━━━━━━━━━━━━━━━━━
// 🔧 SET OWNER NAME COMMAND
//━━━━━━━━━━━━━━━━━━━━━━━

const setownername = {
    name: 'setownername',
    aliases: ['setowner', 'ownername'],
    category: 'OWNER',
    description: 'Set or update the bot owner name',
    usage: '.setownername <new name>',
    
    async execute(sock, message, args, context) {
        const { senderIsSudo, reply, react } = context;

        if (!senderIsSudo) {
            await react('❌');
            return reply('⚠️ Owner Only Command!');
        }

        // 🔑 Normalize args (handles aliases correctly)
        const ownerCmds = ['setownername', 'setowner', 'ownername'];
        const cleanArgs = ownerCmds.includes(args[0]?.toLowerCase())
            ? args.slice(1)
            : args;

        if (cleanArgs.length === 0) {
            const currentOwner = getSetting('botOwner', 'Not Set');
            await react('ℹ️');
            return reply(
                `📝 Current Owner Name: ${currentOwner}\n\n` +
                `Usage: .setownername <new name>\n` +
                `Example: .setownername Isaac Favour`
            );
        }

        try {
            await react('⏳');

            const newOwnerName = cleanArgs.join(' ').trim();

            if (newOwnerName.length < 2) {
                await react('❌');
                return reply('⚠️ Owner name must be at least 2 characters long!');
            }

            if (newOwnerName.length > 50) {
                await react('❌');
                return reply('⚠️ Owner name must be less than 50 characters!');
            }

            const oldOwnerName = getSetting('botOwner', 'Not Set');
            const success = updateSetting('botOwner', newOwnerName);

            if (success) {
                global.botOwner = newOwnerName;
                await react('✅');
                return reply(
                    `✅ *Owner Name Updated!*\n\n` +
                    `📝 Old: ${oldOwnerName}\n` +
                    `✨ New: ${newOwnerName}`
                );
            }

            await react('❌');
            reply('❌ Failed to update owner name.');

        } catch (err) {
            console.error(err);
            await react('❌');
            reply(`❌ Error: ${err.message}`);
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
        const { senderIsSudo, reply, react } = context;

        if (!senderIsSudo) {
            await react('❌');
            return reply('⚠️ Owner Only Command!');
        }

        // 🔑 Normalize args (handles aliases correctly)
        const botCmds = ['setbotname', 'botname', 'setbot'];
        const cleanArgs = botCmds.includes(args[0]?.toLowerCase())
            ? args.slice(1)
            : args;

        if (cleanArgs.length === 0) {
            const currentBotName = getSetting('botName', 'Gift-X');
            await react('ℹ️');
            return reply(
                `🤖 Current Bot Name: ${currentBotName}\n\n` +
                `Usage: .setbotname <new name>\n` +
                `Example: .setbotname GIFT-MD v2.0`
            );
        }

        try {
            await react('⏳');

            const newBotName = cleanArgs.join(' ').trim();

            if (newBotName.length < 2) {
                await react('❌');
                return reply('⚠️ Bot name must be at least 2 characters long!');
            }

            if (newBotName.length > 50) {
                await react('❌');
                return reply('⚠️ Bot name must be less than 50 characters!');
            }

            const oldBotName = getSetting('botName', 'Gift-X');
            const success = updateSetting('botName', newBotName);

            if (success) {
                global.botName = newBotName;
                await react('✅');
                return reply(
                    `✅ *Bot Name Updated!*\n\n` +
                    `🤖 Old: ${oldBotName}\n` +
                    `✨ New: ${newBotName}`
                );
            }

            await react('❌');
            reply('❌ Failed to update bot name.');

        } catch (err) {
            console.error(err);
            await react('❌');
            reply(`❌ Error: ${err.message}`);
        }
    }
};

export default [setownername, setbotname];
