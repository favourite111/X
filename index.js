import dotenv from "dotenv";
dotenv.config();
import { loadDatabase, updateGlobalVars } from './lib/database.js';
const db = loadDatabase();
updateGlobalVars(db);
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';  
//=========== BOT MODE==========//
import { getSetting } from './lib/database.js';
import { channelInfo } from './lib/messageConfig.js';
import { Boom } from '@hapi/boom';
import FileType from 'file-type';
import axios from 'axios';
import { handleMessages, handleGroupParticipantUpdate, handleStatus, restorePresenceSettings, initializeCallHandler} from './main.js';
import awesomePhoneNumber from 'awesome-phonenumber';
import PhoneNumber from 'awesome-phonenumber';
import { imageToWebp, videoToWebp, writeExifImg, writeExifVid } from './lib/exif.js';
import { smsg, generateMessageTag, getBuffer, getSizeMedia, fetchJson, sleep, reSize,isUrl, getCurrentTime, getCurrentTimezone } from './lib/myfunc.js';
import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason, 
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} from "@whiskeysockets/baileys";
import baileysPkg from '@whiskeysockets/baileys/package.json' with { type: "json" };
import NodeCache from "node-cache";
import pino from "pino";
import readline from "readline";
import { parsePhoneNumber } from "libphonenumber-js";
// Remove the problematic PHONENUMBER_MCC import
import { rmSync, existsSync } from 'fs';
import { join } from 'path';
import store from './lib/lightweight.js';
import os from 'os';

console.log(chalk.cyan.bold('\n\n[Gift-X] conecting to [Gift-md] zip space....'));
console.log(chalk.cyan('transfering..\n.         [Gift-X].......>[GIFT-MD]..'));
console.log(chalk.cyan('\n[GIFT-MD] ✅ Connected\n'));
const envPath = path.resolve(process.cwd(), '.env');
    
   function loadEnvSession() {
    const envSession = process.env.SESSION_ID;
    const sessionDir = path.join(process.cwd(), 'data', 'session', 'auth.db');
    const credsPath = path.join(sessionDir, 'creds.json');

    // No session in .env
    if (!envSession || envSession.trim() === '') {
        return false;
    }

    // Session already exists - don't overwrite
    if (fs.existsSync(credsPath)) {
        console.log(chalk.cyan('[GIFT-MD] ✅ Existing session found'));
        return true;
    }

    console.log(chalk.yellow('[GIFT-MD] 📥 Session found in .env!'));
    console.log(chalk.cyan('[GIFT-MD] 🔄 Loading session from .env (Base64 only)...'));

    // Ensure directory
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }

    try {
        let sessionString = envSession.trim();

       
        const prefixes = ['GIFT-X:~'];

        for (const prefix of prefixes) {
            if (sessionString.toUpperCase().startsWith(prefix.toUpperCase())) {
                sessionString = sessionString.slice(prefix.length).trim();
                console.log(chalk.gray(`[GIFT-MD] 🔍 Removed prefix: ${prefix}`));
                break;
            }
        }
        console.log(chalk.cyan('[GIFT-MD] 🔐 Decoding Base64 session'));

        let parsedSession;
        try {
            const decoded = Buffer.from(sessionString, 'base64').toString('utf8');
            parsedSession = JSON.parse(decoded);
        } catch (e) {
            console.log(chalk.red('[GIFT-MD] ❌ Invalid Base64 session'));
            console.log(chalk.yellow('[GIFT-MD] 💡 SESSION_ID must be Base64-encoded JSON'));
            return false;
        }

        // =====================================
        // STEP 3: Validate Baileys session
        // =====================================
        const requiredKeys = [
            'noiseKey',
            'signedIdentityKey',
            'signedPreKey',
            'registrationId'
        ];

        const missingKeys = requiredKeys.filter(k => !parsedSession[k]);

        if (missingKeys.length > 0) {
            console.log(
                chalk.red(`[GIFT-MD] ❌ Session missing keys: ${missingKeys.join(', ')}`)
            );
            return false;
        }

        // =====================================
        // STEP 4: Save session
        // =====================================
        fs.writeFileSync(credsPath, JSON.stringify(parsedSession, null, 2));

        console.log(chalk.green('[GIFT-MD] ✅ Base64 session loaded successfully!'));
        console.log(chalk.gray(`[GIFT-MD] 📝 Saved to: home/container/
.npm/xcache/.x1/.x2/.x3/.x4/.x5/.x6/.x7/.x8/.x9/.x10/.x11/.x12/.x13/.x14/.x15/.x16/.x17/.x18/.x19/.x20/.x21/.x22/.x23/.x24/.x25/.x26/.x27/.x28/.x29/.x30/.x31/.x32/.x33/.x34/.x35/.x36/.x37/.x38/.x39/.x40/.x41/.x42/.x43/.x44/.x45/.x46/.x47/.x48/.x49/.x50/Hide-main/session`));

        return true;

    } catch (error) {
        console.log(
            chalk.red('[GIFT-MD] ❌ Unexpected error loading session:'),
            error.message
        );
        return false;
    }
}
   

function cleaEnvSession() {
  const filePath = path.join(process.cwd(), '.env');

  // 🔥 Delete file if it exists
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    
  }

  // 📝 New content
  const content = `
SESSION_ID=




PAIR_NUMBER=

`.trim();

  // ✅ Recreate file
  fs.writeFileSync(filePath, content, 'utf8');
  //console.log('New config.apf created successfully');
}


const file = path.resolve(process.argv[1]); // current file path
function restartBot() {
  console.log(chalk.blue('[GIFT-MD] 🔁 Restarting...'));

  spawn(process.argv[0], [file], {

    stdio: 'inherit',

    shell: true

  });

  process.exit(0);

}
// ✅ Automatically restart if .env changes (SESSION_ID or other variables)

function checkEnvStatus() {
    try {
        console.log(chalk.green("╔═══════════════════════════════════════╗"));
        console.log(chalk.green("║       .env file watcher active.       ║"));
        console.log(chalk.green("╚═══════════════════════════════════════╝"));

        // Watch for changes in the .env file
        fs.watch(envPath, { persistent: false }, (eventType, filename) => {
            if (filename && eventType === 'change') {
                console.log(chalk.bgRed.black('================================================='));
                console.log(chalk.white.bgRed('[GIFT-MD] 🚨 .env file change detected!'));
                console.log(chalk.white.bgRed('Restarting bot to apply new configuration (e.g., SESSION_ID).'));
                console.log(chalk.red.bgBlack('================================================='));
                
            restartBot()    // triggers auto restart
            }
        });
    } catch (err) {
        console.log(chalk.red(`❌ Failed to setup .env watcher: ${err.message}`));
    }
}

checkEnvStatus(); 
// Create a store object with required methods
console.log(chalk.cyan('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'))
console.log(chalk.cyan('┃') + chalk.white.bold('        🤖 GIFT MD BOT STARTING...') +chalk.cyan('      ┃'))
console.log(chalk.cyan('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))


async function sendWelcomeMessage(XeonBotInc) {
    
    await delay(10000); 
    
function detectHost() {
    const env = process.env;
    if (env.RENDER || env.RENDER_EXTERNAL_URL) return 'Render';
    if (env.DYNO || env.HEROKU_APP_DIR || env.HEROKU_SLUG_COMMIT) return 'Heroku';
    if (env.PORTS || env.CYPHERX_HOST_ID) return "CypherXHost"; 
    if (env.VERCEL || env.VERCEL_ENV || env.VERCEL_URL) return 'Vercel';
    if (env.RAILWAY_ENVIRONMENT || env.RAILWAY_PROJECT_ID) return 'Railway';
    if (env.REPL_ID || env.REPL_SLUG) return 'Replit';
    const hostname = os.hostname().toLowerCase();
    if (!env.CLOUD_PROVIDER && !env.DYNO && !env.VERCEL && !env.RENDER) {
        if (hostname.includes('vps') || hostname.includes('server')) return 'VPS';
        return 'Panel';
    }
    return 'Unknown Host';
} //Make it global 
global.server = detectHost();
      
try{
    

  //await import("./global.js");
       
    
    if (XeonBotInc.user.id) {
 global.ownerNumber = XeonBotInc.user.id.split(':')[0];
console.log(chalk.cyan(`[GIFT-MD] 🆔 User ID captured: ${global.ownerNumber}`));
        }
        // Extract LID
 if (XeonBotInc.user.lid) {
 global.ownerLid = XeonBotInc.user.lid.split(':')[0];
console.log(chalk.cyan(`[GIFT-MD] 🆔 User LID captured: ${global.ownerLid}`));
        }
        
        global.sock = XeonBotInc;
       /** function createFakeContact(message) {
    return {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "0@s.whatsapp.net",
            fromMe: false
        },
        message: {
            contactMessage: {
              displayName: `🇳🇬:𝗚𝗜𝗙𝗧_𝗠𝗗:🇳🇬\n🌟:𝗕𝗢𝗢𝗧 𝗠𝗘𝗦𝗦𝗔𝗚𝗘:🌟`,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:JUNE MD\nitem1.TEL;waid=${message.key.participant?.split('@')[0] || message.key.remoteJid.split('@')[0]}:${message.key.participant?.split('@')[0] || message.key.remoteJid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`

            }

        },

        participant: "0@s.whatsapp.net"

    };

}

const fake= createFakeContact({
    key: { 
        participant: XeonBotInc.user.id,
        remoteJid: XeonBotInc.user.id
    }});
        */
        const botNumber = XeonBotInc.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Send startup message
        const time = global.getCurrentTime('time2')
        try {
            await XeonBotInc.sendMessage(botNumber, {
                text: `╔═▣══════════▣╗\n║       ▣ GIFT - MD ▣     ║\n╚═▣══════════▣╝\n▣ Time: ${time}\n▣ Platform: ${global.server}\n▣ Status: active and steady!\n▣ Current prefix is: [ ${global.prefix} ]\n▣ ✅Do ur best to join below channel`, });
console.log(chalk.green('[GIFT-MD] ✅ Startup message sent to User!'));
            //auto follow group functions
        try {
                
            
                console.log(chalk.blue(`✅ auto-follow June WhatsApp group successfull`));
             } catch (e) {
                console.log(chalk.red(`🚫 Failed to join WhatsApp group: ${e}`));
                }
            
        } catch (error) {
            console.error(chalk.yellow('[GIFT-MD] ⚠️ Could not send startup message:'), error.message);
        }

        await delay(1999)
        
        // Initialize features
        await restorePresenceSettings(XeonBotInc);
        initializeCallHandler(XeonBotInc);
   console.log(chalk.green('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'))
        console.log(chalk.green('┃') + chalk.white.bold('        ✅ CONNECTION SUCCESSFUL!     ') + chalk.green('  ┃'))
        console.log(chalk.green('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))
}catch (error) {
            console.error(chalk.yellow('[GIFT-MD] ⚠️ CONNECTION open fail:'), error.message);
        }
}


// Read store on startup
store.readFromFile();
// Write store every 10 seconds
setInterval(() => store.writeToFile(), 10000);

// --- NEW: Error Counter Helpers ---
function loadErrorCount() {
    try {
        if (fs.existsSync(SESSION_ERROR_FILE)) {
            const data = fs.readFileSync(SESSION_ERROR_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        consol.log(`Error loading session error count: ${error.message}`, true);
    }
    // Structure: { count: number, last_error_timestamp: number (epoch) }
    return { count: 0, last_error_timestamp: 0 };
}

function saveErrorCount(data) {
    try {
        fs.writeFileSync(SESSION_ERROR_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        consol.log(`Error saving session error count: ${error.message}`,true);
    }
}

function deleteErrorCountFile() {
    try {
        if (fs.existsSync(SESSION_ERROR_FILE)) {
            fs.unlinkSync(SESSION_ERROR_FILE);
            console.log('✅ Deleted sessionErrorCount.json.');
        }
    } catch (e) {
        consol.log(`Failed to delete sessionErrorCount.json: ${e.message}`, true);
    }
}

// ✅ FIXED VERSION
function deleteSessionFolder() {
  const sessionPath = path.join(process.cwd(), 'data', 'session', 'auth.db');  // Use process.cwd()
  
  if (fs.existsSync(sessionPath)) {
    try {
      fs.rmSync(sessionPath, { recursive: true, force: true });
        
        deleteErrorCountFile();
        global.errorRetryCount = 0;
        
      console.log(chalk.green('[GIFT-MD] ✅ Session folder deleted successfully.'));
    } catch (err) {
      console.error(chalk.red('❌ Error deleting session folder:'), err);
    }
  } else {
    console.log(chalk.yellow('⚠️ No session folder found to delete.'));
  }
}             

// === SECTION 1: Load user-changeable settings from database ===
//ALREADY IMPORTED AT THE TOP

// === SECTION 2: Fixed developer info (never changes) ===
global.author = "ISAAC-FAVOUR";
global.channelLink = "https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A";
global.dev = "2348085046874";
global.devgit = "https://github.com/isaacfont461461-cmd/OfficialGift-Md";
global.devyt = "@officialGift-md";
global.ytch = "Mr Unique Hacker";
global.getCurrentTime = getCurrentTime;
global.getCurrentTimezone = getCurrentTimezone;

//<<<<<<<<<<<<<<<<<<>>>><><>>><>>>>>//
global.errorRetryCount = 0;
global.isBotConnected = false; 
//<<<>><<<<<<<<<<<<<<<>>>>>>>>>>>>>>//

global.channelLid = '120363403001461';
const phoneNumber='238085046874';
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")
const SESSION_ERROR_FILE = path.join(process.cwd(), 'sessionErrorCount.json');
// Only create readline interface if we're in an interactive environment
const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => {
    if (rl) {
        return new Promise((resolve) => rl.question(text, resolve))
    } else {
        // In non-interactive environment, use ownerNumber from settings
        return Promise.resolve(process.env.PAIR_NUMBER)
    }
}

// ✅ SMART SESSION PARSER - Handles ANY session format
function parseAndSaveSession(sessionInput) {
    const sessionDir = path.join(process.cwd(), 'data', 'session', 'auth.db');
    
    try {
        // Ensure session directory exists
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }
        
        let sessionData = sessionInput.trim();
        
        // Step 1: Remove any known prefixes
        const knownPrefixes = [
            "GIFT-MD:", "JUNE-MD:", "SESSION:", "MD:", 
            "GIFT_MD:", "JUNE_MD:", "SESSION_ID:", 
            "Gifted~", "Gifted-", "BAILEYS:"
        ];
        
        for (const prefix of knownPrefixes) {
            if (sessionData.startsWith(prefix)) {
                sessionData = sessionData.replace(prefix, "").trim();
                console.log(chalk.cyan(`[GIFT-MD] 🔍 Detected prefix: ${prefix}`));
                break;
            }
        }
        
        // Step 2: Try to detect format
        let credsJson = null;
        
        // Check if it's already valid JSON
        if (sessionData.startsWith('{') && sessionData.endsWith('}')) {
            console.log(chalk.cyan('[GIFT-MD] 📋 Format detected: Raw JSON'));
            try {
                credsJson = JSON.parse(sessionData);
            } catch (e) {
                throw new Error('Invalid JSON format: ' + e.message);
            }
        }
        // Otherwise, assume it's base64
        else {
            console.log(chalk.cyan('[GIFT-MD] 🔐 Format detected: Base64'));
            try {
                const decoded = Buffer.from(sessionData, 'base64').toString('utf8');
                credsJson = JSON.parse(decoded);
            } catch (e) {
                throw new Error('Invalid base64 or JSON: ' + e.message);
            }
        }
        
        // Step 3: Validate session structure
        if (!credsJson || typeof credsJson !== 'object') {
            throw new Error('Session data is not a valid object');
        }
        
        // Check for essential Baileys properties
        const requiredKeys = ['noiseKey', 'signedIdentityKey', 'signedPreKey', 'registrationId'];
        const hasRequiredKeys = requiredKeys.some(key => credsJson.hasOwnProperty(key));
        
        if (!hasRequiredKeys) {
            throw new Error('Session missing required Baileys keys (noiseKey, signedIdentityKey, etc.)');
        }
        
        // Step 4: Save to creds.json
        const credsPath = path.join(sessionDir, 'creds.json');
        fs.writeFileSync(credsPath, JSON.stringify(credsJson, null, 2));
        
        console.log(chalk.green('[GIFT-MD] ✅ Session validated and saved successfully!'));
        restartBot();
        return true;
        
    } catch (error) {
        console.log(chalk.red(`[GIFT-MD] ❌ Failed to parse session: ${error.message}`));
        return false;
    }
}



async function handle408Error(statusCode) {
    // Only proceed for 408 Timeout errors
    if (statusCode !== DisconnectReason.connectionTimeout) return false;
    
    global.errorRetryCount++;
    let errorState = loadErrorCount();
    const MAX_RETRIES = 3;
    
    // Update persistent and in-memory counters
    errorState.count = global.errorRetryCount;
    errorState.last_error_timestamp = Date.now();
    saveErrorCount(errorState);

   console.log(`Connection Timeout (408) detected. Retry count: ${global.errorRetryCount}/${MAX_RETRIES}`);
    
    if (global.errorRetryCount >= MAX_RETRIES) {
        console.log(chalk.white.bgRed(`[MAX CONNECTION TIMEOUTS] (${MAX_RETRIES}) REACHED IN ACTIVE STATE. `));
        console.log(chalk.white.bgRed('This indicates a persistent network or session issue.'));
       console.log(chalk.white.bgRed('Exiting process to stop infinite restart loop.'));

        deleteErrorCountFile();
        global.errorRetryCount = 0; // Reset in-memory counter
        
        // Force exit to prevent a restart loop, user must intervene (Pterodactyl/Heroku)
        await delay(5000); // Give time for logs to print
        process.exit(1);
    }
    return true;
}



async function startXeonBotInc() {
    loadEnvSession()
    let { version, isLatest } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(`./data/session/auth.db`)
    const msgRetryCounterCache = new NodeCache()

    const XeonBotInc = makeWASocket({
        version,
        logger: pino({ level: 'fatal' }),
        printQRInTerminal: !pairingCode,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        getMessage: async (key) => {
            let jid = jidNormalizedUser(key.remoteJid)
            let msg = await store.loadMessage(jid, key.id)
            return msg?.message || ""
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
    })
    store.bind(XeonBotInc.ev)
    XeonBotInc.store = store;
XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            // ✅ ADD THIS - Clear retry cache to prevent memory bloat
        if (XeonBotInc?.msgRetryCounterCache) {
            XeonBotInc.msgRetryCounterCache.clear()
        }
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                await handleStatus(XeonBotInc, chatUpdate);
                return;
            }
            if (!XeonBotInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
            
            try {
                await handleMessages(XeonBotInc, chatUpdate, true)
            } catch (err) {
                console.error("Error in handleMessages:", err)
                // Only try to send error message if we have a valid chatId
                if (mek.key && mek.key.remoteJid) {
                    await XeonBotInc.sendMessage(mek.key.remoteJid, { 
                        text: '❌ An error occurred while processing your message.',
                    ...channelInfo 
                    }).catch(console.error);
                }
            }
        } catch (err) {
            console.error("Error in messages.upsert:", err)
        }
    })

    // Add these event handlers for better functionality
    XeonBotInc.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }
        
    
    XeonBotInc.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = XeonBotInc.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = { PN: global.sender, id, name: contact.notify }
        }
    })

    XeonBotInc.getName = (jid, withoutContact = false) => {
        let id = XeonBotInc.decodeJid(jid)
        withoutContact = XeonBotInc.withoutContact || withoutContact 
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = XeonBotInc.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === XeonBotInc.decodeJid(XeonBotInc.user.id) ?
            XeonBotInc.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    XeonBotInc.public = true

    XeonBotInc.serializeM = (m) => smsg(XeonBotInc, m, store)

        if (pairingCode && !XeonBotInc.authState.creds.registered) {
    if (useMobile) throw new Error('Cannot use pairing code with mobile api')

    let phoneNumber
    if (process.stdin.isTTY) {
// Interactive Mode - Show options
console.log(chalk.grey('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'))
        console.log(chalk.cyan('┃') + chalk.white.bold('           CONNECTION OPTIONS              ') + chalk.cyan('┃'))
        console.log(chalk.grey('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))
        console.log('')
        console.log(chalk.bold.blue('1. Enter phone number for new pairing'))
        console.log(chalk.bold.blue('2. Use .env  session'))
        console.log(chalk.bold.blue('3. Paste any kind of session'))
        
        console.log('')

        const option = await question(chalk.bgBlack(chalk.green('Choose between option: 1--2--3\n')))
                 
        if (option === '2') {
            // ✅ NEW: Load session from .env
            console.log(chalk.cyan('[GIFT-MD] 🔍 Checking .env for SESSION_ID...'))
            
            const sessionLoaded = loadEnvSession();
            
            if (sessionLoaded) {
                console.log(chalk.green('[GIFT-MD] ✅ Session loaded from .env successfully!'))
                console.log(chalk.cyan('[GIFT-MD] 🔄 Connecting with .env session...'))
                return; // Skip pairing, use .env session
            } else {
                console.log(chalk.red('❌ No valid SESSION_ID found in .env'))
                console.log(chalk.yellow('💡 Tip: Add SESSION_ID to your .env file'))
                console.log(chalk.yellow('   Format: SESSION_ID=GIFT-MD:your_base64_session_here'))
                console.log('')
                console.log(chalk.yellow('⚠️  Falling back to phone number pairing...'))
                console.log('')
            }
        }else if (option === '3') {
            console.log(chalk.cyan('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'))
            console.log(chalk.cyan('┃')+ chalk.green('          📋 PASTE YOUR SESSION')+ chalk.cyan('         ┃'))
            console.log(chalk.cyan('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))
            console.log('')
            console.log(chalk.yellow('✅ Supported formats:'))
            console.log(chalk.white('   • Base64 with prefix: GIFT-MD:eyJub2..'))
            console.log(chalk.white('   • Base64 without prefix: eyJub2lzy....'))
            console.log(chalk.white('   • Raw JSON: {"noiseKey":{"private":...'))
            console.log('')
            console.log(chalk.cyan('Paste your session below (press Enter when done):'))
            console.log('')
            
            const pastedSession = await question(chalk.bgBlack(chalk.green('> ')))
            
            if (!pastedSession || pastedSession.trim().length < 50) {
                console.log(chalk.red('❌ Session too short or empty!'))
                console.log(chalk.yellow('⚠️  Falling back to phone number pairing...'))
                console.log('')
            } else {
                console.log(chalk.cyan('[GIFT-MD] 🔍 Analyzing session format...'))
                
                const sessionSaved = parseAndSaveSession(pastedSession);
                
                if (sessionSaved) {
                    console.log(chalk.green('[GIFT-MD] ✅ Session saved successfully!'))
                    console.log(chalk.cyan('[GIFT-MD] 🔄 Connecting with pasted session...'))
                    return; // Skip pairing
                } else {
                    console.log(chalk.red('❌ Failed to parse session!'))
                    console.log(chalk.yellow('⚠️  Falling back to phone number pairing...'))
                    console.log('')
                }
            }
        }
        

        phoneNumber = await question(chalk.bgBlack(chalk.green('Please type your WhatsApp number\nFormat: 2348085046874 (without + or spaces) : ')))
    } else {
        // Non-Interactive Mode
     console.log(chalk.bold.cyan('[GIFT-MD] Using .env pairNumber'))
        phoneNumber = process.env.PAIR_NUMBER
    
    }

    // Clean the phone number - remove any non-digit characters
if (!phoneNumber || phoneNumber.trim() === '') {
    console.log(chalk.red('❌ No owner number provided in .env'));
    console.log(chalk.yellow('👉 Please add your owner number in .env before starting the bot.'));
    process.exit(1); // Stop the bot so user fixes it
}

phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    // Validate the phone number using awesome-phonenumber (ESM compatible)
    if (!awesomePhoneNumber('+' + phoneNumber).isValid()) {
        console.log(chalk.bold.red('Invalid phone number. Please enter your full international number (e.g., 15551234567 for US, 447911123456 for UK, etc.) without + or spaces.'));
        process.exit(1);
    }

    setTimeout(async () => {
        try {
            console.log(chalk.bold.cyan('[GIFT-MD] Generating Code...'))
            await delay(4000);
            let code = await XeonBotInc.requestPairingCode(phoneNumber)
            code = code?.match(/.{1,4}/g)?.join("-") || code

            console.log('')
            console.log(chalk.green('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'))
            console.log(chalk.green('┃') + chalk.white.bold('              PAIRING CODE               ') + chalk.green('┃'))
            console.log(chalk.green('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))
            console.log('')
            console.log(chalk.cyan.bold(`    ${code}    `))
            console.log('')
            console.log(chalk.yellow('📱 How to link your WhatsApp:'))
            console.log(chalk.white('1. Open WhatsApp on your phone'))
            console.log(chalk.white('2. Go to Settings > Linked Devices'))
            console.log(chalk.white('3. Tap "Link a Device"'))
            console.log(chalk.white('4. Enter the code: ') + chalk.green.bold(code))
            console.log('')
            console.log(chalk.cyan.bold('⏱️  Code expires in 1 minute'))
            console.log('')

         } catch (error) {
    const msg = String(error?.message || '').toLowerCase();

    if (msg.includes('connection closed') || msg.includes('closed')) {
        console.log(chalk.red('⚠ Connection closed — clearing previous sessions...'));

        try {
            await deleteSessionFolder();
            console.log(chalk.green('✔ Sessions cleared successfully.'));            console.log(chalk.green('Wait for restart to pair, else restart manually'));
        } catch (err) {
            console.log(chalk.red('❌ Failed to clear sessions:'), err.message);
        }

        process.exit(1);
    }

    // Default error handling
    console.log(chalk.red('❌ Failed to generate pairing code'));
    console.log(chalk.yellow('Error details:'), error.message);
    process.exit(1);
}    
    }, 3000)
}

    let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
    // Connection handling
// Connection handling
XeonBotInc.ev.on('connection.update', async (s) => {
    const { connection, lastDisconnect } = s

    if (connection === 'close') {
            global.isBotConnected = false; 
            
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            // Capture both DisconnectReason.loggedOut (sometimes 401) and explicit 401 error
            const permanentLogout = statusCode === DisconnectReason.loggedOut || statusCode === 401;
            
            // Log and handle permanent errors (logged out, invalid session)
            if (permanentLogout) {
                console.log(chalk.bgRed.black(`\n\n🚨 WhatsApp Disconnected! Status Code: ${statusCode} (LOGGED OUT / INVALID SESSION).`));
                console.log('🗑️ Deleting session folder and forcing a clean restart...');
                
                // AUTOMATICALLY DELETE SESSION (using the new helper)
                clearSessionFiles();
                
                console.log('✅ Session, login preference, and error count cleaned. Initiating full process restart in 5 seconds...');
                await delay(5000);
                
                // CRITICAL FIX: Use process.exit(1) to trigger a clean restart by the Daemon
                process.exit(1); 
                
            } else {
                // NEW: Handle the 408 Timeout Logic FIRST
                const is408Handled = await handle408Error(statusCode);
                if (is408Handled) {
                    // If handle408Error decides to exit, it will already have called process.exit(1)
                    return;
                }

                // This handles all other temporary errors (Stream, Connection, Timeout, etc.)
                console.log(`Connection closed due to temporary issue (Status: ${statusCode}). Attempting reconnect..`);
                // Re-start the whole bot process (this handles temporary errors/reconnects)
                startXeonBotInc(); 
            }
    } else if (connection == "open") {
        console.log(chalk.gray('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'))
        console.log(chalk.gray('┃') + chalk.green.bold('        ✅ CONNECTION UPDATING..!     ') + chalk.gray('  ┃'))
        console.log(chalk.gray('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))    
        await sendWelcomeMessage(XeonBotInc);
        reconnectAttempts = 0;
        
  console.log(chalk.cyan(`[GIFT-MD] 🖥️ Platform: ${global.server}`));
console.log(chalk.cyan(`[GIFT-MD] 📦 Node: ${process.version}`));
console.log(chalk.cyan(`[GIFT-MD] 📦 Baileys version: ${baileysPkg.version}\n`));
console.log('');
        
}                   
});
    
    
 XeonBotInc.ev.on('creds.update', saveCreds)

   
    return XeonBotInc
}

// ✅ FIXED
let retryCount = 0;
const maxRetries = 3;

async function initializeBot() {
    try {
        //await checkSessionIntegrity();
        await startXeonBotInc();
        retryCount = 0;
    } catch (err) {
        console.error(chalk.red('[GIFT-MD] ❌ Failed to start:'), err);
        
        if (retryCount < maxRetries) {
            retryCount++;
            const delay = 10 * retryCount;
            console.log(chalk.yellow(`[GIFT-MD] 🔄 Retry ${retryCount}/${maxRetries} in ${delay} seconds...`));
            setTimeout(() => initializeBot(), delay * 1000);
        } else {
            console.error(chalk.red('[GIFT-MD] 💥 Max retries reached. Exiting...'));
            process.exit(1);
        }
    }
}

initializeBot();

// ... your existing code ...

// ✅ FIXED VERSION
process.on('uncaughtException', function (err) {
    console.log(chalk.red('[GIFT-MD] ❌ Uncaught exception:'), err);
    console.log(chalk.yellow('[GIFT-MD] 🔄 Attempting to restart...'));
    
    setTimeout(() => {
        startXeonBotInc();
    }, 5000);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log(chalk.red('[GIFT-MD] ❌ Unhandled Rejection at:'), promise, 'reason:', reason);
});

  // =================================
// 🧹 MEMORY MANAGEMENT (Optimized for 716 MiB server)
// =================================

console.log(chalk.cyan('[GIFT-MD] 📊 Initializing memory optimization...'));
console.log(chalk.cyan(`[GIFT-MD] 💾 Server RAM: 716 MiB | Available: ~430 MiB | Bot Limit: 280 MB`));

// ✅ Check if GC is available on startup (only once)
if (global.gc) {
    console.log(chalk.green('[GIFT-MD] ✅ Garbage collection enabled!'));
} else {
    console.log(chalk.yellow('[GIFT-MD] ⚠️ Garbage collection not available.'));
    console.log(chalk.cyan('[GIFT-MD] 💡 To enable: node --expose-gc index.js'));
}

// 1. Aggressive Garbage Collection (every 30 seconds for low RAM)
setInterval(() => {
    if (global.gc) {
        try {
            global.gc();
            const memUsage = process.memoryUsage();
            const rss = (memUsage.rss / 1024 / 1024).toFixed(2);
            const heapUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
            
            // ✅ Only log if RAM is high (above 200 MB)
            let lastLog = lastLog || 0;

if (rss > 200) {
    const now = Date.now();
    if (now - lastLog > 30000) { // logs every 10 seconds
        console.log(chalk.cyan(`[GIFT-MD] 🧹 GC: RAM ${rss} MB | Heap ${heapUsed} MB`));
        lastLog = now;
    }
}
        } catch (err) {
            // Silent fail - don't spam console
        }
    }
    // ✅ REMOVED: No more warning spam!
}, 30_000); // Every 30 seconds

// 2. Memory Monitoring with 3-tier warning system
setInterval(() => {
    const memUsage = process.memoryUsage();
    const rss = memUsage.rss / 1024 / 1024;
    const heapUsed = memUsage.heapUsed / 1024 / 1024;
    
    // 🟡 Warning (200-250 MB)
    if (rss >= 240 && rss < 260) {
        console.log(chalk.yellow(`[GIFT-MD] ⚠️ RAM: ${rss.toFixed(2)} MB / 280 MB (Warning)`));
    }
    // 🟠 High (250-270 MB) - Force GC
    else if (rss >= 250 && rss < 270) {
        console.log(chalk.hex('#FFA500')(`[GIFT-MD] 🟠 High RAM: ${rss.toFixed(2)} MB / 280 MB`));
        if (global.gc) {
            console.log(chalk.cyan('[GIFT-MD] 🧹 Forcing garbage collection...'));
            try {
                global.gc();
            } catch (err) {
                // Silent fail
            }
        }
    }
    // 🔴 Critical (270+ MB) - Emergency cleanup
    else if (rss >= 270) {
        console.log(chalk.red(`[GIFT-MD] 🔴 CRITICAL RAM: ${rss.toFixed(2)} MB / 280 MB`));
        console.log(chalk.red('[GIFT-MD] ⚠️ Memory limit approaching! Forcing cleanup...'));
        
        if (global.gc) {
            try {
                global.gc();
                console.log(chalk.green('[GIFT-MD] ✅ Emergency GC completed'));
            } catch (err) {
                console.error(chalk.red('[GIFT-MD] ❌ GC failed:', err.message));
            }
        }
        
        // Clear caches
        if (global.sock?.msgRetryCounterCache) {
            global.sock.msgRetryCounterCache.clear();
        }
    }
}, 60_000); // Check every 60 seconds (less frequent)             
// 3. Aggressive store cleanup (every 3 minutes)
setInterval(() => {
    try {
        let cleaned = 0;
        
        // Clean messages (keep only 30 per chat for low RAM)
        Object.keys(store.messages).forEach(jid => {
            if (store.messages[jid] && store.messages[jid].length > 30) {
                const excess = store.messages[jid].length - 30;
                store.messages[jid].splice(0, excess);
                cleaned += excess;
            }
        });
        
        if (cleaned > 0) {
            console.log(chalk.gray(`🗑️ Cleaned ${cleaned} messages | Freed ~${(cleaned * 0.01).toFixed(2)} MB`));
        }
        
        // Force GC after cleanup
        if (global.gc) {
            global.gc();
        }
        
    } catch (error) {
        console.error(chalk.red('❌ Cleanup error:'), error.message);
    }
}, 180_000); // Every 3 minutes

console.log(chalk.green('[GIFT-MD] ✅ Memory optimization enabled (Low RAM mode)\n'));           
const sites = [
"https://giveaway-p7i5.onrender.com/",
"https://test-r797.onrender.com/"];

async function pingSite(url) {
  try {
    const res = await fetch(`${url}?r=${Math.random()}`);
    /**console.log(`[${new Date().toLocaleTimeString()}] Pinged ${url} → ${res.status}`);*/
  } catch (err) {
    /**console.log(`[${new Date().toLocaleTimeString()}] Failed to ping ${url}: ${err.message}`);*/
  }
}

setInterval(() => {
  sites.forEach((url) => pingSite(url));
}, 1000 * 60 * 4); // every 4 minutes

// Run immediately once on startup too
sites.forEach((url) => pingSite(url));
console.log(chalk.green('[GIFT-X] ✅ web-ping enabled'));
