import {
     getSetting, 
     updateSetting
} from '../lib/database.js';
import { 
    getCurrentTimezone, 
    setTimezone, 
    resetTimezone,
    getCurrentTime, 
    formatTimezoneList, 
    findTimezone,
    DEFAULT_TIMEZONE 
} from '../lib/myfunc.js';

export default [
    {
        name: 'timezone',
        aliases: ['tz', 'time'],
        category: 'SETTINGS MENU',
        description: 'Show current timezone and time',
        execute: async (sock, message, args, context) => {
            const currentTz = getCurrentTimezone();
            const currentTime = getCurrentTime('full');
            
            const info = `🕐 Timezone Info\n\n` +
                `📍 Current Timezone: ${currentTz}\n` +
                `🕰️ Current Time: ${currentTime}\n\n` +
                `Use ${global.prefix}settimezone <zone> to change\n` +
                `Use ${global.prefix}timezones to see all options`;
            
            await context.reply(info,{quoted: global.TZ});
        }
    },
    
    {
        name: 'settimezone',
        aliases: ['settz', 'changetimezone'],
        category: 'SETTINGS MENU',
        description: 'Set bot timezone',
        execute: async (sock, message, args, context) => {
            if (!context.senderIsSudo) {
                return context.reply('❌ Only the owner can change timezone!',{quoted: global.STZ});
            }
            
            const timezone = args.slice(1).join('/'); // Handle "Africa Lagos" → "Africa/Lagos"
            
            if (!timezone) {
                return context.reply(
                    `❌ Please provide a timezone!\n\n` +
                    `Example:\n` +
                    `${global.prefix}settimezone Africa/Lagos\n` +
                    `${global.prefix}settimezone America/New_York\n\n` +
                    `Use ${global.prefix}timezones to see all options\n` +
                    `Use ${global.prefix}findtz <name> to search`,{quoted: global.STZ});
            }
            
            // Try to format input (handle both "Africa/Lagos" and "Africa Lagos")
            let formattedTz = timezone;
            if (!timezone.includes('/') && args.length >= 3) {
                formattedTz = `${args[1]}/${args[2]}`;
            }
            
            const result = setTimezone(formattedTz);
            
            if (result.success) {
                const newTime = getCurrentTime('full');
                await context.reply(
                    `✅ ${result.message}\n\n` +
                    `🕰️ Current time: ${newTime}`,{quoted: global.STZ});
            } else {
                // Try to find similar timezones
                const suggestions = findTimezone(timezone.split('/').pop() || timezone);
                let suggestionText = '';
                
                if (suggestions.length > 0 && suggestions.length <= 5) {
                    suggestionText = `\n\nDid you mean:\n${suggestions.map(s => `• ${s}`).join('\n')}`;
                }
                
                await context.reply(`❌ ${result.message}${suggestionText}`,{quoted: global.STZ});
            }
        }
    },
    
    {
        name: 'timezones',
        aliases: ['tzlist', 'timezonelist'],
        category: 'SETTINGS MENU',
        description: 'List all available timezones',
        execute: async (sock, message, args, context) => {
            const list = formatTimezoneList();
            const currentTz = getCurrentTimezone();
            
            const output = `🌍 Available Timezones\n\n` +
                `📍 Current: ${currentTz}\n` +
                `${list}\n\n` +
                `Use ${global.prefix}settimezone <zone> to change`;
            
            await context.reply(output,{quoted: global.TZ});
        }
    },
    
    {
        name: 'findtz',
        aliases: ['searchtz', 'findtimezone'],
        category: 'SETTINGS MENU',
        description: 'Search for a timezone',
        execute: async (sock, message, args, context) => {
            const search = args.slice(1).join(' ');
            
            if (!search) {
                return context.reply(
                    `❌ Please provide a search term!\n\n` +
                    `Example:\n` +
                    `${global.prefix}findtz lagos\n` +
                    `${global.prefix}findtz new york\n` +
                    `${global.prefix}findtz tokyo`,{quoted: global.FTZ});
            }
            
            const results = findTimezone(search);
            
            if (results.length === 0) {
                await context.reply(`❌ No timezones found matching "${search}"`,{quoted: global.FTZ});
            } else if (results.length > 10) {
                await context.reply(
                    `🔍 Found ${results.length} results. Showing first 10:\n\n` +
                    results.slice(0, 10).map((tz, i) => `${i + 1}. ${tz}`).join('\n') +
                    `\n\nTry a more specific search.`,{quoted: global.FTZ});
            } else {
                await context.reply(
                    `🔍 Found ${results.length} timezone(s):\n\n` +
                    results.map((tz, i) => `${i + 1}. ${tz}`).join('\n') +
                    `\n\nUse ${global.prefix}settimezone <zone> to set`,{quoted: global.FTZ});
            }
        }
    },
    
    {
        name: 'resettimezone',
        aliases: ['resettz'],
        category: 'SETTINGS MENU',
        description: 'Reset timezone to default',
        execute: async (sock, message, args, context) => {
            if (!context.senderIsSudo) {
                return context.reply('❌ Only the owner can reset timezone!',{quoted: global.RTZ});
            }
            
            const result = resetTimezone();
            const newTime = getCurrentTime('full');
            
            await context.reply(
                `✅ ${result.message}\n\n` +
                `🕰️ Current time: ${newTime}`,{quoted: global.RTZ});
        }
    },
     {

    name: 'setfont',

    aliases: [],

    category: 'owner',

    description: 'Change bot text output formatting style',

    usage: '.setfont <style> or .setfont list',

    execute: async (sock, message, args, context) => {

        const { chatId, reply, react, senderIsSudo } = context; 

      // Remove command name if included in args

        const cleanArgs = args[0] === 'setfont' ? args.slice(1) : args;

        if (!senderIsSudo) {
        await react('😝')
            return await reply('❌ Only owner can change front styles',{quoted: global.setfot});

        }

        if (cleanArgs.length < 1) {

            const currentStyle = getSetting('fontstyle', 'normal');

            return await reply(

                `📝 Font Style Manager\n\nCurrent style: ${currentStyle}\n\nUsage:\n• .setfont list - Show all styles\n• .setfont <style> - Set font style\n• .setfont current - Show current style`,{quoted: global.setfot});

        }

        const action = cleanArgs[0].toLowerCase();

        if (action === 'list') {

            await react('📋');

            const styles = getAvailableFontStyles();

            const currentStyle = getSetting('fontstyle', 'normal');

            

            let styleList = '🎨 Available Font Styles:\n\n';

            styles.forEach((style, index) => {

                const marker = style === currentStyle ? '➤' : '•';

                const example = applyFontStyle('Sample text');

                styleList += `${marker} ${style}\n`;

            });

            

            styleList += `\n📌 Current: ${currentStyle}\n`;

            styleList += `\nUsage: .setfont <style_name>`;

            

            return await reply(styleList,{quoted: global.setfot});

        }

        if (action === 'current') {

            const currentStyle = getSetting('fontstyle', 'normal');

            const sampleText = applyFontStyle('This is how your bot text will look');

            

            return await reply(

                `📝 Current Font Style\n\n` +

                `Style: ${currentStyle}\n` +

                `Preview: ${sampleText}`,{quoted: global.setfot});

        }

        // Set font style

        const availableStyles = getAvailableFontStyles();

        const newStyle = action;

        if (!availableStyles.includes(newStyle)) {

            return await reply(

                `❌ Invalid font style: ${newStyle}\n\n` +

                `Available styles:\n${availableStyles.map(s => `• ${s}`).join('\n')}\n\n` +

                `Use .setfont list to see all options.`,{quoted: global.setfot});

        }

        await react('✅');

        

        // Update the setting

        const success = updateSetting('fontstyle', newStyle);

        

        if (success) {

            const sampleText = applyFontStyle('This is how your bot will respond now');

            await reply(

                `✅ Font style updated!\n\n` +

                `New style: ${newStyle}\n` +

                `Preview: ${sampleText}\n\n` +

                `All bot responses will now use this formatting.`,{quoted: global.setfot});

        } else {

            await reply('❌ Failed to update font style. Please try again.',{quoted: global.setfot});

        }

    }

}
];
