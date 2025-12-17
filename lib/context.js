import isAdmin from './isAdmin.js';
import { getSetting } from './database.js';
import { channelInfo } from './messageConfig.js';
import { applyFontStyle } from './database.js';

function buildContext(sock, message, extra = {}) {

    const chatId = message.key.remoteJid;

    const sender = message.key.fromMe
        ? sock.user.id
        : (message.key.participant || message.key.remoteJid);

    // Fix: Better handling of sender ID
    let cleanSender = sender;
    if (sender.includes(':')) {
        cleanSender = sender.split(':')[0];
    }

    const ownerNumber = global.ownerNumber
    const isGroup = chatId.endsWith('@g.us');
    const isChannel = chatId.endsWith('@newsletter');
    const isPrivate = !isGroup && !isChannel;

    // ✅ ENHANCED: Better channel-aware sender number extraction
    let senderNumber = cleanSender.replace('@s.whatsapp.net', '').replace('@lid', '');

    // ✅ FIXED: Enhanced channel support - Removed

    // ✅ ENHANCED sudo check with better group participant detection
    const sudoUsers = getSetting('sudo', []);

    // ✅ FIXED: More comprehensive sudo detection for channels
    const senderIsSudo = message.key.fromMe || 
        senderNumber === ownerNumber || 
        senderNumber === global.ownerLid ||
        senderNumber === global.channelLid ||
        cleanSender === ownerNumber + '@s.whatsapp.net' ||
        cleanSender === global.ownerLid + '@s.whatsapp.net' ||
 (Array.isArray(sudoUsers) && (
sudoUsers.includes(senderNumber) || sudoUsers.includes(cleanSender) || sudoUsers.includes(senderNumber + '@s.whatsapp.net') ||
            sudoUsers.includes(cleanSender.replace('@s.whatsapp.net', ''))
        ))

    const userMessage = message.message?.conversation?.trim() ||  
    message.message?.extendedTextMessage?.text?.trim() ||  
    message.message?.imageMessage?.caption?.trim() ||  
    message.message?.videoMessage?.caption?.trim() ||
    message.message?.documentMessage?.caption?.trim() ||
    message.message?.buttonsResponseMessage?.selectedButtonId ||
    message.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    ''  
).toLowerCase().replace(/\.\s+/g, '.').trim();

    const rawText = message.message?.conversation?.trim() ||  
    message.message?.extendedTextMessage?.text?.trim() ||  
    message.message?.imageMessage?.caption?.trim() ||  
    message.message?.videoMessage?.caption?.trim() ||
    message.message?.documentMessage?.caption?.trim() ||
    message.message?.buttonsResponseMessage?.selectedButtonId ||
    message.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    '';
    
    // Message metadata
    const messageId = message.key.id;
    const timestamp = message.messageTimestamp;
    const isFromOwner = message.key.fromMe;

    // Message type detection
    const messageType = Object.keys(message.message || {})[0];
    const hasMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(messageType);
    const hasQuotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    // Group admin checks
    let isSenderAdmin = false;
    let isBotAdmin = false;
    if ((isGroup || isChannel) && extra.isAdminCheck) {
        const adminStatus = extra.adminStatus || {};
        isSenderAdmin = adminStatus.isSenderAdmin || false;
        isBotAdmin = adminStatus.isBotAdmin || false;
    }

    // Extract mentions if any
    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const isBotMentioned = mentions.includes(sock.user.id);

    // Default External Ad Reply configuration
    const defaultExternalAdReply = {
        title: `♻️ GIFT MD`,
        body: `Ⓜ️ Status: Online | 😎 Version: ${global.version}`,
        thumbnailUrl: "https://files.catbox.moe/hoqhfi.jpeg",
        sourceUrl: "https://github.com/mruniquehacker/Knightbot-MD",
        mediaType: 1,
        showAdAttribution: false,
        renderLargerThumbnail: false
    };

    // ✅ UPDATED: Enhanced reply function with custom quote support
    const reply = async (content, options = {}) => {
        const useExternalAd = options.externalAdReply !== false;
        const customExternalAd = options.externalAdReply === true ? defaultExternalAdReply : options.externalAdReply;
        
        // ✅ NEW: Support custom quoted message
        const quotedMessage = options.quoted !== undefined ? options.quoted : message;

        try {        
            const currentStyle = getSetting('fontstyle', 'normal');

            let messageOptions = {
                ...channelInfo,
                ...options
            };

            // Handle different content types
            if (typeof content === 'string') {
                // Plain string - apply font styling
                const formattedText = applyFontStyle(content);
                messageOptions.text = formattedText;
            } else if (typeof content === 'object' && content !== null) {
                // Object content - copy all properties and apply styling to text fields
                messageOptions = { ...messageOptions, ...content };

                // Apply font styling to 'text' property if it exists
                if (content.text && typeof content.text === 'string') {
                    const formattedText = applyFontStyle(content.text);
                    messageOptions.text = formattedText;
                }

                // Apply font styling to 'caption' property if it exists
                if (content.caption && typeof content.caption === 'string') {
                    const formattedCaption = applyFontStyle(content.caption);
                    messageOptions.caption = formattedCaption;
                }
            }

            // Add external ad reply if enabled
            if (useExternalAd) {
                messageOptions.contextInfo = {
                    ...messageOptions.contextInfo/*,
                    externalAdReply: customExternalAd || defaultExternalAdReply*/
                };
            }

            // ✅ Clean up options that shouldn't be in messageOptions
            delete messageOptions.externalAdReply;
            delete messageOptions.quoted;

            // ✅ FIXED: Use custom quoted message or no quote
            return await sock.sendMessage(
                chatId, 
                messageOptions, 
                quotedMessage ? { quoted: quotedMessage } : {}
            );

        } catch (error) {
            console.error('❌ Error in enhanced reply function:', error);

            // Fallback without font styling
            let fallbackOptions = {
                ...channelInfo,
                ...options
            };

            if (typeof content === 'string') {
                fallbackOptions.text = content;
            } else if (typeof content === 'object' && content !== null) {
                fallbackOptions = { ...fallbackOptions, ...content };
            }

            if (useExternalAd) {
                fallbackOptions.contextInfo = {
                    ...fallbackOptions.contextInfo,
                    externalAdReply: customExternalAd || defaultExternalAdReply
                };
            }

            delete fallbackOptions.externalAdReply;
            delete fallbackOptions.quoted;

            return await sock.sendMessage(
                chatId, 
                fallbackOptions, 
                quotedMessage ? { quoted: quotedMessage } : {}
            );
        }
    };

    const react = async (emoji) => {
        return await sock.sendMessage(chatId, {
            react: {
                text: emoji,
                key: message.key
            }
        });
    };

    const replyWithAd = async (content, customAd = {}, options = {}) => {
        const externalAdReply = { ...defaultExternalAdReply, ...customAd };
        return await reply(content, { ...options, externalAdReply });
    };

    // ✅ UPDATED: replyPlain with custom quote support
    const replyPlain = async (content, options = {}) => {
        // ✅ NEW: Support custom quoted message
        const quotedMessage = options.quoted !== undefined ? options.quoted : message;

        try {      
            let messageOptions = {
                ...channelInfo,
                ...options
            };

            // Handle different content types (same logic as reply() but NO external ads)
            if (typeof content === 'string') {
                // Plain string - apply font styling
                const formattedText = applyFontStyle(content);
                messageOptions.text = formattedText;
            } else if (typeof content === 'object' && content !== null) {
                // Object content - copy all properties and apply styling to ALL text fields
                messageOptions = { ...messageOptions, ...content };

                // Apply font styling to ALL possible text properties
                const textProperties = [
                    'text', 'caption', 'title', 'body', 'footer', 
                    'headerText', 'footerText', 'buttonText', 'description'
                ];

                textProperties.forEach(prop => {
                    if (content[prop] && typeof content[prop] === 'string') {
                        messageOptions[prop] = applyFontStyle(content[prop]);
                    }
                });

                // Handle nested text in buttons, sections, etc.
                if (content.buttons && Array.isArray(content.buttons)) {
                    messageOptions.buttons = content.buttons.map(button => ({
                        ...button,
                        buttonText: button.buttonText && typeof button.buttonText === 'object' ? {
                            ...button.buttonText,
                            displayText: button.buttonText.displayText ? 
                                applyFontStyle(button.buttonText.displayText) : 
                                button.buttonText.displayText
                        } : button.buttonText
                    }));
                }

                // Handle sections in list messages
                if (content.sections && Array.isArray(content.sections)) {
                    messageOptions.sections = content.sections.map(section => ({
                        ...section,
                        title: section.title ? applyFontStyle(section.title) : section.title,
                        rows: section.rows ? section.rows.map(row => ({
                            ...row,
                            title: row.title ? applyFontStyle(row.title) : row.title,
                            description: row.description ? applyFontStyle(row.description) : row.description
                        })) : section.rows
                    }));
                }
            }

            // ✅ Clean up
            delete messageOptions.quoted;

            // ✅ FIXED: Use custom quoted message or no quote
            return await sock.sendMessage(
                chatId, 
                messageOptions, 
                quotedMessage ? { quoted: quotedMessage } : {}
            );

        } catch (error) {
            console.error('❌ Error in replyPlain function:', error);

            // Fallback without font styling
            let fallbackOptions = {
                ...channelInfo, 
                ...options
            };

            if (typeof content === 'string') {
                fallbackOptions.text = content;
            } else if (typeof content === 'object' && content !== null) {
                fallbackOptions = { ...fallbackOptions, ...content };
            }

            delete fallbackOptions.quoted;

            return await sock.sendMessage(
                chatId, 
                fallbackOptions, 
                quotedMessage ? { quoted: quotedMessage } : {}
            );
        }
    };

    return {
        // Basic info
        chatId,
        sender,
        cleanSender,
        senderNumber,
        isGroup,
        isChannel,
        isPrivate,
        messageId,
        timestamp,

        // Permission checks
        isSenderAdmin,
        isBotAdmin,
        senderIsSudo,
        isFromOwner,

        // Message content
        userMessage,
        rawText,
        messageType,
        hasMedia,
        hasQuotedMessage,

        // Social features
        mentions,
        isBotMentioned,

        // Configuration
        defaultExternalAdReply,

        // Reply functions
        reply,
        react,
        replyWithAd,
        replyPlain
    };
}

export { buildContext };
