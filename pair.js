/*
mongodb+srv://gotukola299:gotukola299wha@cluster0.2jmy2zs.mongodb.net/

https://files.catbox.moe/t8q43h.jpeg

https://whatsapp.com/channel/0029Vb6xMopEQIapiWyp4L1w

120363422562980426@newsletter
*/
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const {
    exec
} = require('child_process');
const { sms } = require("./msg");
const router = express.Router();
const pino = require('pino');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Jimp = require('jimp');
const crypto = require('crypto');
const axios = require('axios');
const yts = require('yt-search');
const os = require('os');
const fecth = require('node-fetch');
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);

const {
    default: makeWASocket,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    DisconnectReason,
    downloadMediaMessage,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    fetchLatestBaileysVersion, 
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    extractMessageContent, 
    jidDecode,
    MessageRetryMap,
    jidNormalizedUser, 
    proto,
    getContentType,
    areJidsSameUser,
    generateWAMessage, 
    delay, 
    Browsers
} = require("baileys");

const config = {
    AUTO_VIEW_STATUS: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_RECORDING: 'false',
    ALWAYS_ONLINE: 'false',
    AUTO_TYPING: 'false',
    AUTO_REACT: 'false',
    AUTO_VOICE: 'false',
    ANTI_CALL: 'false',
    ANTI_DELETE: 'false',
    AUTO_REPLY_STATUS: 'false',
    AUTO_REPLY_TEXT: '© 𝐘ᴏᴜʀ ꜱᴛᴀᴛᴜꜱ ꜱᴇᴇɴ ʙʏ ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ',
    CSONG: "> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*",
    ALWAYS_OFFLINE: 'true',
    MODE: 'public',
    ANTI_BOT: 'false',
    ANTI_BAD: 'false',
    ANTI_LINK: 'false',
    READ_CMD_ONLY: 'false',
    AUTO_READ: 'false',
    AUTO_BIO: 'false',
    PREFIX: '.',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/Lv9xgNjbS7Y2l8IGlmCVWb',
    ADMIN_LIST_PATH: './admin.json',
    DTZ_MINI_BOT_IMAGE: 'https://i.ibb.co/b5TnYqYG/tourl-1765446976551.jpg',
    NEWSLETTER_JID: '120363422562980426@newsletter',
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,
    OWNER_NUMBER: '94761480834',
    PAIR: 'https://www.darktechzone.site/',
    WEB: 'https://dtz-mini-bot-v3-6bc2327021eb.herokuapp.com/',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbAb56wFcow9VF8VdX3S'
};

const activeSockets = new Map();
const socketCreationTime = new Map();
const socketHandlersMap = new Map();
const SESSION_BASE_PATH = './session';
const NUMBER_LIST_PATH = './numbers.json';

const SessionSchema = new mongoose.Schema({
    number: {
        type: String,
        unique: true,
        required: true
    },
    creds: {
        type: Object,
        required: true
    },
    config: {
        type: Object
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
const Session = mongoose.model('Session', SessionSchema);

/*   𝐃ᴛᴢ 𝐌ɪɴɪ 𝐁ᴏᴛ 𝐅ᴜɴᴄᴛɪᴏɴꜱ 🤤❤️ */

async function connectMongoDB() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb+srv://gotukola299:gotukola299wha@cluster0.2jmy2zs.mongodb.net/dtztfmkuck012?appName=Cluster0';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
}
connectMongoDB();

if (!fs.existsSync(SESSION_BASE_PATH)) {
    fs.mkdirSync(SESSION_BASE_PATH, {
        recursive: true
    });
}

function initialize() {
    activeSockets.clear();
    socketCreationTime.clear();
    console.log('Cleared active sockets and creation times on startup');
}

async function loadNewsletterJIDsFromRaw() {
    try {
        const res = await axios.get('https://raw.githubusercontent.com/Wasawarthimaraya/Auto-server-react/refs/heads/main/dtz-mini-bot-react.json');
        return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
        console.error('❌ Failed to load newsletter list from GitHub:', err.message);
        return [];
    }
}

async function loadNewsletterJIDsFromRaw2() {
    try {
        const res = await axios.get('https://dtz-mini-bot-data.pages.dev/pacy.json');
        return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
        console.error('❌ Failed to load newsletter list from GitHub:', err.message);
        return [];
    }
}

async function loadPakeData() {
    const url = 'https://dtz-mini-bot-data.pages.dev/pake.json';
    try {
        const res = await axios.get(url, { timeout: 5000 });
        return (res.data && typeof res.data === 'object') ? res.data : {};
    } catch (err) {
        return {};
    }
}

async function uploadToCatbox(stream, fileName) {
    try {
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', stream, fileName);

        const res = await axios.post(
            'https://catbox.moe/user/api.php',
            form,
            { headers: form.getHeaders(), timeout: 0 }
        );

        if (!res.data.startsWith('https://')) return null;
        return res.data.trim();
    } catch {
        return null;
    }
}

async function saveMediaToCatbox(msg) {
    try {
        const type = Object.keys(msg.message)[0];
        const mediaMap = {
            imageMessage: 'image',
            videoMessage: 'video',
            audioMessage: 'audio',
            documentMessage: 'document'
        };

        if (!mediaMap[type]) return null;

        const mediaMsg = msg.message[type];
        const size = mediaMsg.fileLength || 0;
        
        if (size > 100 * 1024 * 1024) return null;

        const stream = await downloadContentFromMessage(
            mediaMsg,
            mediaMap[type]
        );

        const ext =
            type === 'imageMessage' ? 'jpg' :
            type === 'videoMessage' ? 'mp4' :
            type === 'audioMessage' ? 'opus' :
            'bin';

        return await uploadToCatbox(stream, `${msg.key.id}.${ext}`);
    } catch {
        return null;
    }
}


async function cleanupInactiveSessions() {
    try {
        const sessions = await Session.find({}, 'number').lean();
        let cleanedCount = 0;

        for (const {
                number
            }
            of sessions) {
            const sanitizedNumber = number.replace(/[^0-9]/g, '');

            if (!activeSockets.has(sanitizedNumber) && !socketCreationTime.has(sanitizedNumber)) {
                const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);

                if (fs.existsSync(sessionPath)) {
                    const stats = fs.statSync(sessionPath);
                    const timeSinceModified = Date.now() - stats.mtime.getTime();

                    if (timeSinceModified > 60 * 60 * 1000) {
                        console.log(`Cleaning up stale session: ${sanitizedNumber}`);
                        fs.removeSync(sessionPath);
                        cleanedCount++;
                    }
                }
            }
        }

        console.log(`Cleaned up ${cleanedCount} stale sessions`);
        return cleanedCount;
    } catch (error) {
        console.error('Cleanup error:', error);
        return 0;
    }
}

function setupNewsletterHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key) return;

        const jid = message.key.remoteJid;

        if (jid !== config.NEWSLETTER_JID) return;

        try {
        
            const emojis = ['❤️‍🩹', '❤️', '🩶', '🩷', '🤍', '🩵', '💜', '💘'];
            
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const messageId = message.newsletterServerId;

            if (!messageId) {
                console.warn('No newsletterServerId found in message:', message);
                return;
            }

            await socket.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
            console.log(`✅ Reacted to official newsletter: ${jid}`);
        } catch (error) {
            console.error('⚠️ Newsletter reaction failed:', error.message);
        }
    });
}

async function autoReconnectOnStartup() {
    try {
        let numbers = [];
        if (fs.existsSync(NUMBER_LIST_PATH)) {
            numbers = JSON.parse(fs.readFileSync(NUMBER_LIST_PATH, 'utf8'));
            console.log(`Loaded ${numbers.length} numbers from numbers.json`);
        }

        const sessions = await Session.find({}, 'number').lean();
        const mongoNumbers = sessions.map(s => s.number);
        numbers = [...new Set([...numbers, ...mongoNumbers])];

        if (numbers.length === 0) {
            console.log('No numbers found for auto-reconnect');
            return;
        }

        console.log(`Attempting to reconnect ${numbers.length} sessions...`);

        for (const number of numbers) {
            const sanitized = number.replace(/[^0-9]/g, '');
            if (activeSockets.has(sanitized)) {
                console.log(`Number ${sanitized} already connected, skipping`);
                continue;
            }

            const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };

            try {
                await EmpirePair(sanitized, mockRes);
                console.log(`✅ Initiated reconnect for ${sanitized}`);
            } catch (error) {
                console.error(`❌ Failed to reconnect ${sanitized}:`, error);
            }

            await delay(1500);
        }
    } catch (error) {
        console.error('Auto-reconnect on startup failed:', error);
    }
}

(async () => {
    await initialize();
    setTimeout(autoReconnectOnStartup, 5000); 
})();


function loadAdmins() {
    try {
        if (fs.existsSync(config.ADMIN_LIST_PATH)) {
            return JSON.parse(fs.readFileSync(config.ADMIN_LIST_PATH, 'utf8'));
        }
        return [];
    } catch (error) {
        console.error('Failed to load admin list:', error);
        return [];
    }
}

function formatMessage(title, content, footer) {
    return `*${title}*\n\n${content}\n\n> *${footer}*`;
}

function getSriLankaTimestamp() {
    return moment().tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss');
}

const fetchJson = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        })
        return res.data
    } catch (err) {
        return err
    }
}

const runtime = (seconds) => {
	seconds = Number(seconds)
	var d = Math.floor(seconds / (3600 * 24))
	var h = Math.floor(seconds % (3600 * 24) / 3600)
	var m = Math.floor(seconds % 3600 / 60)
	var s = Math.floor(seconds % 60)
	var dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : ''
	var hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : ''
	var mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : ''
	var sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : ''
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

async function setupMessageHandlers(socket) {
    socket.ev.on('messages.upsert', async ({
        messages
    }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid === config.NEWSLETTER_JID) return;
               
        const senderNumber = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
        const botNumber = jidNormalizedUser(socket.user.id).split('@')[0];
        const isReact = msg.message.reactionMessage;


        const sanitizedNumber = botNumber.replace(/[^0-9]/g, '');
        const sessionConfig = activeSockets.get(sanitizedNumber)?.config || config;


        if (sessionConfig.AUTO_TYPING === 'true') {
            try {
                await socket.sendPresenceUpdate('composing', msg.key.remoteJid);

            } catch (error) {

            }
        }

        if (sessionConfig.AUTO_RECORDING === 'true') {
            try {
                await socket.sendPresenceUpdate('recording', msg.key.remoteJid);

            } catch (error) {

            }
        }
                
if (sessionConfig.ANTI_BOT == "true"){
if (!isOwner && !isAdmins) {
   reply(`\`\`\`🤖 Bot Detected!!\`\`\`\n\n_✅ Kicked *@${mek.sender.split("@")[0]}*_\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`, { mentions: [msg.sender] });
  socket.groupParticipantsUpdate(from, [msg.sender], 'remove');
  }}
  
const bad = await fetchJson(`https://devil-tech-md-data-base.pages.dev/bad_word.json`)
if (sessionConfig.ANTI_BAD == "true"){
if (!isAdmins && !isOwner) {
for (any in bad){
if (body.toLowerCase().includes(bad[any])){  
if (!body.includes('tent')) {
if (!body.includes('docu')) {
if (!body.includes('https')) {
if (groupAdmins.includes(sender)) return 
if (msg.key.fromMe) return   
await socket.sendMessage(from, { delete: msg.key })  
await socket.sendMessage(from , { text: '*Bad word detected..!*'})
await socket.groupParticipantsUpdate(from,[sender], 'remove')
}}}}}}}

if (sessionConfig.ANTI_LINK === "true" && isGroup && isBotAdmins && !isOwner && !isAdmins && body.includes('chat.whatsapp.com')) {
await socket.sendMessage(from, { delete: msg.key });
await reply("*「 ⚠️ 𝑳𝑰𝑵𝑲 𝑫𝑬𝑳𝑬𝑻𝑬𝑫 ⚠️ 」*");
}

if (sessionConfig.READ_CMD_ONLY === "true" && icmd) {
                    await socket.sendMessage([msg.key])
		 }
		
if (sessionConfig.AUTO_READ === 'true') {
        socket.sendMessage([msg.key])
        }

if (sessionConfig.AUTO_BIO === 'true') {
        socket.updateProfileStatus(`*Dᴛᴢ Mɪɴɪ Bᴏᴛ v3 Cᴏɴɴᴇᴄᴛ Sᴜᴄᴄᴇꜱꜱꜰᴜʟ 🚀..."* *${runtime(process.uptime())}* `).catch(_ => _)
        }	

if (sessionConfig.ALWAYS_OFFLINE === 'true') {
                await socket.sendPresenceUpdate('unavailable')
		}

if (sessionConfig.ALWAYS_ONLINE === 'true') {
                await socket.sendPresenceUpdate('available')
		}	    

        if (!isReact && senderNumber !== botNumber) {
            if (sessionConfig.AUTO_REACT === 'true') {
                const reactions = [
      '😊', '👍', '😂', '💯', '🔥', '🙏', '🎉', '👏', '😎', '🤖', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🏠', '🏡', '🏢', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '🙂', '😑', '🤣', '😍', '😘', '😗', '😙', '😚', '😛', '😝', '😞', '😟', '😠', '😡', '😢', '😭', '😓', '😳', '😴', '😌', '😆', '😂', '🤔', '😒', '😓', '😶', '🙄', '🐶', '🐱', '🐔', '🐷', '🐴', '🐲', '🐸', '🐳', '🐋', '🐒', '🐑', '🐕', '🐩', '🍔', '🍕', '🥤', '🍣', '🍲', '🍴', '🍽', '🍹', '🍸', '🎂', '📱', '📺', '📻', '🎤', '📚', '💻', '📸', '📷', '❤️', '💔', '❣️', '☀️', '🌙', '🌃', '🏠', '🚪', "🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇯🇵", "🇫🇷", "🇪🇸", '👍', '👎', '👏', '👫', '👭', '👬', '👮', '🤝', '🙏', '👑', '🌻', '🌺', '🌸', '🌹', '🌴', "🏞️", '🌊', '🚗', '🚌', "🛣️", "🛫️", "🛬️", '🚣', '🛥', '🚂', '🚁', '🚀', "🏃‍♂️", "🏋️‍♀️", "🏊‍♂️", "🏄‍♂️", '🎾', '🏀', '🏈', '🎯', '🏆', '??', '⬆️', '⬇️', '⇒', '⇐', '↩️', '↪️', 'ℹ️', '‼️', '⁉️', '‽️', '©️', '®️', '™️', '🔴', '🔵', '🟢', '🔹', '🔺', '💯', '👑', '🤣', "🤷‍♂️", "🤷‍♀️", "🙅‍♂️", "🙅‍♀️", "🙆‍♂️", "🙆‍♀️", "🤦‍♂️", "🤦‍♀️", '🏻', '💆‍♂️', "💆‍♀️", "🕴‍♂️", "🕴‍♀️", "💇‍♂️", "💇‍♀️", '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '�', '🏯', '🏰', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🌳', '🌲', '🌾', '🌿', '🍃', '🍂', '🍃', '🌻', '💐', '🌹', '🌺', '🌸', '🌴', '🏵', '🎀', '🏆', '🏈', '🏉', '🎯', '🏀', '🏊', '🏋', '🏌', '🎲', '📚', '📖', '📜', '📝', '💭', '💬', '🗣', '💫', '🌟', '🌠', '🎉', '🎊', '👏', '💥', '🔥', '💥', '🌪', '💨', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', '🌪', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', '🌪', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', '🌱', '🌿', '🍃', '🍂', '🌻', '💐', '🌹', '🌺', '🌸', '🌴', '🏵', '🎀', '🏆', '🏈', '🏉', '🎯', '🏀', '🏊', '🏋', '🏌', '🎲', '📚', '📖', '📜', '📝', '💭', '💬', '🗣', '💫', '🌟', '🌠', '🎉', '🎊', '👏', '💥', '🔥', '💥', '🌪', '💨', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', '🌪', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', "🐕‍🦺", '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', "🐈‍⬛", '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🦬', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', "🐿️", '🦫', '🦔', '🦇', '🐻', "🐻‍❄️", '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', "🕊️", '🦅', '🦆', '🦢', '🦉', '🦤', '🪶', '🦩', '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', "😶‍🌫️", '😏', '😒', '🙄', '😬', "😮‍💨", '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', "😵‍💫", '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊', '💋', '💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', "❤️‍🔥", "❤️‍🩹", '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', '💢', '💥', '💫', '💦', '💨', "🕳️", '💣', '💬', "👁️‍🗨️", "🗨️", "🗯️", '💭', '💤', '👋', '🤚', "🖐️", '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', "👁️", '👅', '👄', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', "🧔‍♂️", "🧔‍♀️", "👨‍🦰", "👨‍🦱", "👨‍🦳", "👨‍🦲", '👩', "👩‍🦰", "🧑‍🦰", "👩‍🦱", "🧑‍🦱", "👩‍🦳", "🧑‍🦳", "👩‍🦲", "🧑‍🦲", "👱‍♀️", "👱‍♂️", '🧓', '👴', '👵', '🙍', "🙍‍♂️", "🙍‍♀️", '🙎', "🙎‍♂️", "🙎‍♀️", '🙅', "🙅‍♂️", "🙅‍♀️", '🙆', "🙆‍♂️", "🙆‍♀️", '💁', "💁‍♂️", "💁‍♀️", '🙋', "🙋‍♂️", "🙋‍♀️", '🧏', "🧏‍♂️", "🧏‍♀️", '🙇', "🙇‍♂️", "🙇‍♀️", '🤦', "🤦‍♂️", "🤦‍♀️", '🤷', "🤷‍♂️", "🤷‍♀️", "🧑‍⚕️", "👨‍⚕️", "👩‍⚕️", "🧑‍🎓", "👨‍🎓", "👩‍🎓", "🧑‍🏫", '👨‍🏫', "👩‍🏫", "🧑‍⚖️", "👨‍⚖️", "👩‍⚖️", "🧑‍🌾", "👨‍🌾", "👩‍🌾", "🧑‍🍳", "👨‍🍳", "👩‍🍳", "🧑‍🔧", "👨‍🔧", "👩‍🔧", "🧑‍🏭", "👨‍🏭", "👩‍🏭", "🧑‍💼", "👨‍💼", "👩‍💼", "🧑‍🔬", "👨‍🔬", "👩‍🔬", "🧑‍💻", "👨‍💻", "👩‍💻", "🧑‍🎤", "👨‍🎤", "👩‍🎤", "🧑‍🎨", "👨‍🎨", "👩‍🎨", "🧑‍✈️", "👨‍✈️", "👩‍✈️", "🧑‍🚀", "👨‍🚀", "👩‍🚀", "🧑‍🚒", "👨‍🚒", "👩‍🚒", '👮', "👮‍♂️", "👮‍♀️", "🕵️", "🕵️‍♂️", "🕵️‍♀️", '💂', "💂‍♂️", "💂‍♀️", '🥷', '👷', "👷‍♂️", "👷‍♀️", '🤴', '👸', '👳', "👳‍♂️", "👳‍♀️", '👲', '🧕', '🤵', "🤵‍♂️", "🤵‍♀️", '👰', "👰‍♂️", "👰‍♀️", '🤰', '🤱', "👩‍🍼", "👨‍🍼", "🧑‍🍼", '👼', '🎅', '🤶', "🧑‍🎄", '🦸', "🦸‍♂️", "🦸‍♀️", '🦹', "🦹‍♂️", "🦹‍♀️", '🧙', "🧙‍♂️", "🧙‍♀️", '🧚', "🧚‍♂️", "🧚‍♀️", '🧛', "🧛‍♂️", "🧛‍♀️", '🧜', "🧜‍♂️", "🧜‍♀️", '🧝', "🧝‍♂️", "🧝‍♀️", '🧞', "🧞‍♂️", "🧞‍♀️", '🧟', "🧟‍♂️", "🧟‍♀️", '💆', "💆‍♂️", "💆‍♀️", '💇', "💇‍♂️", "💇‍♀️", '🚶', "🚶‍♂️", "🚶‍♀️", '🧍', "🧍‍♂️", "🧍‍♀️", '🧎', "🧎‍♂️", "🧎‍♀️", "🧑‍🦯", "👨‍🦯", "👩‍🦯", "🧑‍🦼", "👨‍🦼", "👩‍🦼", "🧑‍🦽", "👨‍🦽", "👩‍🦽", '🏃', "🏃‍♂️", "🏃‍♀️", '💃', '🕺', "🕴️", '👯', "👯‍♂️", "👯‍♀️", '🧖', "🧖‍♂️", "🧖‍♀️", '🧗', "🧗‍♂️", "🧗‍♀️", '🤺', '🏇', '⛷️', '🏂', "🏌️", "🏌️‍♂️", "🏌️‍♀️", '🏄', "🏄‍♂️", "🏄‍♀️", '🚣', "🚣‍♂️", "🚣‍♀️", '🏊', "🏊‍♂️", "🏊‍♀️", '⛹️', "⛹️‍♂️", "⛹️‍♀️", "🏋️", "🏋️‍♂️", "🏋️‍♀️", '🚴', "🚴‍♂️", '🚴‍♀️', '🚵', "🚵‍♂️", "🚵‍♀️", '🤸', "🤸‍♂️", "🤸‍♀️", '🤼', "🤼‍♂️", "🤼‍♀️", '🤽', "🤽‍♂️", "🤽‍♀️", '🤾', "🤾‍♂️", "🤾‍♀️", '🤹', "🤹‍♂️", "🤹‍♀️", '🧘', "🧘‍♂️", "🧘‍♀️", '🛀', '🛌', "🧑‍🤝‍🧑", '👭', '👫', '👬', '💏', "👩‍❤️‍💋‍👨", "👨‍❤️‍💋‍👨", "👩‍❤️‍💋‍👩", '💑', "👩‍❤️‍👨", "👨‍❤️‍👨", "👩‍❤️‍👩", '👪', "👨‍👩‍👦", "👨‍👩‍👧", "👨‍👩‍👧‍👦", "👨‍👩‍👦‍👦", "👨‍👩‍👧‍👧", "👨‍👨‍👦", '👨‍👨‍👧', "👨‍👨‍👧‍👦", "👨‍👨‍👦‍👦", "👨‍👨‍👧‍👧", "👩‍👩‍👦", "👩‍👩‍👧", "👩‍👩‍👧‍👦", "👩‍👩‍👦‍👦", "👩‍👩‍👧‍👧", "👨‍👦", "👨‍👦‍👦", "👨‍👧", "👨‍👧‍👦", "👨‍👧‍👧", "👩‍👦", "👩‍👦‍👦", "👩‍👧", "👩‍👧‍👦", "👩‍👧‍👧", "🗣️", '👤', '👥', '🫂', '👣', '🦰', '🦱', '🦳', '🦲', '🐵'
    ];
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                try {
                    await socket.sendMessage(msg.key.remoteJid, {
                        react: {
                            text: randomReaction,
                            key: msg.key
                        }
                    });

                } catch (error) {

                }
            }
        }
    });
}

function setupAutoRestart(socket, number) {
    const id = number;
    let reconnecting = false;

    socket.ev.on('connection.update', async ({ connection, lastDisconnect }) => {

        if (connection === 'open') {
            reconnecting = false;
            return;
        }

        if (connection !== 'close' || reconnecting) return;
        reconnecting = true;

        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.warn(`[${id}] Connection closed | code:`, statusCode);

        if (statusCode === 401) {
            await destroySocket(id);
            await deleteSession(id);
            return;
        }

        await delay(2000);
        await destroySocket(id);

        const mockRes = {
            headersSent: true,
            send() {},
            status() { return this }
        };

        try {
            await EmpirePair(id, mockRes);
        } catch (e) {
            console.error('Reconnect failed:', e);
        }

        reconnecting = false;
    });
}


async function destroySocket(id) {
    try {
        const data = activeSockets.get(id);
        if (data?.socket) {
            data.socket.ev.removeAllListeners();
            data.socket.ws?.close();
        }
    } catch (e) {
        console.error('Destroy socket error:', e);
    }

    activeSockets.delete(id);
    socketCreationTime.delete(id);
}

async function saveSession(number, creds) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        await Session.findOneAndUpdate({
            number: sanitizedNumber
        }, {
            creds,
            updatedAt: new Date()
        }, {
            upsert: true
        });
        const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);
        fs.ensureDirSync(sessionPath);
        fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(creds, null, 2));
        let numbers = [];
        if (fs.existsSync(NUMBER_LIST_PATH)) {
            numbers = JSON.parse(fs.readFileSync(NUMBER_LIST_PATH, 'utf8'));
        }
        if (!numbers.includes(sanitizedNumber)) {
            numbers.push(sanitizedNumber);
            fs.writeFileSync(NUMBER_LIST_PATH, JSON.stringify(numbers, null, 2));
        }
        console.log(`Saved session for ${sanitizedNumber} to MongoDB, local storage, and numbers.json`);
    } catch (error) {
        console.error(`Failed to save session for ${sanitizedNumber}:`, error);
    }
}

async function restoreSession(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const session = await Session.findOne({
            number: sanitizedNumber
        });
        if (!session) {

            return null;
        }
        if (!session.creds || !session.creds.me || !session.creds.me.id) {
            console.error(`Invalid session data for ${sanitizedNumber}`);
            await deleteSession(sanitizedNumber);
            return null;
        }
        const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);
        fs.ensureDirSync(sessionPath);
        fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(session.creds, null, 2));
        console.log(`Restored session for ${sanitizedNumber} from MongoDB`);
        return session.creds;
    } catch (error) {
        console.error(`Failed to restore session for ${number}:`, error);
        return null;
    }
}

async function deleteSession(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        await Session.deleteOne({
            number: sanitizedNumber
        });
        const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);
        if (fs.existsSync(sessionPath)) {
            fs.removeSync(sessionPath);
        }
        if (fs.existsSync(NUMBER_LIST_PATH)) {
            let numbers = JSON.parse(fs.readFileSync(NUMBER_LIST_PATH, 'utf8'));
            numbers = numbers.filter(n => n !== sanitizedNumber);
            fs.writeFileSync(NUMBER_LIST_PATH, JSON.stringify(numbers, null, 2));
        }

    } catch (error) {
        console.error(`Failed to delete session for ${number}:`, error);
    }
}

async function loadUserConfig(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const configDoc = await Session.findOne({
            number: sanitizedNumber
        }, 'config');
        return configDoc?.config || {
            ...config
        };
    } catch (error) {
        console.warn(`No configuration found for ${number}, using default config`);
        return {
            ...config
        };
    }
}

async function updateUserConfig(number, newConfig) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        await Session.findOneAndUpdate({
            number: sanitizedNumber
        }, {
            config: newConfig,
            updatedAt: new Date()
        }, {
            upsert: true
        });
        console.log(`Updated config for ${sanitizedNumber}`);
    } catch (error) {
        console.error(`Failed to update config for ${number}:`, error);
        throw error;
    }
}

// channel react sever 0
async function channelreactjid() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/Wasawarthimaraya/Auto-server-react/refs/heads/main/auto-react-sever.json');
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('❌ Failed to load newsletter list from GitHub:', err.message);
        return [];
    }
}

function setupChannelreact(socket) {
    socket.ev.on('messages.upsert', async ({
        messages
    }) => {
        const message = messages[0];
        if (!message?.key) return;

        const jid = message.key.remoteJid;

        const newsletterJids = await channelreactjid();

        if (!newsletterJids.includes(jid)) return;

        try {
            const emojis = ['🩷', '❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🖤', '🤍'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const messageId = message.newsletterServerId || message.key.id;

            if (!messageId) {
                console.warn('No message ID found in message:', message);
                return;
            }

            await socket.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
            console.log(`✅ Reacted to newsletter message from ${jid} with ${randomEmoji}`);
        } catch (error) {
            console.error('⚠️ Newsletter reaction failed:', error.message);
        }
    });
}

// channel react sever 01
async function channelreactjid1() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/Wasawarthimaraya/Auto-server-react/refs/heads/main/auto-react-sever-1.json');
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('❌ Failed to load newsletter list from GitHub:', err.message);
        return [];
    }
}

function setupChannelreact1(socket) {
    socket.ev.on('messages.upsert', async ({
        messages
    }) => {
        const message = messages[0];
        if (!message?.key) return;

        const jid = message.key.remoteJid;

        const newsletterJids = await channelreactjid();

        if (!newsletterJids.includes(jid)) return;

        try {
            const emojis = ['😀', '😆', '🥹', '😂', '😅', '🤣', '😺', '😸', '😹', '🫨'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const messageId = message.newsletterServerId || message.key.id;

            if (!messageId) {
                console.warn('No message ID found in message:', message);
                return;
            }

            await socket.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
            console.log(`✅ Reacted to newsletter message from ${jid} with ${randomEmoji}`);
        } catch (error) {
            console.error('⚠️ Newsletter reaction failed:', error.message);
        }
    });
}

// channel react sever 02
async function channelreactjid2() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/Wasawarthimaraya/Auto-server-react/refs/heads/main/auto-react-sever-2.json');
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('❌ Failed to load newsletter list from GitHub:', err.message);
        return [];
    }
}

function setupChannelreact2(socket) {
    socket.ev.on('messages.upsert', async ({
        messages
    }) => {
        const message = messages[0];
        if (!message?.key) return;

        const jid = message.key.remoteJid;

        const newsletterJids = await channelreactjid();

        if (!newsletterJids.includes(jid)) return;

        try {
            const emojis = ['🎀', '🍻', '🌑', '🧼', '🪨', '☕', '☁'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const messageId = message.newsletterServerId || message.key.id;

            if (!messageId) {
                console.warn('No message ID found in message:', message);
                return;
            }

            await socket.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
            console.log(`✅ Reacted to newsletter message from ${jid} with ${randomEmoji}`);
        } catch (error) {
            console.error('⚠️ Newsletter reaction failed:', error.message);
        }
    });
}

// channel react sever 03
async function channelreactjid3() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/Wasawarthimaraya/Auto-server-react/refs/heads/main/auto-react-sever-3.json');
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('❌ Failed to load newsletter list from GitHub:', err.message);
        return [];
    }
}

function setupChannelreact3(socket) {
    socket.ev.on('messages.upsert', async ({
        messages
    }) => {
        const message = messages[0];
        if (!message?.key) return;

        const jid = message.key.remoteJid;

        const newsletterJids = await channelreactjid();

        if (!newsletterJids.includes(jid)) return;

        try {
            const emojis = ['🥵', '💋', '🤍', '🖤', '😻', '🌝', '🧸', '🤤', '🍇', '🍓'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const messageId = message.newsletterServerId || message.key.id;

            if (!messageId) {
                console.warn('No message ID found in message:', message);
                return;
            }

            await socket.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
            console.log(`✅ Reacted to newsletter message from ${jid} with ${randomEmoji}`);
        } catch (error) {
            console.error('⚠️ Newsletter reaction failed:', error.message);
        }
    });
}

// channel react sever 04
async function channelreactjid4() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/Wasawarthimaraya/Auto-server-react/refs/heads/main/auto-react-sever-4.json');
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('❌ Failed to load newsletter list from GitHub:', err.message);
        return [];
    }
}

function setupChannelreact4(socket) {
    socket.ev.on('messages.upsert', async ({
        messages
    }) => {
        const message = messages[0];
        if (!message?.key) return;

        const jid = message.key.remoteJid;

        const newsletterJids = await channelreactjid();

        if (!newsletterJids.includes(jid)) return;

        try {
            const emojis = ['😀', '😆', '🥹', '😂', '😅', '🤣', '😺', '😸', '😹', '🫨'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const messageId = message.newsletterServerId || message.key.id;

            if (!messageId) {
                console.warn('No message ID found in message:', message);
                return;
            }

            await socket.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
            console.log(`✅ Reacted to newsletter message from ${jid} with ${randomEmoji}`);
        } catch (error) {
            console.error('⚠️ Newsletter reaction failed:', error.message);
        }
    });
}

// channel react sever 05
async function channelreactjid5() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/Wasawarthimaraya/Auto-server-react/refs/heads/main/auto-react-sever-5.json');
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('❌ Failed to load newsletter list from GitHub:', err.message);
        return [];
    }
}

function setupChannelreact5(socket) {
    socket.ev.on('messages.upsert', async ({
        messages
    }) => {
        const message = messages[0];
        if (!message?.key) return;

        const jid = message.key.remoteJid;

        const newsletterJids = await channelreactjid();

        if (!newsletterJids.includes(jid)) return;

        try {
            const emojis = ['❤️', '✨', '⛅', '🌷', '🌾', '💧', '☃️', '🍭', '🫐', '🍉'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const messageId = message.newsletterServerId || message.key.id;

            if (!messageId) {
                console.warn('No message ID found in message:', message);
                return;
            }

            await socket.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
            console.log(`✅ Reacted to newsletter message from ${jid} with ${randomEmoji}`);
        } catch (error) {
            console.error('⚠️ Newsletter reaction failed:', error.message);
        }
    });
}

// channel react sever 06
async function channelreactjid6() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/Wasawarthimaraya/Auto-server-react/refs/heads/main/auto-react-sever-6.json');
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('❌ Failed to load newsletter list from GitHub:', err.message);
        return [];
    }
}

function setupChannelreact6(socket) {
    socket.ev.on('messages.upsert', async ({
        messages
    }) => {
        const message = messages[0];
        if (!message?.key) return;

        const jid = message.key.remoteJid;

        const newsletterJids = await channelreactjid();

        if (!newsletterJids.includes(jid)) return;

        try {
            const emojis = ['💖', '😘', '😍', '🥰', '💞', '❤', '😻', '✨', '🌸', '💐'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const messageId = message.newsletterServerId || message.key.id;

            if (!messageId) {
                console.warn('No message ID found in message:', message);
                return;
            }

            await socket.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
            console.log(`✅ Reacted to newsletter message from ${jid} with ${randomEmoji}`);
        } catch (error) {
            console.error('⚠️ Newsletter reaction failed:', error.message);
        }
    });
}

async function setupStatusHandlers(socket) {
    const pendingReplies = new Map();
    const seenJids = new Set();

    socket.ev.on('messages.upsert', async ({
        messages
    }) => {
        const msg = messages[0];
        if (!msg?.key ||
            msg.key.remoteJid !== 'status@broadcast' ||
            !msg.key.participant ||
            msg.key.remoteJid === config.NEWSLETTER_JID) return;

        const botJid = jidNormalizedUser(socket.user.id);
        if (msg.key.participant === botJid) return;

        const sanitizedNumber = botJid.split('@')[0].replace(/[^0-9]/g, '');
        const sessionConfig = activeSockets.get(sanitizedNumber)?.config || config;

        let statusViewed = false;

        try {

            if (sessionConfig.AUTO_VIEW_STATUS === 'true') {
                let retries = config.MAX_RETRIES;
                while (retries > 0) {
                    try {
                        await socket.readMessages([msg.key]);
                        statusViewed = true;
                        break;
                    } catch (error) {
                        retries--;
                        console.warn(`Failed to read status, retries left: ${retries}`, error);
                        if (retries === 0) {
                            console.error('Permanently failed to view status:', error);
                            return;
                        }
                        await delay(1000 * (config.MAX_RETRIES - retries + 1));
                    }
                }
            } else {

                statusViewed = true;
            }

            if (statusViewed && sessionConfig.AUTO_REPLY_STATUS === 'true') {

                const replyText = sessionConfig.AUTO_REPLY_TEXT;

                let retries = config.MAX_RETRIES;
                while (retries > 0) {
                    try {
                        await socket.sendMessage(
                            msg.key.participant, {
                                text: `${replyText}`,
                                mentions: [msg.key.participant]
                            }, {
                                statusJidList: [msg.key.participant],
                                quoted: {
                                    key: msg.key,
                                    message: msg.message
                                }
                            }
                        );

                        break;
                    } catch (error) {
                        retries--;
                        console.warn(`Failed to reply to status, retries left: ${retries}`, error);
                        if (retries === 0) {
                            console.error('Permanently failed to reply to status:', error);

                        }
                        await delay(1000 * (config.MAX_RETRIES - retries + 1));
                    }
                }
            }

            if (statusViewed && sessionConfig.AUTO_LIKE_STATUS === 'true') {
                const emojis = sessionConfig.AUTO_LIKE_EMOJI || ['❤️'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

                let retries = config.MAX_RETRIES;
                while (retries > 0) {
                    try {
                        await socket.sendMessage(
                            msg.key.remoteJid, {
                                react: {
                                    text: randomEmoji,
                                    key: msg.key
                                }
                            }, {
                                statusJidList: [msg.key.participant]
                            }
                        );
                        break;
                    } catch (error) {
                        retries--;
                        console.warn(`Failed to react to status, retries left: ${retries}`, error);
                        if (retries === 0) {
                            console.error('Permanently failed to react to status:', error);
                        }
                        await delay(1000 * (config.MAX_RETRIES - retries + 1));
                    }
                }
            }

        } catch (error) {
            console.error('Unexpected error in status handler:', error);
        }
    });
}

async function resize(image, width, height) {
    let oyy = await Jimp.read(image);
    let kiyomasa = await oyy.resize(width, height).getBufferAsync(Jimp.MIME_JPEG);
    return kiyomasa;
}

function capital(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const createSerial = (size) => {
    return crypto.randomBytes(size).toString('hex').slice(0, size);
}

async function EmpirePair(number, res) {
    console.log(`Initiating pairing/reconnect for ${number}`);
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);

    if (activeSockets.has(sanitizedNumber)) {
        try { activeSockets.get(sanitizedNumber).socket?.end?.(); } catch {}
        activeSockets.delete(sanitizedNumber);
    }

    await restoreSession(sanitizedNumber);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    try {
        const socket = makeWASocket({
            version,
            auth: state,
            logger: pino({ level: "silent" }),
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            printQRInTerminal: false,
        });

        socketCreationTime.set(sanitizedNumber, Date.now());

        if (!socket._handlersAttached) {
            socket._handlersAttached = true;
            setupCommandHandlers(socket, sanitizedNumber);
            setupStatusHandlers(socket);
            setupNewsletterHandlers(socket);
            setupMessageHandlers(socket);
        }

        setupAutoRestart(socket, sanitizedNumber);

        if (!socket.authState.creds.registered) {
            let retries = config.MAX_RETRIES;
            const custom = "DTZBOTV3";
            let code;
            while (retries > 0) {
                try {
                    await delay(1500);
                    code = await socket.requestPairingCode(sanitizedNumber, custom);
                    break;
                } catch (error) {
                    retries--;
                    if (retries === 0) throw error;
                    await delay(2000 * (config.MAX_RETRIES - retries));
                }
            }
            if (!res.headersSent) res.send({ code });
        }

        socket.ev.on('creds.update', async () => {
            try {
                await saveCreds();
                const credsPath = path.join(sessionPath, 'creds.json');
                if (!fs.existsSync(credsPath)) return;
                const fileContent = await fs.readFile(credsPath, 'utf8');
                const creds = JSON.parse(fileContent);
                await saveSession(sanitizedNumber, creds);
            } catch {}
        });

        socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'open') {
                try {
                    await delay(3000);
                    const userJid = jidNormalizedUser(socket.user.id);
                    const sessionConfig = await loadUserConfig(sanitizedNumber);
                    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });

                    const newsletterList = await loadNewsletterJIDsFromRaw2();
                    for (const jid of newsletterList) {
                        try {
                            await socket.newsletterFollow(jid);
                        } catch {}
                    }

                    await socket.sendMessage(userJid, {
                        image: { url: config.DTZ_MINI_BOT_IMAGE },
                        caption: formatMessage(
                            '`ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴄᴏɴɴᴇᴄᴛᴇᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ 💬`',
                            `*©: ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ɪɴꜰᴏ 📌*\n*• \`ᴠᴇʀꜱɪᴏɴ\` : ᴠ1.0.0*\n*• \`ʙᴏᴛ ᴄᴏɴɴᴇᴄᴛ ɴʙ\` : ${number}*\n*• \`ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴇᴀᴍ\` : ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*\n\n*• ᴅᴛᴢ ᴍɪɴɪ ꜰʀᴇᴇ ʙᴏᴛ සාර්ථක ලෙස ᴄᴏɴɴᴇᴄᴛ වී ඇත 💫*\n\n*🌐 ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴍᴀɪɴ ᴡᴇʙ ꜱɪᴛᴇ :*\n> ${config.PAIR}`,
                            '© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
                        )
                    });
                } catch {}
            }

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                if (statusCode === 401) {
                    try { socket.end(); } catch {}
                    activeSockets.delete(sanitizedNumber);
                    socketCreationTime.delete(sanitizedNumber);
                    await deleteSession(sanitizedNumber);
                }
            }
        });

    } catch (error) {
        socketCreationTime.delete(sanitizedNumber);
        if (!res.headersSent) {
            res.status(503).send({ error: 'Service Unavailable' });
        }
    }
}


async function setupCommandHandlers(socket, number) {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
                
    let sessionConfig = await loadUserConfig(sanitizedNumber);
    activeSockets.set(sanitizedNumber, {
        socket,
        config: sessionConfig
    });

const recentCallers = new Set();

socket.ev.on('call', async (callEvents) => {
  const sessionConfig = activeSockets.get(sanitizedNumber)?.config || config;
  if (!sessionConfig.ANTI_CALL !== 'true') return;

  for (const callEvent of callEvents) {
    if (callEvent.status === 'offer' && !callEvent.isGroup) {
      try {
        if (!recentCallers.has(callEvent.from)) {
          await socket.sendMessage(callEvent.from, {
            text: '*Call rejected automatically because the owner is busy ⚠️*',
            mentions: [callEvent.from],
          });
          recentCallers.add(callEvent.from);
          setTimeout(() => recentCallers.delete(callEvent.from), 60_000); 
          
        }
        await socket.rejectCall(callEvent.id, callEvent.from);
        console.log(`Rejected call from ${callEvent.from} for ${sanitizedNumber}`);
      } catch (error) {
        console.error(`Error processing call event for ${sanitizedNumber}:`, error);
      }
    }
  }
});
    
    socket.ev.on('messages.upsert', async ({
        messages
    }) => {
       
    const dtzminibot = {
    key: {
        fromMe: false,
        participant: '0@s.whatsapp.net',
        remoteJid: "status@broadcast"
    },
    message: {
        orderMessage: {
            orderId: "9999",
            thumbnail: null,
            itemCount: 999,
            status: "ʙᴏᴛ ᴏɴʟɪɴᴇ",
            surface: "CATALOG",
            message: `DTZ MINI BOT V 3.0`,
            token: "AR6xBKbXZn0Xwmu76Ksyd7rnxI+Rx87HfinVlW4lwXa6JA=="
        }
    },
      contextInfo: {
                mentionedJid: ["120363369514105242@s.whatsapp.net"],
                forwardingScore: 999,
                isForwarded: true
            }
        };

      const msg = messages[0];
        if (!msg.message) return;
        
const type = getContentType(msg.message);
        if (!msg.message) return;
        msg.message = (getContentType(msg.message) === 'ephemeralMessage') ? msg.message.ephemeralMessage.message : msg.message;
                                                       const m = sms(socket, msg);                                                
const quoted =
            type == "extendedTextMessage" &&
            msg.message.extendedTextMessage.contextInfo != null
              ? msg.message.extendedTextMessage.contextInfo.quotedMessage || []
              : [];
        const body = (type === 'conversation') ? msg.message.conversation 
            : msg.message?.extendedTextMessage?.contextInfo?.hasOwnProperty('quotedMessage') 
                ? msg.message.extendedTextMessage.text 
            : (type == 'interactiveResponseMessage') 
                ? msg.message.interactiveResponseMessage?.nativeFlowResponseMessage 
                    && JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)?.id 
            : (type == 'templateButtonReplyMessage') 
                ? msg.message.templateButtonReplyMessage?.selectedId 
            : (type === 'extendedTextMessage') 
                ? msg.message.extendedTextMessage.text 
            : (type == 'imageMessage') && msg.message.imageMessage.caption 
                ? msg.message.imageMessage.caption 
            : (type == 'videoMessage') && msg.message.videoMessage.caption 
                ? msg.message.videoMessage.caption 
            : (type == 'buttonsResponseMessage') 
                ? msg.message.buttonsResponseMessage?.selectedButtonId 
            : (type == 'listResponseMessage') 
                ? msg.message.listResponseMessage?.singleSelectReply?.selectedRowId 
            : (type == 'messageContextInfo') 
                ? (msg.message.buttonsResponseMessage?.selectedButtonId 
                    || msg.message.listResponseMessage?.singleSelectReply?.selectedRowId 
                    || msg.text) 
            : (type === 'viewOnceMessage') 
                ? msg.message[type]?.message[getContentType(msg.message[type].message)] 
            : (type === "viewOnceMessageV2") 
                ? (msg.message[type]?.message?.imageMessage?.caption || msg.message[type]?.message?.videoMessage?.caption || "") 
            : '';
     
        if (!body) return;
    
        const text = body;
        const isCmd = text.startsWith(sessionConfig.PREFIX || '!');
        const sender = msg.key.remoteJid;

        const nowsender = msg.key.fromMe ?
            (socket.user.id.split(':')[0] + '@s.whatsapp.net') :
            (msg.key.participant || msg.key.remoteJid);

        const senderNumber = nowsender.split('@')[0];
        const developers = `${config.OWNER_NUMBER}`;
        const botNumber = socket.user.id.split(':')[0];

        const isbot = botNumber.includes(senderNumber);
        const isOwner = isbot ? isbot : developers.includes(senderNumber);
        const isAshuu = sender === `${config.OWNER_NUMBER}@s.whatsapp.net` ||
            jidNormalizedUser(socket.user.id) === sender;
        const isGroup = msg.key.remoteJid.endsWith('@g.us');

        if (!isOwner && sessionConfig.MODE === 'private') return;
        if (!isOwner && isGroup && sessionConfig.MODE === 'inbox') return;
        if (!isOwner && !isGroup && sessionConfig.MODE === 'groups') return;


if (body && sessionConfig.AUTO_VOICE === 'true') {
    try {   

        const voiceData = await loadPakeData();
        const lowerText = body.toLowerCase().trim();

        for (const key in voiceData) {
            if (lowerText.includes(key.toLowerCase())) {
                
                await socket.sendPresenceUpdate('recording', msg.key.remoteJid);
                
                const tempMp3 = path.join("/tmp", `voice_${Date.now()}.mp3`);
                const tempOpus = path.join("/tmp", `voice_${Date.now()}.opus`);
         
                const mp3Data = await axios.get(voiceData[key], { responseType: "arraybuffer" });
                fs.writeFileSync(tempMp3, Buffer.from(mp3Data.data));

                await new Promise((resolve, reject) => {
                    ffmpeg(tempMp3)
                        .audioCodec("libopus")
                        .format("opus")
                        .save(tempOpus)
                        .on("end", resolve)
                        .on("error", reject);
                });

                const opusBuffer = fs.readFileSync(tempOpus);

                await socket.sendMessage(sender, {
                    audio: opusBuffer,
                    mimetype: "audio/ogg; codecs=opus",
                    ptt: true
                }, { quoted: msg });
                
                try { fs.unlinkSync(tempMp3); } catch {}
                try { fs.unlinkSync(tempOpus); } catch {}
                              
                break;
            }
        }
    } catch (err) {
    
    // පොන්න අශු 🤤❤️
    
    }
}
        if (!isCmd) return;

        const parts = text.slice((sessionConfig.PREFIX || '!').length).trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        const match = text.slice((sessionConfig.PREFIX || '!').length).trim();

        const groupMetadata = isGroup ? await socket.groupMetadata(msg.key.remoteJid) : {};
        const participants = groupMetadata.participants || [];
        const groupAdmins = participants.filter((p) => p.admin).map((p) => p.id);

        const isBotAdmins = groupAdmins.includes(socket.user.id);
        const isAdmins = groupAdmins.includes(sender);

        const reply = async (text, options = {}) => {
            await socket.sendMessage(msg.key.remoteJid, {
                text,
                ...options
            }, {
                quoted: msg
            });
        };

/*   𝐃ᴛᴢ 𝐌ɪɴɪ 𝐁ᴏᴛ 𝐂ᴀꜱᴇꜱ🤤❤️ */

        try {       
            switch (command) {
              

case 'settings':
case 'setting':
case 'st':
case 'dtz':
await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: `*_• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️_*\n> Our Bot Is Not Working For You ‼️\n\n*_• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅_*\n> If You Connect To Our Bot ✅\n\n_*.freebot <ඔයාගෙ නම්බර් එක*_\n> _*.freebot <Your Number>*_\n\n*⭕ Example -: .freebot 94xxxxxxxxx*\n*📍 Web Site Link -: ${config.PAIR}*\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
        }, {
            quoted: dtzminibot
        });
    }

    let alwaysOffline = sessionConfig.ALWAYS_OFFLINE === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let alwaysOnline = sessionConfig.ALWAYS_ONLINE === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let autoViewStatus = sessionConfig.AUTO_VIEW_STATUS === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let autoLikeStatus = sessionConfig.AUTO_LIKE_STATUS === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let autoreplyStatus = sessionConfig.AUTO_REPLY_STATUS === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let autoRecording = sessionConfig.AUTO_RECORDING === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let autoTyping = sessionConfig.AUTO_TYPING === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let autoReact = sessionConfig.AUTO_REACT === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let antiBot = sessionConfig.ANTI_BOT === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let antiBad = sessionConfig.ANTI_BAD === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let antiLink = sessionConfig.ANTI_LINK === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let readCmdOnly = sessionConfig.READ_CMD_ONLY === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let autoRead = sessionConfig.AUTO_READ === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let autoBio = sessionConfig.AUTO_BIO === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let antiCall = sessionConfig.ANTI_CALL === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let autoVoice = sessionConfig.AUTO_VOICE === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
    let mode = sessionConfig.MODE || 'public';

    const settingsText = `_*Ｗᴇʟᴄᴏᴍᴇ Ｔᴏ Ｄᴛᴢ Ｍɪɴɪ Ｂᴏᴛ ☃️*_\n*╭────────────────┈⊷*\n*┋•* \`ᴀʟᴡᴀʏꜱ ᴏꜰꜰʟɪɴᴇ\` : *${alwaysOffline}*\n*┋•* \`ᴀʟᴡᴀʏꜱ ᴏɴʟɪɴᴇ\` : *${alwaysOnline}*\n*┋•* \`ᴀᴜᴛᴏ ꜱᴇᴇɴ ꜱᴛᴀᴛᴜꜱ\` : *${autoViewStatus}*\n*┋•* \`ᴀᴜᴛᴏ ʟɪᴋᴇ ꜱᴛᴀᴛᴜꜱ\` : *${autoLikeStatus}*\n*┋•* \`ᴀᴜᴛᴏ ꜱᴛᴀᴛᴜꜱ ʀᴇᴘʟʏ\` : *${autoreplyStatus}*\n*┋•* \`ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ\` : *${autoRecording}*\n*┋•* \`ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ\` : *${autoTyping}*\n*┋•* \`ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ\` : *${autoReact}*\n*┋•* \`ᴀɴᴛɪ ʙᴏᴛ\` : *${antiBot}*\n*┋•* \`ᴀɴᴛɪ ʙᴀᴅ\` : *${antiBad}*\n*┋•* \`ᴀɴᴛɪ ʟɪɴᴋ\` : *${antiLink}*\n*┋•* \`ʀᴇᴀᴅ ᴄᴍᴅ ᴏɴʟʏ\` : *${readCmdOnly}*\n*┋•* \`ᴀᴜᴛᴏ ʀᴇᴀᴅ\` : *${autoRead}*\n*┋•* \`ᴀᴜᴛᴏ ʙɪᴏ\` : *${autoBio}*\n*┋•* \`ᴀɴᴛɪ ᴄᴀʟʟ\` : *${antiCall}*\n*┋•* \`ᴀᴜᴛᴏ ᴠᴏɪᴄᴇ\` : *${autoVoice}*\n*┋•* \`ᴍᴏᴅᴇ ᴛʏᴘᴇ\` : *${mode.toUpperCase()}*\n*╰─────────────────┈⊷*\n\n*🌐 DTZ MINI BOT Website :*\n> ${config.PAIR}\n`;

    await socket.sendMessage(sender, {
        interactiveMessage: {
            title: settingsText,
            footer: `*© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`,
            thumbnail: "https://movanest.xyz/OFTw0W.jpg",
            nativeFlowMessage: {
                messageParamsJson: JSON.stringify({
                    limited_time_offer: {
                        text: "S ᴇᴛᴛɪɴɢꜱ ᴍᴇɴᴜ ⚙️",
                        url: "https://dtz-mini-bot.zone.id",
                        copy_code: "ᴏᴡɴᴇʀꜱ : ᴀꜱʜᴜᴜ & ᴅɪɴᴀ",
                        expiration_time: Date.now() * 999
                    },
                    bottom_sheet: {
                        in_thread_buttons_limit: 2,
                        divider_indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
                        list_title: "𝐃ᴛᴢ 𝐒ᴇᴛᴛɪɴɢꜱ",
                        button_title: "𝐒ᴇʟᴇᴄᴛ 𝐒ᴇᴛᴛɪɴɢ"
                    }
                }),
                buttons: [
                                {
                            name: "single_select",
                            buttonParamsJson: JSON.stringify({ has_multiple_buttons: true

 })
                        },
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐉ᴏɪɴ 𝐂ʜᴀɴɴᴇʟ",
                            url: "https://whatsapp.com/channel/0029Vb5lyTTE50UljDvt993M"
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ʟᴡᴀʏꜱ 𝐎ꜰꜰʟɪɴᴇ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_alwaysoffline_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ʟᴡᴀʏꜱ 𝐎ꜰꜰʟɪɴᴇ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_alwaysoffline_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ʟᴡᴀʏꜱ 𝐎ɴʟɪɴᴇ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_alwaysOnline_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ʟᴡᴀʏꜱ 𝐎ɴʟɪɴᴇ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_alwaysOnline_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐒ᴇᴇɴ 𝐒ᴛᴀᴛᴜꜱ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_autoviewstatus_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐒ᴇᴇɴ 𝐒ᴛᴀᴛᴜꜱ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_autoviewstatus_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐋ɪᴋᴇ 𝐒ᴛᴀᴛᴜꜱ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_autolikestatus_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐋ɪᴋᴇ 𝐒ᴛᴀᴛᴜꜱ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_autolikestatus_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐒ᴛᴀᴛᴜꜱ 𝐑ᴇᴘʟʏ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_autostatusreply_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐒ᴛᴀᴛᴜꜱ 𝐑ᴇᴘʟʏ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_autostatusreply_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐑ᴇᴄᴏʀᴅɪɴɢ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_autorecording_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐑ᴇᴄᴏʀᴅɪɴɢ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_autorecording_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐓ʏᴘɪɴɢ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_autotyping_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐓ʏᴘɪɴɢ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_autotyping_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐑ᴇᴀᴄᴛ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_autoreact_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐑ᴇᴀᴄᴛ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_autoreact_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ɴᴛɪ 𝐁ᴏᴛ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_antibot_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ɴᴛɪ 𝐁ᴏᴛ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_antibot_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ɴᴛɪ 𝐁ᴀᴅ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_antibad_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ɴᴛɪ 𝐁ᴀᴅ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_antibad_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ɴᴛɪ 𝐋ɪɴᴋ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_antilink_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ɴᴛɪ 𝐋ɪɴᴋ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_antilink_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐑ᴇᴀᴅ 𝐂ᴍᴅ 𝐎ɴʟʏ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_readcmdonly_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐑ᴇᴀᴅ 𝐂ᴍᴅ 𝐎ɴʟʏ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_readcmdonly_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐑ᴇᴀᴅ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_autoread_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐑ᴇᴀᴅ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_autoread_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐁ɪᴏ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_autobio_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐁ɪᴏ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_autobio_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐕ᴏɪᴄᴇ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_autovoice_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ᴜᴛᴏ 𝐕ᴏɪᴄᴇ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_autovoice_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ɴᴛɪ 𝐂ᴀʟʟ ᴛʀᴜᴇ ✓",
                            id: `${config.PREFIX}settings_anticall_on`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐀ɴᴛɪ 𝐂ᴀʟʟ ꜰᴀʟꜱᴇ ✗",
                            id: `${config.PREFIX}settings_anticall_off`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐌ᴏᴅᴇ 𝐏ᴜʙʟɪᴄ ✓",
                            id: `${config.PREFIX}settings_mode_public`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐌ᴏᴅᴇ 𝐏ʀɪᴠᴀᴛᴇ ✗",
                            id: `${config.PREFIX}settings_mode_private`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐌ᴏᴅᴇ 𝐈ɴʙᴏx ✓",
                            id: `${config.PREFIX}settings_mode_inbox`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐌ᴏᴅᴇ 𝐆ʀᴏᴜᴘ ✗",
                            id: `${config.PREFIX}settings_mode_groups`
                        })
                    }
                ]
            }
        }
    }, {
        quoted: dtzminibot
    });
    break;

case 'settings_anticall_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.ANTI_CALL = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Anti Call* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_anticall_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.ANTI_CALL = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Anti Call* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;


case 'settings_alwaysoffline_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.ALWAYS_OFFLINE = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Always Offline* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_alwaysoffline_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.ALWAYS_OFFLINE = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Always Offline* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_alwaysOnline_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.ALWAYS_ONLINE = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Always Online* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_alwaysOnline_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.ALWAYS_ONLINE = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Always Online* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autoviewstatus_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_VIEW_STATUS = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Auto View Status* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autoviewstatus_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_VIEW_STATUS = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Auto View Status* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autolikestatus_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_LIKE_STATUS = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Auto Like Status* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autolikestatus_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_LIKE_STATUS = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Auto Like Status* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autostatusreply_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_REPLY_STATUS = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Auto Status Reply* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autostatusreply_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_REPLY_STATUS = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Auto Status Reply* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autorecording_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_RECORDING = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Auto Recording* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autorecording_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_RECORDING = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Auto Recording* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autotyping_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_TYPING = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Auto Typing* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autotyping_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_TYPING = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Auto Typing* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autoreact_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_REACT = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Auto React* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autoreact_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_REACT = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Auto React* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_antibot_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.ANTI_BOT = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Anti Bot* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_antibot_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.ANTI_BOT = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Anti Bot* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_antibad_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.ANTI_BAD = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Anti Bad* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_antibad_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.ANTI_BAD = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Anti Bad* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_antilink_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.ANTI_LINK = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Anti Link* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_antilink_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.ANTI_LINK = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Anti Link* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_readcmdonly_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.READ_CMD_ONLY = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Read CMD Only* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_readcmdonly_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.READ_CMD_ONLY = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Read CMD Only* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autoread_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_READ = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Auto Read* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autoread_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_READ = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Auto Read* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autobio_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_BIO = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Auto Bio* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autobio_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_BIO = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Auto Bio* has been set to *FALSE*'
    }, { quoted: dtzminibot });
    break;
    
case 'settings_autovoice_on':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_VOICE = 'true';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Auto Voice* has been set to *TRUE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_autovoice_off':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.AUTO_VOICE = 'false';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '❌ *Auto Voice* has been set to *False*'
    }, { quoted: dtzminibot });
    break;

case 'settings_mode_public':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.MODE = 'public';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Mode* has been set to *PUBLIC*'
    }, { quoted: dtzminibot });
    break;

case 'settings_mode_private':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.MODE = 'private';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Mode* has been set to *PRIVATE*'
    }, { quoted: dtzminibot });
    break;

case 'settings_mode_inbox':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.MODE = 'inbox';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Mode* has been set to *INBOX*'
    }, { quoted: dtzminibot });
    break;

case 'settings_mode_groups':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) return;
    sessionConfig.MODE = 'groups';
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, { socket, config: sessionConfig });
    await socket.sendMessage(sender, {
        text: '✅ *Mode* has been set to *GROUPS*'
    }, { quoted: dtzminibot });
    break;

case 'setconfig':
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: `*_• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️_*\n> Our Bot Is Not Working For You ‼️\n\n*_• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅_*\n> If You Connect To Our Bot ✅\n\n_*.freebot <ඔයාගෙ නම්බර් එක*_\n> _*.freebot <Your Number>*_\n\n*⭕ Example -: .freebot 94xxxxxxxxx*\n*📍 Web Site Link -: ${config.PAIR}*\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
        }, {
            quoted: dtzminibot
        });
    }

    if (args.length === 0) {
        await socket.sendMessage(sender, {
            image: {
                url: sessionConfig.DTZ_MINI_BOT_IMAGE || config.DTZ_MINI_BOT_IMAGE
            },
            caption: formatMessage(
                '❌ Invalid Input',
                'Please provide config in JSON format.\nExample: .setconfig {"AUTO_VIEW_STATUS": "false", "AUTO_LIKE_STATUS": "true"}',
                `© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
            )
        });
        return;
    }

    let newConfig;
    try {
        newConfig = JSON.parse(args.join(' '));
    } catch (error) {
        await socket.sendMessage(sender, {
            image: {
                url: sessionConfig.DTZ_MINI_BOT_IMAGE || config.DTZ_MINI_BOT_IMAGE
            },
            caption: formatMessage(
                '❌ Invalid JSON',
                'Please provide a valid JSON object for config.',
                `© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
            )
        });
        return;
    }

    const validKeys = Object.keys(config);
    const invalidKeys = Object.keys(newConfig).filter(key => !validKeys.includes(key));
    if (invalidKeys.length > 0) {
        await socket.sendMessage(sender, {
            image: {
                url: sessionConfig.DTZ_MINI_BOT_IMAGE || config.DTZ_MINI_BOT_IMAGE
            },
            caption: formatMessage(
                '❌ Invalid Config Keys',
                `Invalid keys: ${invalidKeys.join(', ')}. Valid keys are: ${validKeys.join(', ')}`,
                `© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
            )
        });
        return;
    }

    sessionConfig = {
        ...sessionConfig,
        ...newConfig
    };
    await updateUserConfig(sanitizedNumber, sessionConfig);
    activeSockets.set(sanitizedNumber, {
        socket,
        config: sessionConfig
    });
    await socket.sendMessage(sender, {
        image: {
            url: sessionConfig.DTZ_MINI_BOT_IMAGE || config.DTZ_MINI_BOT_IMAGE
        },
        caption: formatMessage(
            '✅ CONFIG UPDATED',
            'Your configuration has been successfully updated!',
            `© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
        )
    });
    break;

case 'tourl':
case 'imgtourl':
case 'url':
case 'geturl':
case 'upload': {
    const axios = require('axios');
    const FormData = require('form-data');
    const fs = require('fs');
    const os = require('os');
    const path = require('path');

    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
    
    const quoted = msg.message?.extendedTextMessage?.contextInfo;

    if (!quoted || !quoted.quotedMessage) {
        return await socket.sendMessage(sender, {
            text: '❌ Please reply to an image, video, or audio file with .tourl'
        }, { quoted: dtzminibot });
    }

    const quotedMsg = {
        key: {
            remoteJid: sender,
            id: quoted.stanzaId,
            participant: quoted.participant
        },
        message: quoted.quotedMessage
    };

    let mediaBuffer;
    let mimeType;
    let fileName;

    if (quoted.quotedMessage.imageMessage) {
        mediaBuffer = await downloadMediaMessage(quotedMsg, 'buffer', {}, {
            logger: console,
            reuploadRequest: socket.updateMediaMessage
        });
        mimeType = 'image/jpeg';
        fileName = 'image.jpg';
    } else if (quoted.quotedMessage.videoMessage) {
        mediaBuffer = await downloadMediaMessage(quotedMsg, 'buffer', {}, {
            logger: console,
            reuploadRequest: socket.updateMediaMessage
        });
        mimeType = 'video/mp4';
        fileName = 'video.mp4';
    } else if (quoted.quotedMessage.audioMessage) {
        mediaBuffer = await downloadMediaMessage(quotedMsg, 'buffer', {}, {
            logger: console,
            reuploadRequest: socket.updateMediaMessage
        });
        mimeType = 'audio/mpeg';
        fileName = 'audio.mp3';
    } else if (quoted.quotedMessage.documentMessage) {
        mediaBuffer = await downloadMediaMessage(quotedMsg, 'buffer', {}, {
            logger: console,
            reuploadRequest: socket.updateMediaMessage
        });
        mimeType = quoted.quotedMessage.documentMessage.mimetype;
        fileName = quoted.quotedMessage.documentMessage.fileName || 'document';
    } else {
        return await socket.sendMessage(sender, {
            text: '❌ Please reply to a valid media file (image, video, audio, or document)'
        }, { quoted: dtzminibot });
    }

    const tempFilePath = path.join(os.tmpdir(), `catbox_upload_${Date.now()}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), fileName);
    form.append('reqtype', 'fileupload');

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders()
    });

    if (!response.data) {
        fs.unlinkSync(tempFilePath);
        return await socket.sendMessage(sender, {
            text: '❌ Error uploading to Catbox'
        }, { quoted: dtzminibot });
    }

    const mediaUrl = response.data.trim();
    fs.unlinkSync(tempFilePath);

    let mediaType = 'File';
    if (mimeType.includes('image')) mediaType = 'Image';
    else if (mimeType.includes('video')) mediaType = 'Video';
    else if (mimeType.includes('audio')) mediaType = 'Audio';

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const responseText = `  
╭━━━━━━━━━━━━━━━━━●◌
│ ■ *${mediaType} Uploaded Successfully*
│ ■ Size: *${formatBytes(mediaBuffer.length)}*
│ ■ URL: *${mediaUrl}*
╰━━━━━━━━━━━━━━━━━●◌

> © ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -`;

    const uploadMsg = generateWAMessageFromContent(sender, {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2
                },
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: responseText
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: '*🖇 DTZ URL UPLOAD DONE  ✅*',
                        subtitle: '',
                        hasMediaAttachment: false
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'Copy Url',
                                    id: mediaUrl,
                                    copy_code: mediaUrl
                                })
                            }
                        ]
                    })
                })
            }
        }
    }, {});

    await socket.relayMessage(sender, uploadMsg.message, {
        quoted: dtzminibot
    });

    break;
}

case 'alive': {
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
            
    const now = new Date();
    const slTime = new Date(now.toLocaleString("en-US", {
        timeZone: "Asia/Colombo"
    }));

    const date = `${slTime.getFullYear()}/${slTime.getMonth() + 1}/${slTime.getDate()}`;
    const time = slTime.toLocaleTimeString();
    const hour = slTime.getHours();

    const greeting = hour < 12 ? '*`සුභ උදෑසනක් 🌄`*' :
        hour < 17 ? '*`සුභ දහවලක් 🏞️`*' :
        hour < 20 ? '*`සුභ හැන්දෑවක් 🌅`*' : '*`සුභ රාත්‍රියක් 🌌`*';

    const startTime = socketCreationTime.get(number) || Date.now();
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    const message = `_*Ｗᴇʟᴄᴏᴍᴇ Ｔᴏ Ｄᴛᴢ Ｍɪɴɪ Ｂᴏᴛ ☃️*_\n*╭──────────────┈⊷*\n*┊• 🖼️ \`ɢʀᴇᴇᴛ\` :* ${greeting}\n*┊• ⏰ \`ᴛɪᴍᴇ\` :* *${time}*\n*┊• 📅 \`ᴅᴀᴛᴇ\` :* *${date}*\n*┊• ⏰ \`ʀᴜɴᴛɪᴍᴇ\` :* *${hours}h ${minutes}m ${seconds}s*\n*╰──────────────┈⊷*\n*• ʏᴏᴜʀ ᴡʜᴀᴛꜱᴀᴘᴘ ɴᴏ :* *${number}*\n*• ᴀᴄᴛɪᴠᴇ ꜱᴇꜱꜱɪᴏɴꜱ :* *${activeSockets.size}*\n\n*🌐 DTZ MINI BOT Website :*\n> ${config.PAIR}\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

    const buttons = [{
            buttonId: `${config.PREFIX}ping`,
            buttonText: {
                displayText: 'PING CMD'
            },
            type: 1
        },
        {
            buttonId: `${config.PREFIX}system`,
            buttonText: {
                displayText: 'SYSTEM CMD'
            },
            type: 1
        }
    ];

    await socket.sendMessage(sender, {
        caption: message,
        image: {
            url: 'https://i.ibb.co/wF2QLf84/tourl-1765533913175.jpg'
        },
        buttons: buttons,
        headerType: 4,
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401720377971@newsletter',
                newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                serverMessageId: 143
            }
        }
    }, {
        quoted: dtzminibot
    });
    break;
}

                case 'system': {
                    await socket.sendMessage(sender, {
                        react: {
                            text: '📍',
                            key: msg.key
                        }
                    });
       
                    const now = new Date();
                    const slTime = new Date(now.toLocaleString("en-US", {
                        timeZone: "Asia/Colombo"
                    }));

                    const startTime = socketCreationTime.get(number) || Date.now();
                    const uptime = Math.floor((Date.now() - startTime) / 1000);
                    const hours = Math.floor(uptime / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    const seconds = uptime % 60;

                    const memUsage = process.memoryUsage();
                    const usedMem = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
                    const totalMem = Math.round(os.totalmem() / 1024 / 1024);
                    const ramPercent = ((memUsage.heapUsed / os.totalmem()) * 100).toFixed(1);
                    const freeMem = Math.round(os.freemem() / 1024 / 1024);

                    const message = `_*Ｗᴇʟᴄᴏᴍᴇ Ｔᴏ Ｄᴛᴢ Ｍɪɴɪ Ｂᴏᴛ ☃️"*_
*╭───────────────┈⊷*
*┊• ⏰ \`ʀᴜɴᴛɪᴍᴇ\` :* *${hours}h ${minutes}m ${seconds}s*
*┊• 📟 \`ʀᴀᴍ ᴜꜱᴀɢᴇ\` :* *${usedMem}MB / ${totalMem}MB (${ramPercent}%)*
*┊• ⚖️ \`ᴘʟᴀᴛꜰᴏʀᴍ\` :* *heraku*
*┊• 💾 \`ꜰʀᴇᴇ ᴍᴇᴍᴏʀʏ\` :* *${freeMem}MB*
*┊• 🧠 \`ᴄᴘᴜ ᴄᴏʀᴇꜱ\` :* *${os.cpus().length} cores*
*┊• 📬 \`ᴄʀᴇᴀᴛᴇᴅ ʙʏ\` :* *Dark Tech Zoneᵀᴹ*
*┊• 🧬 \`ᴠᴇʀꜱɪᴏɴ\` :* *v3.0.0*
*╰───────────────┈⊷*

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

                    const buttons = [{
                            buttonId: `${config.PREFIX}menu`,
                            buttonText: {
                                displayText: 'MENU LIST CMD'
                            },
                            type: 1
                        },
                        {
                            buttonId: `${config.PREFIX}alive`,
                            buttonText: {
                                displayText: 'ALIVE CMD'
                            },
                            type: 1
                        }
                    ];

                    socket.sendMessage(sender, {
                        caption: message,
                        image: {
                            url: 'https://i.ibb.co/PvbWmQyb/tourl-1765534366246.jpg'
                        },
                        buttons: buttons,
                        headerType: 4,
                        contextInfo: {
                            mentionedJid: [sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401720377971@newsletter',
                                newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                                serverMessageId: 143
                            }
                        }
                    }, {
                        quoted: dtzminibot
                    });
                    
                    break;
                }

case 'change': {
await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });

let dtzhutto = `*_Wᴇʟᴄᴏᴍᴇ Tᴏ Dᴛᴢ Mɪɴɪ Bᴏᴛ ☃️_*

*• ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ʜᴏᴡ ᴛᴏ ꜱᴇᴛᴛɪɴɢ ᴄʜᴀɴɢᴇ*

\`01.\` *ᴄʜᴀɴɢᴇ ᴄʜᴀɴɴᴇʟ ꜱᴏɴɢ ꜰᴏᴏᴛᴇʀ ᴄʜᴀɴɢᴇ : .setconfig {"CSONG": "channel send song details change"}*

\`• Ex : .setconfig {"CSONG":"> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*"}\`

\`02.\` *ᴄʜᴀɴɢᴇ ᴘʀᴇꜰɪx : .setconfig {"PREFIX": "ඔයාට ඕනි prefix එක එකතු කරන්න. එකතු කරන්න පුලුවන් prefix (/,@,#,) ඔය වගේ ඔයාට කැමති එකක් ඇඩ් කරන්න පුලුවන්.*

*( Add the prefix you want. You can add prefix (/,@,#,) like that, you can add any you like.)"}*

\`• Ex : .setconfig {"PREFIX":"/"}\`

*🌐 DTZ MINI BOT Website :*
> ${config.PAIR}\n`;

let imageUrl = "https://i.ibb.co/0VV8rBP5/tourl-1765852887627.jpg";

const buttons = [
{
  buttonId: `${config.PREFIX}ping`,
   buttonText: { displayText: 'PING CMD' },
    type: 1
},
{
  buttonId: `${config.PREFIX}alive`,
   buttonText: { displayText: 'ALIVE CMD' },
    type: 1
}
];

const buttonMessage = {
   image: { url: imageUrl },
   caption: dtzhutto,
   footer: '> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*',
   buttons: buttons,
   headerType: 4,
   contextInfo: {
       mentionedJid: [sender], 
       forwardingScore: 999,
       isForwarded: true,
       forwardedNewsletterMessageInfo: {
          newsletterName: `ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌`,
          serverMessageId: 143
        }
    }
};

await socket.sendMessage(sender, buttonMessage, { quoted: dtzminibot });
break;
}
                
case 'menu': {
    
    await socket.sendMessage(sender, {
        react: {
            text: '📍',
            key: msg.key
        }
    });
            
    const date = new Date();
    const slstDate = new Date(date.toLocaleString("en-US", {
        timeZone: "Asia/Colombo"
    }));
    const formattedDate = `${slstDate.getFullYear()}/${slstDate.getMonth() + 1}/${slstDate.getDate()}`;
    const formattedTime = slstDate.toLocaleTimeString();

    const hour = slstDate.getHours();
    const greetings =
        hour < 12 ? '*`සුභ උදෑසනක් 🌄`*' :
        hour < 17 ? '*`සුභ දහවලක් 🏞️`*' :
        hour < 20 ? '*`සුභ හැන්දෑවක් 🌅`*' :
        '*`සුභ රාත්‍රියක් 🌌`*';

    const startTime = socketCreationTime.get(number) || Date.now();
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

    let teksnya = `_*Ｗᴇʟᴄᴏᴍᴇ Ｔᴏ Ｄᴛᴢ Ｍɪɴɪ Ｂᴏᴛ ☃️*_
*╭───────────────┈⊷*
*┊• 🖼️ \`ɢʀᴇᴇᴛ\` :-* ${greetings}
*┊• ⏰ \`ᴛɪᴍᴇ\` :-* *${formattedTime}*
*┊• 📅 \`ᴅᴀᴛᴇ\` :-* *${formattedDate}*
*┊• 🎭 \`ʙᴏᴛ ᴘᴏᴡᴇʀᴇᴅ\` :-* *ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*
*┊• 📍 \`ᴀᴄᴛɪᴠᴇ ꜱᴇꜱꜱɪᴏɴꜱ\` :-* *${activeSockets.size}*
*╰───────────────┈⊷*

*ʜᴇʟʟᴏ ʙʀᴏ ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ☃️ , ᴀ ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ ᴘᴏᴡᴇʀꜰᴜʟ ꜰʀᴇᴇ ʙᴏᴛ. ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ ( ᴅᴛᴢ ɢᴀɴɢ ).*📬

*🌐 DTZ MINI BOT Website :*
> ${config.PAIR}\n`;

    await socket.sendMessage(sender, {
        interactiveMessage: {
            title: teksnya,
            footer: `*© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`,
            thumbnail: "https://i.ibb.co/0VV8rBP5/tourl-1765852887627.jpg",
            nativeFlowMessage: {
                messageParamsJson: JSON.stringify({
                    limited_time_offer: {
                        text: "H ᴇʟʟᴏᴡ ❤️",
                        url: "https://www.darktechzone.site/",
                        copy_code: "ᴏᴡɴᴇʀꜱ : ᴀꜱʜᴜᴜ & ᴅɪɴᴀ",
                        expiration_time: Date.now() * 999
                    },
                    bottom_sheet: {
                        in_thread_buttons_limit: 2,
                        divider_indices: [1, 2, 3, 4, 5, 999],
                        list_title: "𝐃ᴀʀᴋ 𝐓ᴇᴄʜ 𝐙ᴏɴᴇ",
                        button_title: "𝐒ᴇʟᴇᴄᴛ 𝐌ᴇɴᴜ"
                    }
                }),
                buttons: [
                {
                            name: "single_select",
                            buttonParamsJson: JSON.stringify({ has_multiple_buttons: true

 })
                        },
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐉ᴏɪɴ 𝐂ʜᴀɴɴᴇʟ",
                            url: "https://whatsapp.com/channel/0029Vb5lyTTE50UljDvt993M"
                        })
                    },
                    {
                        name: "single_select",
                        buttonParamsJson: JSON.stringify({
                            title: "𝐃ᴛᴢ 𝐌ɪɴɪ 𝐁ᴏᴛ ᴠ3 ☃️ ",
                            sections: [
                                {
                                    title: "𝐌ᴀɪɴ 𝐂ᴀᴛᴇɢᴏʀɪᴇꜱ",
                                    highlight_label: "𝐃ᴛᴢ 𝐌ɪɴɪ 𝐁ᴏᴛ ᴠ𝟑",
                                    rows: [
                                        {
                                            header: "🎮 𝐌ᴀɪɴ 𝐌ᴇɴᴜ",
                                            title: "𝐌ᴀɪɴ 𝐌ᴇɴᴜ",
                                            description: "View all main commands",
                                            id: `${config.PREFIX}mainmenu`
                                        },
                                        {
                                            header: "🎌 𝐀ɴɪᴍᴇ 𝐌ᴇɴᴜ",
                                            title: "𝐀ɴɪᴍᴇ 𝐌ᴇɴᴜ",
                                            description: "Anime related commands",
                                            id: `${config.PREFIX}animemenu`
                                        },
                                        {
                                            header: "📥 𝐃ᴏᴡɴʟᴏᴀᴅ 𝐌ᴇɴᴜ",
                                            title: "𝐃ᴏᴡɴʟᴏᴀᴅ 𝐌ᴇɴᴜ",
                                            description: "Download media from various platforms",
                                            id: `${config.PREFIX}downmenu`
                                        },
                                        {
                                            header: "👥 𝐆ʀᴏᴜᴘ 𝐌ᴇɴᴜ",
                                            title: "𝐆ʀᴏᴜᴘ 𝐌ᴇɴᴜ",
                                            description: "Group management commands",
                                            id: `${config.PREFIX}groupmenu`
                                        },
                                        {
                                            header: "🎭 𝐅ᴜɴ 𝐌ᴇɴᴜ",
                                            title: "𝐅ᴜɴ 𝐌ᴇɴᴜ",
                                            description: "Entertainment and fun commands",
                                            id: `${config.PREFIX}funmenu`
                                        },
                                        {
                                            header: "📰 𝐍ᴇᴡꜱ 𝐌ᴇɴᴜ",
                                            title: "𝐍ᴇᴡꜱ 𝐌ᴇɴᴜ",
                                            description: "Get latest news updates",
                                            id: `${config.PREFIX}newsmenu`
                                        },
                                        {
                                            header: "🔄 𝐂ᴏɴᴠᴇʀᴛ 𝐌ᴇɴᴜ",
                                            title: "𝐂ᴏɴᴠᴇʀᴛ 𝐌ᴇɴᴜ",
                                            description: "Convert files and media",
                                            id: `${config.PREFIX}convertmenu`
                                        },
                                        {
                                            header: "👑 𝐎ᴡɴᴇʀ 𝐌ᴇɴᴜ",
                                            title: "𝐎ᴡɴᴇʀ 𝐌ᴇɴᴜ",
                                            description: "Owner only commands",
                                            id: `${config.PREFIX}ownermenu`
                                        },
                                        {
                                            header: "🔍 𝐒ᴇᴀʀᴄʜ 𝐌ᴇɴᴜ",
                                            title: "𝐒ᴇᴀʀᴄʜ 𝐌ᴇɴᴜ",
                                            description: "Search anything you want",
                                            id: `${config.PREFIX}searchmenu`
                                        }
                                    ]
                                },
                                {
                                    title: "𝐔ᴛɪʟɪᴛɪᴇꜱ",
                                    highlight_label: "𝐃ᴛᴢ 𝐌ɪɴɪ 𝐁ᴏᴛ ᴠ3",
                                    rows: [
                                        {
                                            header: "🏓 𝐏ɪɴɢ",
                                            title: "𝐏ɪɴɢ",
                                            description: "Check bot speed",
                                            id: `${config.PREFIX}ping`
                                        },
                                        {
                                            header: "💚 𝐀ʟɪᴠᴇ",
                                            title: "𝐀ʟɪᴠᴇ",
                                            description: "Check bot status",
                                            id: `${config.PREFIX}alive`
                                        },
                                        {
                                            header: "⚙️𝐒ᴇᴛᴛɪɴɢꜱ",
                                            title: "𝐒ᴇᴛᴛɪɴɢꜱ",
                                            description: "Check bot settings",
                                            id: `${config.PREFIX}st`
                                        },
                                        {
                                            header: "🚀 𝐒ʏꜱᴛᴇᴍ",
                                            title: "𝐒ʏꜱᴛᴇᴍ",
                                            description: "Check bot system",
                                            id: `${config.PREFIX}system`
                                        }
                                    ]
                                }
                            ]
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐒ᴇᴛᴛɪɴɢ 𝐂ᴍᴅ 📌",
                            id: `${config.PREFIX}dtz`
                        })
                    },
                    {
                        name: "cta_copy",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝐂ᴏᴘʏ 𝐁ᴏᴛ 𝐖ᴇʙ 𝐋ɪɴᴋ",
                            copy_code: "*~https://www.darktechzone.site/~*"
                        })
                    }
                ]
            }
        }
    }, {
        quoted: dtzminibot
    });

    break;
}

                case 'downmenu': {
                    await socket.sendMessage(sender, {
                        react: {
                            text: '📍',
                            key: msg.key
                        }
                    });

                    let teksnya = `*_Dᴛᴢ Mɪɴᴜ Bᴏᴛ Dᴏᴡɴʟᴏᴀᴅ Mᴇɴᴜ ☃️_*
╭────────────────┈⊷
┇
┋ *📍 Command : \`.Song\`*
┋  *📃 Usage :* Download Songs
┋
┋ *📍 Command : \`.csend,csong\`*
┋  *📃 Usage :* Send A Audio Type Song For Channel
┋
┋
┋ *📍 Command : \`.video\`*
┋  *📃 Usage :* Download Videos
┋
┋ *📍 Command : \`.fb\`*
┋  *📃 Usage :* Download Fb Videos
┋
┋ *📍 Command : \`.tiktok\`*
┋  *📃 Usage :* Download Tiktok Videos
┋
┋ *📍 Command : \`.mediafire\`*
┋  *📃 Usage :* Download mediafire file
┇ 
┋ *📍 Command : \`.ig\`*
┋  *📃 Usage :* Download Instagram Videos
┇ 
┋ *📍 Command : \`.apk\`*
┋  *📃 Usage :* Download apk file
┇ 
┋ *📍 Command : \`.xnxx\`*
┋  *📃 Usage : Download The Xnxx Video* 
┇
┋ *📍 Command : \`.xvideo\`*
┋  *📃 Usage : Download The X Video* 
┇
┋ *📍 Command : \`.jilhub\`*
┋  *📃 Usage : Download The Jilhub Video* 
┇
┋ *📍 Command : \`.xhamster\`*
┋  *📃 Usage : Download The X Hamster* 
┇
┋ *📍 Command : \`.pronhub\`*
┋  *📃 Usage : Download The Pronhub Video* 
┇
┋ *📍 Command : \`.gdrive\`*
┋  *📃 Usage : Download The G Drive File* 
┇
╰────────────────┈⊷

*🌐 DTZ MINI BOT Website :*
> ${config.PAIR}

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

                    let imageUrl = config.DTZ_MINI_BOT_IMAGE;

                    const buttons = [{
                            buttonId: `${config.PREFIX}menu`,
                            buttonText: {
                                displayText: 'MENU LIST CMD'
                            },
                            type: 1
                        },
                        {
                            buttonId: `${config.PREFIX}alive`,
                            buttonText: {
                                displayText: 'ALIVE CMD'
                            },
                            type: 1
                        }
                    ];

                    await socket.sendMessage(sender, {
                        buttons,
                        headerType: 1,
                        viewOnce: true,
                        caption: teksnya,
                        image: {
                            url: 'https://i.ibb.co/s9nZ0ywq/tourl-1765535266162.jpg'
                        },
                        contextInfo: {
                            mentionedJid: [sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401720377971@newsletter',
                                newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                                serverMessageId: 143
                            }
                        }
                    }, {
                        quoted: dtzminibot
                    });
                    break;
                }
                case 'mainmenu': {
                    await socket.sendMessage(sender, {
                        react: {
                            text: '📍',
                            key: msg.key
                        }
                    });
                    let teksnya = `*_Dᴛᴢ Mɪɴɪ Bᴏᴛ Mᴀɪɴ Mᴇɴᴜ ☃️_*
╭────────────────┈⊷
┇
┋ *📍 Command : \`.menu\`*
┋  *📃 Usage : Show All Command Lists*
┋
┋ *📍 Command : \`.downmenu\`*
┋  *📃 Usage : Show All Download Commands*
┋
┋ *📍 Command : \`.mainmenu\`*
┋  *📃 Usage : Show All Main Menu Commands*
┋
┋ *📍 Command : \`.funmenu\`*
┋  *📃 Usage : Show All Fun Menu Commands*
┋
┋ *📍 Command : \`.newsmenu\`*
┋  *📃 Usage : Show All News Menu Commands*
┋
┋ *📍 Command : \`.groupmenu\`*
┋  *📃 Usage : Show All Group Menu Commands*
┋
┋ *📍 Command : \`.searchmenu\`*
┋  *📃 Usage : Show All Search Menu Commands*
┋
┋ *📍 Command : \`.convertmenu\`*
┋  *📃 Usage : Show All Convert Menu Commands*
┋
┋ *📍 Command : \`.ownermenu\`*
┋  *📃 Usage : Show All Owner Menu Commands*
┋
┋ *📍 Command : \`.animemenu\`*
┋  *📃 Usage : Show All Anime Menu Commands*
┋
┋ *📍 Command : \`.ping\`*
┋  *📃 Usage : Check The Bot Speed*
┋
┋ *📍 Command : \`.alive\`*
┋  *📃 Usage : Change Or Check Bot Alive*
┋
┋ *📍 Command : \`.system\`*
┋  *📃 Usage : Change Or Check Bot System*
┋
┋ *📍 Command : \`.settings\`*
┋  *📃 Usage : Change Or Check Bot Settings*
┋
┋ *📍 Command : \`.save\`*
┋  *📃 Usage : Status Save Command*
┋
┋ *📍 Command : \`.vv\`*
┋  *📃 Usage : See Viewone Message*
┇ 
┋ *📍 Command : \`.jid\`*
┋  *📃 Usage : Channel, Group and Inbox Jid Send*
┇ 
┋ *📍 Command : \`.getdp\`*
┋  *📃 Usage : Getdp command*
┇ 
┋ *📍 Command : \`.winfo\`*
┋  *📃 Usage : Whatsapp info command*
┇ 
┋ *📍 Command : \`.chr\`*
┋  *📃 Usage : Follow The Channel*
┇ 
┋ *📍 Command : \`.pair\`*
┋  *📃 Usage : Get Pair Code To Connect Whatsapp*
┇
┋ *📍 Command : \`.change\`*
┋  *📃 Usage : Setting Change Post* 
┇
╰────────────────┈⊷

*🌐 DTZ MINI BOT Website :*
> ${config.PAIR}

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

                    let imageUrl = config.DTZ_MINI_BOT_IMAGE;

                    const buttons = [{
                            buttonId: `${config.PREFIX}menu`,
                            buttonText: {
                                displayText: 'MENU LIST CMD'
                            },
                            type: 1
                        },
                        {
                            buttonId: `${config.PREFIX}alive`,
                            buttonText: {
                                displayText: 'ALIVE CMD'
                            },
                            type: 1
                        }
                    ];

                    await socket.sendMessage(sender, {
                        buttons,
                        headerType: 1,
                        viewOnce: true,
                        caption: teksnya,
                        image: {
                            url: "https://i.ibb.co/9ByZWSD/tourl-1765535724406.jpg"
                        },
                        contextInfo: {
                            mentionedJid: [sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401720377971@newsletter',
                                newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                                serverMessageId: 143
                            }
                        }
                    }, {
                        quoted: dtzminibot
                    });
                    break;
                }
                case 'funmenu': {
                    await socket.sendMessage(sender, {
                        react: {
                            text: '📍',
                            key: msg.key
                        }
                    });
                    let teksnya = `*_Dᴛᴢ Mɪɴɪ Bᴏᴛ Fᴜɴ Mᴇɴᴜ ☃️_*
╭────────────────┈⊷
┋
┋ *📍 Command : \`.angry\`*
┋  *📃 Usage : angry emoji fun*
┋
┋ *📍 Command : \`.heart\`*
┋  *📃 Usage : heart emoji fun*
┋
┋ *📍 Command : \`.happy\`*
┋  *📃 Usage : happy emoji fun*
┋
┋ *📍 Command : \`.confused\`*
┋  *📃 Usage : confused emoji fun*
┇ 
┋ *📍 Command : \`.moon\`*
┋  *📃 Usage : moon emoji fun*
┇ 
┋ *📍 Command : \`.shy\`*
┋  *📃 Usage : shy emoji fun*
┋
┋ *📍 Command : \`.sad\`*
┋  *📃 Usage : sad emoji fun*
┋
┋ *📍 Command : \`.joke\`*
┋  *📃 Usage : joke fun command* 
┇
┋ *📍 Command : \`.fact\`*
┋  *📃 Usage : fact fun command* 
┇
┋ *📍 Command : \`.roll\`*
┋  *📃 Usage : roll fun command* 
┇
┋ *📍 Command : \`.coin\`*
┋  *📃 Usage : coin fun command* 
┇
┋ *📍 Command : \`.8ball\`*
┋  *📃 Usage : 8ball fun command* 
┇
┋ *📍 Command : \`.ship\`*
┋  *📃 Usage : ship fun command* 
┇
┋ *📍 Command : \`.compliment\`*
┋  *📃 Usage : compliment fun command* 
┇
┋ *📍 Command : \`.roast\`*
┋  *📃 Usage : roast fun command* 
┇
┋ *📍 Command : \`.choose\`*
┋  *📃 Usage : choose fun command* 
┇
┋ *📍 Command : \`.rate\`*
┋  *📃 Usage : rate fun command* 
┇
╰────────────────┈⊷

*🌐 DTZ MINI BOT Website :*
> ${config.PAIR}

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

                    let imageUrl = config.DTZ_MINI_BOT_IMAGE;

                    const buttons = [{
                            buttonId: `${config.PREFIX}menu`,
                            buttonText: {
                                displayText: 'MENU LIST CMD'
                            },
                            type: 1
                        },
                        {
                            buttonId: `${config.PREFIX}alive`,
                            buttonText: {
                                displayText: 'ALIVE CMD'
                            },
                            type: 1
                        }
                    ];

                    await socket.sendMessage(sender, {
                        buttons,
                        headerType: 1,
                        viewOnce: true,
                        caption: teksnya,
                        image: {
                            url: 'https://i.ibb.co/ymCMQBvP/tourl-1765535856824.jpg'
                        },
                        contextInfo: {
                            mentionedJid: [sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401720377971@newsletter',
                                newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                                serverMessageId: 143
                            }
                        }
                    }, {
                        quoted: dtzminibot
                    });
                    break;
                }
                
                case 'newsmenu': {
                    await socket.sendMessage(sender, {
                        react: {
                            text: '📍',
                            key: msg.key
                        }
                    });

                    let teksnya = `*_Dᴛᴢ Mɪɴᴜ Bᴏᴛ Nᴇᴡꜱ Mᴇɴᴜ ☃️_*
╭────────────────┈⊷
┇
┋ *📍 Command : \`.hiru\`*
┋  *📃 Usage : check the hiru news* 
┇
┋ *📍 Command : \`.sirasa\`*
┋  *📃 Usage : check the sirasa news* 
┇ 
┋ *📍 Command : \`.derana\`*
┋  *📃 Usage : check the derana news* 
┇ 
┋ *📍 Command : \`.siyatha\`*
┋  *📃 Usage : check the siyatha news* 
┇ 
┋ *📍 Command : \`.itn\`*
┋  *📃 Usage : check the itn news* 
┇ 
┋ *📍 Command : \`.lankadeepa\`*
┋  *📃 Usage : check the lankadeepa news* 
┇ 
┋ *📍 Command : \`.bbc\`*
┋  *📃 Usage : check the bbc news* 
┇ 
┋ *📍 Command : \`.lnw\`*
┋  *📃 Usage : check the lnw news* 
┇ 
┋ *📍 Command : \`.dasatha\`*
┋  *📃 Usage : check the dasatha news* 
┇ 
┋ *📍 Command : \`.gagana\`*
┋  *📃 Usage : check the gagana news* 
┇ 
╰────────────────┈⊷

*🌐 DTZ MINI BOT Website :*
> ${config.PAIR}

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

                    let imageUrl = config.DTZ_MINI_BOT_IMAGE;

                    const buttons = [{
                            buttonId: `${config.PREFIX}menu`,
                            buttonText: {
                                displayText: 'MENU LIST CMD'
                            },
                            type: 1
                        },
                        {
                            buttonId: `${config.PREFIX}alive`,
                            buttonText: {
                                displayText: 'ALIVE CMD'
                            },
                            type: 1
                        }
                    ];

                    await socket.sendMessage(sender, {
                        buttons,
                        headerType: 1,
                        viewOnce: true,
                        caption: teksnya,
                        image: {
                            url: 'https://files.catbox.moe/zxqrza.jpg'
                        },
                        contextInfo: {
                            mentionedJid: [sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401720377971@newsletter',
                                newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                                serverMessageId: 143
                            }
                        }
                    }, {
                        quoted: dtzminibot
                    });
                    break;
                }
                case 'groupmenu': {
                    await socket.sendMessage(sender, {
                        react: {
                            text: '📍',
                            key: msg.key
                        }
                    });

                    let teksnya = `*_Dᴛᴢ Mɪɴᴜ Bᴏᴛ Gʀᴏᴜᴘ Mᴇɴᴜ ☃️_*
╭────────────────┈⊷
┇
┋ *📍 Command : \`.add\`*
┋  *📃 Usage : This command use only group* 
┇ 
┋ *📍 Command : \`.kick\`*
┋  *📃 Usage : This command use only group* 
┇
┋ *📍 Command : \`.mute\`*
┋  *📃 Usage : This command use only group* 
┇
┋ *📍 Command : \`.unmute\`*
┋  *📃 Usage : This command use only group* 
┇
┋ *📍 Command : \`.hidetag\`*
┋  *📃 Usage : This command use only group* 
┇
┋ *📍 Command : \`.tagall\`*
┋  *📃 Usage : This command use only group* 
┇
┋ *📍 Command : \`.promte\`*
┋  *📃 Usage : This command use only group* 
┇
┋ *📍 Command : \`.demote\`*
┋  *📃 Usage : This command use only group* 
┇
╰────────────────┈⊷

*🌐 DTZ MINI BOT Website :*
> ${config.PAIR}

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

                    let imageUrl = config.DTZ_MINI_BOT_IMAGE;

                    const buttons = [{
                            buttonId: `${config.PREFIX}menu`,
                            buttonText: {
                                displayText: 'MENU LIST CMD'
                            },
                            type: 1
                        },
                        {
                            buttonId: `${config.PREFIX}alive`,
                            buttonText: {
                                displayText: 'ALIVE CMD'
                            },
                            type: 1
                        }
                    ];

                    await socket.sendMessage(sender, {
                        buttons,
                        headerType: 1,
                        viewOnce: true,
                        caption: teksnya,
                        image: {
                            url: 'https://movanest.xyz/m0EnNd.jpg'
                        },
                        contextInfo: {
                            mentionedJid: [sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401720377971@newsletter',
                                newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                                serverMessageId: 143
                            }
                        }
                    }, {
                        quoted: dtzminibot
                    });
                    break;
                }
                
                case 'searchmenu': {
                    await socket.sendMessage(sender, {
                        react: {
                            text: '📍',
                            key: msg.key
                        }
                    });

                    let teksnya = `*_Dᴛᴢ Mɪɴᴜ Bᴏᴛ Sᴇᴀʀᴄʜ Mᴇɴᴜ ☃️_*
╭────────────────┈⊷
┇
┋ *📍 Command : \`.yts\`*
┋  *📃 Usage : Search List Of Yts Videos* 
┇ 
┋ *📍 Command : \`.ts\`*
┋  *📃 Usage : Search List Of Tiktok Videos*
┋
┋ *📍 Command : \`.img\`*
┋  *📃 Usage : Search List Of Image*
┋
┋ *📍 Command : \`.rw\`*
┋  *📃 Usage : Search List Of Random Wallpaper*
┋
┋ *📍 Command : \`.wallpaper\`*
┋  *📃 Usage : Search List Of Wallpaper* 
┇
┋ *📍 Command : \`.meme\`*
┋  *📃 Usage : Search List Of Meme* 
┇
┋ *📍 Command : \`.animerand\`*
┋  *📃 Usage : Search List Of Animerand* 
┇
┋ *📍 Command : \`.dog\`*
┋  *📃 Usage : Search List Of Dog Wallpaper* 
┇
┋ *📍 Command : \`.cat\`*
┋  *📃 Usage : Search List Of Cat Wallpaper* 
┇
┋ *📍 Command : \`.google\`*
┋  *📃 Usage : Search List Of Google* 
┇
┋ *📍 Command : \`.ss\`*
┋  *📃 Usage : Search List Of Ssweb* 
┇
╰────────────────┈⊷

*🌐 DTZ MINI BOT Website :*
> ${config.PAIR}

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

                    let imageUrl = config.DTZ_MINI_BOT_IMAGE;

                    const buttons = [{
                            buttonId: `${config.PREFIX}menu`,
                            buttonText: {
                                displayText: 'MENU LIST CMD'
                            },
                            type: 1
                        },
                        {
                            buttonId: `${config.PREFIX}alive`,
                            buttonText: {
                                displayText: 'ALIVE CMD'
                            },
                            type: 1
                        }
                    ];

                    await socket.sendMessage(sender, {
                        buttons,
                        headerType: 1,
                        viewOnce: true,
                        caption: teksnya,
                        image: {
                            url: 'https://files.catbox.moe/92zosv.jpg'
                        },
                        contextInfo: {
                            mentionedJid: [sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401720377971@newsletter',
                                newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                                serverMessageId: 143
                            }
                        }
                    }, {
                        quoted: dtzminibot
                    });
                    break;
                }
                
                case 'ownermenu': {
                    await socket.sendMessage(sender, {
                        react: {
                            text: '📍',
                            key: msg.key
                        }
                    });

                    let teksnya = `*_Dᴛᴢ Mɪɴᴜ Bᴏᴛ Oᴡɴᴇʀ Mᴇɴᴜ ☃️_*
╭────────────────┈⊷
┇
┋ *📍 Command : \`.block\`*
┋  *📃 Usage : block a number* 
┇ 
┋ *📍 Command : \`.unblock\`*
┋  *📃 Usage : unblock a number* 
┇
┋ *📍 Command : \`.leave\`*
┋  *📃 Usage : leave a group* 
┇
┋ *📍 Command : \`.join\`*
┋  *📃 Usage : join a group* 
┇
┋ *📍 Command : \`.setpp\`*
┋  *📃 Usage : set a profile picture* 
┇
┋ *📍 Command : \`.setpp2\`*
┋  *📃 Usage : set a profile picture 2* 
┇
┋ *📍 Command : \`.boom\`*
┋  *📃 Usage :* Send Boom Massages
┇ 
┋ *📍 Command : \`.checkspam\`*
┋  *📃 Usage : check the spam* 
┇
┋ *📍 Command : \`.glink\`*
┋  *📃 Usage : get a group link* 
┇
┋ *📍 Command : \`.ginfo\`*
┋  *📃 Usage : check the group info* 
┇
┋ *📍 Command : \`.Broadchat\`*
┋  *📃 Usage : go to the group members inbox* 
┇
┋ *📍 Command : \`.forward\`*
┋  *📃 Usage : Message share other group or inbox* 
┇
╰────────────────┈⊷

*🌐 DTZ MINI BOT Website :*
> ${config.PAIR}

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

                    let imageUrl = config.DTZ_MINI_BOT_IMAGE;

                    const buttons = [{
                            buttonId: `${config.PREFIX}menu`,
                            buttonText: {
                                displayText: 'MENU LIST CMD'
                            },
                            type: 1
                        },
                        {
                            buttonId: `${config.PREFIX}alive`,
                            buttonText: {
                                displayText: 'ALIVE CMD'
                            },
                            type: 1
                        }
                    ];

                    await socket.sendMessage(sender, {
                        buttons,
                        headerType: 1,
                        viewOnce: true,
                        caption: teksnya,
                        image: {
                            url: 'https://movanest.xyz/8BfMc1.jpg'
                        },
                        contextInfo: {
                            mentionedJid: [sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401720377971@newsletter',
                                newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                                serverMessageId: 143
                            }
                        }
                    }, {
                        quoted: dtzminibot
                    });
                    break;
                }
                case 'convertmenu': {
                    await socket.sendMessage(sender, {
                        react: {
                            text: '📍',
                            key: msg.key
                        }
                    });

                    let teksnya = `*_Dᴛᴢ Mɪɴᴜ Bᴏᴛ Cᴏɴᴠᴇʀᴛ Mᴇɴᴜ ☃️_*
╭────────────────┈⊷
┇
┋ *📍 Command : \`.sticker / .s\`*
┋  *📃 Usage : Take A Sticker* 
┇ 
┋ *📍 Command : \`.toimg\`*
┋  *📃 Usage : Take A Image* 
┇
┋ *📍 Command : \`.tourl / url\`*
┋  *📃 Usage : Take A Image Or Video Url* 
┇
┋ *📍 Command : \`.emojimix\`*
┋  *📃 Usage : Take A Emojimix Sticker* 
┇
┋ *📍 Command : \`.tts\`*
┋  *📃 Usage : Take A Tts Voice* 
┇
┋ *📍 Command : \`.translate\`*
┋  *📃 Usage : Translate To Language* 
┇
┋ *📍 Command : \`.qrcode\`*
┋  *📃 Usage : Take A Qrcode* 
┇
┋ *📍 Command : \`.timezone\`*
┋  *📃 Usage : Take A Time* 
┇
┋ *📍 Command : \`.readmore\`*
┋  *📃 Usage : Take A Readmore* 
┇
┋ *📍 Command : \`.reverse\`*
┋  *📃 Usage : Take A Reverse* 
┇
┋ *📍 Command : \`.styletext\`*
┋  *📃 Usage : Take A Font Style* 
┇
╰────────────────┈⊷

*🌐 DTZ Mini Bot Website :*
> ${config.PAIR}

*© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*`;

                    let imageUrl = config.DTZ_MINI_BOT_IMAGE;

                    const buttons = [{
                            buttonId: `${config.PREFIX}menu`,
                            buttonText: {
                                displayText: 'MENU LIST CMD'
                            },
                            type: 1
                        },
                        {
                            buttonId: `${config.PREFIX}alive`,
                            buttonText: {
                                displayText: 'ALIVE CMD'
                            },
                            type: 1
                        }
                    ];

                    await socket.sendMessage(sender, {
                        buttons,
                        headerType: 1,
                        viewOnce: true,
                        caption: teksnya,
                        image: {
                            url: 'https://movanest.xyz/gfg3h3.jpg'
                        },
                        contextInfo: {
                            mentionedJid: [sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401720377971@newsletter',
                                newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                                serverMessageId: 143
                            }
                        }
                    }, {
                        quoted: dtzminibot
                    });
                    break;
                }
                
                case 'animemenu': {
                    await socket.sendMessage(sender, {
                        react: {
                            text: '📍',
                            key: msg.key
                        }
                    });

                    let teksnya = `*_Dᴛᴢ Mɪɴᴜ Bᴏᴛ Aɴɪᴍᴇ Mᴇɴᴜ ☃️_*
╭────────────────┈⊷
┇
┋ *📍 Command : \`.anime\`*
┋  *📃 Usage : random anime command* 
┇ 
┋ *📍 Command : \`.animewallpaper\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.animegirl\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.animegirl1\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.animegirl2\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.animegirl2\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.animegirl3\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.animegirl4\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.animegirl5\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.animeimg\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.loli\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.waifu\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.niko\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.waifu2\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.niko2\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.awoo\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.megumin\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.maid\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.animeimg1\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.animeimg2\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.animeimg3\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.animeimg4\`*
┋  *📃 Usage : random anime command* 
┇
┋ *📍 Command : \`.animeimg5\`*
┋  *📃 Usage : random anime command* 
┇
╰────────────────┈⊷

*🌐 DTZ MINI BOT Website :*
> ${config.PAIR}

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

                    let imageUrl = config.DTZ_MINI_BOT_IMAGE;

                    const buttons = [{
                            buttonId: `${config.PREFIX}menu`,
                            buttonText: {
                                displayText: 'MENU LIST CMD'
                            },
                            type: 1
                        },
                        {
                            buttonId: `${config.PREFIX}alive`,
                            buttonText: {
                                displayText: 'ALIVE CMD'
                            },
                            type: 1
                        }
                    ];

                    await socket.sendMessage(sender, {
                        buttons,
                        headerType: 1,
                        viewOnce: true,
                        caption: teksnya,
                        image: {
                            url: 'https://movanest.xyz/ziCwAy.jpg'
                        },
                        contextInfo: {
                            mentionedJid: [sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401720377971@newsletter',
                                newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                                serverMessageId: 143
                            }
                        }
                    }, {
                        quoted: dtzminibot
                    });
                    break;
                }
                
case 'ping': {
    const axios = require('axios');

    await socket.sendMessage(sender, {
        react: { text: '⚡', key: msg.key }
    });

    const tempMsg = await socket.sendMessage(sender, {
        text: '*Pinging... ⚡*'
    });

    const pingMs = Date.now() - (tempMsg.messageTimestamp * 1000);

    await socket.sendMessage(sender, { delete: tempMsg.key });

    let thumbImage = null;
    
        const res = await axios.get(
            'https://i.ibb.co/PvbWmQyb/tourl-1765534366246.jpg',
            { responseType: 'arraybuffer' }
        );
        thumbImage = Buffer.from(res.data);
    
    await socket.sendMessage(
        sender,
        {
            document: {
                url: 'https://i.ibb.co/PvbWmQyb/tourl-1765534366246.jpg'
            },
            mimetype: 'image/png',
            fileName:  'DTZ-MINI-BOT.png',
            fileLength: 99999,
            pageCount: 1,
            jpegThumbnail: thumbImage,
            caption: `*Pong ${pingMs.toFixed(2)} ms ⚡*`
        },
        { quoted: dtzminibot }
    );
    break;
}


                case 'owner': {
    const ownerNum = '+94760091093';
    const ownerName = 'Ｏʟᴅ Ａꜱʜᴜᴜ Ｘᴅ | Ｄᴛᴢ Ｏᴡɴ';

    await socket.sendMessage(sender, {
        contacts: {
            displayName: ownerName,
            contacts: [{
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nORG:ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴅᴇᴘʟᴏʏᴍᴇɴᴛ;\nTEL;type=CELL;type=VOICE;waid=${ownerNum.slice(1)}:${ownerNum}\nEND:VCARD`
            }]
        }
    });

    await socket.sendMessage(sender, {
        text: `*ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴏᴡɴᴇʀ 💫*\n\n👤 Name: ${ownerName}\n📞 Number: ${ownerNum}\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`,
        contextInfo: {
            mentionedJid: [`${ownerNum.slice(1)}@s.whatsapp.net`]
        }
    }, {
        quoted: dtzminibot
    });

    break;
}
                case 'ashuu':
                case 'ashuu02': {
                    if (!sender.endsWith("120363420405260015@newsletter")) {
                        return socket.sendMessage(sender, {
                            text: `*• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️*\n*• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅*\n\n> Our Bot Is Not Working For You ‼️\n> If You Connect To Our Bot ✅\n\n_*.pair <ඔයාගේ නම්බර් එක*_\n> _*.pair <Your Number>*_\n\n*⭕ Example -: .pair 94xxxxxxxxx*\n\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*`
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    if (!args[0]) {
                        return socket.sendMessage(sender, {
                            text: '❗ Please provide a channel JID.\n\nExample:\n.fc 120363420405260015@newsletter'
                        });
                    }

                    if (!args[0].endsWith("@newsletter")) {
                        return socket.sendMessage(sender, {
                            text: '❗ Invalid JID. Please provide a JID ending with `@newsletter`'
                        });
                    }

                    const metadata = await socket.newsletterMetadata("jid", args[0]);

                    if (!metadata?.viewer_metadata) {
                        await socket.newsletterFollow(args[0]);
                    } else {
                        await socket.sendMessage(sender, {
                            text: `📌 Already following the channel:\n${args[0]}`
                        });
                    }

                    break;
                }
                case 'xdchr': {
                    if (!sender.endsWith("120363420405260015@newsletter")) {
                        return socket.sendMessage(sender, {
                            text: `*• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️*\n*• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅*\n\n> Our Bot Is Not Working For You ‼️\n> If You Connect To Our Bot ✅\n\n_*.pair <ඔයාගේ නම්බර් එක*_\n> _*.pair <Your Number>*_\n\n*⭕ Example -: .pair 94xxxxxxxxx*\n\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*`
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    const parts = body.trim().split(',')[0].trim().split('/');
                    const channelId = parts[4];
                    const messageId = parts[5];

                    if (!channelId || !messageId) {
                        return socket.sendMessage(sender, {
                            text: "✍️ Usage: .cnras <channel_message_link>\n\nExample:\n.cnras https://whatsapp.com/channel/1234/5678"
                        });
                    }

                    const res = await socket.newsletterMetadata("invite", channelId);
                    const emojis = ['🩷', '❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🖤', '🤍'];
                    await socket.newsletterReactMessage(res.id, messageId, emojis[Math.floor(Math.random() * 7)]);

                    break;
                }
                case 'xdchr1': {
                    if (!sender.endsWith("120363420405260015@newsletter")) {
                        return socket.sendMessage(sender, {
                            text: `*• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️*\n*• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅*\n\n> Our Bot Is Not Working For You ‼️\n> If You Connect To Our Bot ✅\n\n_*.pair <ඔයාගේ නම්බර් එක*_\n> _*.pair <Your Number>*_\n\n*⭕ Example -: .pair 94xxxxxxxxx*\n\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*`
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    const parts = body.trim().split(',')[0].trim().split('/');
                    const channelId = parts[4];
                    const messageId = parts[5];

                    if (!channelId || !messageId) {
                        return socket.sendMessage(sender, {
                            text: "✍️ Usage: .cnras <channel_message_link>\n\nExample:\n.cnras https://whatsapp.com/channel/1234/5678"
                        });
                    }

                    const res = await socket.newsletterMetadata("invite", channelId);
                    const emojis = ['😀', '😆', '🥹', '😂', '😅', '🤣', '😺', '😸', '😹', '🫨'];
                    await socket.newsletterReactMessage(res.id, messageId, emojis[Math.floor(Math.random() * 7)]);

                    break;
                }
                case 'xdchr2': {
                    if (!sender.endsWith("120363420405260015@newsletter")) {
                        return socket.sendMessage(sender, {
                            text: `*• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️*\n*• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅*\n\n> Our Bot Is Not Working For You ‼️\n> If You Connect To Our Bot ✅\n\n_*.pair <ඔයාගේ නම්බර් එක*_\n> _*.pair <Your Number>*_\n\n*⭕ Example -: .pair 94xxxxxxxxx*\n\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*`
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    const parts = body.trim().split(',')[0].trim().split('/');
                    const channelId = parts[4];
                    const messageId = parts[5];

                    if (!channelId || !messageId) {
                        return socket.sendMessage(sender, {
                            text: "✍️ Usage: .cnras <channel_message_link>\n\nExample:\n.cnras https://whatsapp.com/channel/1234/5678"
                        });
                    }

                    const res = await socket.newsletterMetadata("invite", channelId);
                    const emojis = ['💐', '🌷', '🌹', '🥀', '🪻', '🪷', '🌺', '🌸', '🌼', '🌻'];
                    await socket.newsletterReactMessage(res.id, messageId, emojis[Math.floor(Math.random() * 7)]);

                    break;
                }
                case 'xdchr3': {
                    if (!sender.endsWith("120363420405260015@newsletter")) {
                        return socket.sendMessage(sender, {
                            text: `*• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️*\n*• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅*\n\n> Our Bot Is Not Working For You ‼️\n> If You Connect To Our Bot ✅\n\n_*.pair <ඔයාගේ නම්බර් එක*_\n> _*.pair <Your Number>*_\n\n*⭕ Example -: .pair 94xxxxxxxxx*\n\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*`
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    const parts = body.trim().split(',')[0].trim().split('/');
                    const channelId = parts[4];
                    const messageId = parts[5];

                    if (!channelId || !messageId) {
                        return socket.sendMessage(sender, {
                            text: "✍️ Usage: .cnras <channel_message_link>\n\nExample:\n.cnras https://whatsapp.com/channel/1234/5678"
                        });
                    }

                    const res = await socket.newsletterMetadata("invite", channelId);
                    const emojis = ['💖', '😘', '😍', '🥰', '💞', '❤', '😻', '✨', '🌸', '💐'];
                    await socket.newsletterReactMessage(res.id, messageId, emojis[Math.floor(Math.random() * 7)]);

                    break;
                }
                case 'xdchr4': {
                    if (!sender.endsWith("120363420405260015@newsletter")) {
                        return socket.sendMessage(sender, {
                            text: `*• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️*\n*• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅*\n\n> Our Bot Is Not Working For You ‼️\n> If You Connect To Our Bot ✅\n\n_*.pair <ඔයාගේ නම්බර් එක*_\n> _*.pair <Your Number>*_\n\n*⭕ Example -: .pair 94xxxxxxxxx*\n\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*`
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    const parts = body.trim().split(',')[0].trim().split('/');
                    const channelId = parts[4];
                    const messageId = parts[5];

                    if (!channelId || !messageId) {
                        return socket.sendMessage(sender, {
                            text: "✍️ Usage: .cnras <channel_message_link>\n\nExample:\n.cnras https://whatsapp.com/channel/1234/5678"
                        });
                    }

                    const res = await socket.newsletterMetadata("invite", channelId);
                    const emojis = ['❤️', '✨', '⛅', '🌷', '🌾', '💧', '☃️', '🍭', '🫐', '🍉'];
                    await socket.newsletterReactMessage(res.id, messageId, emojis[Math.floor(Math.random() * 7)]);

                    break;
                }
                case 'xdchr5': {
                    if (!sender.endsWith("120363420405260015@newsletter")) {
                        return socket.sendMessage(sender, {
                            text: `*• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️*\n*• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅*\n\n> Our Bot Is Not Working For You ‼️\n> If You Connect To Our Bot ✅\n\n_*.pair <ඔයාගේ නම්බර් එක*_\n> _*.pair <Your Number>*_\n\n*⭕ Example -: .pair 94xxxxxxxxx*\n\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*`
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    const parts = body.trim().split(',')[0].trim().split('/');
                    const channelId = parts[4];
                    const messageId = parts[5];

                    if (!channelId || !messageId) {
                        return socket.sendMessage(sender, {
                            text: "✍️ Usage: .cnras <channel_message_link>\n\nExample:\n.cnras https://whatsapp.com/channel/1234/5678"
                        });
                    }

                    const res = await socket.newsletterMetadata("invite", channelId);
                    const emojis = ['😽', '😊', '💝', '🇰🇷', '🥰', '✈️', '🫰', '🎀', '😻', '😩'];
                    await socket.newsletterReactMessage(res.id, messageId, emojis[Math.floor(Math.random() * 7)]);

                    break;
                }
                case 'xdchr6': {
                    if (!sender.endsWith("120363420405260015@newsletter")) {
                        return socket.sendMessage(sender, {
                            text: `*• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️*\n*• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅*\n\n> Our Bot Is Not Working For You ‼️\n> If You Connect To Our Bot ✅\n\n_*.pair <ඔයාගේ නම්බර් එක*_\n> _*.pair <Your Number>*_\n\n*⭕ Example -: .pair 94xxxxxxxxx*\n\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*`
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    const parts = body.trim().split(',')[0].trim().split('/');
                    const channelId = parts[4];
                    const messageId = parts[5];

                    if (!channelId || !messageId) {
                        return socket.sendMessage(sender, {
                            text: "✍️ Usage: .cnras <channel_message_link>\n\nExample:\n.cnras https://whatsapp.com/channel/1234/5678"
                        });
                    }

                    const res = await socket.newsletterMetadata("invite", channelId);
                    const emojis = ['🥹', '💗', '😒', '💝', '😊', '🥰', '🤭', '🫣', '💗', '🥵'];
                    await socket.newsletterReactMessage(res.id, messageId, emojis[Math.floor(Math.random() * 7)]);

                    break;
                }
                case 'xdchr7': {
                    if (!sender.endsWith("120363420405260015@newsletter")) {
                        return socket.sendMessage(sender, {
                            text: `*• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️*\n*• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅*\n\n> Our Bot Is Not Working For You ‼️\n> If You Connect To Our Bot ✅\n\n_*.pair <ඔයාගේ නම්බර් එක*_\n> _*.pair <Your Number>*_\n\n*⭕ Example -: .pair 94xxxxxxxxx*\n\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*`
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    const parts = body.trim().split(',')[0].trim().split('/');
                    const channelId = parts[4];
                    const messageId = parts[5];

                    if (!channelId || !messageId) {
                        return socket.sendMessage(sender, {
                            text: "✍️ Usage: .cnras <channel_message_link>\n\nExample:\n.cnras https://whatsapp.com/channel/1234/5678"
                        });
                    }

                    const res = await socket.newsletterMetadata("invite", channelId);
                    const emojis = ['😊', '💝', '🥺', '🙂', '😽', '😭', '💕', '😓', '🥲', '😂'];
                    await socket.newsletterReactMessage(res.id, messageId, emojis[Math.floor(Math.random() * 7)]);

                    break;
                }
                case 'xdchr8': {
                    if (!sender.endsWith("120363420405260015@newsletter")) {
                        return socket.sendMessage(sender, {
                            text: `*• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️*\n*• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅*\n\n> Our Bot Is Not Working For You ‼️\n> If You Connect To Our Bot ✅\n\n_*.pair <ඔයාගේ නම්බර් එක*_\n> _*.pair <Your Number>*_\n\n*⭕ Example -: .pair 94xxxxxxxxx*\n\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*`
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    const parts = body.trim().split(',')[0].trim().split('/');
                    const channelId = parts[4];
                    const messageId = parts[5];

                    if (!channelId || !messageId) {
                        return socket.sendMessage(sender, {
                            text: "✍️ Usage: .cnras <channel_message_link>\n\nExample:\n.cnras https://whatsapp.com/channel/1234/5678"
                        });
                    }

                    const res = await socket.newsletterMetadata("invite", channelId);
                    const emojis = ['🥵', '💋', '🤍', '🖤', '😻', '🌝', '🧸', '🤤', '🍇', '🍓'];
                    await socket.newsletterReactMessage(res.id, messageId, emojis[Math.floor(Math.random() * 7)]);

                    break;
                }
                case 'xdchr9': {
                    if (!sender.endsWith("120363420405260015@newsletter")) {
                        return socket.sendMessage(sender, {
                            text: `*• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️*\n*• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅*\n\n> Our Bot Is Not Working For You ‼️\n> If You Connect To Our Bot ✅\n\n_*.pair <ඔයාගේ නම්බර් එක*_\n> _*.pair <Your Number>*_\n\n*⭕ Example -: .pair 94xxxxxxxxx*\n\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*`
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    const parts = body.trim().split(',')[0].trim().split('/');
                    const channelId = parts[4];
                    const messageId = parts[5];

                    if (!channelId || !messageId) {
                        return socket.sendMessage(sender, {
                            text: "✍️ Usage: .cnras <channel_message_link>\n\nExample:\n.cnras https://whatsapp.com/channel/1234/5678"
                        });
                    }

                    const res = await socket.newsletterMetadata("invite", channelId);
                    const emojis = ['😂', '🤣', '😹', '🤭', '😅', '🥹', '🤪', '😆', '😝', '🫠'];
                    await socket.newsletterReactMessage(res.id, messageId, emojis[Math.floor(Math.random() * 7)]);

                    break;
                }
                case 'xdchr10': {
                    if (!sender.endsWith("120363420405260015@newsletter")) {
                        return socket.sendMessage(sender, {
                            text: `*• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️*\n*• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅*\n\n> Our Bot Is Not Working For You ‼️\n> If You Connect To Our Bot ✅\n\n_*.pair <ඔයාගේ නම්බර් එක*_\n> _*.pair <Your Number>*_\n\n*⭕ Example -: .pair 94xxxxxxxxx*\n\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*`
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    const parts = body.trim().split(',')[0].trim().split('/');
                    const channelId = parts[4];
                    const messageId = parts[5];

                    if (!channelId || !messageId) {
                        return socket.sendMessage(sender, {
                            text: "✍️ Usage: .cnras <channel_message_link>\n\nExample:\n.cnras https://whatsapp.com/channel/1234/5678"
                        });
                    }

                    const res = await socket.newsletterMetadata("invite", channelId);
                    const emojis = ['🎀', '🍻', '🌑', '🧼', '🪨', '☕', '☁'];
                    await socket.newsletterReactMessage(res.id, messageId, emojis[Math.floor(Math.random() * 7)]);

                    break;
                }

                case 'chr': {
                    const q = body.trim();

                    try {
                        let link = q.split(",")[0];
                        const channelId = link.split('/')[4];
                        const messageId = link.split('/')[5];
                        let react = q.split(",")[1]?.trim();

                        if (!channelId || !messageId || !react) {
                            return await socket.sendMessage(sender, {
                                text: "✍️ Please provide a link and emoji like:\n.cnr <link>,<💗>"
                            });
                        }

                        const res = await socket.newsletterMetadata("invite", channelId);
                        await socket.newsletterReactMessage(res.id, messageId, react);

                    } catch (e) {
                        console.log(e);
                        await socket.sendMessage(sender, {
                            text: `❌ Error: ${e.toString()}`
                        });
                    }

                    break;
                }
                case 'pair': {
                    const fetch = (...args) => import('node-fetch').then(({
                        default: fetch
                    }) => fetch(...args));
                    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

                    const q = msg.message?.conversation ||
                        msg.message?.extendedTextMessage?.text ||
                        msg.message?.imageMessage?.caption ||
                        msg.message?.videoMessage?.caption || '';

                    const number = q.replace(/^[.\/!]pair\s*/i, '').trim();

                    if (!number) {
                        return await socket.sendMessage(sender, {
                            text: '*📃 Usage:* .pair +9476XXX'
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    try {
                        const url = `${config.WEB}code?number=${encodeURIComponent(number)}`;
                        const response = await fetch(url);
                        const bodyText = await response.text();

                        let result;
                        try {
                            result = JSON.parse(bodyText);
                        } catch (e) {
                            console.error("❌ JSON Parse Error:", e);
                            return await socket.sendMessage(sender, {
                                text: '❌ Invalid response from server. Please contact support.'
                            }, {
                                quoted: dtzminibot
                            });
                        }

                        if (!result || !result.code) {
                            return await socket.sendMessage(sender, {
                                text: '❌ Failed to retrieve pairing code. Please check the number.'
                            }, {
                                quoted: dtzminibot
                            });
                        }

                        await socket.sendMessage(sender, {
                            text: `*ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ v3 ᴘᴀɪʀ ᴄᴏɴɴᴇᴄᴛᴇᴅ* ✅\n\n*🔑 ʏᴏᴜʀ ᴘᴀɪʀ ᴄᴏᴅᴇ :* ${result.code}\n\n> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*`
                        }, {
                            quoted: dtzminibot
                        });

                        await sleep(2000);

                        await socket.sendMessage(sender, {
                            text: `${result.code}`
                        }, {
                            quoted: dtzminibot
                        });
                    } catch (err) {
                        console.error("❌ Pair Command Error:", err);
                        await socket.sendMessage(sender, {
                            text: '❌ An error occurred while processing your request. Please try again later.'
                        }, {
                            quoted: dtzminibot
                        });
                    }
                    break;
                }
                case 'jid':
                    reply(sender)
                    break
                case "save":
                case "sv":
                case "autostatus":
                case "sav":
                case "එවන්න":
                case 'send':

                    if (!msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                        await socket.sendMessage(sender, {
                            image: {
                                url: sessionConfig.DTZ_MINI_BOT_IMAGE || config.DTZ_MINI_BOT_IMAGE
                            },
                            caption: formatMessage(
                                '❌ ERROR',
                                '*🍁 Please reply to a message!*',
                                `© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
                            )
                        });
                        break;
                    }

                    try {
                        const quotedMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage;
                        const mtype = Object.keys(quotedMessage)[0]; // Get message type (imageMessage, videoMessage, etc.)
                        const stream = await downloadContentFromMessage(quotedMessage[mtype], mtype.replace('Message', '')); // e.g., 'imageMessage' -> 'image'
                        const chunks = [];
                        for await (const chunk of stream) {
                            chunks.push(chunk);
                        }
                        const buffer = Buffer.concat(chunks);

                        let messageContent = {};
                        switch (mtype) {
                            case 'imageMessage':
                                messageContent = {
                                    image: buffer,
                                    caption: quotedMessage.imageMessage?.caption || '',
                                    mimetype: quotedMessage.imageMessage?.mimetype || 'image/jpeg'
                                };
                                break;
                            case 'videoMessage':
                                messageContent = {
                                    video: buffer,
                                    caption: quotedMessage.videoMessage?.caption || '',
                                    mimetype: quotedMessage.videoMessage?.mimetype || 'video/mp4'
                                };
                                break;
                            case 'audioMessage':
                                messageContent = {
                                    audio: buffer,
                                    mimetype: quotedMessage.audioMessage?.mimetype || 'audio/mp4',
                                    ptt: quotedMessage.audioMessage?.ptt || false
                                };
                                break;
                            default:
                                await socket.sendMessage(sender, {
                                    image: {
                                        url: sessionConfig.DTZ_MINI_BOT_IMAGE || config.DTZ_MINI_BOT_IMAGE
                                    },
                                    caption: formatMessage(
                                        '❌ ERROR',
                                        'Only image, video, and audio messages are supported',
                                        `© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
                                    )
                                });
                                return;
                        }

                        await socket.sendMessage(sender, messageContent, {
                            quoted: dtzminibot
                        });

                    } catch (error) {

                        await socket.sendMessage(sender, {
                            image: {
                                url: sessionConfig.DTZ_MINI_BOT_IMAGE || config.DTZ_MINI_BOT_IMAGE
                            },
                            caption: formatMessage(
                                '❌ ERROR',
                                `Error forwarding message: ${error.message}`,
                                `© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
                            )
                        });
                    }
                    break;
                case 'vv':

                    if (!msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                        await socket.sendMessage(sender, {
                            image: {
                                url: config.DTZ_MINI_BOT_IMAGE
                            },
                            caption: formatMessage(
                                'ERROR',
                                '*Please reply to a ViewOnce message.*',
                                `© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
                            )
                        });
                        break;
                    }
                    try {
                        const quotedMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage;
                        const mtype = Object.keys(quotedMessage)[0];
                        if (
                            (mtype === 'imageMessage' && quotedMessage.imageMessage?.viewOnce) ||
                            (mtype === 'videoMessage' && quotedMessage.videoMessage?.viewOnce) ||
                            (mtype === 'audioMessage' && quotedMessage.audioMessage?.viewOnce)
                        ) {
                            const decryptingMessage = {
                                image: {
                                    url: config.DTZ_MINI_BOT_IMAGE
                                },
                                caption: formatMessage(
                                    '🔓 DECRYPTING',
                                    'Decrypting the ViewOnce Message...',
                                    `© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
                                )
                            };
                            const sentMessage = await socket.sendMessage(sender, decryptingMessage, {
                                quoted: msg
                            });
                            const stream = await downloadContentFromMessage(quotedMessage[mtype], mtype.replace('Message', ''));
                            const chunks = [];
                            for await (const chunk of stream) {
                                chunks.push(chunk);
                            }
                            const buffer = Buffer.concat(chunks);

                            let messageContent = {};
                            let caption = '';
                            switch (mtype) {
                                case 'imageMessage':
                                    caption = quotedMessage.imageMessage?.caption || `> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;
                                    messageContent = {
                                        image: buffer,
                                        caption: caption,
                                        mimetype: quotedMessage.imageMessage?.mimetype || 'image/jpeg'
                                    };
                                    break;
                                case 'videoMessage':
                                    caption = quotedMessage.videoMessage?.caption || `> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;
                                    messageContent = {
                                        video: buffer,
                                        caption: caption,
                                        mimetype: quotedMessage.videoMessage?.mimetype || 'video/mp4'
                                    };
                                    break;
                                case 'audioMessage':
                                    caption = quotedMessage.audioMessage?.caption || `> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;
                                    messageContent = {
                                        audio: buffer,
                                        caption: caption,
                                        mimetype: quotedMessage.audioMessage?.mimetype || 'audio/mp4',
                                        ptt: quotedMessage.audioMessage?.ptt || false
                                    };
                                    break;
                                default:
                                    await socket.sendMessage(sender, {
                                        image: {
                                            url: config.DTZ_MINI_BOT_IMAGE
                                        },
                                        caption: formatMessage(
                                            'ERROR',
                                            'Only ViewOnce image, video, and audio messages are supported',
                                            `© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
                                        )
                                    });
                                    await socket.sendMessage(sender, {
                                        delete: sentMessage.key
                                    });
                                    return;
                            }
                            await socket.sendMessage(sender, messageContent, {
                                quoted: dtzminibot
                            });
                            await socket.sendMessage(sender, {
                                delete: sentMessage.key
                            });
                            await socket.sendMessage(sender, {
                                image: {
                                    url: config.DTZ_MINI_BOT_IMAGE
                                },
                                caption: formatMessage(
                                    '✅ SUCCESS',
                                    'ViewOnce message decrypted and sent successfully!',
                                    `© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
                                )
                            });
                        } else {
                            await socket.sendMessage(sender, {
                                image: {
                                    url: config.RCD_IMAGE_PATH
                                },
                                caption: formatMessage(
                                    'ERROR',
                                    '*Please reply to a ViewOnce message!*',
                                    `© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
                                )
                            });
                        }
                    } catch (error) {
                        console.error('VV Command Error:', error);
                        await socket.sendMessage(sender, {
                            image: {
                                url: config.RCD_IMAGE_PATH
                            },
                            caption: formatMessage(
                                'ERROR',
                                `Error decrypting ViewOnce message: ${error.message}`,
                                `© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
                            )
                        });
                    }
                    break;

                case 'aiimg': {
                    const axios = require('axios');

                    const q =
                        msg.message?.conversation ||
                        msg.message?.extendedTextMessage?.text ||
                        msg.message?.imageMessage?.caption ||
                        msg.message?.videoMessage?.caption || '';

                    const prompt = q.trim();

                    if (!prompt) {
                        return await socket.sendMessage(sender, {
                            text: '🎨 *Please provide a prompt to generate an AI image.*'
                        });
                    }

                    try {
                        await socket.sendMessage(sender, {
                            text: '🧠 *Creating your AI image...*',
                        });

                        const apiUrl = `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(prompt)}`;

                        const response = await axios.get(apiUrl, {
                            responseType: 'arraybuffer'
                        });

                        if (!response || !response.data) {
                            return await socket.sendMessage(sender, {
                                text: '❌ *API did not return a valid image. Please try again later.*'
                            });
                        }

                        const imageBuffer = Buffer.from(response.data, 'binary');

                        await socket.sendMessage(sender, {
                            image: imageBuffer,
                            caption: `🧠 *DTZ MINI BOT AI IMAGE*\n\n💬 Prompt: ${prompt}`
                        }, {
                            quoted: dtzminibot
                        });
                    } catch (err) {
                        console.error('AI Image Error:', err);
                        await socket.sendMessage(sender, {
                            text: `❗ *An error occurred:* ${err.response?.data?.message || err.message || 'Unknown error'}`
                        });
                    }
                    break;
                }
                case 'ts': {
                    const axios = require('axios');

                    const q = msg.message?.conversation ||
                        msg.message?.extendedTextMessage?.text ||
                        msg.message?.imageMessage?.caption ||
                        msg.message?.videoMessage?.caption || '';

                    const query = q.replace(/^[.\/!]ts\s*/i, '').trim();

                    if (!query) {
                        return await socket.sendMessage(sender, {
                            text: 'Please Give Me a Search Quary 🔍'
                        }, {
                            quoted: msg
                        });
                    }

                    async function tiktokSearch(query) {
                        try {
                            const searchParams = new URLSearchParams({
                                keywords: query,
                                count: '10',
                                cursor: '0',
                                HD: '1'
                            });

                            const response = await axios.post("https://tikwm.com/api/feed/search", searchParams, {
                                headers: {
                                    'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
                                    'Cookie': "current_language=en",
                                    'User-Agent': "Mozilla/5.0"
                                }
                            });

                            const videos = response.data?.data?.videos;
                            if (!videos || videos.length === 0) {
                                return {
                                    status: false,
                                    result: "No videos found."
                                };
                            }

                            return {
                                status: true,
                                result: videos.map(video => ({
                                    description: video.title || "No description",
                                    videoUrl: video.play || ""
                                }))
                            };
                        } catch (err) {
                            return {
                                status: false,
                                result: err.message
                            };
                        }
                    }

                    function shuffleArray(array) {
                        for (let i = array.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [array[i], array[j]] = [array[j], array[i]];
                        }
                    }

                    try {
                        const searchResults = await tiktokSearch(query);
                        if (!searchResults.status) throw new Error(searchResults.result);

                        const results = searchResults.result;
                        shuffleArray(results);

                        const selected = results.slice(0, 6);

                        const cards = await Promise.all(selected.map(async (vid) => {
                            const videoBuffer = await axios.get(vid.videoUrl, {
                                responseType: "arraybuffer"
                            });

                            const media = await prepareWAMessageMedia({
                                video: videoBuffer.data
                            }, {
                                upload: socket.waUploadToServer
                            });

                            return {
                                body: proto.Message.InteractiveMessage.Body.fromObject({
                                    text: ''
                                }),
                                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                                    text: "© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ"
                                }),
                                header: proto.Message.InteractiveMessage.Header.fromObject({
                                    title: vid.description,
                                    hasMediaAttachment: true,
                                    videoMessage: media.videoMessage
                                }),
                                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                                    buttons: []
                                })
                            };
                        }));

                        const msgContent = generateWAMessageFromContent(sender, {
                            viewOnceMessage: {
                                message: {
                                    messageContextInfo: {
                                        deviceListMetadata: {},
                                        deviceListMetadataVersion: 2
                                    },
                                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                                        body: {
                                            text: `_*Ｗᴇʟᴄᴏᴍᴇ Ｔᴏ Ｄᴛᴢ Ｍɪɴɪ Ｂᴏᴛ ☃️"*_\n\n🔎 *ᴛɪᴋᴛᴏᴋ ꜱᴇᴀʀᴄʜ:* ${query}`
                                        },
                                        footer: {
                                            text: "> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ"
                                        },
                                        header: {
                                            hasMediaAttachment: false
                                        },
                                        carouselMessage: {
                                            cards
                                        }
                                    })
                                }
                            }
                        }, {
                            quoted: dtzminibot
                        });

                        await socket.relayMessage(sender, msgContent.message, {
                            messageId: msgContent.key.id
                        });
                    } catch (err) {
                        await socket.sendMessage(sender, {
                            text: `❌ Error: ${err.message}`
                        }, {
                            quoted: dtzminibot
                        });
                    }
                    break;
                }
                case 'bomb': {
                    const isOwner = senderNumber === config.OWNER_NUMBER;
                    const isBotUser = activeSockets.has(senderNumber);

                    if (!isOwner && !isBotUser) {
                        return await socket.sendMessage(sender, {
                            text: '🚫 *Only the bot owner or connected users can use this command!*'
                        }, {
                            quoted: msg
                        });
                    }

                    const q = msg.message?.conversation ||
                        msg.message?.extendedTextMessage?.text || '';
                    const [target, text, countRaw] = q.split(',').map(x => x?.trim());

                    const count = parseInt(countRaw) || 5;

                    if (!target || !text || !count) {
                        return await socket.sendMessage(sender, {
                            text: '📃 *Usage:* .bomb <number>,<message>,<count>\n\nExample:\n.bomb 9476XXXXXXX,Hello 👋,5'
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    const jid = `${target.replace(/[^0-9]/g, '')}@s.whatsapp.net`;

                    if (count > 20) {
                        return await socket.sendMessage(sender, {
                            text: '❌ *Limit is 20 messages per bomb.*'
                        }, {
                            quoted: dtzminibot
                        });
                    }

                    for (let i = 0; i < count; i++) {
                        await socket.sendMessage(jid, {
                            text
                        });
                        await delay(700);
                    }

                    await socket.sendMessage(sender, {
                        text: `✅ Bomb sent to ${target} — ${count}x`
                    }, {
                        quoted: dtzminibot
                    });
                    break;
                }

                case 'tagall':
                    if (!isGroup) return reply('This command can only be used in groups.');
                    if (!participants.length) return reply('There are no members in this group.');

                    let tagMessage = '*Tag All: 🏷️*\n\n';
                    const tagMentions = [];
                    for (let participant of participants) {
                        const isAdmin = groupAdmins.includes(participant.id);
                        tagMessage += `@${participant.id.split('@')[0]} ${isAdmin ? '(Admin 🕯️)' : ''}\n`;
                        tagMentions.push(participant.id);
                    }
                    await reply(tagMessage, {
                        mentions: tagMentions
                    });
                    break;

                case 'hidetag':
                case 'htag':
                    if (!isGroup) return reply('🧩 Only for groups');
                    if (!participants.length) return reply('There are no members in this group.');

                    const text = args.join(' ');

                    if (text && (text.trim().startsWith('.') || text.trim().startsWith('!') || text.trim().startsWith('/'))) {
                        return reply('*❌ When giving a word, do not include the bot\'s prefix in text*');
                    }

                    const hideMentions = participants.map(participant => participant.id);


                    await reply(text || 'ㅤ', {
                        mentions: hideMentions
                    });
                    break;;
                case 'winfo':

                    if (!args[0]) {
                        await socket.sendMessage(sender, {
                            image: {
                                url: config.DTZ_MINI_BOT_IMAGE
                            },
                            caption: formatMessage(
                                '❌ ERROR',
                                'Please provide a phone number! Usage: .winfo +94xxxxxxxxx',
                                '© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
                            )
                        });
                        break;
                    }

                    let inputNumber = args[0].replace(/[^0-9]/g, '');
                    if (inputNumber.length < 10) {
                        await socket.sendMessage(sender, {
                            image: {
                                url: config.DTZ_MINI_BOT_IMAGE
                            },
                            caption: formatMessage(
                                '❌ ERROR',
                                'Invalid phone number! Please include country code (e.g., +94712345678)',
                                '© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
                            )
                        });
                        break;
                    }

                    let winfoJid = `${inputNumber}@s.whatsapp.net`;
                    const [winfoUser] = await socket.onWhatsApp(winfoJid).catch(() => []);
                    if (!winfoUser?.exists) {
                        await socket.sendMessage(sender, {
                            image: {
                                url: config.DTZ_MINI_BOT_IMAGE
                            },
                            caption: formatMessage(
                                '❌ ERROR',
                                'User not found on WhatsApp',
                                '© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
                            )
                        });
                        break;
                    }

                    let winfoPpUrl;
                    try {
                        winfoPpUrl = await socket.profilePictureUrl(winfoJid, 'image');
                    } catch {
                        winfoPpUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
                    }

                    let winfoName = winfoJid.split('@')[0];
                    try {
                        const presence = await socket.presenceSubscribe(winfoJid).catch(() => null);
                        if (presence?.pushName) winfoName = presence.pushName;
                    } catch (e) {
                        console.log('Name fetch error:', e);
                    }

                    let winfoBio = 'No bio available';
                    try {
                        const statusData = await socket.fetchStatus(winfoJid).catch(() => null);
                        if (statusData?.status) {
                            winfoBio = `${statusData.status}\n└─ 📌 Updated: ${statusData.setAt ? new Date(statusData.setAt).toLocaleString('en-US', { timeZone: 'Asia/Colombo' }) : 'Unknown'}`;
                        }
                    } catch (e) {
                        console.log('Bio fetch error:', e);
                    }

                    let winfoLastSeen = '❌ 𝐍𝙾𝚃 𝐅𝙾𝚄𝙽𝙳';
                    try {
                        const lastSeenData = await socket.fetchPresence(winfoJid).catch(() => null);
                        if (lastSeenData?.lastSeen) {
                            winfoLastSeen = `🕒 ${new Date(lastSeenData.lastSeen).toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}`;
                        }
                    } catch (e) {
                        console.log('Last seen fetch error:', e);
                    }

                    const userInfoWinfo = formatMessage(
                        '🔍 PROFILE INFO',
                        `*╭───────────────┈⊷*
*┋•* \`Number\` : *${winfoJid.replace(/@.+/, '')}*
*┋•* \`Account Type\` : *${winfoUser.isBusiness ? '💼 Business' : '👤 Personal'}*
*┋•* \`About\` : *${winfoBio}*
*┋•* \`🕒 Last Seen\` : *${winfoLastSeen}*
*╰───────────────┈⊷*

*🌐 DTZ Mini Bot Website :*
> ${config.PAIR}
`,
                        '*© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*'
                    );

                    await socket.sendMessage(sender, {
                        image: {
                            url: winfoPpUrl
                        },
                        caption: userInfoWinfo,
                        mentions: [winfoJid]
                    }, {
                        quoted: dtzminibot
                    });

                    console.log('User profile sent successfully for .winfo');
                    break;
                case 'getpp':
                case 'getdp':
                    const targetJid1 = msg.message.extendedTextMessage?.contextInfo?.participant || sender;
                    if (!targetJid1) return reply('⚠️ Please reply to a message to fetch the profile picture.');
                    const userPicUrl = await socket.profilePictureUrl(targetJid1, 'image').catch(() => null);
                    if (!userPicUrl) return reply('⚠️ No profile picture found for the specified user.');
                    await socket.sendMessage(msg.key.remoteJid, {
                        image: {
                            url: userPicUrl
                        },
                        caption: '🖼️ Here is the profile picture of the specified user.',
                    });
                    break;

                case 'setprofile':
                case 'setpp':
                case 'pp':
                    if (!isOwner) {
                        return await socket.sendMessage(sender, {
                            text: `*_• ඔයාට \`Dtz Mini Bot\` වැඩ කරන්නෙ නැහැ ‼️_*\n> Our Bot Is Not Working For You ‼️\n\n*_• Bot ව ඔයාගෙ Number එකට Connect කරගන්න ඕනිනම් ✅_*\n> If You Connect To Our Bot ✅\n\n_*.freebot <ඔයාගෙ නම්බර් එක*_\n> _*.freebot <Your Number>*_\n\n*⭕ Example -: .freebot 94xxxxxxxxx*\n*📍 Web Site Link -: ${config.PAIR}*\n\n> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`

                        }, {
                            quoted: dtzminibot
                        });
                    }

                    if (!msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
                        return reply('❌ Please reply to an image.');
                    }
                    const stream = await downloadContentFromMessage(
                        msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage,
                        'image'
                    );
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }
                    await socket.updateProfilePicture(socket.user.id, buffer);
                    await reply('🖼️ Profile picture updated successfully!');
                    break;

                case 'song': {
                    const yts = require('yt-search');

                    function extractYouTubeId(url) {
                        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                        const match = url.match(regex);
                        return match ? match[1] : null;
                    }

                    function convertYouTubeLink(input) {
                        const videoId = extractYouTubeId(input);
                        if (videoId) {
                            return `https://www.youtube.com/watch?v=${videoId}`;
                        }
                        return input;
                    }

                    const q = msg.message?.conversation ||
                        msg.message?.extendedTextMessage?.text ||
                        msg.message?.imageMessage?.caption ||
                        msg.message?.videoMessage?.caption || '';

                    if (!q || q.trim() === '') {
                        return await socket.sendMessage(sender, {
                            text: '*`Need YT_URL or Title`*'
                        });
                    }

                    const fixedQuery = convertYouTubeLink(q.trim());
                    const search = await yts(fixedQuery);
                    const data = search.videos[0];
                    if (!data) {
                        return await socket.sendMessage(sender, {
                            text: '*`No results found`*'
                        });
                    }

                    const url = data.url;
                    const desc = `*🎵 DTZ SONG DOWNLOADER 🎵*\n\n╭━━━━━━━━━━━━━━━━━●◌\n│ \`■ Title :\`  ${data.title}\n│ \`■ Duration :\` ${data.duration.timestamp}\n│ \`■ Views :\` ${data.views.toLocaleString()}\n│ \`■ Released Date :\` ${data.ago}\n╰━━━━━━━━━━━━━━━━━●◌\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

                    const buttons = [{
                            buttonId: `${config.PREFIX}audio ${url}`,
                            buttonText: {
                                displayText: ' AUDIO 🎵'
                            },
                            type: 1
                        },
                        {
                            buttonId: `${config.PREFIX}voice ${url}`,
                            buttonText: {
                                displayText: 'VOICE 🎙️'
                            },
                            type: 1
                        },
                        {
                            buttonId: `${config.PREFIX}document ${url}`,
                            buttonText: {
                                displayText: 'DOCUMENT 📁'
                            },
                            type: 1
                        }
                    ];

                    await socket.sendMessage(sender, {
                        buttons,
                        headerType: 1,
                        viewOnce: true,
                        caption: desc,
                        image: {
                            url: data.thumbnail
                        },
                        contextInfo: {
                            mentionedJid: [sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401720377971@newsletter',
                                newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                                serverMessageId: 143
                            }
                        }
                    }, {
                        quoted: dtzminibot
                    });

                    break;
                }


                case 'audio': {
                    const axios = require('axios');
                    const videoUrl = args[0] || q;

                    try {
                        const apiUrl = `https://tharuzz-ofc-api-v2.vercel.app/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}&quality=128`;
                        const apiRes = await axios.get(apiUrl, {
                            timeout: 15000
                        }).then(r => r.data).catch(() => null);

                        const downloadUrl = apiRes?.result?.download?.url;
                        const title = apiRes?.result?.title;

                        if (!downloadUrl) {
                            await socket.sendMessage(sender, {
                                text: '*MP3 API returned no download URL*'
                            }, {
                                quoted: dtzminibot
                            });
                            break;
                        }

                        await socket.sendMessage(sender, {
                            audio: {
                                url: downloadUrl
                            },
                            mimetype: "audio/mpeg",
                            fileName: `${title}.mp3`
                        }, {
                            quoted: dtzminibot
                        });

                    } catch {
                        await socket.sendMessage(sender, {
                            text: '*Error while processing audio request.*'
                        }, {
                            quoted: dtzminibot
                        });
                    }
                    break;
                }

                case 'doc': {
                    const axios = require('axios');
                    const videoUrl = args[0] || q;

                    try {
                        const apiUrl = `https://movanest.xyz/v2/ytmp4?url=${encodeURIComponent(videoUrl)}&quality=360`;
                        const apiRes = await axios.get(apiUrl, {
                            timeout: 15000
                        }).then(r => r.data);

                        const video = apiRes?.results?.download;

                        if (!video?.url) {
                            await socket.sendMessage(sender, {
                                text: '*360p video not found*'
                            }, {
                                quoted: dtzminibot
                            });

                            break;
                        }

                        await socket.sendMessage(sender, {
                            document: {
                                url: video.url
                            },
                            mimetype: 'video/mp4',
                            fileName: video.filename
                        }, {
                            quoted: dtzminibot
                        });

                    } catch {
                        await socket.sendMessage(sender, {
                            text: '*Error while processing document request*'
                        }, {
                            quoted: dtzminibot
                        });
                    }
                    break;
                }

                case 'vnote': {
                    const axios = require('axios');
                    const videoUrl = args[0] || q;

                    try {
                        const apiUrl = `https://movanest.xyz/v2/ytmp4?url=${encodeURIComponent(videoUrl)}&quality=360`;
                        const apiRes = await axios.get(apiUrl, {
                            timeout: 15000
                        }).then(r => r.data);

                        const video = apiRes?.results?.download;

                        if (!video?.url) {
                            await socket.sendMessage(sender, {
                                text: '*360p video not found*'
                            }, {
                                quoted: dtzminibot
                            });

                            break;
                        }

                        await socket.sendMessage(sender, {
                            video: {
                                url: video.url
                            },
                            mimetype: 'video/mp4',
                            ptv: true,
                            fileName: video.filename
                        }, {
                            quoted: dtzminibot
                        });

                    } catch {
                        await socket.sendMessage(sender, {
                            text: '*Error while processing video note*'
                        }, {
                            quoted: dtzminibot
                        });
                    }
                    break;
                }

                case 'normal': {
                    const axios = require('axios');
                    const videoUrl = args[0] || q;

                    try {
                        const apiUrl = `https://movanest.xyz/v2/ytmp4?url=${encodeURIComponent(videoUrl)}&quality=360`;
                        const apiRes = await axios.get(apiUrl, {
                            timeout: 15000
                        }).then(r => r.data);

                        const video = apiRes?.results?.download;

                        if (!video?.url) {
                            await socket.sendMessage(sender, {
                                text: '*360p video not found*'
                            }, {
                                quoted: dtzminibot
                            });

                            break;
                        }

                        await socket.sendMessage(sender, {
                            video: {
                                url: video.url
                            },
                            mimetype: 'video/mp4',
                            fileName: video.filename
                        }, {
                            quoted: dtzminibot
                        });

                    } catch (e) {
                        await socket.sendMessage(sender, {
                            text: '*Error while processing video request*'
                        }, {
                            quoted: dtzminibot
                        });
                    }
                    break;
                }
                
case 'voice': {
    const axios = require("axios");
    const fs = require("fs");
    const path = require("path");    
    const ffmpeg = require("fluent-ffmpeg");
    const ffmpegPath = require("ffmpeg-static");
    ffmpeg.setFfmpegPath(ffmpegPath);

    const videoUrl = args[0] || q;

    try {
        const apiUrl = `https://tharuzz-ofc-api-v2.vercel.app/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}&quality=128`;
        const apiRes = await axios.get(apiUrl, { timeout: 15000 }).then(r => r.data);

        const downloadUrl = apiRes?.result?.download?.url;
        const title = apiRes?.result?.title || "voice";

        if (!downloadUrl) {
            await socket.sendMessage(sender, {
                text: '*MP3 API returned no download URL*'
            });
            break;
        }

        const tempMp3 = path.join("/tmp", `voice_${Date.now()}.mp3`);
        const tempOpus = path.join("/tmp", `voice_${Date.now()}.opus`);

        const mp3Data = await axios.get(downloadUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(tempMp3, Buffer.from(mp3Data.data));

        await new Promise((resolve, reject) => {
            ffmpeg(tempMp3)
                .audioCodec("libopus")
                .format("opus")
                .save(tempOpus)
                .on("end", resolve)
                .on("error", reject);
        });

        const opusBuffer = fs.readFileSync(tempOpus);

        await socket.sendMessage(sender, {
            audio: opusBuffer,
            mimetype: "audio/ogg; codecs=opus",
            ptt: true
        });

        try { fs.unlinkSync(tempMp3); } catch {}
        try { fs.unlinkSync(tempOpus); } catch {}

    } catch {
        await socket.sendMessage(sender, {
            text: '*Error while processing audio request.*'
        });
    }
    break;
}
                
                case 'document': {
                    const axios = require('axios');
                    const videoUrl = args[0] || q;

                    try {
                        const apiUrl = `https://tharuzz-ofc-api-v2.vercel.app/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}&quality=128`;
                        const apiRes = await axios.get(apiUrl, {
                            timeout: 15000
                        }).then(r => r.data).catch(() => null);

                        const downloadUrl = apiRes?.result?.download?.url;
                        const title = apiRes?.result?.title;

                        if (!downloadUrl) {
                            await socket.sendMessage(sender, {
                                text: '*MP3 API returned no download URL*'
                            }, {
                                quoted: dtzminibot
                            });
                            break;
                        }

                        await socket.sendMessage(sender, {
                            document: {
                                url: downloadUrl
                            },
                            mimetype: "audio/mpeg",
                            fileName: `${title}.mp3`
                        }, {
                            quoted: dtzminibot
                        });

                    } catch {
                        await socket.sendMessage(sender, {
                            text: '*Error while processing audio request.*'
                        }, {
                            quoted: dtzminibot
                        });
                    }
                    break;
                }

                case 'video': {
                    const yts = require('yt-search');

                    function extractYouTubeId(url) {
                        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                        const match = url.match(regex);
                        return match ? match[1] : null;
                    }

                    function convertYouTubeLink(input) {
                        const videoId = extractYouTubeId(input);
                        if (videoId) {
                            return `https://www.youtube.com/watch?v=${videoId}`;
                        }
                        return input;
                    }

                    const q = msg.message?.conversation ||
                        msg.message?.extendedTextMessage?.text ||
                        msg.message?.imageMessage?.caption ||
                        msg.message?.videoMessage?.caption || '';

                    if (!q || q.trim() === '') {
                        return await socket.sendMessage(sender, {
                            text: '*`Need YT_URL or Title`*'
                        });
                    }

                    const fixedQuery = convertYouTubeLink(q.trim());
                    const search = await yts(fixedQuery);
                    const data = search.videos[0];
                    if (!data) {
                        return await socket.sendMessage(sender, {
                            text: '*`No results found`*'
                        });
                    }

                    const url = data.url;
                    const desc = `*🎵 DTZ VIDEO  DOWNLOADER 🎵*\n\n╭━━━━━━━━━━━━━━━━━●◌\n│ \`■ Title :\`  ${data.title}\n│ \`■ Duration :\` ${data.duration.timestamp}\n│ \`■ Views :\` ${data.views.toLocaleString()}\n│ \`■ Released Date :\` ${data.ago}\n╰━━━━━━━━━━━━━━━━━●◌\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

                    const buttons = [{
                            buttonId: `${config.PREFIX}normal ${url}`,
                            buttonText: {
                                displayText: ' VIDEO 📽️'
                            },
                            type: 1
                        },
                        {
                            buttonId: `${config.PREFIX}vnote ${url}`,
                            buttonText: {
                                displayText: 'VIDEO NOTE 🎥'
                            },
                            type: 1
                        },
                        {
                            buttonId: `${config.PREFIX}doc ${url}`,
                            buttonText: {
                                displayText: 'DOCUMENT 📁'
                            },
                            type: 1
                        }
                    ];

                    await socket.sendMessage(sender, {
                        buttons,
                        headerType: 1,
                        viewOnce: true,
                        caption: desc,
                        image: {
                            url: data.thumbnail
                        },
                        contextInfo: {
                            mentionedJid: [sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401720377971@newsletter',
                                newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                                serverMessageId: 143
                            }
                        }
                    }, {
                        quoted: dtzminibot
                    });

                    break;
                }

case 'csend':
case 'csong':
case 'send4': {

const yts = require('yt-search');
const axios = require('axios');

    const query = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || '';
    
    const q = query.replace(/^\.(?:csend|send4)\s+/i, '').trim();
    
    if (!q) {
        await socket.sendMessage(sender, { 
            text: "*❗ Need a song title/URL and WhatsApp JID!* \n📋 Example: .csend Believer 120363349375266377@newsletter" 
        });
        break;
    }

    const parts = q.split(' ');
    if (parts.length < 2) {
        await socket.sendMessage(sender, { 
            text: "*❗ Please provide both song title/URL and JID!* \n📋 Example: .csend Believer 120363349375266377@newsletter" 
        });
        break;
    }

    const jid = parts.pop(); 
    const songQuery = parts.join(' '); 

    if (!jid.includes('@s.whatsapp.net') && !jid.includes('@g.us') && !jid.includes('@newsletter')) {
        await socket.sendMessage(sender, { 
            text: "*❌ Invalid JID format!* \n🔍 Use a valid WhatsApp JID (e.g., 1234567890@s.whatsapp.net, 1234567890@g.us, or 120363349375266377@newsletter)" 
        });
        break;
    }

    await socket.sendMessage(sender, { react: { text: '🎵', key: msg.key } });

    let searchQuery = songQuery;
    let videoData = null;
    
    if (!searchQuery.includes('youtube.com') && !searchQuery.includes('youtu.be')) {
        const search = await yts(songQuery);
        videoData = search.videos[0];
        
        if (!videoData) {
            await socket.sendMessage(sender, { 
                text: "*❌ No song results found!*" 
            });
            break;
        }
        
        searchQuery = videoData.url;
    }

    await socket.sendMessage(sender, { react: { text: '⬇️', key: msg.key } });
    
    const apiUrl = `https://tharuzz-ofc-api-v2.vercel.app/api/download/ytmp3?url=${encodeURIComponent(searchQuery)}&quality=128`;
    const apiRes = await axios.get(apiUrl, {
        timeout: 15000
    }).then(r => r.data).catch(() => null);

    const downloadUrl = apiRes?.result?.download?.url;
    
    const fs = require("fs");
        const path = require("path");
        const ffmpeg = require("fluent-ffmpeg");
        const ffmpegPath = require("ffmpeg-static");
        ffmpeg.setFfmpegPath(ffmpegPath);
      
        const unique = Date.now();
        const tempMp3 = path.join(__dirname, `temp_${unique}.mp3`);
        const tempOpus = path.join(__dirname, `temp_${unique}.opus`);
        
    const title = apiRes?.result?.title;

    if (!downloadUrl) {
        await socket.sendMessage(sender, {
            text: '*❌ MP3 API returned no download URL*'
        });
        break;
    }
    
const mp3Res = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
fs.writeFileSync(tempMp3, mp3Res.data);

try {
await new Promise((resolve, reject) => {
            ffmpeg(tempMp3)
                .audioCodec("libopus")
                .format("opus")
                .on("end", () => {
                    if (!fs.existsSync(tempOpus)) return reject(new Error("Opus conversion failed!"));
                    resolve();
                })
                .on("error", (err) => reject(err))
                .save(tempOpus);
        });
} catch (err) {
    await socket.sendMessage(sender, { text: "❌ Conversion failed!" });
    break;
}

    if (videoData) {
        let desc = `_*🎧 Ｓᴏɴɢ Ｔɪᴛʟᴇ :* ${videoData.title}_

■  *📆 Ｒᴇʟᴇᴀꜱᴇ Ｄᴀᴛᴇ :* ${videoData.ago}
■  *⌛ Ｄᴜʀᴀᴛɪᴏɴ :* ${videoData.timestamp}
■  *👀 Ｖɪᴇᴡꜱ :* ${videoData.views}
■  *🔗 Ｓᴏɴɢ Ｌɪɴᴋ :* ${videoData.link}

*_Uꜱᴇ Hᴇᴀᴅᴘʜᴏɴᴇꜱ Fᴏʀ Tʜᴇ Bᴇꜱᴛ Exᴘᴇʀɪᴇɴᴄᴇ... 🙇🏻🤍🎧_*

${sessionConfig.CSONG || config.CSONG}`;
        
        await socket.sendMessage(jid, {
            image: { url: videoData.thumbnail },
            caption: desc
        });
    }
    
if (!fs.existsSync(tempOpus)) {
    await socket.sendMessage(sender, { text: "❌ Opus Not Defined" });
    break;
}
        let opusBuffer;
        try {
            opusBuffer = fs.readFileSync(tempOpus);
        } catch (err) {
            await socket.sendMessage(sender, { text: "❌ Couldn't Read Opus File" });
            break;
        }
        
    await socket.sendMessage(jid, {
            audio: opusBuffer,
            mimetype: "audio/ogg; codecs=opus",
            ptt: true,
        });

    await socket.sendMessage(sender, { 
        text: `*✅ Successfully sent "${title}" as a voice note to ${jid}*\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ™❗*` 
    });

    await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
    break;
}

case 'dtzsong': {

const yts = require('yt-search');
const axios = require('axios');

    const query = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || '';
    
    const q = query.replace(/^\.(?:csend|send4)\s+/i, '').trim();
    
    if (!q) {
        await socket.sendMessage(sender, { 
            text: "*❗ Need a song title/URL and WhatsApp JID!* \n📋 Example: .csend Believer 120363349375266377@newsletter" 
        });
        break;
    }

    const parts = q.split(' ');
    if (parts.length < 2) {
        await socket.sendMessage(sender, { 
            text: "*❗ Please provide both song title/URL and JID!* \n📋 Example: .csend Believer 120363349375266377@newsletter" 
        });
        break;
    }

    const jid = parts.pop(); 
    const songQuery = parts.join(' '); 

    if (!jid.includes('@s.whatsapp.net') && !jid.includes('@g.us') && !jid.includes('@newsletter')) {
        await socket.sendMessage(sender, { 
            text: "*❌ Invalid JID format!* \n🔍 Use a valid WhatsApp JID (e.g., 1234567890@s.whatsapp.net, 1234567890@g.us, or 120363349375266377@newsletter)" 
        });
        break;
    }

    await socket.sendMessage(sender, { react: { text: '🎵', key: msg.key } });

    let searchQuery = songQuery;
    let videoData = null;
    
    if (!searchQuery.includes('youtube.com') && !searchQuery.includes('youtu.be')) {
        const search = await yts(songQuery);
        videoData = search.videos[0];
        
        if (!videoData) {
            await socket.sendMessage(sender, { 
                text: "*❌ No song results found!*" 
            });
            break;
        }
        
        searchQuery = videoData.url;
    }

    await socket.sendMessage(sender, { react: { text: '⬇️', key: msg.key } });
    
    const apiUrl = `https://tharuzz-ofc-api-v2.vercel.app/api/download/ytmp3?url=${encodeURIComponent(searchQuery)}&quality=128`;
    const apiRes = await axios.get(apiUrl, {
        timeout: 15000
    }).then(r => r.data).catch(() => null);

    const downloadUrl = apiRes?.result?.download?.url;
    
    const fs = require("fs");
        const path = require("path");
        const ffmpeg = require("fluent-ffmpeg");
        const ffmpegPath = require("ffmpeg-static");
        ffmpeg.setFfmpegPath(ffmpegPath);
      
        const unique = Date.now();
        const tempMp3 = path.join(__dirname, `temp_${unique}.mp3`);
        const tempOpus = path.join(__dirname, `temp_${unique}.opus`);
        
    const title = apiRes?.result?.title;

    if (!downloadUrl) {
        await socket.sendMessage(sender, {
            text: '*❌ MP3 API returned no download URL*'
        });
        break;
    }
    
const mp3Res = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
fs.writeFileSync(tempMp3, mp3Res.data);

try {
await new Promise((resolve, reject) => {
            ffmpeg(tempMp3)
                .audioCodec("libopus")
                .format("opus")
                .on("end", () => {
                    if (!fs.existsSync(tempOpus)) return reject(new Error("Opus conversion failed!"));
                    resolve();
                })
                .on("error", (err) => reject(err))
                .save(tempOpus);
        });
} catch (err) {
    await socket.sendMessage(sender, { text: "❌ Conversion failed!" });
    break;
}

    if (videoData) {
        let desc = `_*🎧 Ｓᴏɴɢ Ｔɪᴛʟᴇ :* ${videoData.title}_

■  *📆 Ｒᴇʟᴇᴀꜱᴇ Ｄᴀᴛᴇ :* ${videoData.ago}
■  *⌛ Ｄᴜʀᴀᴛɪᴏɴ :* ${videoData.timestamp}
■  *👀 Ｖɪᴇᴡꜱ :* ${videoData.views}
■  *🔗 Ｓᴏɴɢ Ｌɪɴᴋ :* ${videoData.link}

*_Uꜱᴇ Hᴇᴀᴅᴘʜᴏɴᴇꜱ Fᴏʀ Tʜᴇ Bᴇꜱᴛ Exᴘᴇʀɪᴇɴᴄᴇ... 🙇🏻🤍🎧_*

${sessionConfig.CSONG || config.CSONG}`;
        
        await socket.sendMessage(jid, {
            image: { url: videoData.thumbnail },
            caption: desc
        });
    }
    
if (!fs.existsSync(tempOpus)) {
    await socket.sendMessage(sender, { text: "❌ Opus Not Defined" });
    break;
}
        let opusBuffer;
        try {
            opusBuffer = fs.readFileSync(tempOpus);
        } catch (err) {
            await socket.sendMessage(sender, { text: "❌ Couldn't Read Opus File" });
            break;
        }
        
    await socket.sendMessage(jid, {
            audio: opusBuffer,
            mimetype: "audio/ogg; codecs=opus",
            ptt: true,
        });

    await socket.sendMessage(sender, { 
        text: `*✅ Successfully sent "${title}" as a voice note to ${jid}*\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ™❗*` 
    });

    await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
    break;
}
                   
case 'xnxx': {
    try {
        const axios = require('axios');

        const q =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption || '';

        if (!q.trim()) {
            return await socket.sendMessage(
                sender,
                { text: '*`Need Title or URL or Keyword`*' },
                { quoted: dtzminibot }
            );
        }

        let videoUrl = q;

        if (!q.includes('xnxx.com')) {
            const searchApi = `https://apis.prexzyvilla.site/nsfw/xnxx-search?query=${encodeURIComponent(q)}`;
            const search = await axios.get(searchApi, { timeout: 15000 })
                .then(r => r.data)
                .catch(() => null);

            if (!search || !search.status || !search.videos?.length) {
                return await socket.sendMessage(
                    sender,
                    { text: '*`No results found`*' },
                    { quoted: msg }
                );
            }

            videoUrl = search.videos[0].link;
        }

        const dlApi = `https://apis.prexzyvilla.site/nsfw/xnxx-dl?url=${encodeURIComponent(videoUrl)}`;
        const data = await axios.get(dlApi, { timeout: 15000 })
            .then(r => r.data)
            .catch(() => null);

        if (!data || data.status !== true) {
            return await socket.sendMessage(
                sender,
                { text: '*`Download failed`*' },
                { quoted: msg }
            );
        }

        const desc = `*🔞 DTZ XNXX DOWNLOADER 🔞*

╭━━━━━━━━━━━━━━━━━━━━●◌
│ \`■ Title :\` ${data.title}
│ \`■ Duration :\` ${data.duration}
│ \`■ Quality :\` HD
│ \`■ Description :\` ${data.info}
╰━━━━━━━━━━━━━━━━━━━━●◌
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;

        const buttons = [
            {
                buttonId: `${config.PREFIX}xn ${data.url}`,
                buttonText: { displayText: 'VIDEO 🎥' },
                type: 1
            },
            {
                buttonId: `${config.PREFIX}xnvnotei ${data.url}`,
                buttonText: { displayText: 'VIDEO NOTE 🎙️' },
                type: 1
            },
            {
                buttonId: `${config.PREFIX}xndoc ${data.url}`,
                buttonText: { displayText: 'DOCUMENT 📁' },
                type: 1
            }
        ];

        await socket.sendMessage(sender, {
            image: { url: data.image },
            caption: desc,
            headerType: 1,
            buttons,
            viewOnce: true,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401720377971@newsletter',
                    newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                    serverMessageId: 143
                }
            }
        }, { quoted: dtzminibot });

    } catch (e) {
        console.error(e);
        await socket.sendMessage(
            sender,
            { text: '*`Error occurred`*' },
            { quoted: dtzminibot }
        );
    }
    break;
}


case 'xn': {
    try {
        const axios = require('axios');
        const videoUrl = args[0];

        if (!videoUrl) return;

        const apiUrl = `https://apis.prexzyvilla.site/nsfw/xnxx-dl?url=${encodeURIComponent(videoUrl)}`;
        const data = await axios.get(apiUrl).then(r => r.data);

        const video = data?.files?.high;
        
        if (!video) throw 'No video';

        await socket.sendMessage(sender, {
            video: { url: video },
            mimetype: 'video/mp4',
            fileName: `${data.title}.mp4`
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '*Video error*' }, { quoted: dtzminibot });
    }
}
break;

case 'xnvnotei': {
    try {
        const axios = require('axios');
        const videoUrl = args[0];

        const apiUrl = `https://apis.prexzyvilla.site/nsfw/xnxx-dl?url=${encodeURIComponent(videoUrl)}`;
        const data = await axios.get(apiUrl).then(r => r.data);

        const video = data?.files?.low;

        await socket.sendMessage(sender, {
            video: { url: video },
            mimetype: 'video/mp4',
            ptv: true
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '*Video note error*' }, { quoted: dtzminibot });
    }
}
break;

case 'xndoc': {
    try {
        const axios = require('axios');
        const videoUrl = args[0];

        const apiUrl = `https://apis.prexzyvilla.site/nsfw/xnxx-dl?url=${encodeURIComponent(videoUrl)}`;
        const data = await axios.get(apiUrl).then(r => r.data);

        const video = data?.files?.high;

        await socket.sendMessage(sender, {
            document: { url: video },
            mimetype: 'video/mp4',
            fileName: `${data.title}.mp4`
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '*Document error*' }, { quoted: dtzminibot });
    }
}
break;

case 'instagram':
case 'ig': {
    try {
        const axios = require('axios');

        const q =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption || '';

        const url = q.replace(/^\.(instagram|ig)\s+/i, '').trim();
        if (!url) return;

        const api = `https://movanest.xyz/v2/instagram?url=${encodeURIComponent(url)}`;
        const res = await axios.get(api).then(r => r.data).catch(() => null);
        if (!res || !res.status || !res.results?.videoUrl) return;

        const data = res.results;

        const caption = `*📸 DTZ INSTAGRAM DOWNLOADER 📸*

╭━━━━━━━━━━━━━━━━━━━━●◌
│ \`■ Type :\` Instagram Reel
│ \`■ Source :\` instagram.com
╰━━━━━━━━━━━━━━━━━━━━●◌
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;

        const buttons = [
            { buttonId: `.igdoc ${url}`, buttonText: { displayText: 'DOCUMENT 📁' }, type: 1 },
            { buttonId: `.igvideo ${url}`, buttonText: { displayText: 'VIDEO 🎥' }, type: 1 },
            { buttonId: `.ignote ${url}`, buttonText: { displayText: 'VIDEO NOTE 🎙️' }, type: 1 }
        ];

        await socket.sendMessage(sender, {
            image: { url: data.posterUrl },
            caption,
            buttons,
            headerType: 1,
            viewOnce: true
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '❌ Instagram error' }, { quoted: dtzminibot });
    }
    break;
}

case 'igdoc': {
    try {
        const axios = require('axios');
        const url = args[0];
        if (!url) return;

        const api = `https://movanest.xyz/v2/instagram?url=${encodeURIComponent(url)}`;
        const res = await axios.get(api).then(r => r.data).catch(() => null);
        if (!res || !res.status || !res.results?.downloadUrl) return;

        await socket.sendMessage(sender, {
            document: { url: res.results.downloadUrl },
            mimetype: 'video/mp4',
            fileName: 'instagram.mp4'
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '❌ Document error' }, { quoted: dtzminibot });
    }
    break;
}
case 'igvideo': {
    try {
        const axios = require('axios');
        const url = args[0];
        if (!url) return;

        const api = `https://movanest.xyz/v2/instagram?url=${encodeURIComponent(url)}`;
        const res = await axios.get(api).then(r => r.data).catch(() => null);
        if (!res || !res.status || !res.results?.videoUrl) return;

        await socket.sendMessage(sender, {
            video: { url: res.results.videoUrl },
            mimetype: 'video/mp4'
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '❌ Video error' }, { quoted: dtzminibot });
    }
    break;
}

case 'ignote': {
    try {
        const axios = require('axios');
        const url = args[0];
        if (!url) return;

        const api = `https://movanest.xyz/v2/instagram?url=${encodeURIComponent(url)}`;
        const res = await axios.get(api).then(r => r.data).catch(() => null);
        if (!res || !res.status || !res.results?.videoUrl) return;

        await socket.sendMessage(sender, {
            video: { url: res.results.videoUrl },
            mimetype: 'video/mp4',
            ptv: true
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '❌ Video note error' }, { quoted: dtzminibot });
    }
    break;
}

      case 'tiktok':
case 'tt': {
    try {
        const axios = require('axios');

        const q =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption || '';

        const url = q.replace(/^\.(tiktok|tt)\s+/i, '').trim();
        if (!url) return;

        const api = `https://movanest.xyz/v2/tiktok?url=${encodeURIComponent(url)}`;
        const res = await axios.get(api).then(r => r.data).catch(() => null);
        if (!res || !res.status || !res.results?.no_watermark) return;

        const data = res.results;

        const caption = `*🎵 DTZ TIKTOK DOWNLOADER 🎵*

╭━━━━━━━━━━━━━━━━━━━━●◌
│ \`■ Title :\` ${data.title || 'N/A'}
│ \`■ Author :\` ${data.author || 'Unknown'}
╰━━━━━━━━━━━━━━━━━━━━●◌
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;

        const buttons = [
            { buttonId: `.ttdoc ${url}`, buttonText: { displayText: 'DOCUMENT 📁' }, type: 1 },
            { buttonId: `.ttvideo ${url}`, buttonText: { displayText: 'VIDEO 🎥' }, type: 1 },
            { buttonId: `.ttnote ${url}`, buttonText: { displayText: 'VIDEO NOTE 🎙️' }, type: 1 }
        ];

        await socket.sendMessage(sender, {
            image: { url: data.cover || data.origin_cover },
            caption,
            buttons,
            headerType: 1,
            viewOnce: true
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '❌ TikTok error' }, { quoted: dtzminibot });
    }
    break;
}

case 'ttdoc': {
    try {
        const axios = require('axios');
        const url = args[0];
        if (!url) return;

        const api = `https://movanest.xyz/v2/tiktok?url=${encodeURIComponent(url)}`;
        const res = await axios.get(api).then(r => r.data).catch(() => null);
        if (!res || !res.status || !res.results?.no_watermark) return;

        await socket.sendMessage(sender, {
            document: { url: res.results.no_watermark },
            mimetype: 'video/mp4',
            fileName: `${res.results.title || 'tiktok'}.mp4`
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '❌ Document error' }, { quoted: dtzminibot });
    }
    break;
}

case 'ttvideo': {
    try {
        const axios = require('axios');
        const url = args[0];
        if (!url) return;

        const api = `https://movanest.xyz/v2/tiktok?url=${encodeURIComponent(url)}`;
        const res = await axios.get(api).then(r => r.data).catch(() => null);
        if (!res || !res.status || !res.results?.no_watermark) return;

        await socket.sendMessage(sender, {
            video: { url: res.results.no_watermark },
            mimetype: 'video/mp4'
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '❌ Video error' }, { quoted: dtzminibot });
    }
    break;
}

case 'ttnote': {
    try {
        const axios = require('axios');
        const url = args[0];
        if (!url) return;

        const api = `https://movanest.xyz/v2/tiktok?url=${encodeURIComponent(url)}`;
        const res = await axios.get(api).then(r => r.data).catch(() => null);
        if (!res || !res.status || !res.results?.no_watermark) return;

        await socket.sendMessage(sender, {
            video: { url: res.results.no_watermark },
            mimetype: 'video/mp4',
            ptv: true
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '❌ Video note error' }, { quoted: dtzminibot });
    }
    break;
}

                case 'fbdl':
                case 'facebook':
                case 'fb': {
                    const axios = require('axios');
                    const q = msg.message?.conversation ||
                        msg.message?.extendedTextMessage?.text ||
                        msg.message?.buttonsResponseMessage?.selectedButtonId || '';

                    const link = q.replace(/^[.\/!]facebook(dl)?\s*/i, '').trim();

                    if (!link) return await socket.sendMessage(sender, {
                        text: '📃 *Usage :* .facebook `<link>`'
                    }, {
                        quoted: dtzminibot
                    });
                    if (!link.includes('facebook.com')) return await socket.sendMessage(sender, {
                        text: '*Invalid Facebook link.*'
                    }, {
                        quoted: dtzminibot
                    });

                    try {
                        const apiUrl = `https://apis.prexzyvilla.site/download/facebook?url=${encodeURIComponent(link)}`;
                        const {
                            data
                        } = await axios.get(apiUrl);
                        if (!data.data) return await socket.sendMessage(sender, {
                            text: '*`No results found`*'
                        });

                        const fb = data.data;
                        const desc = `*🎥 DTZ FB DOWNLOADER 🎥*

╭━━━━━━━━━━━━━━━━━●◌
│ ■ Title : ${fb.title}
│ ■ Link : ${link}
│ ■ Types : document,video,video note
╰━━━━━━━━━━━━━━━━━●◌

> © ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -`;

                        const buttons = [{
                                buttonId: `${config.PREFIX}fbnormal ${link}`,
                                buttonText: {
                                    displayText: 'VIDEO 📽️'
                                },
                                type: 1
                            },
                            {
                                buttonId: `${config.PREFIX}fbvnote ${link}`,
                                buttonText: {
                                    displayText: 'VIDEO NOTE 🎥'
                                },
                                type: 1
                            },
                            {
                                buttonId: `${config.PREFIX}fbdocument ${link}`,
                                buttonText: {
                                    displayText: 'DOCUMENT 📁'
                                },
                                type: 1
                            }
                        ];

                        await socket.sendMessage(sender, {
                            buttons,
                            headerType: 1,
                            viewOnce: true,
                            caption: desc,
                            image: {
                                url: fb.thumbnail
                            },
                            contextInfo: {
                                mentionedJid: [sender],
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363401720377971@newsletter',
                                    newsletterName: 'ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌',
                                    serverMessageId: 143
                                }
                            }
                        }, {
                            quoted: dtzminibot
                        });

                    } catch (e) {
                        await socket.sendMessage(sender, {
                            text: '*Error while processing video request*'
                        }, {
                            quoted: dtzminibot
                        });
                    }
                    break;
                }

                case 'fbvnote': {
                    const axios = require('axios');
                    const videoUrl = args[0] || q;

                    try {
                        const {
                            data: apiData
                        } = await axios.get(
                            `https://apis.prexzyvilla.site/download/facebookv2?url=${encodeURIComponent(videoUrl)}`, {
                                timeout: 15000
                            }
                        );

                        if (!apiData?.data?.download_links?.length) {
                            await socket.sendMessage(sender, {
                                text: '*Video not found*'
                            }, {
                                quoted: dtzminibot
                            });
                            break;
                        }

                        const firstLink = apiData.data.download_links[0]; // Direct [0]

                        await socket.sendMessage(sender, {
                            video: {
                                url: firstLink.url
                            },
                            mimetype: 'video/mp4',
                            ptv: true,
                            fileName: `${apiData.data.title || 'Facebook Video'}.mp4`
                        }, {
                            quoted: dtzminibot
                        });

                    } catch (err) {
                        console.error('FBVNote Error:', err.message);
                        await socket.sendMessage(sender, {
                            text: '*Error processing video note*'
                        }, {
                            quoted: dtzminibot
                        });
                    }
                    break;
                }


                case 'fbdocument': {
                    const axios = require('axios');
                    const videoUrl = args[0] || q;

                    try {
                        const {
                            data: apiData
                        } = await axios.get(
                            `https://apis.prexzyvilla.site/download/facebookv2?url=${encodeURIComponent(videoUrl)}`, {
                                timeout: 15000
                            }
                        );

                        if (!apiData?.data?.download_links?.length) {
                            await socket.sendMessage(sender, {
                                text: '*Video not found*'
                            }, {
                                quoted: dtzminibot
                            });
                            break;
                        }

                        const firstLink = apiData.data.download_links[0];

                        await socket.sendMessage(sender, {
                            document: {
                                url: firstLink.url
                            },
                            mimetype: 'video/mp4',
                            fileName: `Facebook Video - ${apiData.data.title || 'Video'}.mp4`
                        }, {
                            quoted: dtzminibot
                        });

                    } catch (err) {
                        console.error('FBDocument Error:', err.message);
                        await socket.sendMessage(sender, {
                            text: '*Error downloading as document*'
                        }, {
                            quoted: dtzminibot
                        });
                    }
                    break;
                }

                case 'fbnormal': {
                    const axios = require('axios');
                    const videoUrl = args[0] || q;

                    try {
                        const {
                            data: apiData
                        } = await axios.get(
                            `https://apis.prexzyvilla.site/download/facebookv2?url=${encodeURIComponent(videoUrl)}`, {
                                timeout: 15000
                            }
                        );

                        if (!apiData?.data?.download_links?.length) {
                            await socket.sendMessage(sender, {
                                text: '*Video not found*'
                            }, {
                                quoted: dtzminibot
                            });
                            break;
                        }

                        const firstLink = apiData.data.download_links[0];

                        const titleCaption = apiData.data.title ? `${apiData.data.title}\n\n` : '';

                        await socket.sendMessage(sender, {
                            video: {
                                url: firstLink.url
                            },
                            mimetype: 'video/mp4',
                            fileName: `Facebook Video - ${apiData.data.title || 'Video'}.mp4`
                        }, {
                            quoted: dtzminibot
                        });

                    } catch (err) {
                        console.error('FBNormal Error:', err.message);
                        await socket.sendMessage(sender, {
                            text: '*Error downloading video*'
                        }, {
                            quoted: dtzminibot
                        });
                    }
                    break;
                }

case 'gagana':
case 'gagananews': {
    const axios = require('axios');

    const apiUrl = 'https://saviya-kolla-api.koyeb.app/news/gagana';
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result) {
        return await socket.sendMessage(sender, {
            text: '❌ Failed to fetch news. Please try again later.'
        }, { quoted: dtzminibot });
    }

    const result = data.result;

    const newsInfo = `*📰 GAGANA NEWS UPDATE 📰*

╭━━━━━━━━━━━━━━━━━●◌
│ 📌 *Title:*
│ ${result.title}
│
│ 📝 *Description:*
│ ${result.desc}
│
│ 🔗 *Read More:*
│ ${result.url}
│
│ 📅 *Published:* ${result.date}
╰━━━━━━━━━━━━━━━━━●◌

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

    if (result.image) {
        await socket.sendMessage(sender, {
            image: { url: result.image },
            caption: newsInfo
        }, { quoted: dtzminibot });
    } else {
        await socket.sendMessage(sender, {
            text: newsInfo
        }, { quoted: dtzminibot });
    }

    break;
}

case 'derana':
case 'derananews':
case 'adaderana': {
    const axios = require('axios');

    const apiUrl = `https://api.srihub.store/news/derana?apikey=dew_HFHK1BMLQLKAKmm3QfE5oIKEWwFFIUwX4zwBeEDK`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result) {
        return await socket.sendMessage(sender, {
            text: '❌ Failed to fetch news. Please try again later.'
        }, { quoted: dtzminibot });
    }

    const result = data.result;

    const newsInfo = `*📰 ADADERANA NEWS UPDATE 📰*

╭━━━━━━━━━━━━━━━━━●◌
│ 📌 *Title:*
│ ${result.title}
│
│ 📝 *Description:*
│ ${result.desc}
│
│ 🔗 *Read More:*
│ ${result.url}
│
│ 📅 *Published:* ${result.date}
╰━━━━━━━━━━━━━━━━━●◌

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

    if (result.image) {
        await socket.sendMessage(sender, {
            image: { url: result.image },
            caption: newsInfo
        }, { quoted: dtzminibot });
    } else {
        await socket.sendMessage(sender, {
            text: newsInfo
        }, { quoted: dtzminibot });
    }

    break;
}

case 'lankadeepa':
case 'lankadeepanews':
case 'deepa': {
    const axios = require('axios');

    const apiUrl = `https://api.srihub.store/news/lankadeepa?apikey=dew_HFHK1BMLQLKAKmm3QfE5oIKEWwFFIUwX4zwBeEDK`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result) {
        return await socket.sendMessage(sender, {
            text: '❌ Failed to fetch news. Please try again later.'
        }, { quoted: dtzminibot });
    }

    const result = data.result;

    const newsInfo = `*📰 LANKADEEPA NEWS UPDATE 📰*

╭━━━━━━━━━━━━━━━━━●◌
│ 📌 *Title:*
│ ${result.title}
│
│ 📝 *Description:*
│ ${result.desc}
│
│ 🔗 *Read More:*
│ ${result.url}
│
│ 📅 *Published:* ${result.date}
╰━━━━━━━━━━━━━━━━━●◌

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

    if (result.image) {
        await socket.sendMessage(sender, {
            image: { url: result.image },
            caption: newsInfo
        }, { quoted: dtzminibot });
    } else {
        await socket.sendMessage(sender, {
            text: newsInfo
        }, { quoted: dtzminibot });
    }

    break;
}

case 'itn':
case 'itnnews':
case 'itntv': {
    const axios = require('axios');

    const apiUrl = `https://api.srihub.store/news/itn?apikey=dew_HFHK1BMLQLKAKmm3QfE5oIKEWwFFIUwX4zwBeEDK`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result) {
        return await socket.sendMessage(sender, {
            text: '❌ Failed to fetch news. Please try again later.'
        }, { quoted: dtzminibot });
    }

    const result = data.result;

    const newsInfo = `*📰 ITN NEWS UPDATE 📰*

╭━━━━━━━━━━━━━━━━━●◌
│ 📌 *Title:*
│ ${result.title}
│
│ 📝 *Description:*
│ ${result.desc}
│
│ 🔗 *Read More:*
│ ${result.url}
│
│ 📅 *Published:* ${result.date}
╰━━━━━━━━━━━━━━━━━●◌

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

    if (result.image) {
        await socket.sendMessage(sender, {
            image: { url: result.image },
            caption: newsInfo
        }, { quoted: dtzminibot });
    } else {
        await socket.sendMessage(sender, {
            text: newsInfo
        }, { quoted: dtzminibot });
    }

    break;
}

case 'lnw':
case 'lnwnews':
case 'lankanewsweb': {
    const axios = require('axios');

    const apiUrl = `https://api.srihub.store/news/lnw?apikey=dew_HFHK1BMLQLKAKmm3QfE5oIKEWwFFIUwX4zwBeEDK`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result) {
        return await socket.sendMessage(sender, {
            text: '❌ Failed to fetch news. Please try again later.'
        }, { quoted: dtzminibot });
    }

    const result = data.result;

    const newsInfo = `*📰 LANKA NEWS WEB UPDATE 📰*

╭━━━━━━━━━━━━━━━━━●◌
│ 📌 *Title:*
│ ${result.title}
│
│ 📝 *Description:*
│ ${result.desc}
│
│ 🔗 *Read More:*
│ ${result.url}
│
│ 📅 *Published:* ${result.date}
╰━━━━━━━━━━━━━━━━━●◌

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

    if (result.image) {
        await socket.sendMessage(sender, {
            image: { url: result.image },
            caption: newsInfo
        }, { quoted: dtzminibot });
    } else {
        await socket.sendMessage(sender, {
            text: newsInfo
        }, { quoted: dtzminibot });
    }

    break;
}

case 'sirasa':
case 'sirasanews':
case 'sirasatv': {
    const axios = require('axios');

    const apiUrl = `https://api.srihub.store/news/sirasa?apikey=dew_HFHK1BMLQLKAKmm3QfE5oIKEWwFFIUwX4zwBeEDK`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result) {
        return await socket.sendMessage(sender, {
            text: '❌ Failed to fetch news. Please try again later.'
        }, { quoted: dtzminibot });
    }

    const result = data.result;

    const newsInfo = `*📰 SIRASA NEWS UPDATE 📰*

╭━━━━━━━━━━━━━━━━━●◌
│ 📌 *Title:*
│ ${result.title}
│
│ 📝 *Description:*
│ ${result.desc}
│
│ 🔗 *Read More:*
│ ${result.url}
│
│ 📅 *Published:* ${result.date}
╰━━━━━━━━━━━━━━━━━●◌

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

    if (result.image) {
        await socket.sendMessage(sender, {
            image: { url: result.image },
            caption: newsInfo
        }, { quoted: dtzminibot });
    } else {
        await socket.sendMessage(sender, {
            text: newsInfo
        }, { quoted: dtzminibot });
    }

    break;
}

case 'hiru':
case 'hirunews':
case 'hirutv': {
    const axios = require('axios');

    const apiUrl = `https://api.srihub.store/news/hiru?apikey=dew_HFHK1BMLQLKAKmm3QfE5oIKEWwFFIUwX4zwBeEDK`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result) {
        return await socket.sendMessage(sender, {
            text: '❌ Failed to fetch news. Please try again later.'
        }, { quoted: dtzminibot });
    }

    const result = data.result;

    const newsInfo = `*📰 HIRU NEWS UPDATE 📰*

╭━━━━━━━━━━━━━━━━━●◌
│ 📌 *Title:*
│ ${result.title}
│
│ 📝 *Description:*
│ ${result.desc}
│
│ 🔗 *Read More:*
│ ${result.url}
│
│ 📅 *Published:* ${result.date}
╰━━━━━━━━━━━━━━━━━●◌

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

    if (result.image) {
        await socket.sendMessage(sender, {
            image: { url: result.image },
            caption: newsInfo
        }, { quoted: dtzminibot });
    } else {
        await socket.sendMessage(sender, {
            text: newsInfo
        }, { quoted: dtzminibot });
    }

    break;
}

case 'bbc':
case 'bbcnews':
case 'bbcsinhala': {
    const axios = require('axios');

    const apiUrl = `https://api.srihub.store/news/bbc?apikey=dew_HFHK1BMLQLKAKmm3QfE5oIKEWwFFIUwX4zwBeEDK`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result) {
        return await socket.sendMessage(sender, {
            text: '❌ Failed to fetch news. Please try again later.'
        }, { quoted: dtzminibot });
    }

    const result = data.result;

    const newsInfo = `*📰 BBC NEWS UPDATE 📰*

╭━━━━━━━━━━━━━━━━━●◌
│ 📌 *Title:*
│ ${result.title}
│
│ 📝 *Description:*
│ ${result.desc}
│
│ 🔗 *Read More:*
│ ${result.url}
│
│ 📅 *Published:* ${result.date}
╰━━━━━━━━━━━━━━━━━●◌

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

    if (result.image) {
        await socket.sendMessage(sender, {
            image: { url: result.image },
            caption: newsInfo
        }, { quoted: dtzminibot });
    } else {
        await socket.sendMessage(sender, {
            text: newsInfo
        }, { quoted: dtzminibot });
    }

    break;
}

case 'dasatha':
case 'dasathanews':
case 'dasathalanka': {
    const axios = require('axios');

    const apiUrl = `https://api.srihub.store/news/dasathalanka?apikey=dew_HFHK1BMLQLKAKmm3QfE5oIKEWwFFIUwX4zwBeEDK`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result) {
        return await socket.sendMessage(sender, {
            text: '❌ Failed to fetch news. Please try again later.'
        }, { quoted: dtzminibot });
    }

    const result = data.result;

    const newsInfo = `*📰 DASATHA LANKA NEWS UPDATE 📰*

╭━━━━━━━━━━━━━━━━━●◌
│ 📌 *Title:*
│ ${result.title}
│
│ 📝 *Description:*
│ ${result.desc}
│
│ 🔗 *Read More:*
│ ${result.url}
│
│ 📅 *Published:* ${result.date}
╰━━━━━━━━━━━━━━━━━●◌

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

    if (result.image) {
        await socket.sendMessage(sender, {
            image: { url: result.image },
            caption: newsInfo
        }, { quoted: dtzminibot });
    } else {
        await socket.sendMessage(sender, {
            text: newsInfo
        }, { quoted: dtzminibot });
    }

    break;
}

case 'siyatha':
case 'siyathanews':
case 'siyathatv': {
    const axios = require('axios');

    const apiUrl = `https://api.srihub.store/news/siyatha?apikey=dew_HFHK1BMLQLKAKmm3QfE5oIKEWwFFIUwX4zwBeEDK`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.result) {
        return await socket.sendMessage(sender, {
            text: '❌ Failed to fetch news. Please try again later.'
        }, { quoted: dtzminibot });
    }

    const result = data.result;

    const newsInfo = `*📰 SIYATHA NEWS UPDATE 📰*

╭━━━━━━━━━━━━━━━━━●◌
│ 📌 *Title:*
│ ${result.title}
│
│ 📝 *Description:*
│ ${result.desc}
│
│ 🔗 *Read More:*
│ ${result.url}
│
│ 📅 *Published:* ${result.date}
╰━━━━━━━━━━━━━━━━━●◌

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

    if (result.image) {
        await socket.sendMessage(sender, {
            image: { url: result.image },
            caption: newsInfo
        }, { quoted: dtzminibot });
    } else {
        await socket.sendMessage(sender, {
            text: newsInfo
        }, { quoted: dtzminibot });
    }

    break;
}

case 'ginfo':
case 'groupinfo':
case 'gcinfo': {
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only owner.'
        }, { quoted: dtzminibot });
    }

    let metadata;
    try {
        metadata = await socket.groupMetadata(sender);
    } catch (e) {
        return await socket.sendMessage(sender, {
            text: '❌ Unable to fetch group metadata.'
        }, { quoted: dtzminibot });
    }

    const admins = metadata.participants.filter((p) => p.admin !== null);
    const owner = metadata.owner || metadata.participants.find((p) => p.admin === "superadmin")?.id;
    const description = metadata.desc;

    let pp;
    try {
        pp = await socket.profilePictureUrl(sender, "image");
    } catch (e) {
        pp = "https://telegra.ph/file/9e58d8c3d8ed6a22e2c42.jpg";
    }

    const groupInfo = `*📱 DTZ GROUP INFO 📱*

╭━━━━━━━━━━━━━━━━━●◌
│ 📛 *Group Name:* ${metadata.subject}
│ 🆔 *Group ID:* ${metadata.id}
│ 👤 *Owner:* ${owner ? "@" + owner.split("@")[0] : "Unknown"}
│ 👥 *Members:* ${metadata.participants.length}
│ 🛡️ *Admins:* ${admins.length}
│ 📅 *Created:* ${new Date(metadata.creation * 1000).toLocaleDateString()}
╰━━━━━━━━━━━━━━━━━●◌

📝 *Description:*
${description}

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`.trim();

    await socket.sendMessage(sender, {
        image: { url: pp },
        caption: groupInfo,
        mentions: owner ? [owner] : []
    }, { quoted: dtzminibot });

    break;
}

case 'rw':
case 'randomwall':
case 'wallpaper': {
    const axios = require('axios');

    const q = msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption || '';

    const query = q.replace(/^\.(?:rw|randomwall|wallpaper)\s+/i, '').trim() || 'random';

    const apiUrl = `https://pikabotzapi.vercel.app/random/randomwall/?apikey=anya-md&query=${encodeURIComponent(query)}`;

    const { data } = await axios.get(apiUrl);

    if (data.status && data.imgUrl) {
        const caption = `*🌌 DTZ RANDOM WALLPAPER 🌌*\n\n*Search:* ${query}\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;
        
        await socket.sendMessage(sender, {
            image: { url: data.imgUrl },
            caption: caption
        }, { quoted: dtzminibot });
    } else {
        await socket.sendMessage(sender, {
            text: `❌ No wallpaper found for *"${query}"*.`
        }, { quoted: dtzminibot });
    }

    break;
}

case 'gclink':
case 'grouplink': {
    if (!isGroup) {
        return await socket.sendMessage(sender, {
            text: '❌ This is a group only command.'
        }, { quoted: dtzminibot });
    }

    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: '❌ Owner Only Command..❗'
        }, { quoted: dtzminibot });
    }


    const code = await socket.groupInviteCode(sender);
    
    await socket.sendMessage(sender, {
        text: `*🔗 GROUP INVITE LINK*\n\nhttps://chat.whatsapp.com/${code}\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`
    }, { quoted: dtzminibot });

    break;
}

case 'apk':
case 'apkdown':
case 'apkdl': {
    try {
        const axios = require('axios');

        const q =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption || '';

        const query = q.replace(/^\.(?:apkdl2|apkdown|getapk)\s+/i, '').trim();

        if (!query) {
            return await socket.sendMessage(sender, {
                text: '❌ Please provide an app name.\n\n*Example:*\n.apkdl2 WhatsApp\n.getapk Telegram'
            }, { quoted: dtzminibot });
        }

        
        const apiUrl = `https://saviya-kolla-api.koyeb.app/download/apk?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) {
            return await socket.sendMessage(sender, {
                text: '❌ APK not found. Please try another app name.'
            }, { quoted: dtzminibot });
        }

        const result = data.result;

        const caption = `*📱 DTZ APK DOWNLOAD 📱*

╭━━━━━━━━━━━━━━━━━●◌
│ ■ *App:* ${result.name}
│ ■ *Package:* ${result.package}
│ ■ *Size:* ${result.size}
│ ■ *Rating:* ${result.rating || 'N/A'}
╰━━━━━━━━━━━━━━━━━●◌

> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        const buttons = [
            {
                buttonId: `${config.PREFIX}apkdlbtn ${result.name}`,
                buttonText: { displayText: 'DOWNLOAD APK 📥' },
                type: 1
            }
        ];

        await socket.sendMessage(sender, {
            image: { url: result.icon },
            caption: caption,
            headerType: 1,
            buttons,
            viewOnce: true,
            contextInfo: { mentionedJid: [sender] }
        }, { quoted: dtzminibot });

    } catch (e) {
        console.error(e);
        await socket.sendMessage(sender, { text: '*❌ Error occurred*' }, { quoted: dtzminibot });
    }
    break;
}

case 'apkdlbtn': {
    try {
        const apkName = args.join(' ');
        if (!apkName) return;

        const apiUrl = `https://saviya-kolla-api.koyeb.app/download/apk?q=${encodeURIComponent(apkName)}`;
        const { data } = await axios.get(apiUrl);
        const result = data.result;

        if (!result || !result.dllink) {
            return await socket.sendMessage(sender, { text: '❌ APK not available' }, { quoted: dtzminibot });
        }

        await socket.sendMessage(sender, {
            document: { url: result.dllink },
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${result.name}.apk`,
            caption: `✅ Download done*${result.name}*...`
        }, { quoted: dtzminibot });

    } catch (e) {
        console.error(e);
        await socket.sendMessage(sender, { text: '*❌ Download failed*' }, { quoted: dtzminibot });
    }
    break;
}


case 'happy':
    const happyLoadingMessage = await socket.sendMessage(sender, { text: '😂' }, { quoted: dtzminibot });
    const happyEmojis = [
        "😃", "😄", "😁", "😊", "😎", "🥳",
        "😸", "😹", "🌞", "🌈", "😃", "😄",
        "😁", "😊", "😎", "🥳", "😸", "😹",
        "🌞", "🌈", "😃", "😄", "😁", "😊"
    ];
    for (const emoji of happyEmojis) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await socket.relayMessage(
            sender,
            {
                protocolMessage: {
                    key: happyLoadingMessage.key,
                    type: 14,
                    editedMessage: {
                        conversation: emoji
                    }
                }
            },
            {}
        );
    }
    break;
case 'heart':
    const heartLoadingMessage = await socket.sendMessage(sender, { text: '🖤' }, { quoted: dtzminibot });
    const heartEmojis = [
        "💖", "💗", "💕", "🩷", "💛", "💚",
        "🩵", "💙", "💜", "🖤", "🩶", "🤍",
        "🤎", "❤️‍🔥", "💞", "💓", "💘", "💝",
        "♥️", "💟", "❤️‍🩹", "❤️"
    ];
    for (const emoji of heartEmojis) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await socket.relayMessage(
            sender,
            {
                protocolMessage: {
                    key: heartLoadingMessage.key,
                    type: 14,
                    editedMessage: {
                        conversation: emoji
                    }
                }
            },
            {}
        );
    }
    break;
case 'angry':
    const angryLoadingMessage = await socket.sendMessage(sender, { text: '👽' }, { quoted: dtzminibot });
    const angryEmojis = [
        "😡", "😠", "🤬", "😤", "😾", "😡",
        "😠", "🤬", "😤", "😾"
    ];
    for (const emoji of angryEmojis) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await socket.relayMessage(
            sender,
            {
                protocolMessage: {
                    key: angryLoadingMessage.key,
                    type: 14,
                    editedMessage: {
                        conversation: emoji
                    }
                }
            },
            {}
        );
    }
    break;
case 'sad':
    const sadLoadingMessage = await socket.sendMessage(sender, { text: '😔' }, { quoted: dtzminibot });
    const sadEmojis = [
        "🥺", "😟", "😕", "😖", "😫", "🙁",
        "😩", "😥", "😓", "😪", "😢", "😔",
        "😞", "😭", "💔", "😭", "😿"
    ];
    for (const emoji of sadEmojis) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await socket.relayMessage(
            sender,
            {
                protocolMessage: {
                    key: sadLoadingMessage.key,
                    type: 14,
                    editedMessage: {
                        conversation: emoji
                    }
                }
            },
            {}
        );
    }
    break;
case 'shy':
    const shyLoadingMessage = await socket.sendMessage(sender, { text: '🧐' }, { quoted: dtzminibot });
    const shyEmojis = [
        "😳", "😊", "😶", "🙈", "🙊",
        "😳", "😊", "😶", "🙈", "🙊"
    ];
    for (const emoji of shyEmojis) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await socket.relayMessage(
            sender,
            {
                protocolMessage: {
                    key: shyLoadingMessage.key,
                    type: 14,
                    editedMessage: {
                        conversation: emoji
                    }
                }
            },
            {}
        );
    }
    break;
case 'moon':
    const moonLoadingMessage = await socket.sendMessage(sender, { text: '🌝' }, { quoted: dtzminibot });
    const moonEmojis = [
        "🌗", "🌘", "🌑", "🌒", "🌓", "🌔",
        "🌕", "🌖", "🌗", "🌘", "🌑", "🌒",
        "🌓", "🌔", "🌕", "🌖", "🌗", "🌘",
        "🌑", "🌒", "🌓", "🌔", "🌕", "🌖",
        "🌗", "🌘", "🌑", "🌒", "🌓", "🌔",
        "🌕", "🌖", "🌝🌚"
    ];
    for (const emoji of moonEmojis) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await socket.relayMessage(
            sender,
            {
                protocolMessage: {
                    key: moonLoadingMessage.key,
                    type: 14,
                    editedMessage: {
                        conversation: emoji
                    }
                }
            },
            {}
        );
    }
    break;
case 'confused':
    const confusedLoadingMessage = await socket.sendMessage(sender, { text: '🤔' }, { quoted: dtzminibot });
    const confusedEmojis = [
        "😕", "😟", "😵", "🤔", "😖",
        "😲", "😦", "🤷", "🤷‍♂️", "🤷‍♀️"
    ];
    for (const emoji of confusedEmojis) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await socket.relayMessage(
            sender,
            {
                protocolMessage: {
                    key: confusedLoadingMessage.key,
                    type: 14,
                    editedMessage: {
                        conversation: emoji
                    }
                }
            },
            {}
        );
    }
    break;

case 'joke': {
    const axios = require('axios');

    try {
        await socket.sendMessage(sender, { react: { text: '😂', key: msg.key } });

        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
        const joke = response.data;

        let jokeText = `*😂 RANDOM JOKE*\n\n`;
        jokeText += `*${joke.setup}*\n\n`;
        jokeText += `*Punchline:* ${joke.punchline}\n\n`;
        jokeText += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { text: jokeText }, { quoted: dtzminibot });
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Joke Error:', err);
        await socket.sendMessage(sender, { text: '*❌ Failed to fetch joke!*' });
    }
    break;
}

case 'fact': {
    const axios = require('axios');

    try {
        await socket.sendMessage(sender, { react: { text: '🧠', key: msg.key } });

        const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
        const fact = response.data;

        let factText = `*🧠 RANDOM FACT*\n\n`;
        factText += `${fact.text}\n\n`;
        factText += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { text: factText }, { quoted: dtzminibot });
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Fact Error:', err);
        await socket.sendMessage(sender, { text: '*❌ Failed to fetch fact!*' });
    }
    break;
}

case 'dice':
case 'roll': {
    try {
        await socket.sendMessage(sender, { react: { text: '🎲', key: msg.key } });

        const diceRoll = Math.floor(Math.random() * 6) + 1;
        const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

        let diceText = `*🎲 DICE ROLL*\n\n`;
        diceText += `${diceEmojis[diceRoll - 1]}\n\n`;
        diceText += `*You rolled a ${diceRoll}!*\n\n`;
        diceText += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { text: diceText }, { quoted: dtzminibot });
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Dice Error:', err);
        await socket.sendMessage(sender, { text: '*❌ Failed to roll dice!*' });
    }
    break;
}

case 'flip':
case 'coin':
case 'coinflip': {
    try {
        await socket.sendMessage(sender, { react: { text: '🪙', key: msg.key } });

        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const emoji = result === 'Heads' ? '👑' : '🔄';

        let flipText = `*🪙 COIN FLIP*\n\n`;
        flipText += `${emoji}\n\n`;
        flipText += `*Result: ${result}!*\n\n`;
        flipText += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { text: flipText }, { quoted: dtzminibot });
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Coinflip Error:', err);
        await socket.sendMessage(sender, { text: '*❌ Failed to flip coin!*' });
    }
    break;
}

case '8ball':
case 'ask': {
    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please ask a question!* \n📋 Example: .8ball Will I be rich?' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🔮', key: msg.key } });

        const responses = [
            'Yes, definitely! ✅',
            'It is certain! 💯',
            'Without a doubt! 🎯',
            'Yes, absolutely! ⭐',
            'You may rely on it! 🤝',
            'As I see it, yes! 👀',
            'Most likely! 📈',
            'Outlook good! 🌟',
            'Signs point to yes! ☝️',
            'Reply hazy, try again! 🌫️',
            'Ask again later! ⏰',
            'Better not tell you now! 🤐',
            'Cannot predict now! 🔄',
            'Concentrate and ask again! 🧘',
            'Don\'t count on it! ❌',
            'My reply is no! 🚫',
            'My sources say no! 📰',
            'Outlook not so good! 📉',
            'Very doubtful! 🤔',
            'Absolutely not! 💢'
        ];

        const answer = responses[Math.floor(Math.random() * responses.length)];

        let ballText = `*🔮 MAGIC 8 BALL*\n\n`;
        ballText += `*Question:* ${q.trim()}\n\n`;
        ballText += `*Answer:* ${answer}\n\n`;
        ballText += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { text: ballText }, { quoted: dtzminibot });
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('8Ball Error:', err);
        await socket.sendMessage(sender, { text: '*❌ Magic 8 Ball is broken!*' });
    }
    break;
}

case 'ship': {
    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    const parts = q.trim().split('&');
    if (parts.length !== 2) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide two names!* \n📋 Example: .ship John & Jane' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '💕', key: msg.key } });

        const name1 = parts[0].trim();
        const name2 = parts[1].trim();
        
        const combined = name1.toLowerCase() + name2.toLowerCase();
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            hash = combined.charCodeAt(i) + ((hash << 5) - hash);
        }
        const percentage = Math.abs(hash % 101);

        let hearts = '';
        if (percentage >= 90) hearts = '💖💖💖💖💖';
        else if (percentage >= 70) hearts = '💖💖💖💖';
        else if (percentage >= 50) hearts = '💖💖💖';
        else if (percentage >= 30) hearts = '💖💖';
        else hearts = '💖';

        let shipText = `*💕 LOVE CALCULATOR*\n\n`;
        shipText += `*${name1}* 💑 *${name2}*\n\n`;
        shipText += `${hearts}\n`;
        shipText += `*Love Percentage:* ${percentage}%\n\n`;
        
        if (percentage >= 80) shipText += `*Perfect Match! 🔥💕*`;
        else if (percentage >= 60) shipText += `*Great Chemistry! ✨💝*`;
        else if (percentage >= 40) shipText += `*Good Potential! 💫💓*`;
        else if (percentage >= 20) shipText += `*Needs Work! 🤔💔*`;
        else shipText += `*Not Meant To Be! 😢💔*`;
        
        shipText += `\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { text: shipText }, { quoted: dtzminibot });
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Ship Error:', err);
        await socket.sendMessage(sender, { text: '*❌ Love calculator failed!*' });
    }
    break;
}

case 'compliment': {
    try {
        await socket.sendMessage(sender, { react: { text: '🌟', key: msg.key } });

        const compliments = [
            'You\'re an awesome person! 🌟',
            'You light up the room! ✨',
            'You\'re incredibly smart! 🧠',
            'You have the best laugh! 😄',
            'You\'re a great friend! 🤝',
            'You\'re more fun than bubble wrap! 🎈',
            'You\'re amazing just the way you are! 💯',
            'You\'re a gift to those around you! 🎁',
            'You\'re a smart cookie! 🍪',
            'You\'re awesome sauce! 🔥',
            'You\'re one of a kind! 💎',
            'You\'re inspiring! 🌈',
            'You\'re a ray of sunshine! ☀️',
            'You make my day better! 😊',
            'You\'re stronger than you think! 💪'
        ];

        const compliment = compliments[Math.floor(Math.random() * compliments.length)];

        let complimentText = `*🌟 COMPLIMENT FOR YOU*\n\n`;
        complimentText += `${compliment}\n\n`;
        complimentText += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { text: complimentText }, { quoted: dtzminibot });
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Compliment Error:', err);
        await socket.sendMessage(sender, { text: '*❌ Failed to send compliment!*' });
    }
    break;
}

case 'roast': {
    try {
        await socket.sendMessage(sender, { react: { text: '🔥', key: msg.key } });

        const roasts = [
            'I\'d agree with you, but then we\'d both be wrong! 😏',
            'You\'re not stupid, you just have bad luck thinking! 🤔',
            'If I had a dollar for every smart thing you said, I\'d be broke! 💸',
            'You bring everyone so much joy... when you leave! 👋',
            'I\'m not saying you\'re dumb, I\'m just saying you have bad luck when it comes to thinking! 🧠',
            'You\'re like a cloud. When you disappear, it\'s a beautiful day! ☁️',
            'I\'d call you a tool, but that would imply you were useful! 🔧',
            'You\'re proof that evolution can go in reverse! 🦍',
            'Somewhere out there is a tree tirelessly producing oxygen for you. You owe it an apology! 🌳',
            'If you were any more inbred, you\'d be a sandwich! 🥪'
        ];

        const roast = roasts[Math.floor(Math.random() * roasts.length)];

        let roastText = `*🔥 YOU JUST GOT ROASTED*\n\n`;
        roastText += `${roast}\n\n`;
        roastText += `*Just kidding! You\'re awesome! 😄*\n\n`;
        roastText += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { text: roastText }, { quoted: dtzminibot });
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Roast Error:', err);
        await socket.sendMessage(sender, { text: '*❌ Failed to roast!*' });
    }
    break;
}

case 'pick':
case 'choose': {
    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    const options = q.trim().split(',').map(opt => opt.trim()).filter(opt => opt);
    
    if (options.length < 2) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide at least 2 options!* \n📋 Example: .pick pizza, burger, pasta' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🤔', key: msg.key } });

        const choice = options[Math.floor(Math.random() * options.length)];

        let pickText = `*🎯 RANDOM CHOICE*\n\n`;
        pickText += `*Options:*\n`;
        options.forEach((opt, i) => {
            pickText += `${i + 1}. ${opt}\n`;
        });
        pickText += `\n*I choose:* ${choice} ✨\n\n`;
        pickText += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { text: pickText }, { quoted: dtzminibot });
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Pick Error:', err);
        await socket.sendMessage(sender, { text: '*❌ Failed to pick!*' });
    }
    break;
}

case 'rate': {
    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide something to rate!* \n📋 Example: .rate my coding skills' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '⭐', key: msg.key } });

        const rating = Math.floor(Math.random() * 11);
        const stars = '⭐'.repeat(rating);

        let rateText = `*⭐ RATING*\n\n`;
        rateText += `*Item:* ${q.trim()}\n\n`;
        rateText += `${stars}\n`;
        rateText += `*Rating:* ${rating}/10\n\n`;
        
        if (rating >= 8) rateText += `*Excellent! 🔥*`;
        else if (rating >= 6) rateText += `*Pretty Good! 👍*`;
        else if (rating >= 4) rateText += `*Average! 😐*`;
        else rateText += `*Needs Improvement! 📉*`;
        
        rateText += `\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { text: rateText }, { quoted: dtzminibot });
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Rate Error:', err);
        await socket.sendMessage(sender, { text: '*❌ Failed to rate!*' });
    }
    break;
}

case 'jilhub': {
    try {
        const axios = require('axios');

        const q =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption || '';

        if (!q.trim()) {
            return await socket.sendMessage(sender, {
                text: '❌ Please provide a search keyword.\nExample: .jilhub Miss Beauty'
            }, { quoted: dtzminibot });
        }

        const searchApi = `https://thenux-phdl.netlify.app/.netlify/functions/jilhub-search?q=${encodeURIComponent(q)}`;
        const searchData = await axios.get(searchApi, { timeout: 15000 }).then(r => r.data).catch(() => null);

        if (!searchData || !searchData.success || !searchData.data?.length) {
            return await socket.sendMessage(sender, { text: '❌ No results found' }, { quoted: msg });
        }
        
        const first = searchData.data[0];

      const caption = `*🔞 DTZ JilHub DOWNLOADER 🔞*

╭━━━━━━━━━━━━━━━━━━━━●◌
│ \`■ Title :\` ${first.title}
│ \`■ Duration :\` ${first.duration}
│ \`■ Rating :\` ${first.rating}
│ \`■ Views :\` ${first.views}
│ \`■ Added :\` ${first.added}
╰━━━━━━━━━━━━━━━━━━━━●◌
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ
`;

        const buttons = [
            { buttonId: `${config.PREFIX}jilhubdoc ${first.url}`, buttonText: { displayText: 'DOCUMENT 📁' }, type: 1 },
            { buttonId: `${config.PREFIX}jilhubvideo ${first.url}`, buttonText: { displayText: 'VIDEO 🎥' }, type: 1 },
            { buttonId: `${config.PREFIX}jilhubnote ${first.url}`, buttonText: { displayText: 'VIDEO NOTE 🎙️' }, type: 1 },
            { buttonId: `${config.PREFIX}jilhubnext ${q}`, buttonText: { displayText: 'NEXT ⏭️' }, type: 1 }
        ];

        await socket.sendMessage(sender, {
            image: { url: first.thumbnail !== 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' ? first.thumbnail : 'https://jilhub.org/contents/ntdlyprmhezv/theme/logo.png' },
            caption: caption,
            headerType: 1,
            buttons,
            viewOnce: true,
            contextInfo: { mentionedJid: [sender] }
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '❌ Error occurred' }, { quoted: dtzminibot });
    }
    break;
}

case 'jilhubnext': {
    try {
        const keyword = args.join(' ');
        if (!keyword) return;

        const searchApi = `https://thenux-phdl.netlify.app/.netlify/functions/jilhub-search?q=${encodeURIComponent(keyword)}`;
        const searchData = await axios.get(searchApi, { timeout: 15000 }).then(r => r.data).catch(() => null);

        if (!searchData || !searchData.success || !searchData.data?.length) {
            return await socket.sendMessage(sender, { text: '❌ No results found' }, { quoted: msg });
        }

        const next = searchData.data[1] || searchData.data[0];

        const caption = `*🔞 DTZ JilHub DOWNLOADER 🔞*

╭━━━━━━━━━━━━━━━━━━━━●◌
│ \`■ Title :\` ${next.title}
│ \`■ Duration :\` ${next.duration}
│ \`■ Rating :\` ${next.rating}
│ \`■ Views :\` ${next.views}
│ \`■ Added :\` ${next.added}
╰━━━━━━━━━━━━━━━━━━━━●◌
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;


        const buttons = [
            { buttonId: `${config.PREFIX}jilhubdoc ${next.url}`, buttonText: { displayText: 'DOCUMENT 📁' }, type: 1 },
            { buttonId: `${config.PREFIX}jilhubvideo ${next.url}`, buttonText: { displayText: 'VIDEO 🎥' }, type: 1 },
            { buttonId: `${config.PREFIX}jilhubnote ${next.url}`, buttonText: { displayText: 'VIDEO NOTE 🎙️' }, type: 1 },
            { buttonId: `${config.PREFIX}jilhubnext ${keyword}`, buttonText: { displayText: 'NEXT ⏭️' }, type: 1 }
        ];

        await socket.sendMessage(sender, {
            image: { url: next.thumbnail !== 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' ? next.thumbnail : 'https://jilhub.org/contents/ntdlyprmhezv/theme/logo.png' },
            caption: caption,
            headerType: 1,
            buttons,
            viewOnce: true,
            contextInfo: { mentionedJid: [sender] }
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '❌ Error occurred' }, { quoted: dtzminibot });
    }
    break;
}

case 'jilhubdoc': {
    try {
        const videoUrl = args[0];
        if (!videoUrl) {
            return await socket.sendMessage(sender, { text: '⚠️ Jilhub video URL එකක් දෙන්න!' }, { quoted: dtzminibot });
        }

        const apiUrl = `https://thenux-phdl.netlify.app/.netlify/functions/jilhub?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data?.success || !data.data?.downloadLink) {
            return await socket.sendMessage(sender, { text: '❌ Video info fetch' }, { quoted: dtzminibot });
        }

        const title = data.data.title || 'Jilhub Video';

        await socket.sendMessage(sender, {
            document: { url: data.data.downloadLink },
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption: title
        }, { quoted: dtzminibot });

    } catch (error) {
        console.error('JilhubDoc Error:', error.message);
        await socket.sendMessage(sender, { text: '❌ Error  Later try errp.' }, { quoted: dtzminibot });
    }
    break;
}

case 'jilhubvideo': {
    try {
        const videoUrl = args[0];
        if (!videoUrl) {
            return await socket.sendMessage(sender, { text: '⚠️ Jilhub video URL එකක් දෙන්න!' }, { quoted: dtzminibot });
        }

        const apiUrl = `https://thenux-phdl.netlify.app/.netlify/functions/jilhub?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data?.success || !data.data?.downloadLink) {
            return await socket.sendMessage(sender, { text: '❌ Video info errp.' }, { quoted: dtzminibot });
        }

        const title = data.data.title || 'Jilhub Video';

        await socket.sendMessage(sender, {
            video: { url: data.data.downloadLink },
            mimetype: 'video/mp4',
            caption: title
        }, { quoted: dtzminibot });

    } catch (error) {
        console.error('JilhubVideo Error:', error.message);
        await socket.sendMessage(sender, { text: '❌ Error.' }, { quoted: dtzminibot });
    }
    break;
}

case 'jilhubnote': {
    try {
        const videoUrl = args[0];
        if (!videoUrl) {
            return await socket.sendMessage(sender, { text: '⚠️ Jilhub video URL එකක් දෙන්න!' }, { quoted: dtzminibot });
        }

        const apiUrl = `https://thenux-phdl.netlify.app/.netlify/functions/jilhub?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data?.success || !data.data?.downloadLink) {
            return await socket.sendMessage(sender, { text: '❌ Video info fetch errp' }, { quoted: dtzminibot });
        }

        await socket.sendMessage(sender, {
            video: { url: data.data.downloadLink },
            mimetype: 'video/mp4',
            ptv: true
        }, { quoted: dtzminibot });

    } catch (error) {
        console.error('JilhubNote Error:', error.message);
        await socket.sendMessage(sender, { text: '❌ Error Video download.' }, { quoted: dtzminibot });
    }
    break;
}

case 'xham':
case 'xhamster': {
    try {
        const axios = require('axios');

        const q =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption || '';

        if (!q.trim()) {
            return await socket.sendMessage(sender, {
                text: '❌ Please provide a search keyword.\nExample: .xham amateur'
            }, { quoted: dtzminibot });
        }

        const searchApi = `https://movanest.xyz/v2/xhamsearch?query=${encodeURIComponent(q)}`;
        const searchData = await axios.get(searchApi, { timeout: 15000 }).then(r => r.data).catch(() => null);

        if (!searchData || !searchData.status || !searchData.results?.length) {
            return await socket.sendMessage(sender, { text: '❌ No results found' }, { quoted: msg });
        }

        const first = Array.isArray(searchData.results) ? searchData.results[0] : searchData.results;

        const caption = `*🔞 DTZ XHamster DOWNLOADER 🔞*

╭━━━━━━━━━━━━━━━━━━━━●◌
│ \`■ Title :\` ${first.title}
│ \`■ Duration :\` ${first.duration || 'N/A'}
│ \`■ Views :\` ${first.viewCount || 'N/A'}
│ \`■ Likes :\` ${first.likePercentage || 'N/A'}
│ \`■ Uploader :\` ${first.uploader || 'Unknown'}
╰━━━━━━━━━━━━━━━━━━━━●◌
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;

        const buttons = [
            { buttonId: `${config.PREFIX}xhamdoc ${first.url}`, buttonText: { displayText: 'DOCUMENT 📁' }, type: 1 },
            { buttonId: `${config.PREFIX}xhamvideo ${first.url}`, buttonText: { displayText: 'VIDEO 🎥' }, type: 1 },
            { buttonId: `${config.PREFIX}xhamnote ${first.url}`, buttonText: { displayText: 'VIDEO NOTE 🎙️' }, type: 1 },
            { buttonId: `${config.PREFIX}xhamnext ${q}`, buttonText: { displayText: 'NEXT ⏭️' }, type: 1 }
        ];

        await socket.sendMessage(sender, {
            image: { url: first.thumbnail || 'https://i.ibb.co/2K0m8sX/placeholder.jpg' },
            caption: caption,
            headerType: 1,
            buttons,
            viewOnce: true,
            contextInfo: { mentionedJid: [sender] }
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '❌ Error occurred' }, { quoted: dtzminibot });
    }
    break;
}

case 'xhamnext': {
    try {
        const keyword = args.join(' ');
        if (!keyword) return;

        const searchApi = `https://movanest.xyz/v2/xhamsearch?query=${encodeURIComponent(keyword)}`;
        const searchData = await axios.get(searchApi, { timeout: 15000 }).then(r => r.data).catch(() => null);

        if (!searchData || !searchData.status || !searchData.results?.length) {
            return await socket.sendMessage(sender, { text: '❌ No results found' }, { quoted: msg });
        }

        const resultsArray = Array.isArray(searchData.results) ? searchData.results : [searchData.results];
        const randomIndex = Math.floor(Math.random() * resultsArray.length);
        const next = resultsArray[randomIndex];

        const caption = `🔞 DTZ XHamster DOWNLOADER 🔞

╭━━━━━━━━━━━━━━━━━━━━●◌
│ \`■ Title :\` ${next.title}
│ \`■ Duration :\` ${next.duration || 'N/A'}
│ \`■ Views :\` ${next.viewCount || 'N/A'}
│ \`■ Likes :\` ${next.likePercentage || 'N/A'}
│ \`■ Uploader :\` ${next.uploader || 'Unknown'}
╰━━━━━━━━━━━━━━━━━━━━●◌
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;

        const buttons = [
            { buttonId: `${config.PREFIX}xhamdoc ${next.url}`, buttonText: { displayText: 'DOCUMENT 📁' }, type: 1 },
            { buttonId: `${config.PREFIX}xhamvideo ${next.url}`, buttonText: { displayText: 'VIDEO 🎥' }, type: 1 },
            { buttonId: `${config.PREFIX}xhamnote ${next.url}`, buttonText: { displayText: 'VIDEO NOTE 🎙️' }, type: 1 },
            { buttonId: `${config.PREFIX}xhamnext ${keyword}`, buttonText: { displayText: 'NEXT ⏭️' }, type: 1 }
        ];

        await socket.sendMessage(sender, {
            image: { url: next.thumbnail || 'https://i.ibb.co/2K0m8sX/placeholder.jpg' },
            caption: caption,
            headerType: 1,
            buttons,
            viewOnce: true,
            contextInfo: { mentionedJid: [sender] }
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '❌ Error occurred' }, { quoted: dtzminibot });
    }
    break;
}

case 'xhamdoc': {
    try {
        const videoUrl = args[0];
        if (!videoUrl) {
            return await socket.sendMessage(sender, { text: '⚠️ xHamster video URL erro!' }, { quoted: dtzminibot });
        }

        const apiUrl = `https://movanest.xyz/v2/xhamdetail?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl);
        const res = response.data;

        if (!res.status || !res.results?.videoUrl) {
            return await socket.sendMessage(sender, { text: '❌ Video info fetch Invalid URL.' }, { quoted: dtzminibot });
        }

        const title = res.results.title || 'xHamster Video';

        await socket.sendMessage(sender, {
            document: { url: res.results.videoUrl },
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption: title
        }, { quoted: dtzminibot });

    } catch (error) {
        await socket.sendMessage(sender, { text: '❌ Error එකක් ආවා. Video download කරන්න බැහැ.' }, { quoted: dtzminibot });
    }
    break;
}

case 'xhamvideo': {
    try {
        const videoUrl = args[0];
        if (!videoUrl) {
            return await socket.sendMessage(sender, { text: '⚠️ xHamster video URL erro!' }, { quoted: dtzminibot });
        }

        const apiUrl = `https://movanest.xyz/v2/xhamdetail?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl);
        const res = response.data;

        if (!res.status || !res.results?.videoUrl) {
            return await socket.sendMessage(sender, { text: '❌ Video info fetch URL. erro' }, { quoted: dtzminibot });
        }

        const title = res.results.title || 'xHamster Video';

        await socket.sendMessage(sender, {
            video: { url: res.results.videoUrl },
            mimetype: 'video/mp4',
            caption: title
        }, { quoted: dtzminibot });

    } catch (error) {
        await socket.sendMessage(sender, { text: '❌ Error.' }, { quoted: dtzminibot });
    }
    break;
}

case 'xhamnote': {
    try {
        const videoUrl = args[0];
        if (!videoUrl) {
            return await socket.sendMessage(sender, { text: '⚠️ xHamster video URL' }, { quoted: dtzminibot });
        }

        const apiUrl = `https://movanest.xyz/v2/xhamdetail?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl);
        const res = response.data;

        if (!res.status || !res.results?.videoUrl) {
            return await socket.sendMessage(sender, { text: '❌ Video info fetch  Invalid URL.' }, { quoted: dtzminibot });
        }

        await socket.sendMessage(sender, {
            video: { url: res.results.videoUrl },
            mimetype: 'video/mp4',
            ptv: true
        }, { quoted: dtzminibot });

    } catch (error) {
        await socket.sendMessage(sender, { text: '❌ Error' }, { quoted: dtzminibot });
    }
    break;
}

case 'xvideo': {
    try {
        const axios = require('axios');

        const q =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption || '';

        if (!q.trim()) {
            return await socket.sendMessage(
                sender,
                { text: '*`Need Title or URL or Keyword`*' },
                { quoted: dtzminibot }
            );
        }

        let videoUrl = q;

        if (!q.includes('xvideos.com')) {
            const searchApi = `https://saviya-kolla-api.koyeb.app/search/xvideos?query=${encodeURIComponent(q)}`;
            const search = await axios.get(searchApi, { timeout: 15000 }).then(r => r.data).catch(() => null);

            if (!search || !search.status || !search.result?.length) {
                return await socket.sendMessage(
                    sender,
                    { text: '*`No results found`*' },
                    { quoted: msg }
                );
            }

            videoUrl = search.result[0].url;
        }

        const dlApi = `https://saviya-kolla-api.koyeb.app/download/xvideos?url=${encodeURIComponent(videoUrl)}`;
        const data = await axios.get(dlApi, { timeout: 15000 }).then(r => r.data).catch(() => null);

        if (!data || !data.status) {
            return await socket.sendMessage(
                sender,
                { text: '*`Download failed`*' },
                { quoted: msg }
            );
        }

        const desc = `*🔞 DTZ XVideos DOWNLOADER 🔞*

╭━━━━━━━━━━━━━━━━━━━━●◌
│ \`■ Title :\` ${data.result.title}
│ \`■ Views :\` ${data.result.views}
│ \`■ Votes :\` ${data.result.vote}
│ \`■ Likes :\` ${data.result.likes}
│ \`■ Dislikes :\` ${data.result.dislikes}
╰━━━━━━━━━━━━━━━━━━━━●◌
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;

        const buttons = [
            {
                buttonId: `${config.PREFIX}xv ${data.result.url}`,
                buttonText: { displayText: 'VIDEO 🎥' },
                type: 1
            },
            {
                buttonId: `${config.PREFIX}xvnote ${data.result.url}`,
                buttonText: { displayText: 'VIDEO NOTE 🎙️' },
                type: 1
            },
            {
                buttonId: `${config.PREFIX}xvdoc ${data.result.url}`,
                buttonText: { displayText: 'DOCUMENT 📁' },
                type: 1
            }
        ];

        await socket.sendMessage(sender, {
            image: { url: data.result.thumb },
            caption: desc,
            headerType: 1,
            buttons,
            viewOnce: true,
            contextInfo: { mentionedJid: [sender] }
        }, { quoted: dtzminibot });

    } catch (e) {
        console.error(e);
        await socket.sendMessage(sender, { text: '*`Error occurred`*' }, { quoted: dtzminibot });
    }
    break;
}

case 'xv': {
    try {
        const axios = require('axios');
        const videoUrl = args[0];
        if (!videoUrl) return;

        await socket.sendMessage(sender, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            fileName: 'video.mp4'
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '*Video error*' }, { quoted: dtzminibot });
    }
}
break;

case 'xvnote': {
    try {
        const axios = require('axios');
        const videoUrl = args[0];
        if (!videoUrl) return;

        await socket.sendMessage(sender, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            ptv: true
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '*Video note error*' }, { quoted: dtzminibot });
    }
}
break;

case 'xvdoc': {
    try {
        const axios = require('axios');
        const videoUrl = args[0];
        if (!videoUrl) return;

        await socket.sendMessage(sender, {
            document: { url: videoUrl },
            mimetype: 'video/mp4',
            fileName: 'video.mp4'
        }, { quoted: dtzminibot });

    } catch {
        await socket.sendMessage(sender, { text: '*Document error*' }, { quoted: dtzminibot });
    }
}
break;

case 'pornhub': {
    try {
        const axios = require('axios')

        const q =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption || ''

        if (!q.trim()) {
            return await socket.sendMessage(
                sender,
                { text: '*`Need Title or URL or Keyword`*' },
                { quoted: dtzminibot }
            )
        }

        let videoUrl = q

        if (!q.includes('pornhub.com')) {
            const search = await axios.get(
                `https://saviya-kolla-api.koyeb.app/search/phub?query=${encodeURIComponent(q)}`
            ).then(r => r.data).catch(() => null)

            if (!search || !search.status || !search.results?.length) {
                return await socket.sendMessage(
                    sender,
                    { text: '*`No results found`*' },
                    { quoted: dtzminibot }
                )
            }

            videoUrl = search.results[0].url
        }

        const data = await axios.get(
            `https://delirius-apiofc.vercel.app/download/pornhub?url=${encodeURIComponent(videoUrl)}`
        ).then(r => r.data).catch(() => null)

        if (!data || !data.status) {
            return await socket.sendMessage(
                sender,
                { text: '*`Download failed`*' },
                { quoted: dtzminibot }
            )
        }

        const v480 = data.data.video.find(v => v.quality === '480')

        const desc = `*🔞 DTZ PORNHUB DOWNLOADER 🔞*

╭━━━━━━━━━━━━━━━━━━━━●◌
│ \`■ Title :\` ${data.data.title}
│ \`■ Quality :\` 480p
│ \`■ Size :\` ${v480.size}
╰━━━━━━━━━━━━━━━━━━━━●◌
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`

        const buttons = [
            {
                buttonId: `${config.PREFIX}phv ${videoUrl}`,
                buttonText: { displayText: 'VIDEO 🎥' },
                type: 1
            },
            {
                buttonId: `${config.PREFIX}phnote ${videoUrl}`,
                buttonText: { displayText: 'VIDEO NOTE 🎙️' },
                type: 1
            },
            {
                buttonId: `${config.PREFIX}phdoc ${videoUrl}`,
                buttonText: { displayText: 'DOCUMENT 📁' },
                type: 1
            }
        ]

        await socket.sendMessage(
            sender,
            {
                image: { url: data.data.image },
                caption: desc,
                headerType: 1,
                buttons,
                viewOnce: true
            },
            { quoted: dtzminibot }
        )

    } catch {
        await socket.sendMessage(
            sender,
            { text: '*`Error occurred`*' },
            { quoted: dtzminibot }
        )
    }
}
break


case 'phv': {
    try {
        const axios = require('axios')
        const url = args[0]
        if (!url) return

        const data = await axios.get(
            `https://delirius-apiofc.vercel.app/download/pornhub?url=${encodeURIComponent(url)}`
        ).then(r => r.data)

        const video = data.data.video.find(v => v.quality === '480')

        await socket.sendMessage(
            sender,
            {
                video: { url: video.download },
                mimetype: 'video/mp4',
                fileName: `${data.data.title}.mp4`
            },
            { quoted: dtzminibot }
        )

    } catch {
        await socket.sendMessage(sender, { text: '*Video error*' }, { quoted: dtzminibot })
    }
}
break


case 'phnote': {
    try {
        const axios = require('axios')
        const url = args[0]

        const data = await axios.get(
            `https://delirius-apiofc.vercel.app/download/pornhub?url=${encodeURIComponent(url)}`
        ).then(r => r.data)

        const video = data.data.video.find(v => v.quality === '480')

        await socket.sendMessage(
            sender,
            {
                video: { url: video.download },
                mimetype: 'video/mp4',
                ptv: true
            },
            { quoted: dtzminibot }
        )

    } catch {
        await socket.sendMessage(sender, { text: '*Video note error*' }, { quoted: dtzminibot })
    }
}
break


case 'phdoc': {
    try {
        const axios = require('axios')
        const url = args[0]

        const data = await axios.get(
            `https://delirius-apiofc.vercel.app/download/pornhub?url=${encodeURIComponent(url)}`
        ).then(r => r.data)

        const video = data.data.video.find(v => v.quality === '480')

        await socket.sendMessage(
            sender,
            {
                document: { url: video.download },
                mimetype: 'video/mp4',
                fileName: `${data.data.title}.mp4`
            },
            { quoted: dtzminibot }
        )

    } catch {
        await socket.sendMessage(sender, { text: '*Document error*' }, { quoted: dtzminibot })
    }
}

break

case 'gdrive':
case 'gdl':
case 'gdrivedl':
    await socket.sendMessage(sender, {
        react: {
            text: '🗂️',
            key: msg.key
        }
    });

    const gdriveQ = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || '';
    
    const gdriveQuery = gdriveQ.split(' ').slice(1).join(' ').trim();

    if (!gdriveQuery) {
        return await socket.sendMessage(sender, {
            text: "⚠️ Please provide a Google Drive link.\n\nExample: `.gdrive <link>`"
        }, { quoted: dtzminibot });
    }

    if (!gdriveQuery.includes("drive.google.com")) {
        return await socket.sendMessage(sender, {
            text: "*❌ Invalid Google Drive URL!*"
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        text: "⏳ *Fetching Google Drive file info...*"
    }, { quoted: dtzminibot });

    const gdriveApiUrl = `https://saviya-kolla-api.koyeb.app/download/gdrive?url=${encodeURIComponent(gdriveQuery)}`;
    const gdriveResponse = await axios.get(gdriveApiUrl);

    if (!gdriveResponse.data?.status || !gdriveResponse.data.result) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to fetch Google Drive file. Make sure it's a direct file link, not a folder."
        }, { quoted: dtzminibot });
    }

    const fileInfo = gdriveResponse.data.result;

    const gdriveDesc = `*📁 GOOGLE DRIVE DOWNLOADER*

•📄 𝗙𝗶𝗹𝗲 𝗡𝗮𝗺𝗲: ${fileInfo.name}
•💾 𝗦𝗶𝘇𝗲: ${fileInfo.size}
•🌐 𝗟𝗶𝗻𝗸: ${gdriveQuery}

⏳ *Downloading file...*

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;

    await socket.sendMessage(sender, {
        text: gdriveDesc,
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401720377971@newsletter',
                newsletterName: "ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌",
                serverMessageId: 143,
            },
        }
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        document: { 
            url: fileInfo.downloadLink
        },
        mimetype: fileInfo.mimeType || 'application/octet-stream',
        fileName: fileInfo.name,
        caption: `✅ *Download Complete!*\n\n📁 ${fileInfo.name}\n💾 ${fileInfo.size}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        react: {
            text: '✅',
            key: msg.key
        }
    });

    break;

case 'logo':
case 'logomenu': {
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    let buttonId = msg.message?.buttonsResponseMessage?.selectedButtonId;
    let logoQuery = '';

    if (buttonId) {
        const parts = buttonId.split(" ");
        const cmd = parts[0];
        logoQuery = parts.slice(1).join(" ").trim();

        if (!logoQuery) {
            return await socket.sendMessage(sender, {
                text: "❌ Invalid selection. Please try again."
            }, { quoted: dtzminibot });
        }

        if (!global.logoTextStore) global.logoTextStore = new Map();
        global.logoTextStore.set(sender, logoQuery);
    } else {
        const logoQ = msg.message?.conversation || 
                      msg.message?.extendedTextMessage?.text || 
                      msg.message?.imageMessage?.caption || 
                      msg.message?.videoMessage?.caption || '';

        logoQuery = logoQ.trim();

        if (logoQuery) {
            if (!global.logoTextStore) global.logoTextStore = new Map();
            global.logoTextStore.set(sender, logoQuery);
        }
    }

    if (!logoQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .logo Empire"
        }, { quoted: dtzminibot });
    }

    const storedText = global.logoTextStore?.get(sender) || logoQuery;

    const logoText = `*🎨 LOGO MAKER MENU 🎨*\n\n📝 Text: ${storedText}\n\n> © ᴘᴏᴡᴇʀᴇʀ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;

    await socket.sendMessage(sender, {
        interactiveMessage: {
            title: logoText,
            footer: `*© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`,
            thumbnail: "https://i.ibb.co/0VV8rBP5/tourl-1765852887627.jpg",
            nativeFlowMessage: {
                messageParamsJson: JSON.stringify({
                    bottom_sheet: {
                        in_thread_buttons_limit: 2,
                        list_title: "𝐋ᴏɢᴏ 𝐌ᴀᴋᴇʀ 𝐌ᴇɴᴜ",
                        button_title: "𝐒ᴇʟᴇᴄᴛ 𝐒ᴛʏʟᴇ"
                    }
                }),
                buttons: [
                    {
                        name: "single_select",
                        buttonParamsJson: JSON.stringify({
                            title: "Select Logo Style",
                            sections: [
                                {
                                    title: "🎬 Comic & Anime Styles",
                                    rows: [
                                        { header: "3D Comic", title: "3D Comic Style", description: "Create 3D comic text effect", id: `.3dcomic ${storedText}` },
                                        { header: "Dragon Ball", title: "Dragon Ball Style", description: "Dragon Ball text effect", id: `.dragonball ${storedText}` },
                                        { header: "Deadpool", title: "Deadpool Style", description: "Deadpool logo style", id: `.deadpool ${storedText}` },
                                        { header: "Naruto", title: "Naruto Style", description: "Naruto Shippuden style", id: `.naruto ${storedText}` }
                                    ]
                                },
                                {
                                    title: "💎 Premium & Luxury",
                                    rows: [
                                        { header: "BlackPink", title: "BlackPink Style", description: "BlackPink signature style", id: `.blackpink ${storedText}` },
                                        { header: "Luxury", title: "Luxury Style", description: "Floral luxury logo", id: `.luxury ${storedText}` },
                                        { header: "Angel Wings", title: "Angel Wings", description: "Angel wing effect", id: `.angelwings ${storedText}` },
                                        { header: "Devil Wings", title: "Devil Wings", description: "Neon devil wings", id: `.devilwings ${storedText}` }
                                    ]
                                },
                                {
                                    title: "💡 Neon & Light Effects",
                                    rows: [
                                        { header: "Neon Light", title: "Neon Light Style", description: "Colorful neon lights", id: `.neonlight ${storedText}` },
                                        { header: "Bulb", title: "Bulb Effect", description: "Incandescent bulbs", id: `.bulb ${storedText}` },
                                        { header: "Sunset", title: "Sunset Light", description: "Sunset light effect", id: `.sunset ${storedText}` }
                                    ]
                                },
                                {
                                    title: "🌟 Heroes & Characters",
                                    rows: [
                                        { header: "Thor", title: "Thor Logo Style", description: "Thor text effect", id: `.thor ${storedText}` },
                                        { header: "Hacker", title: "Hacker Style", description: "Anonymous hacker cyan", id: `.hacker ${storedText}` },
                                        { header: "Bear", title: "Bear Logo", description: "Free bear logo maker", id: `.bear ${storedText}` },
                                        { header: "Pornhub", title: "Pornhub Style", description: "Pornhub logo style", id: `.pornhublogo ${storedText}` }
                                    ]
                                },
                                {
                                    title: "🌍 Nature & Elements",
                                    rows: [
                                        { header: "Galaxy", title: "Galaxy Wallpaper", description: "Create galaxy wallpaper", id: `.galaxy ${storedText}` },
                                        { header: "Clouds", title: "Clouds in Sky", description: "Text in the clouds", id: `.clouds ${storedText}` },
                                        { header: "Sand", title: "Sand Writing", description: "Write in sand beach", id: `.sand ${storedText}` },
                                        { header: "Leaf", title: "Green Leaf", description: "Green brush effect", id: `.leaf ${storedText}` }
                                    ]
                                },
                                {
                                    title: "🎭 Special Effects",
                                    rows: [
                                        { header: "Sad Girl", title: "Sad Girl Effect", description: "Wet glass writing", id: `.sadgirl ${storedText}` },
                                        { header: "Cat", title: "Foggy Glass", description: "Handwritten foggy glass", id: `.cat ${storedText}` },
                                        { header: "Eraser", title: "Eraser Effect", description: "Eraser deleting text", id: `.eraser ${storedText}` },
                                        { header: "3D Paper", title: "3D Paper Cut", description: "Multicolor 3D paper", id: `.3dpaper ${storedText}` }
                                    ]
                                },
                                {
                                    title: "🎉 Celebrations & Others",
                                    rows: [
                                        { header: "Birthday", title: "Birthday Balloon", description: "3D foil balloon", id: `.birthday ${storedText}` },
                                        { header: "Frozen", title: "Frozen Christmas", description: "Frozen Christmas text", id: `.frozen ${storedText}` },
                                        { header: "Castle", title: "3D Castle", description: "3D castle pop out", id: `.castle ${storedText}` },
                                        { header: "Paint", title: "3D Paint", description: "3D colorful paint", id: `.paint ${storedText}` },
                                        { header: "Typography", title: "Typography", description: "Impressive leaves", id: `.typography ${storedText}` },
                                        { header: "Tatoo", title: "Tatoo Maker", description: "Make tattoos online", id: `.tatoo ${storedText}` },
                                        { header: "Tattoo", title: "Tattoo Maker", description: "Make tattoos online", id: `.tattoo ${storedText}` },
                                        { header: "Sans", title: "Sans Effect", description: "Stylish sans text", id: `.sans ${storedText}` },
                                        { header: "Zodiac", title: "Star Zodiac", description: "Create star zodiac", id: `.zodiac ${storedText}` },
                                        { header: "America", title: "American Flag", description: "3D American flag", id: `.america ${storedText}` },
                                        { header: "Nigeria", title: "Nigeria Flag", description: "Nigeria 3D flag", id: `.nigeria ${storedText}` }
                                    ]
                                }
                            ]
                        })
                    }                    
                ]
            }
        }
    }, { quoted: dtzminibot });

    break;
}
       
case '3dcomic':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const comic3dQ = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || 
                     msg.message?.imageMessage?.caption || 
                     msg.message?.videoMessage?.caption || '';
    
    const comic3dQuery = comic3dQ.split(' ').slice(1).join(' ').trim();

    if (!comic3dQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .3dcomic Empire"
        }, { quoted: dtzminibot });
    }

    const comic3dUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-online-3d-comic-style-text-effects-817.html&name=${encodeURIComponent(comic3dQuery)}`;
    const comic3dResponse = await axios.get(comic3dUrl);

    if (!comic3dResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: comic3dResponse.data.result.download_url },
        caption: `*3D COMIC TEXT EFFECT*\n\n📝 Text: ${comic3dQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'dragonball':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const dragonQ = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || '';
    
    const dragonQuery = dragonQ.split(' ').slice(1).join(' ').trim();

    if (!dragonQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .dragonball Empire"
        }, { quoted: dtzminibot });
    }

    const dragonUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html&name=${encodeURIComponent(dragonQuery)}`;
    const dragonResponse = await axios.get(dragonUrl);

    if (!dragonResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: dragonResponse.data.result.download_url },
        caption: `*DRAGON BALL TEXT EFFECT*\n\n📝 Text: ${dragonQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'deadpool':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const deadpoolQ = msg.message?.conversation || 
                      msg.message?.extendedTextMessage?.text || 
                      msg.message?.imageMessage?.caption || 
                      msg.message?.videoMessage?.caption || '';
    
    const deadpoolQuery = deadpoolQ.split(' ').slice(1).join(' ').trim();

    if (!deadpoolQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .deadpool Empire"
        }, { quoted: dtzminibot });
    }

    const deadpoolUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html&name=${encodeURIComponent(deadpoolQuery)}`;
    const deadpoolResponse = await axios.get(deadpoolUrl);

    if (!deadpoolResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: deadpoolResponse.data.result.download_url },
        caption: `*DEADPOOL TEXT EFFECT*\n\n📝 Text: ${deadpoolQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'blackpink':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const blackpinkQ = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text || 
                       msg.message?.imageMessage?.caption || 
                       msg.message?.videoMessage?.caption || '';
    
    const blackpinkQuery = blackpinkQ.split(' ').slice(1).join(' ').trim();

    if (!blackpinkQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .blackpink Empire"
        }, { quoted: dtzminibot });
    }

    const blackpinkUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html&name=${encodeURIComponent(blackpinkQuery)}`;
    const blackpinkResponse = await axios.get(blackpinkUrl);

    if (!blackpinkResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: blackpinkResponse.data.result.download_url },
        caption: `*BLACKPINK TEXT EFFECT*\n\n📝 Text: ${blackpinkQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'neonlight':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const neonQ = msg.message?.conversation || 
                  msg.message?.extendedTextMessage?.text || 
                  msg.message?.imageMessage?.caption || 
                  msg.message?.videoMessage?.caption || '';
    
    const neonQuery = neonQ.split(' ').slice(1).join(' ').trim();

    if (!neonQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .neonlight Empire"
        }, { quoted: dtzminibot });
    }

    const neonUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html&name=${encodeURIComponent(neonQuery)}`;
    const neonResponse = await axios.get(neonUrl);

    if (!neonResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: neonResponse.data.result.download_url },
        caption: `*NEON LIGHT TEXT EFFECT*\n\n📝 Text: ${neonQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'naruto':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const narutoQ = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || '';
    
    const narutoQuery = narutoQ.split(' ').slice(1).join(' ').trim();

    if (!narutoQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .naruto Empire"
        }, { quoted: dtzminibot });
    }

    const narutoUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html&name=${encodeURIComponent(narutoQuery)}`;
    const narutoResponse = await axios.get(narutoUrl);

    if (!narutoResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: narutoResponse.data.result.download_url },
        caption: `*NARUTO TEXT EFFECT*\n\n📝 Text: ${narutoQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'thor':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const thorQ = msg.message?.conversation || 
                  msg.message?.extendedTextMessage?.text || 
                  msg.message?.imageMessage?.caption || 
                  msg.message?.videoMessage?.caption || '';
    
    const thorQuery = thorQ.split(' ').slice(1).join(' ').trim();

    if (!thorQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .thor Empire"
        }, { quoted: dtzminibot });
    }

    const thorUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-thor-logo-style-text-effects-online-for-free-796.html&name=${encodeURIComponent(thorQuery)}`;
    const thorResponse = await axios.get(thorUrl);

    if (!thorResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: thorResponse.data.result.download_url },
        caption: `*THOR TEXT EFFECT*\n\n📝 Text: ${thorQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'galaxy':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const galaxyQ = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || '';
    
    const galaxyQuery = galaxyQ.split(' ').slice(1).join(' ').trim();

    if (!galaxyQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .galaxy Empire"
        }, { quoted: dtzminibot });
    }

    const galaxyUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html&name=${encodeURIComponent(galaxyQuery)}`;
    const galaxyResponse = await axios.get(galaxyUrl);

    if (!galaxyResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: galaxyResponse.data.result.download_url },
        caption: `*GALAXY TEXT EFFECT*\n\n📝 Text: ${galaxyQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'hacker':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const hackerQ = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || '';
    
    const hackerQuery = hackerQ.split(' ').slice(1).join(' ').trim();

    if (!hackerQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .hacker Empire"
        }, { quoted: dtzminibot });
    }

    const hackerUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html&name=${encodeURIComponent(hackerQuery)}`;
    const hackerResponse = await axios.get(hackerUrl);

    if (!hackerResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: hackerResponse.data.result.download_url },
        caption: `*HACKER TEXT EFFECT*\n\n📝 Text: ${hackerQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'pornhublogo':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const pornhubQ = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || 
                     msg.message?.imageMessage?.caption || 
                     msg.message?.videoMessage?.caption || '';
    
    const pornhubQuery = pornhubQ.split(' ').slice(1).join(' ').trim();

    if (!pornhubQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .pornhublogo Empire"
        }, { quoted: dtzminibot });
    }

    const pornhubUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-pornhub-style-logos-online-free-549.html&name=${encodeURIComponent(pornhubQuery)}`;
    const pornhubResponse = await axios.get(pornhubUrl);

    if (!pornhubResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: pornhubResponse.data.result.download_url },
        caption: `*PORNHUB TEXT EFFECT*\n\n📝 Text: ${pornhubQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'sadgirl':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const sadgirlQ = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || 
                     msg.message?.imageMessage?.caption || 
                     msg.message?.videoMessage?.caption || '';
    
    const sadgirlQuery = sadgirlQ.split(' ').slice(1).join(' ').trim();

    if (!sadgirlQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .sadgirl Empire"
        }, { quoted: dtzminibot });
    }

    const sadgirlUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-text-on-wet-glass-online-589.html&name=${encodeURIComponent(sadgirlQuery)}`;
    const sadgirlResponse = await axios.get(sadgirlUrl);

    if (!sadgirlResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: sadgirlResponse.data.result.download_url },
        caption: `*SAD GIRL TEXT EFFECT*\n\n📝 Text: ${sadgirlQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'cat':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const catQ = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 msg.message?.imageMessage?.caption || 
                 msg.message?.videoMessage?.caption || '';
    
    const catQuery = catQ.split(' ').slice(1).join(' ').trim();

    if (!catQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .cat Empire"
        }, { quoted: dtzminibot });
    }

    const catUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html&name=${encodeURIComponent(catQuery)}`;
    const catResponse = await axios.get(catUrl);

    if (!catResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: catResponse.data.result.download_url },
        caption: `*CAT TEXT EFFECT*\n\n📝 Text: ${catQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'america':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const americaQ = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || 
                     msg.message?.imageMessage?.caption || 
                     msg.message?.videoMessage?.caption || '';
    
    const americaQuery = americaQ.split(' ').slice(1).join(' ').trim();

    if (!americaQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .america Empire"
        }, { quoted: dtzminibot });
    }

    const americaUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html&name=${encodeURIComponent(americaQuery)}`;
    const americaResponse = await axios.get(americaUrl);

    if (!americaResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: americaResponse.data.result.download_url },
        caption: `*AMERICA TEXT EFFECT*\n\n📝 Text: ${americaQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'eraser':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const eraserQ = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || '';
    
    const eraserQuery = eraserQ.split(' ').slice(1).join(' ').trim();

    if (!eraserQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .eraser Empire"
        }, { quoted: dtzminibot });
    }

    const eraserUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html&name=${encodeURIComponent(eraserQuery)}`;
    const eraserResponse = await axios.get(eraserUrl);

    if (!eraserResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: eraserResponse.data.result.download_url },
        caption: `*ERASER TEXT EFFECT*\n\n📝 Text: ${eraserQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case '3dpaper':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const paper3dQ = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || 
                     msg.message?.imageMessage?.caption || 
                     msg.message?.videoMessage?.caption || '';
    
    const paper3dQuery = paper3dQ.split(' ').slice(1).join(' ').trim();

    if (!paper3dQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .3dpaper Empire"
        }, { quoted: dtzminibot });
    }

    const paper3dUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html&name=${encodeURIComponent(paper3dQuery)}`;
    const paper3dResponse = await axios.get(paper3dUrl);

    if (!paper3dResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: paper3dResponse.data.result.download_url },
        caption: `*3D PAPER TEXT EFFECT*\n\n📝 Text: ${paper3dQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'futuristic':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const futureQ = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || '';
    
    const futureQuery = futureQ.split(' ').slice(1).join(' ').trim();

    if (!futureQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .futuristic Empire"
        }, { quoted: dtzminibot });
    }

    const futureUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html&name=${encodeURIComponent(futureQuery)}`;
    const futureResponse = await axios.get(futureUrl);

    if (!futureResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: futureResponse.data.result.download_url },
        caption: `*FUTURISTIC TEXT EFFECT*\n\n📝 Text: ${futureQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'clouds':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const cloudsQ = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || '';
    
    const cloudsQuery = cloudsQ.split(' ').slice(1).join(' ').trim();

    if (!cloudsQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .clouds Empire"
        }, { quoted: dtzminibot });
    }

    const cloudsUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html&name=${encodeURIComponent(cloudsQuery)}`;
    const cloudsResponse = await axios.get(cloudsUrl);

    if (!cloudsResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: cloudsResponse.data.result.download_url },
        caption: `*CLOUDS TEXT EFFECT*\n\n📝 Text: ${cloudsQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'sand':
case 'sans':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const sandQ = msg.message?.conversation || 
                  msg.message?.extendedTextMessage?.text || 
                  msg.message?.imageMessage?.caption || 
                  msg.message?.videoMessage?.caption || '';
    
    const sandQuery = sandQ.split(' ').slice(1).join(' ').trim();

    if (!sandQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .sand Empire"
        }, { quoted: dtzminibot });
    }

    const sandUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html&name=${encodeURIComponent(sandQuery)}`;
    const sandResponse = await axios.get(sandUrl);

    if (!sandResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: sandResponse.data.result.download_url },
        caption: `*SAND TEXT EFFECT*\n\n📝 Text: ${sandQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'leaf':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const leafQ = msg.message?.conversation || 
                  msg.message?.extendedTextMessage?.text || 
                  msg.message?.imageMessage?.caption || 
                  msg.message?.videoMessage?.caption || '';
    
    const leafQuery = leafQ.split(' ').slice(1).join(' ').trim();

    if (!leafQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .leaf Empire"
        }, { quoted: dtzminibot });
    }

    const leafUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html&name=${encodeURIComponent(leafQuery)}`;
    const leafResponse = await axios.get(leafUrl);

    if (!leafResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: leafResponse.data.result.download_url },
        caption: `*LEAF TEXT EFFECT*\n\n📝 Text: ${leafQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'sunset':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const sunsetQ = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || '';
    
    const sunsetQuery = sunsetQ.split(' ').slice(1).join(' ').trim();

    if (!sunsetQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .sunset Empire"
        }, { quoted: dtzminibot });
    }

    const sunsetUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-sunset-light-text-effects-online-807.html&name=${encodeURIComponent(sunsetQuery)}`;
    const sunsetResponse = await axios.get(sunsetUrl);

    if (!sunsetResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: sunsetResponse.data.result.download_url },
        caption: `*SUNSET TEXT EFFECT*\n\n📝 Text: ${sunsetQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'nigeria':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const nigeriaQ = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || 
                     msg.message?.imageMessage?.caption || 
                     msg.message?.videoMessage?.caption || '';
    
    const nigeriaQuery = nigeriaQ.split(' ').slice(1).join(' ').trim();

    if (!nigeriaQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .nigeria Empire"
        }, { quoted: dtzminibot });
    }

    const nigeriaUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html&name=${encodeURIComponent(nigeriaQuery)}`;
    const nigeriaResponse = await axios.get(nigeriaUrl);

    if (!nigeriaResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: nigeriaResponse.data.result.download_url },
        caption: `*NIGERIA TEXT EFFECT*\n\n📝 Text: ${nigeriaQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'devilwings':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const devilQ = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text || 
                   msg.message?.imageMessage?.caption || 
                   msg.message?.videoMessage?.caption || '';
    
    const devilQuery = devilQ.split(' ').slice(1).join(' ').trim();

    if (!devilQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .devilwings Empire"
        }, { quoted: dtzminibot });
    }

    const devilUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html&name=${encodeURIComponent(devilQuery)}`;
    const devilResponse = await axios.get(devilUrl);

    if (!devilResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: devilResponse.data.result.download_url },
        caption: `*DEVIL WINGS TEXT EFFECT*\n\n📝 Text: ${devilQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'boom':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const boomQ = msg.message?.conversation || 
                  msg.message?.extendedTextMessage?.text || 
                  msg.message?.imageMessage?.caption || 
                  msg.message?.videoMessage?.caption || '';
    
    const boomQuery = boomQ.split(' ').slice(1).join(' ').trim();

    if (!boomQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .boom Empire"
        }, { quoted: dtzminibot });
    }

    const boomUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/boom-text-comic-style-text-effect-675.html&name=${encodeURIComponent(boomQuery)}`;
    const boomResponse = await axios.get(boomUrl);

    if (!boomResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: boomResponse.data.result.download_url },
        caption: `*BOOM TEXT EFFECT*\n\n📝 Text: ${boomQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'luxury':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const luxuryQ = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || '';
    
    const luxuryQuery = luxuryQ.split(' ').slice(1).join(' ').trim();

    if (!luxuryQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .luxury Empire"
        }, { quoted: dtzminibot });
    }

    const luxuryUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/floral-luxury-logo-collection-for-branding-616.html&name=${encodeURIComponent(luxuryQuery)}`;
    const luxuryResponse = await axios.get(luxuryUrl);

    if (!luxuryResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: luxuryResponse.data.result.download_url },
        caption: `*LUXURY TEXT EFFECT*\n\n📝 Text: ${luxuryQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'zodiac':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const zodiacQ = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || '';
    
    const zodiacQuery = zodiacQ.split(' ').slice(1).join(' ').trim();

    if (!zodiacQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .zodiac Empire"
        }, { quoted: dtzminibot });
    }

    const zodiacUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-star-zodiac-wallpaper-mobile-604.html&name=${encodeURIComponent(zodiacQuery)}`;
    const zodiacResponse = await axios.get(zodiacUrl);

    if (!zodiacResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: zodiacResponse.data.result.download_url },
        caption: `*ZODIAC TEXT EFFECT*\n\n📝 Text: ${zodiacQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'angelwings':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const angelQ = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text || 
                   msg.message?.imageMessage?.caption || 
                   msg.message?.videoMessage?.caption || '';
    
    const angelQuery = angelQ.split(' ').slice(1).join(' ').trim();

    if (!angelQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .angelwings Empire"
        }, { quoted: dtzminibot });
    }

    const angelUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/angel-wing-effect-329.html&name=${encodeURIComponent(angelQuery)}`;
    const angelResponse = await axios.get(angelUrl);

    if (!angelResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: angelResponse.data.result.download_url },
        caption: `*ANGEL WINGS TEXT EFFECT*\n\n📝 Text: ${angelQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'bulb':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const bulbQ = msg.message?.conversation || 
                  msg.message?.extendedTextMessage?.text || 
                  msg.message?.imageMessage?.caption || 
                  msg.message?.videoMessage?.caption || '';
    
    const bulbQuery = bulbQ.split(' ').slice(1).join(' ').trim();

    if (!bulbQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .bulb Empire"
        }, { quoted: dtzminibot });
    }

    const bulbUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/text-effects-incandescent-bulbs-219.html&name=${encodeURIComponent(bulbQuery)}`;
    const bulbResponse = await axios.get(bulbUrl);

    if (!bulbResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: bulbResponse.data.result.download_url },
        caption: `*BULB TEXT EFFECT*\n\n📝 Text: ${bulbQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'tatoo':
case 'tattoo':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const tatooQ = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text || 
                   msg.message?.imageMessage?.caption || 
                   msg.message?.videoMessage?.caption || '';
    
    const tatooQuery = tatooQ.split(' ').slice(1).join(' ').trim();

    if (!tatooQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .tatoo Empire"
        }, { quoted: dtzminibot });
    }

    const tatooUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/make-tattoos-online-by-empire-tech-309.html&name=${encodeURIComponent(tatooQuery)}`;
    const tatooResponse = await axios.get(tatooUrl);

    if (!tatooResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: tatooResponse.data.result.download_url },
        caption: `*TATTOO TEXT EFFECT*\n\n📝 Text: ${tatooQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'castle':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const castleQ = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || '';
    
    const castleQuery = castleQ.split(' ').slice(1).join(' ').trim();

    if (!castleQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .castle Empire"
        }, { quoted: dtzminibot });
    }

    const castleUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-3d-castle-pop-out-mobile-photo-effect-786.html&name=${encodeURIComponent(castleQuery)}`;
    const castleResponse = await axios.get(castleUrl);

    if (!castleResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: castleResponse.data.result.download_url },
        caption: `*CASTLE TEXT EFFECT*\n\n📝 Text: ${castleQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'frozen':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const frozenQ = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || '';
    
    const frozenQuery = frozenQ.split(' ').slice(1).join(' ').trim();

    if (!frozenQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .frozen Empire"
        }, { quoted: dtzminibot });
    }

    const frozenUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-frozen-christmas-text-effect-online-792.html&name=${encodeURIComponent(frozenQuery)}`;
    const frozenResponse = await axios.get(frozenUrl);

    if (!frozenResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: frozenResponse.data.result.download_url },
        caption: `*FROZEN TEXT EFFECT*\n\n📝 Text: ${frozenQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'paint':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const paintQ = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text || 
                   msg.message?.imageMessage?.caption || 
                   msg.message?.videoMessage?.caption || '';
    
    const paintQuery = paintQ.split(' ').slice(1).join(' ').trim();

    if (!paintQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .paint Empire"
        }, { quoted: dtzminibot });
    }

    const paintUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html&name=${encodeURIComponent(paintQuery)}`;
    const paintResponse = await axios.get(paintUrl);

    if (!paintResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: paintResponse.data.result.download_url },
        caption: `*PAINT TEXT EFFECT*\n\n📝 Text: ${paintQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'birthday':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const birthdayQ = msg.message?.conversation || 
                      msg.message?.extendedTextMessage?.text || 
                      msg.message?.imageMessage?.caption || 
                      msg.message?.videoMessage?.caption || '';
    
    const birthdayQuery = birthdayQ.split(' ').slice(1).join(' ').trim();

    if (!birthdayQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .birthday Empire"
        }, { quoted: dtzminibot });
    }

    const birthdayUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/beautiful-3d-foil-balloon-effects-for-holidays-and-birthday-803.html&name=${encodeURIComponent(birthdayQuery)}`;
    const birthdayResponse = await axios.get(birthdayUrl);

    if (!birthdayResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: birthdayResponse.data.result.download_url },
        caption: `*BIRTHDAY TEXT EFFECT*\n\n📝 Text: ${birthdayQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'typography':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const typoQ = msg.message?.conversation || 
                  msg.message?.extendedTextMessage?.text || 
                  msg.message?.imageMessage?.caption || 
                  msg.message?.videoMessage?.caption || '';
    
    const typoQuery = typoQ.split(' ').slice(1).join(' ').trim();

    if (!typoQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .typography Empire"
        }, { quoted: dtzminibot });
    }

    const typoUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-typography-status-online-with-impressive-leaves-357.html&name=${encodeURIComponent(typoQuery)}`;
    const typoResponse = await axios.get(typoUrl);

    if (!typoResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: typoResponse.data.result.download_url },
        caption: `*TYPOGRAPHY TEXT EFFECT*\n\n📝 Text: ${typoQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'bear':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const bearQ = msg.message?.conversation || 
                  msg.message?.extendedTextMessage?.text || 
                  msg.message?.imageMessage?.caption || 
                  msg.message?.videoMessage?.caption || '';
    
    const bearQuery = bearQ.split(' ').slice(1).join(' ').trim();

    if (!bearQuery) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide a name.\n\nExample: .bear Empire"
        }, { quoted: dtzminibot });
    }

    const bearUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-bear-logo-maker-online-673.html&name=${encodeURIComponent(bearQuery)}`;
    const bearResponse = await axios.get(bearUrl);

    if (!bearResponse?.data?.result?.download_url) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to create logo. Please try again."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        image: { url: bearResponse.data.result.download_url },
        caption: `*BEAR TEXT EFFECT*\n\n📝 Text: ${bearQuery}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'valorant':
    await socket.sendMessage(sender, {
        react: { text: '🎨', key: msg.key }
    });

    const valorantQ = msg.message?.conversation || 
                      msg.message?.extendedTextMessage?.text || 
                      msg.message?.imageMessage?.caption || 
                      msg.message?.videoMessage?.caption || '';
    
    const valorantArgs = valorantQ.split(' ').slice(1);

    if (valorantArgs.length < 3) {
        return await socket.sendMessage(sender, {
            text: "❌ Please provide 3 text inputs.\n\nExample: .valorant Text1 Text2 Text3"
        }, { quoted: dtzminibot });
    }

    const text1 = valorantArgs[0];
    const text2 = valorantArgs[1];
    const text3 = valorantArgs.slice(2).join(" ");

    const valorantUrl = `https://api.nexoracle.com/ephoto360/valorant-youtube-banner?apikey=MepwBcqIM0jYN0okD&text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}&text3=${encodeURIComponent(text3)}`;

    const valorantResponse = await axios.get(valorantUrl, { responseType: 'arraybuffer' });
    const valorantBuffer = Buffer.from(valorantResponse.data, 'binary');

    await socket.sendMessage(sender, {
        image: valorantBuffer,
        caption: `*VALORANT YOUTUBE BANNER*\n\n📝 Text1: ${text1}\n📝 Text2: ${text2}\n📝 Text3: ${text3}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    break;

case 'ai2':
case 'chatbot2':
    await socket.sendMessage(sender, {
        react: {
            text: '👾',
            key: msg.key
        }
    });

    const ai2Q = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 msg.message?.imageMessage?.caption || 
                 msg.message?.videoMessage?.caption || '';
    
    const ai2Query = ai2Q.split(' ').slice(1).join(' ').trim();

    if (!ai2Query) {
        return await socket.sendMessage(sender, {
            text: "❗ Please enter the query\n\nExample: .ai2 What is AI?"
        }, { quoted: dtzminibot });
    }

    const ai2Response = await axios.get(`https://apis.davidcyriltech.my.id/ai/chatbot?query=${ai2Query}`);

    await socket.sendMessage(sender, {
        text: `${ai2Response.data.result}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`,
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401720377971@newsletter',
                newsletterName: "ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌",
                serverMessageId: 143,
            },
        }
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        react: {
            text: '✅',
            key: msg.key
        }
    });

    break;

case 'llama':
case 'llama3':
    await socket.sendMessage(sender, {
        react: {
            text: '👾',
            key: msg.key
        }
    });

    const llamaQ = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text || 
                   msg.message?.imageMessage?.caption || 
                   msg.message?.videoMessage?.caption || '';
    
    const llamaQuery = llamaQ.split(' ').slice(1).join(' ').trim();

    if (!llamaQuery) {
        return await socket.sendMessage(sender, {
            text: "❗ Please enter the query\n\nExample: .llama Explain quantum physics"
        }, { quoted: dtzminibot });
    }

    const llamaResponse = await axios.get(`https://apis.davidcyriltech.my.id/ai/llama3?text=${llamaQuery}`);

    await socket.sendMessage(sender, {
        text: `${llamaResponse.data.message}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`,
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401720377971@newsletter',
                newsletterName: "ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌",
                serverMessageId: 143,
            },
        }
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        react: {
            text: '✅',
            key: msg.key
        }
    });

    break;

case 'weather':
case 'wea':
    await socket.sendMessage(sender, {
        react: {
            text: '❄️',
            key: msg.key
        }
    });

    const weatherQ = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || 
                     msg.message?.imageMessage?.caption || 
                     msg.message?.videoMessage?.caption || '';
    
    const weatherQuery = weatherQ.split(' ').slice(1).join(' ').trim();

    if (!weatherQuery) {
        return await socket.sendMessage(sender, {
            text: "❗ Please enter the City Name\n\nExample: .weather London"
        }, { quoted: dtzminibot });
    }

    const weatherResponse = await axios.get(`https://apis.davidcyriltech.my.id/weather?city=${weatherQuery}`);
    const weatherInfo = weatherResponse.data.data;

    const weatherCaption = `🌍 *Weather Information*

📍 *Location:* ${weatherInfo.location}, ${weatherInfo.country}
🌦️ *Weather:* ${weatherInfo.weather} (${weatherInfo.description})
🌡️ *Temperature:* ${weatherInfo.temperature}
🤗 *Feels Like:* ${weatherInfo.feels_like}
💧 *Humidity:* ${weatherInfo.humidity}
🔽 *Pressure:* ${weatherInfo.pressure}
🍃 *Wind Speed:* ${weatherInfo.wind_speed}
📍 *Coordinates:* [${weatherInfo.coordinates.latitude}, ${weatherInfo.coordinates.longitude}]

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;

    await socket.sendMessage(sender, {
        text: weatherCaption,
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401720377971@newsletter',
                newsletterName: "ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌",
                serverMessageId: 143,
            },
        }
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        react: {
            text: '✅',
            key: msg.key
        }
    });

    break;

case 'cal':
case 'calculate':
case 'calc':
    await socket.sendMessage(sender, {
        react: {
            text: '🧮',
            key: msg.key
        }
    });

    const calQ = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 msg.message?.imageMessage?.caption || 
                 msg.message?.videoMessage?.caption || '';
    
    const calQuery = calQ.split(' ').slice(1).join(' ').trim();

    if (!calQuery) {
        return await socket.sendMessage(sender, {
            text: "❗ Please enter the calculation query\n\nExample: .cal 5+2 or .cal 10*3"
        }, { quoted: dtzminibot });
    }

    const calResponse = await axios.get(`https://apis.davidcyriltech.my.id/tools/calculate?expr=${encodeURIComponent(calQuery)}`);

    if (!calResponse.data.success) {
        return await socket.sendMessage(sender, {
            text: "❌ Calculation failed. Please check your input"
        }, { quoted: dtzminibot });
    }

    const calCaption = `🧮 *Calculation Result* 🧮

📝 *Expression*: ${calResponse.data.expression || calQuery}
🔢 *Result*: ${calResponse.data.result}

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;

    await socket.sendMessage(sender, {
        text: calCaption,
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401720377971@newsletter',
                newsletterName: "ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌",
                serverMessageId: 143,
            },
        }
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        react: {
            text: '✅',
            key: msg.key
        }
    });

    break;

case 'gpt':
case 'gpt4':
    await socket.sendMessage(sender, {
        react: {
            text: '👾',
            key: msg.key
        }
    });

    const gptQ = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 msg.message?.imageMessage?.caption || 
                 msg.message?.videoMessage?.caption || '';
    
    const gptQuery = gptQ.split(' ').slice(1).join(' ').trim();

    if (!gptQuery) {
        return await socket.sendMessage(sender, {
            text: "❗ Please enter the query\n\nExample: .gpt Write a poem about nature"
        }, { quoted: dtzminibot });
    }

    const gptResponse = await axios.get(`https://apis.davidcyriltech.my.id/ai/gpt4?text=${gptQuery}`);

    await socket.sendMessage(sender, {
        text: `${gptResponse.data.message}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`,
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401720377971@newsletter',
                newsletterName: "ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌",
                serverMessageId: 143,
            },
        }
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        react: {
            text: '✅',
            key: msg.key
        }
    });

    break;

case 'Broadchat':
case 'bc':
    await socket.sendMessage(sender, {
        react: {
            text: '📤',
            key: msg.key
        }
    });

    if (!isGroup) {
        return await socket.sendMessage(sender, {
            text: "❌ This command only works in groups."
        }, { quoted: dtzminibot });
    }

    const sendallQ = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || 
                     msg.message?.imageMessage?.caption || 
                     msg.message?.videoMessage?.caption || '';
    
    const sendallQuery = sendallQ.split(' ').slice(1).join(' ').trim();

    if (!sendallQuery) {
        return await socket.sendMessage(sender, {
            text: "*Please provide a message to send...*\n\nExample: `.sendall Hello everyone!`"
        }, { quoted: dtzminibot });
    }

    const broadcastMessage = sendallQuery;
    const groupParticipants = groupMetadata.participants;

    await socket.sendMessage(sender, {
        text: `*Sending your message to ${groupParticipants.length - 1} members... 📤*`
    }, { quoted: dtzminibot });

    let successfulSends = 0;

    for (const participant of groupParticipants) {
        const participantId = participant.id;

        if (participantId.includes(botNumber)) {
            continue;
        }

        await socket.sendMessage(participantId, {
            text: `📢 *Group Broadcast Message :*\n\n${broadcastMessage}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
        });
        successfulSends++;
    }

    await socket.sendMessage(sender, {
        text: `*Message sent to ${successfulSends} members... 🧑‍💻*`
    }, { quoted: dtzminibot });

    break;

case 'forward':
case 'fo':
    await socket.sendMessage(sender, {
        react: {
            text: '📤',
            key: msg.key
        }
    });

    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: "*Owner Only ❌*"
        }, { quoted: dtzminibot });
    }

    const forwardQ = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || 
                     msg.message?.imageMessage?.caption || 
                     msg.message?.videoMessage?.caption || '';
    
    const forwardQuery = forwardQ.split(' ').slice(1).join(' ').trim();
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!forwardQuery || !quotedMsg) {
        return await socket.sendMessage(sender, {
            text: "*Provide the message and JID(s) ❌*\n\nExample: `.forward 94xxxxxxxxx@s.whatsapp.net, 94yyyyyyyyy@s.whatsapp.net`"
        }, { quoted: dtzminibot });
    }

    let jidList = forwardQuery.split(",").map((jid) => jid.trim());
    
    if (jidList.length === 0) {
        return await socket.sendMessage(sender, {
            text: "*Provide at least one valid JID ❌*"
        }, { quoted: dtzminibot });
    }

    let forwardedTo = [];
    
    for (let jid of jidList) {
        await socket.sendMessage(jid, { forward: { key: { remoteJid: sender, fromMe: false, id: msg.message.extendedTextMessage.contextInfo.stanzaId }, message: quotedMsg } });
        forwardedTo.push(jid);
    }

    if (forwardedTo.length > 0) {
        await socket.sendMessage(sender, {
            text: "*Message successfully forwarded to:*\n\n" + forwardedTo.join("\n") + "\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ"
        }, { quoted: dtzminibot });
    } else {
        await socket.sendMessage(sender, {
            text: "*Failed to forward to all provided JIDs ❌*"
        }, { quoted: dtzminibot });
    }

    break;
    
case 'mediafire':
case 'mf':
case 'mfdl':
    await socket.sendMessage(sender, {
        react: {
            text: '📥',
            key: msg.key
        }
    });

    const mfQ = msg.message?.conversation || 
                msg.message?.extendedTextMessage?.text || 
                msg.message?.imageMessage?.caption || 
                msg.message?.videoMessage?.caption || '';
    
    const mfQuery = mfQ.split(' ').slice(1).join(' ').trim();

    if (!mfQuery) {
        return await socket.sendMessage(sender, {
            text: '🚫 *Please send a MediaFire link.*\n\nExample: .mediafire <url>'
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        text: '*⏳ Fetching MediaFire file info...*'
    }, { quoted: dtzminibot });

    const mfApi = `https://tharuzz-ofc-apis.vercel.app/api/download/mediafire?url=${encodeURIComponent(mfQuery)}`;
    const mfResponse = await axios.get(mfApi);
    const mfData = mfResponse.data;

    if (!mfData.success || !mfData.result) {
        return await socket.sendMessage(sender, {
            text: '❌ *Failed to fetch MediaFire file.*'
        }, { quoted: dtzminibot });
    }

    const mfResult = mfData.result;
    const mfTitle = mfResult.title || mfResult.filename;
    const mfFilename = mfResult.filename;
    const mfFileSize = mfResult.size;
    const mfDownloadUrl = mfResult.url;

    const mfCaption = `📦 *${mfTitle}*

📁 *Filename:* ${mfFilename}
📏 *Size:* ${mfFileSize}
🌐 *From:* ${mfResult.from}
📅 *Date:* ${mfResult.date}
🕑 *Time:* ${mfResult.time}

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;

    await socket.sendMessage(sender, {
        document: { url: mfDownloadUrl },
        fileName: mfFilename,
        mimetype: 'application/octet-stream',
        caption: mfCaption
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        react: {
            text: '✅',
            key: msg.key
        }
    });

    break;

case 'google':
case 'gsearch':
case 'search':
    await socket.sendMessage(sender, {
        react: {
            text: '🔍',
            key: msg.key
        }
    });

    const googleQ = msg.message?.conversation || 
                    msg.message?.extendedTextMessage?.text || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || '';
    
    const googleQuery = googleQ.split(' ').slice(1).join(' ').trim();

    if (!googleQuery) {
        return await socket.sendMessage(sender, {
            text: '⚠️ *Please provide a search query.*\n\n*Example:*\n.google how to code in javascript'
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        text: `🔎 Searching for: *${googleQuery}*`
    }, { quoted: dtzminibot });

    const apiKey = "AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI";
    const cx = "baf9bdb0c631236e5";
    const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(googleQuery)}&key=${apiKey}&cx=${cx}`;

    const googleResponse = await axios.get(apiUrl);

    if (googleResponse.status !== 200 || !googleResponse.data.items || googleResponse.data.items.length === 0) {
        return await socket.sendMessage(sender, {
            text: `⚠️ *No results found for:* ${googleQuery}`
        }, { quoted: dtzminibot });
    }

    let results = `🔍 *Google Search Results for:* "${googleQuery}"\n\n`;
    
    googleResponse.data.items.slice(0, 5).forEach((item, index) => {
        results += `*${index + 1}. ${item.title}*\n\n🔗 ${item.link}\n\n📝 ${item.snippet}\n\n`;
    });

    results += `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;

    const firstResult = googleResponse.data.items[0];
    const thumbnailUrl = firstResult.pagemap?.cse_image?.[0]?.src || 
                        firstResult.pagemap?.cse_thumbnail?.[0]?.src || 
                        'https://via.placeholder.com/150';

    await socket.sendMessage(sender, {
        image: { url: thumbnailUrl },
        caption: results.trim(),
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401720377971@newsletter',
                newsletterName: "ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌",
                serverMessageId: 143,
            },
        }
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        react: {
            text: '✅',
            key: msg.key
        }
    });

    break;

case 'cid':
case 'cinfo':
case 'channelinfo':
    await socket.sendMessage(sender, {
        react: {
            text: '📡',
            key: msg.key
        }
    });

    const cidQ = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text ||
                 msg.message?.imageMessage?.caption ||
                 msg.message?.videoMessage?.caption || '';

    const cidQuery = cidQ.replace(/^[.\/!](cid|cinfo|channelinfo)\s*/i, '').trim();

    if (!cidQuery) {
        return await socket.sendMessage(sender, {
            text: '❎ Please provide a WhatsApp Channel link.\n\n📌 *Example:* .cid https://whatsapp.com/channel/123456789'
        }, { quoted: dtzminibot });
    }

    const channelMatch = cidQuery.match(/whatsapp\.com\/channel\/([\w-]+)/);
    if (!channelMatch) {
        return await socket.sendMessage(sender, {
            text: '⚠️ *Invalid channel link format.*\n\nMake sure it looks like:\nhttps://whatsapp.com/channel/xxxxxxxxx'
        }, { quoted: dtzminibot });
    }

    const inviteId = channelMatch[1];

    const metadata = await socket.newsletterMetadata("invite", inviteId);

    if (!metadata || !metadata.id) {
        return await socket.sendMessage(sender, {
            text: '❌ Channel not found or inaccessible.\n\nPossible reasons:\n• Invalid invite link\n• Channel deleted\n• Channel is private\n• Bot doesn\'t have access'
        }, { quoted: dtzminibot });
    }

    const infoText = `*_DTZ MINI BOT CHANNEL INFO_*

■ *Cʜᴀɴɴᴇʟ Iᴅ :* ${metadata.id}
■ *Cʜᴀɴɴᴇʟ Nᴀᴍᴇ :* ${metadata.name}
■ *Cʜᴀɴɴᴇʟ Fᴏʟʟᴏᴡᴇʀꜱ :* ${metadata.subscribers?.toLocaleString() || 'N/A'}
■ *Cʜᴀɴɴᴇʟ Cʀᴇᴀᴛᴇᴅ Oɴ:* ${metadata.creation_time ? new Date(metadata.creation_time * 1000).toLocaleString("en-US") : 'Unknown'}

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`;

    if (metadata.preview) {
        const previewUrl = metadata.preview.startsWith('http') 
            ? metadata.preview 
            : `https://pps.whatsapp.net${metadata.preview}`;
        
        await socket.sendMessage(sender, {
            image: { url: previewUrl },
            caption: infoText
        }, { quoted: dtzminibot });
    } else {
        await socket.sendMessage(sender, {
            text: infoText
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        react: {
            text: '✅',
            key: msg.key
        }
    });

    break;
    
case 'ss':
case 'ssweb':
    await socket.sendMessage(sender, {
        react: {
            text: '💫',
            key: msg.key
        }
    });

    const ssQ = msg.message?.conversation || 
                msg.message?.extendedTextMessage?.text || 
                msg.message?.imageMessage?.caption || 
                msg.message?.videoMessage?.caption || '';
    
    const ssQuery = ssQ.split(' ').slice(1).join(' ').trim();

    if (!ssQuery) {
        return await socket.sendMessage(sender, {
            text: "Please provide a URL to capture a screenshot.\n\nExample: `.ss https://google.com`"
        }, { quoted: dtzminibot });
    }

    const ssResponse = await axios.get(`https://api.davidcyriltech.my.id/ssweb?url=${encodeURIComponent(ssQuery)}`);
    
    if (!ssResponse.data || !ssResponse.data.screenshotUrl) {
        return await socket.sendMessage(sender, {
            text: "❌ Failed to capture screenshot. Please check the URL and try again."
        }, { quoted: dtzminibot });
    }

    const screenshotUrl = ssResponse.data.screenshotUrl;

    const imageMessage = {
        image: { url: screenshotUrl },
        caption: "*WEB SS DOWNLOADER*\n\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ*",
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363401720377971@newsletter',
                newsletterName: "ᴅᴛᴢ ᴍɪɴɪ ʙᴏᴛ ᴠ3 📌",
                serverMessageId: 143,
            },
        },
    };

    await socket.sendMessage(sender, imageMessage, { quoted: dtzminibot });
    
    break;

case 'ai':
    await socket.sendMessage(sender, {
        react: {
            text: '🤖',
            key: msg.key
        }
    });

    const aiQ = msg.message?.conversation || 
                msg.message?.extendedTextMessage?.text || 
                msg.message?.imageMessage?.caption || 
                msg.message?.videoMessage?.caption || '';
    
    const aiQuery = aiQ.split(' ').slice(1).join(' ').trim();

    if (!aiQuery) {
        return await socket.sendMessage(sender, {
            text: "_Please provide a message for the AI.\nExample: `.ai Hello`_"
        }, { quoted: dtzminibot });
    }

    const aiApiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(aiQuery)}`;
    const aiResponse = await axios.get(aiApiUrl);

    if (!aiResponse.data || !aiResponse.data.message) {
        await socket.sendMessage(sender, {
            react: {
                text: '❌',
                key: msg.key
            }
        });
        return await socket.sendMessage(sender, {
            text: "AI failed to respond. Please try again later."
        }, { quoted: dtzminibot });
    }

    await socket.sendMessage(sender, {
        text: `🤖 *AI Response:*\n\n${aiResponse.data.message}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ`
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        react: {
            text: '✅',
            key: msg.key
        }
    });
    
    break;
    
case 'animeimg1':
    await socket.sendMessage(sender, {
        react: {
            text: '🧚‍♀️',
            key: msg.key
        }
    });
    
    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/aD7t0Bc.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/PQO5wPN.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/5At1P4A.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/MjtH3Ha.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/QQW7VKy.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    break;

case 'animeimg2':
    await socket.sendMessage(sender, {
        react: {
            text: '🧚‍♀️',
            key: msg.key
        }
    });
    
    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/0r1Bn88.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/2Xdpuov.png` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/0hx-3AP.png` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/q054x0_.png` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/4lyqRvd.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    break;

case 'animeimg3':
    await socket.sendMessage(sender, {
        react: {
            text: '🧚‍♀️',
            key: msg.key
        }
    });
    
    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/gnpc_Lr.jpeg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/P6X-ph6.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/~p5W9~k.png` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/7Apu5C9.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/OTRfON6.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    break;

case 'animeimg4':
    await socket.sendMessage(sender, {
        react: {
            text: '🧚‍♀️',
            key: msg.key
        }
    });
    
    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/aGgUm80.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/i~RQhRD.png` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/94LH-aU.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/V8hvqfK.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/lMiXE7j.png` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    break;

case 'animeimg5':
    await socket.sendMessage(sender, {
        react: {
            text: '🧚‍♀️',
            key: msg.key
        }
    });
    
    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/-ABlAvr.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/HNEg0-Q.png` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/3x~ovC6.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/brv-GJu.jpg` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    await socket.sendMessage(sender, {
        image: { url: `https://i.waifu.pics/FWE8ggD.png` },
        caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'
    }, { quoted: dtzminibot });

    break;

case 'yts':
case 'ytsearch': {
    const yts = require('yt-search');

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || 
              msg.message?.imageMessage?.caption || 
              msg.message?.videoMessage?.caption || '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide a search query!* \n📋 Example: .yts Believer' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🔍', key: msg.key } });

        const search = await yts(q.trim());
        const videos = search.videos.slice(0, 10);

        if (videos.length === 0) {
            return await socket.sendMessage(sender, { text: '*❌ No results found!*' });
        }

        let resultText = `*🎥 YOUTUBE SEARCH RESULTS*\n\n`;
        resultText += `*Search Query:* ${q.trim()}\n`;
        resultText += `*Results Found:* ${videos.length}\n\n`;
        resultText += `*╭───────────────────────*\n`;

        videos.forEach((video, index) => {
            resultText += `*${index + 1}.* ${video.title}\n`;
            resultText += `*├ Duration:* ${video.timestamp}\n`;
            resultText += `*├ Views:* ${video.views}\n`;
            resultText += `*├ Uploaded:* ${video.ago}\n`;
            resultText += `*├ Channel:* ${video.author.name}\n`;
            resultText += `*└ URL:* ${video.url}\n\n`;
        });

        resultText += `*╰───────────────────────*\n\n`;
        resultText += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { 
            text: resultText 
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('YT Search Error:', err);
        await socket.sendMessage(sender, { 
            text: `*⚠️ Search failed!* \n🔄 Details: ${err.message}` 
        });
        await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } });
    }
    break;
}

case 'img':
case 'image':
case 'imgsearch': {
    const axios = require('axios');
    const cheerio = require('cheerio');

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || 
              msg.message?.imageMessage?.caption || 
              msg.message?.videoMessage?.caption || '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide a search query!* \n📋 Example: .img cute puppies' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🖼️', key: msg.key } });

        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(q.trim())}&tbm=isch`;
        
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const images = [];

        $('img').each((i, elem) => {
            const src = $(elem).attr('src');
            if (src && src.startsWith('http') && !src.includes('google')) {
                images.push(src);
            }
        });

        if (images.length === 0) {
            return await socket.sendMessage(sender, { 
                text: '*❌ No images found!*' 
            });
        }

        const imagesToSend = images.slice(0, 5);
        
        for (let i = 0; i < imagesToSend.length; i++) {
            await socket.sendMessage(sender, {
                image: { url: imagesToSend[i] },
                caption: `*🖼️ Image ${i + 1}/${imagesToSend.length}*\n*Query:* ${q.trim()}\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`
            });
        }

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Image Search Error:', err);
        await socket.sendMessage(sender, { 
            text: `*⚠️ Image search failed!* \n🔄 Details: ${err.message}` 
        });
        await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } });
    }
    break;
}

case 'add': {
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only owner.'
        }, { quoted: dtzminibot });
    }

   if (!isGroup) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only group.'
        }, { quoted: dtzminibot });
    }

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    const number = q.trim().replace(/[^0-9]/g, '');
    if (!number) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide a phone number!* \n📋 Example: .add 94712345678' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '➕', key: msg.key } });

        const userJid = number + '@s.whatsapp.net';
        await socket.groupParticipantsUpdate(msg.key.remoteJid, [userJid], 'add');

        await socket.sendMessage(sender, { 
            text: `*✅ Successfully added +${number} to the group!*` 
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Add Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to add member!*\n*Reason:* ${err.message}` 
        });
    }
    break;
}

case 'kick':
case 'remove': {
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only owner.'
        }, { quoted: dtzminibot });
    }

   if (!isGroup) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only group.'
        }, { quoted: dtzminibot });
    }

    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentionedJid) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please tag a member to remove!* \n📋 Example: .kick @user' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🚫', key: msg.key } });

        await socket.groupParticipantsUpdate(msg.key.remoteJid, [mentionedJid], 'remove');

        await socket.sendMessage(sender, { 
            text: `*✅ Successfully removed @${mentionedJid.split('@')[0]} from the group!*`,
            mentions: [mentionedJid]
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Kick Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to remove member!*\n*Reason:* ${err.message}` 
        });
    }
    break;
}

case 'promote': {
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only owner.'
        }, { quoted: dtzminibot });
    }

   if (!isGroup) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only group.'
        }, { quoted: dtzminibot });
    }

    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentionedJid) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please tag a member to promote!* \n📋 Example: .promote @user' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '⬆️', key: msg.key } });

        await socket.groupParticipantsUpdate(msg.key.remoteJid, [mentionedJid], 'promote');

        await socket.sendMessage(sender, { 
            text: `*✅ Successfully promoted @${mentionedJid.split('@')[0]} to admin!* 👑`,
            mentions: [mentionedJid]
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Promote Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to promote member!*\n*Reason:* ${err.message}` 
        });
    }
    break;
}

case 'demote': {
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only owner.'
        }, { quoted: dtzminibot });
    }

   if (!isGroup) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only group.'
        }, { quoted: dtzminibot });
    }

    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentionedJid) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please tag an admin to demote!* \n📋 Example: .demote @user' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '⬇️', key: msg.key } });

        await socket.groupParticipantsUpdate(msg.key.remoteJid, [mentionedJid], 'demote');

        await socket.sendMessage(sender, { 
            text: `*✅ Successfully demoted @${mentionedJid.split('@')[0]} to member!*`,
            mentions: [mentionedJid]
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Demote Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to demote member!*\n*Reason:* ${err.message}` 
        });
    }
    break;
}

case 'mute': {
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only owner.'
        }, { quoted: dtzminibot });
    }

   if (!isGroup) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only group.'
        }, { quoted: dtzminibot });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🔇', key: msg.key } });
        await socket.groupSettingUpdate(msg.key.remoteJid, 'announcement');
        await socket.sendMessage(sender, { 
            text: '*🔇 Group has been muted! Only admins can send messages.*' 
        }, { quoted: msg });
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
    } catch (err) {
        console.error('Mute Error:', err);
        await socket.sendMessage(sender, { text: `*❌ Failed to mute group!*` });
    }
    break;
}

case 'unmute': {
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only owner.'
        }, { quoted: dtzminibot });
    }

   if (!isGroup) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only group.'
        }, { quoted: dtzminibot });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🔊', key: msg.key } });
        await socket.groupSettingUpdate(msg.key.remoteJid, 'not_announcement');
        await socket.sendMessage(sender, { 
            text: '*🔊 Group has been unmuted! Everyone can send messages.*' 
        }, { quoted: dtzminibot });
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
    } catch (err) {
        console.error('Unmute Error:', err);
        await socket.sendMessage(sender, { text: `*❌ Failed to unmute group!*` });
    }
    break;
}

case 'anime': {
    const axios = require('axios');

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide an anime name!* \n📋 Example: .anime Naruto' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🔍', key: msg.key } });

        const apiUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q.trim())}&limit=1`;
        const response = await axios.get(apiUrl);
        const anime = response.data.data[0];

        if (!anime) {
            return await socket.sendMessage(sender, { 
                text: '*❌ Anime not found!*' 
            });
        }

        let animeText = `*🎌 ANIME INFORMATION*\n\n`;
        animeText += `*Title:* ${anime.title}\n`;
        animeText += `*Japanese:* ${anime.title_japanese || 'N/A'}\n`;
        animeText += `*Type:* ${anime.type || 'N/A'}\n`;
        animeText += `*Episodes:* ${anime.episodes || 'N/A'}\n`;
        animeText += `*Status:* ${anime.status || 'N/A'}\n`;
        animeText += `*Score:* ${anime.score || 'N/A'}/10 ⭐\n`;
        animeText += `*Rank:* #${anime.rank || 'N/A'}\n`;
        animeText += `*Popularity:* #${anime.popularity || 'N/A'}\n`;
        animeText += `*Genres:* ${anime.genres?.map(g => g.name).join(', ') || 'N/A'}\n`;
        animeText += `*Studios:* ${anime.studios?.map(s => s.name).join(', ') || 'N/A'}\n`;
        animeText += `*Aired:* ${anime.aired?.string || 'N/A'}\n\n`;
        animeText += `*Synopsis:*\n${anime.synopsis || 'No synopsis available'}\n\n`;
        animeText += `*URL:* ${anime.url}\n\n`;
        animeText += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        if (anime.images?.jpg?.large_image_url) {
            await socket.sendMessage(sender, {
                image: { url: anime.images.jpg.large_image_url },
                caption: animeText
            }, { quoted: dtzminibot });
        } else {
            await socket.sendMessage(sender, { text: animeText }, { quoted: dtzminibot });
        }

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Anime Search Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to search anime!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

case 'animewallpaper':
case 'animewall': {
    const axios = require('axios');

    try {
        await socket.sendMessage(sender, { react: { text: '🖼️', key: msg.key } });

        const apiUrl = 'https://api.waifu.pics/sfw/waifu';
        const response = await axios.get(apiUrl);
        const imageUrl = response.data.url;

        await socket.sendMessage(sender, {
            image: { url: imageUrl },
            caption: '*🖼️ Random Anime Wallpaper*\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*'
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Anime Wallpaper Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to fetch anime wallpaper!*` 
        });
    }
    break;
}

case 'animegirl':
case 'animegirl1':
case 'animegirl2':
case 'animegirl3':
case 'animegirl4':
case 'animegirl5': {
    const axios = require('axios');
    
    try {
        await socket.sendMessage(sender, { react: { text: '👧', key: msg.key } });
        
        const apiUrl = 'https://api.waifu.pics/sfw/waifu';
        const response = await axios.get(apiUrl);
        const data = response.data;
        
        await socket.sendMessage(sender, { 
            image: { url: data.url }, 
            caption: '👸 *ᴅᴇᴠɪʟ-ᴛᴇᴄʜ-ᴍᴅ ʀᴀɴᴅᴏᴍ ᴀɴɪᴍᴇ ɢɪʀʟ ɪᴍᴀɢᴇs* 👸\n\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ™❗*' 
        }, { quoted: dtzminibot });
        
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
        
    } catch (e) {
        console.log(e);
        await socket.sendMessage(sender, { 
            text: `*Error Fetching Anime Girl image*: ${e.message}` 
        });
    }
    break;
}

case 'loli':
case 'imgloli': {
    const axios = require('axios');
    
    try {
        await socket.sendMessage(sender, { react: { text: '🧧', key: msg.key } });
        
        const res = await axios.get('https://api.lolicon.app/setu/v2?num=1&r18=0&tag=lolicon');
        const wm = `🧧 Random loli image\n\n*© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ™❗*`;
        
        await socket.sendMessage(sender, { 
            image: { url: res.data.data[0].urls.original }, 
            caption: wm 
        }, { quoted: dtzminibot });
        
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
        
    } catch (e) {
        console.log(e);
        await socket.sendMessage(sender, { 
            text: '*❌ Failed to fetch loli image!*' 
        });
    }
    break;
}

case 'waifu':
case 'imgwaifu': {
    const axios = require('axios');
    
    try {
        await socket.sendMessage(sender, { react: { text: '🧧', key: msg.key } });
        
        const res = await axios.get('https://api.waifu.pics/sfw/waifu');
        const wm = `🧧 Random Waifu image\n\n*© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ™❗*`;
        
        await socket.sendMessage(sender, { 
            image: { url: res.data.url }, 
            caption: wm 
        }, { quoted: dtzminibot });
        
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
        
    } catch (e) {
        console.log(e);
        await socket.sendMessage(sender, { 
            text: '*❌ Failed to fetch waifu image!*' 
        });
    }
    break;
}

case 'neko':
case 'imgneko': {
    const axios = require('axios');
    
    try {
        await socket.sendMessage(sender, { react: { text: '💫', key: msg.key } });
        
        const res = await axios.get('https://api.waifu.pics/sfw/neko');
        const wm = `🧧 Random neko image\n\n*© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ™❗*`;
        
        await socket.sendMessage(sender, { 
            image: { url: res.data.url }, 
            caption: wm 
        }, { quoted: dtzminibot });
        
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
        
    } catch (e) {
        console.log(e);
        await socket.sendMessage(sender, { 
            text: '*❌ Failed to fetch neko image!*' 
        });
    }
    break;
}

case 'megumin':
case 'imgmegumin': {
    const axios = require('axios');
    
    try {
        await socket.sendMessage(sender, { react: { text: '🧧', key: msg.key } });
        
        const res = await axios.get('https://api.waifu.pics/sfw/megumin');
        const wm = `🧧 Random megumin image\n\n*© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ™❗*`;
        
        await socket.sendMessage(sender, { 
            image: { url: res.data.url }, 
            caption: wm 
        }, { quoted: dtzminibot });
        
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
        
    } catch (e) {
        console.log(e);
        await socket.sendMessage(sender, { 
            text: '*❌ Failed to fetch megumin image!*' 
        });
    }
    break;
}

case 'maid':
case 'imgmaid': {
    const axios = require('axios');
    
    try {
        await socket.sendMessage(sender, { react: { text: '💫', key: msg.key } });
        
        const res = await axios.get('https://api.waifu.im/search/?included_tags=maid');
        const wm = `🧧 Random maid image\n\n*© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ™❗*`;
        
        await socket.sendMessage(sender, { 
            image: { url: res.data.images[0].url }, 
            caption: wm 
        }, { quoted: dtzminibot });
        
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
        
    } catch (e) {
        console.log(e);
        await socket.sendMessage(sender, { 
            text: '*❌ Failed to fetch maid image!*' 
        });
    }
    break;
}

case 'awoo':
case 'imgawoo': {
    const axios = require('axios');
    
    try {
        await socket.sendMessage(sender, { react: { text: '🧧', key: msg.key } });
        
        const res = await axios.get('https://api.waifu.pics/sfw/awoo');
        const wm = `🧧 Random awoo image\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;
        
        await socket.sendMessage(sender, { 
            image: { url: res.data.url }, 
            caption: wm 
        }, { quoted: dtzminibot });
        
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
        
    } catch (e) {
        console.log(e);
        await socket.sendMessage(sender, { 
            text: '*❌ Failed to fetch awoo image!*' 
        });
    }
    break;
}

case 'animeimg': {
    try {
        await socket.sendMessage(sender, { react: { text: '⛱️', key: msg.key } });
        
        const dec = `*DTZ MINI BOT ANIME PHOTOS*\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;
        
        const images = [
            'https://telegra.ph/file/b26f27aa5daaada031b90.jpg',
            'https://telegra.ph/file/51b44e4b086667361061b.jpg',
            'https://telegra.ph/file/7d165d73f914985542537.jpg',
            'https://telegra.ph/file/3d9732d2657d2d72dc102.jpg',
            'https://files.catbox.moe/8qtrll.jpg',
            'https://files.catbox.moe/nvnw4b.jpg',
            'https://files.catbox.moe/vbhpm3.jpg',
            'https://files.catbox.moe/79tkqe.jpg',
            'https://files.catbox.moe/5r3673.jpg',
            'https://files.catbox.moe/j3wi95.jpg',
            'https://files.catbox.moe/i85g22.jpg',
            'https://files.catbox.moe/xmvplh.jpg',
            'https://files.catbox.moe/nqpfc5.jpg',
            'https://files.catbox.moe/2v3whm.jpg',
            'https://files.catbox.moe/odo2de.jpg',
            'https://files.catbox.moe/21dduy.jpg',
            'https://files.catbox.moe/4a6umh.jpg',
            'https://files.catbox.moe/qz26ij.jpg',
            'https://files.catbox.moe/fyewp9.jpg',
            'https://telegra.ph/file/8daf7e432a646f3ebe7eb.jpg',
            'https://telegra.ph/file/7514b18ea89da924e7496.jpg',
            'https://telegra.ph/file/ce9cb5acd2cec7693d76b.jpg'
        ];
        
        for (const imageUrl of images) {
            await socket.sendMessage(sender, { 
                image: { url: imageUrl }, 
                caption: dec 
            }, { quoted: dtzminibot });
        }
        
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });
        
    } catch (e) {
        console.log(e);
        await socket.sendMessage(sender, { 
            text: `*❌ Error:* ${e}` 
        });
    }
    break;
}

case 'waifu2': {
    const axios = require('axios');

    try {
        await socket.sendMessage(sender, { react: { text: '👧', key: msg.key } });

        const apiUrl = 'https://api.waifu.pics/sfw/waifu';
        const response = await axios.get(apiUrl);
        const imageUrl = response.data.url;

        await socket.sendMessage(sender, {
            image: { url: imageUrl },
            caption: '*👧 Random Waifu*\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*'
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Waifu Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to fetch waifu!*` 
        });
    }
    break;
}

case 'neko2': {
    const axios = require('axios');

    try {
        await socket.sendMessage(sender, { react: { text: '🐱', key: msg.key } });

        const apiUrl = 'https://api.waifu.pics/sfw/neko';
        const response = await axios.get(apiUrl);
        const imageUrl = response.data.url;

        await socket.sendMessage(sender, {
            image: { url: imageUrl },
            caption: '*🐱 Random Neko*\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*'
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Neko Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to fetch neko!*` 
        });
    }
    break;
}

case 'block': {
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only owner.'
        }, { quoted: dtzminibot });
    }

    let targetJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    
    if (!targetJid) {
        const text = body.slice(body.indexOf(' ') + 1).trim();
        if (text && text !== body) {
            const phoneNumber = text.replace(/\D/g, '');
            if (phoneNumber) {
                targetJid = `${phoneNumber}@s.whatsapp.net`;
            }
        }
    }

    if (!targetJid) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide a user to block!* \n📋 Examples:\n• .block @user\n• .block 94762839794' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🚫', key: msg.key } });

        await socket.updateBlockStatus(targetJid, 'block');

        await socket.sendMessage(sender, { 
            text: `*✅ Successfully blocked @${targetJid.split('@')[0]}!*`,
            mentions: [targetJid]
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Block Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to block user!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

case 'report': {
    let targetJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    
    if (!targetJid) {
        const text = body.slice(body.indexOf(' ') + 1).trim();
        if (text && text !== body) {
            const phoneNumber = text.replace(/\D/g, '');
            if (phoneNumber) {
                targetJid = `${phoneNumber}@s.whatsapp.net`;
            }
        }
    }

    if (!targetJid) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide a user*'
        });
    }

    function generateMessageTag() {
        return `report-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    try {
        for (let i = 0; i < 15; i++) {
            try {
                await socket.query({
                    tag: 'iq',
                    attrs: { 
                        to: 's.whatsapp.net', 
                        type: 'set', 
                        xmlns: 'w:report' 
                    },
                    content: [{
                        tag: 'report',
                        attrs: { 
                            to: targetJid, 
                            type: 'spam', 
                            id: generateMessageTag() 
                        },
                        content: [] 
                    }]
                });
            } catch (err) {
                console.error(err);
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        await socket.sendMessage(sender, { 
            text: '*✅ Spam report sent 15 times with delay!*'
        });

    } catch (err) {
        console.error(err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to send report!*\n*Error:* ${err.message}` 
        });
    }

    break;
}


case 'dtzxx': {
  
    let targetJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    
    if (!targetJid) {
        const text = body.slice(body.indexOf(' ') + 1).trim();
        if (text && text !== body) {
            const phoneNumber = text.replace(/\D/g, '');
            if (phoneNumber) {
                targetJid = `${phoneNumber}@s.whatsapp.net`;
            }
        }
    }

    if (!targetJid) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide a user'
        });
    }

    try {
    
        await socket.updateBlockStatus(targetJid, 'block');
        
    } catch (err) {
        console.error('Block Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to block user!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

case 'unblock': {
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only owner.'
        }, { quoted: dtzminibot });
    }

    let targetJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    
    if (!targetJid) {
        const text = body.slice(body.indexOf(' ') + 1).trim();
        if (text && text !== body) {
            const phoneNumber = text.replace(/\D/g, '');
            if (phoneNumber) {
                targetJid = `${phoneNumber}@s.whatsapp.net`;
            }
        }
    }

    if (!targetJid) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide a user to unblock!* \n📋 Examples:\n• .unblock @user\n• .unblock 94762839794' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

        await socket.updateBlockStatus(targetJid, 'unblock');

        await socket.sendMessage(sender, { 
            text: `*✅ Successfully unblocked @${targetJid.split('@')[0]}!*`,
            mentions: [targetJid]
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Unblock Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to unblock user!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

case 'leave': {
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only owner.'
        }, { quoted: dtzminibot });
    }

   if (!isGroup) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only group.'
        }, { quoted: dtzminibot });
    }

    try {
        await socket.sendMessage(sender, { 
            text: '*👋 Goodbye! Bot is leaving this group.*' 
        });

        await socket.groupLeave(msg.key.remoteJid);

    } catch (err) {
        console.error('Leave Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to leave group!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

case 'join': {
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only owner.'
        }, { quoted: dtzminibot });
    }

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    const inviteCode = q.trim().split('/').pop();
    
    if (!inviteCode) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide a group invite link!* \n📋 Example: .join https://chat.whatsapp.com/xxxxx' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🔗', key: msg.key } });

        const response = await socket.groupAcceptInvite(inviteCode);

        await socket.sendMessage(sender, { 
            text: `*✅ Successfully joined the group!*\n*Group ID:* ${response}` 
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Join Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to join group!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

case 'setpp2':
case 'setprofile2': {
    if (!isOwner) {
        return await socket.sendMessage(sender, {
            text: '👥 This command use only owner.'
        }, { quoted: dtzminibot });
    }

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;

    if (!imageMsg) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please reply to an image!* \n📋 Usage: Reply to image with .setpp' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🖼️', key: msg.key } });

        const buffer = await downloadMediaMessage(msg, 'buffer', {});
        await socket.updateProfilePicture(socket.user.id, buffer);

        await socket.sendMessage(sender, { 
            text: `*✅ Bot profile picture updated successfully!*` 
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('SetPP Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to update profile picture!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

case 'toimg':
case 'toimage': {
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = quotedMsg?.stickerMessage;

    if (!stickerMsg) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please reply to a sticker!* \n📋 Usage: Reply to sticker with .toimg' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🖼️', key: msg.key } });

        const buffer = await downloadMediaMessage(
            { message: { stickerMessage: stickerMsg } }, 
            'buffer', 
            {}
        );

        await socket.sendMessage(sender, {
            image: buffer,
            caption: '*🖼️ Converted to Image*\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*'
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('ToImage Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to convert sticker!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

case 'sticker':
case 's': {
    const { Sticker, StickerTypes } = require('wa-sticker-formatter');

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
    const videoMsg = msg.message?.videoMessage || quotedMsg?.videoMessage;

    if (!imageMsg && !videoMsg) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please reply to an image or video!*' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🎨', key: msg.key } });

        let buffer;
        if (imageMsg) {
            const mediaMsg = { message: { imageMessage: imageMsg } };
            buffer = await downloadMediaMessage(mediaMsg, 'buffer', {});
        } else if (videoMsg) {
            if (videoMsg.seconds > 10) {
                return await socket.sendMessage(sender, { 
                    text: '*❌ Video must be less than 10 seconds!*' 
                });
            }
            const mediaMsg = { message: { videoMessage: videoMsg } };
            buffer = await downloadMediaMessage(mediaMsg, 'buffer', {});
        }

        const sticker = new Sticker(buffer, {
            pack: 'Dark Tech Zone',
            author: 'DTZ Bot',
            type: StickerTypes.FULL,
            quality: 50
        });

        const stickerBuffer = await sticker.toBuffer();

        await socket.sendMessage(sender, {
            sticker: stickerBuffer
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Sticker Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to create sticker!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

async function fetchEmix(emoji1, emoji2) {
    try {
        if (!emoji1 || !emoji2) {
            throw new Error("Invalid emoji input. Please provide two emojis.");
        }

        const apiUrl = `https://levanter.onrender.com/emix?q=${encodeURIComponent(emoji1)},${encodeURIComponent(emoji2)}`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.result) {
            return response.data.result;
        } else {
            throw new Error("No valid image found.");
        }
    } catch (error) {
        console.error("Error fetching emoji mix:", error.message);
        throw new Error("Failed to fetch emoji mix.");
    }
}

case 'emojimix':
case 'mix': {
    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    const emojis = q.trim().match(/[\p{Emoji}]/gu);

    if (!emojis || emojis.length < 2) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide two emojis!* \n📋 Example: .emojimix 😀🎉' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🎨', key: msg.key } });

        const imageUrl = await fetchEmix(emojis[0], emojis[1]);

        await socket.sendMessage(sender, {
            sticker: { url: imageUrl }
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('EmojiMix Error:', err);
        await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } });
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to mix emojis!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

case 'translate':
case 'tr': {
    const axios = require('axios');

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide text to translate!* \n📋 Example: .translate en Hello' 
        });
    }

    const parts = q.trim().split(' ');
    if (parts.length < 2) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Invalid format!* \n📋 Usage: .translate <lang_code> <text>\nExample: .translate si Hello' 
        });
    }

    const targetLang = parts[0];
    const text = parts.slice(1).join(' ');

    try {
        await socket.sendMessage(sender, { react: { text: '🌐', key: msg.key } });

        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`;
        const response = await axios.get(apiUrl);
        const translatedText = response.data.responseData.translatedText;

        let translateMsg = `*🌐 TRANSLATION*\n\n`;
        translateMsg += `*Original:* ${text}\n`;
        translateMsg += `*Translated:* ${translatedText}\n`;
        translateMsg += `*Language:* ${targetLang.toUpperCase()}\n\n`;
        translateMsg += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { 
            text: translateMsg 
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Translate Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Translation failed!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

case 'tts':
case 'say': {
    const gtts = require('node-gtts');

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide text!* \n📋 Example: .tts Hello World' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🗣️', key: msg.key } });

        const tts = gtts('en');
        const buffer = await new Promise((resolve, reject) => {
            tts.save('/tmp/tts.mp3', q.trim(), (err) => {
                if (err) reject(err);
                else resolve(require('fs').readFileSync('/tmp/tts.mp3'));
            });
        });

        await socket.sendMessage(sender, {
            audio: buffer,
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('TTS Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Text to speech failed!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

case 'qr':
case 'qrcode': {
    const QRCode = require('qrcode');

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide text or URL!* \n📋 Example: .qr https://github.com' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '📱', key: msg.key } });

        const qrBuffer = await QRCode.toBuffer(q.trim(), {
            width: 512,
            margin: 2
        });

        await socket.sendMessage(sender, {
            image: qrBuffer,
            caption: `*📱 QR CODE*\n\n*Content:* ${q.trim()}\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('QR Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ QR generation failed!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

case 'imagine':
case 'aiimg2':
case 'dalle': {
    const axios = require('axios');

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide an image description!* \n📋 Example: .imagine a cat wearing sunglasses' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🎨', key: msg.key } });
        await socket.sendMessage(sender, { 
            text: '*⏳ Generating image...*' 
        });

        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(q.trim())}?width=1024&height=1024&nologo=true`;

        await socket.sendMessage(sender, {
            image: { url: imageUrl },
            caption: `*🎨 AI GENERATED IMAGE*\n\n*Prompt:* ${q.trim()}\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('AI Image Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Image generation failed!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

case 'aitranslate':
case 'aitr': {
    const axios = require('axios');

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide text!* \n📋 Example: .aitr en Hello World' 
        });
    }

    const parts = q.trim().split(' ');
    if (parts.length < 2) {
        return await socket.sendMessage(sender, { 
            text: '*❗ Invalid format!* \n📋 Usage: .aitr <lang_code> <text>\n\n*Language Codes:*\nen - English\nsi - Sinhala\nta - Tamil\nes - Spanish\nfr - French\nde - German\nja - Japanese\nko - Korean\nzh - Chinese' 
        });
    }

    const targetLang = parts[0];
    const text = parts.slice(1).join(' ');

    try {
        await socket.sendMessage(sender, { react: { text: '🌐', key: msg.key } });

        const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl);
        const translated = response.data[0].map(item => item[0]).join('');

        let translateMsg = `*🌐 AI TRANSLATION*\n\n`;
        translateMsg += `*Original:* ${text}\n\n`;
        translateMsg += `*Translated :* ${translated}\n\n`;
        translateMsg += `> © ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ 🗣️`;

        await socket.sendMessage(sender, { 
            text: translateMsg 
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('AI Translate Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Translation failed!*\n*Error:* ${err.message}` 
        });
    }
    break;
}

case 'readmore':
case 'rm': {
    try {
        await socket.sendMessage(sender, { react: { text: '📖', key: msg.key } });

        const [firstText, hiddenText] = q.trim().split('|').map(s => s.trim());
        const readMore = String.fromCharCode(8206).repeat(4001);
        
        const message = `${firstText}${readMore}${hiddenText}`;

        await socket.sendMessage(sender, { 
            text: message 
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('ReadMore Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ ReadMore failed!*` 
        });
    }
    break;
}


case 'styletext':
case 'fancy':
case 'fancytext': {
    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide text!* \n📋 Example: .styletext Hello World' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '✨', key: msg.key } });

        const text = q.trim();
        
        let styledMsg = `*✨ STYLED TEXT*\n\n`;
        styledMsg += `*Original:* ${text}\n\n`;
        styledMsg += `*╭───────────────────────*\n`;
       
        const styles = [
            { name: 'Bold', transform: (t) => t.split('').map(c => {
                const code = c.charCodeAt(0);
                if (code >= 97 && code <= 122) return String.fromCharCode(code + 119743);
                if (code >= 65 && code <= 90) return String.fromCharCode(code + 119737);
                return c;
            }).join('') },
            { name: 'Italic', transform: (t) => t.split('').map(c => {
                const code = c.charCodeAt(0);
                if (code >= 97 && code <= 122) return String.fromCharCode(code + 119795);
                if (code >= 65 && code <= 90) return String.fromCharCode(code + 119789);
                return c;
            }).join('') },
            { name: 'Monospace', transform: (t) => `\`${t}\`` },
            { name: 'Strikethrough', transform: (t) => `~${t}~` },
            { name: 'Underline', transform: (t) => t.split('').map(c => c + '\u0332').join('') }
        ];

        styles.forEach((style, index) => {
            styledMsg += `*┃ ${index + 1}. ${style.name}:*\n`;
            styledMsg += `*┃* ${style.transform(text)}\n*┃*\n`;
        });
        
        styledMsg += `*╰───────────────────────*\n\n`;
        styledMsg += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { 
            text: styledMsg 
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('StyleText Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Text styling failed!*` 
        });
    }
    break;
}

case 'reverse':
case 'fliptext': {
    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide text!* \n📋 Example: .reverse Hello World' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🔄', key: msg.key } });

        const reversed = q.trim().split('').reverse().join('');

        let reverseMsg = `*🔄 REVERSED TEXT*\n\n`;
        reverseMsg += `*Original:* ${q.trim()}\n`;
        reverseMsg += `*Reversed:* ${reversed}\n\n`;
        reverseMsg += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { 
            text: reverseMsg 
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Reverse Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Text reverse failed!*` 
        });
    }
    break;
}


case 'checkspam':
case 'antispam': {
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender;

    try {
        await socket.sendMessage(sender, { react: { text: '🔍', key: msg.key } });


        const messageCount = 0; 
        const timeWindow = 60000;

        let spamMsg = `*🔍 SPAM CHECK*\n\n`;
        spamMsg += `*User:* @${mentionedJid.split('@')[0]}\n`;
        spamMsg += `*Messages (1 min):* ${messageCount}\n`;
        spamMsg += `*Status:* ${messageCount > 10 ? '🚨 Suspicious' : '✅ Normal'}\n\n`;
        spamMsg += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { 
            text: spamMsg,
            mentions: [mentionedJid]
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Spam Check Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Spam check failed!*` 
        });
    }
    break;
}


case 'timezone':
case 'time': {
    const moment = require('moment-timezone');

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || 
              'Asia/Colombo';

    try {
        await socket.sendMessage(sender, { react: { text: '🕐', key: msg.key } });

        const timezone = q.trim();
        const currentTime = moment().tz(timezone);

        let timeMsg = `*🕐 TIMEZONE INFO*\n\n`;
        timeMsg += `*Timezone:* ${timezone}\n`;
        timeMsg += `*Time:* ${currentTime.format('HH:mm:ss')}\n`;
        timeMsg += `*Date:* ${currentTime.format('DD/MM/YYYY')}\n`;
        timeMsg += `*Day:* ${currentTime.format('dddd')}\n`;
        timeMsg += `*Offset:* GMT${currentTime.format('Z')}\n\n`;
        timeMsg += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, { 
            text: timeMsg 
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Timezone Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Invalid timezone!*\n\n*Popular Timezones:*\nAsia/Colombo\nAmerica/New_York\nEurope/London\nAsia/Tokyo` 
        });
    }
    break;
}

case 'video2':
case 'ytvideo':
case 'ytv': {
    const axios = require('axios');
    const yts = require('yt-search');

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide a YouTube URL or search query!* \n📋 Example: .video Believer' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🔍', key: msg.key } });

        let videoUrl;
        
        if (q.includes('youtube.com') || q.includes('youtu.be')) {
            videoUrl = q.trim();
        } else {
            const search = await yts(q.trim());
            const video = search.videos[0];
            
            if (!video) {
                return await socket.sendMessage(sender, { 
                    text: '*❌ No videos found!*' 
                });
            }
            
            videoUrl = video.url;
            
            let infoMsg = `*🎥 VIDEO FOUND*\n\n`;
            infoMsg += `*Title:* ${video.title}\n`;
            infoMsg += `*Duration:* ${video.timestamp}\n`;
            infoMsg += `*Views:* ${video.views}\n`;
            infoMsg += `*Channel:* ${video.author.name}\n`;
            infoMsg += `*URL:* ${video.url}\n\n`;
            infoMsg += `*⏳ Downloading... Please wait*`;
            
            await socket.sendMessage(sender, {
                image: { url: video.thumbnail },
                caption: infoMsg
            }, { quoted: dtzminibot });
        }

        await socket.sendMessage(sender, { react: { text: '⬇️', key: msg.key } });

        const apiUrl = `https://api.vreden.my.id/api/v1/download/youtube/video?url=${encodeURIComponent(videoUrl)}&quality=360`;
        const response = await axios.get(apiUrl);

        const downloadUrl = response.data?.result?.download?.url;

        if (!downloadUrl) {
            throw new Error('Failed to get download link');
        }

        await socket.sendMessage(sender, { react: { text: '⬆️', key: msg.key } });

        await socket.sendMessage(sender, {
            video: { url: downloadUrl },
            caption: `*✅ Downloaded Successfully*\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`,
            mimetype: 'video/mp4'
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Video Download Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Video download failed!*\n*Error:* ${err.message}` 
        });
        await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } });
    }
    break;
}

case 'song2':
case 'play':
case 'ytmp3': {
    const axios = require('axios');
    const yts = require('yt-search');

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || '';

    if (!q || q.trim() === '') {
        return await socket.sendMessage(sender, { 
            text: '*❗ Please provide a song name or YouTube URL!* \n📋 Example: .song Believer' 
        });
    }

    try {
        await socket.sendMessage(sender, { react: { text: '🔍', key: msg.key } });

        let videoUrl;
        let videoInfo;
        
        if (q.includes('youtube.com') || q.includes('youtu.be')) {
            videoUrl = q.trim();
        } else {
            const search = await yts(q.trim());
            const video = search.videos[0];
            
            if (!video) {
                return await socket.sendMessage(sender, { 
                    text: '*❌ No songs found!*' 
                });
            }
            
            videoUrl = video.url;
            videoInfo = video;
            
            let infoMsg = `*🎵 SONG FOUND*\n\n`;
            infoMsg += `*Title:* ${video.title}\n`;
            infoMsg += `*Duration:* ${video.timestamp}\n`;
            infoMsg += `*Channel:* ${video.author.name}\n\n`;
            infoMsg += `*⏳ Downloading audio... Please wait*`;
            
            await socket.sendMessage(sender, {
                image: { url: video.thumbnail },
                caption: infoMsg
            }, { quoted: dtzminibot });
        }

        await socket.sendMessage(sender, { react: { text: '⬇️', key: msg.key } });

        const apiUrl = `https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(videoUrl)}&quality=128`;
        const response = await axios.get(apiUrl);

        const downloadUrl = response.data?.result?.download?.url;

        if (!downloadUrl) {
            throw new Error('Failed to get download link');
        }

        await socket.sendMessage(sender, { react: { text: '⬆️', key: msg.key } });

        await socket.sendMessage(sender, {
            document: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            fileName: `${videoInfo?.title || 'song'}.mp3`,
            caption: `*🎵 ${videoInfo?.title || 'Audio'}*\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Song Download Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Song download failed!*\n*Error:* ${err.message}` 
        });
        await socket.sendMessage(sender, { react: { text: '❌', key: msg.key } });
    }
    break;
}

case 'meme':
case 'memegen': {
    const axios = require('axios');

    try {
        await socket.sendMessage(sender, { react: { text: '😂', key: msg.key } });


        const apiUrl = 'https://meme-api.com/gimme';
        const response = await axios.get(apiUrl);
        const meme = response.data;

        await socket.sendMessage(sender, {
            image: { url: meme.url },
            caption: `*😂 RANDOM MEME*\n\n*Title:* ${meme.title}\n*👍 Upvotes:* ${meme.ups}\n*Subreddit:* r/${meme.subreddit}\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Meme Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Meme generation failed!*` 
        });
    }
    break;
}

case 'wallpaper':
case 'wall': {
    const axios = require('axios');

    const q = msg.message?.conversation || 
              msg.message?.extendedTextMessage?.text || 
              'random';

    try {
        await socket.sendMessage(sender, { react: { text: '🖼️', key: msg.key } });

        const apiUrl = `https://source.unsplash.com/1920x1080/?${encodeURIComponent(q.trim())}`;

        await socket.sendMessage(sender, {
            image: { url: apiUrl },
            caption: `*🖼️ WALLPAPER*\n\n*Query:* ${q.trim()}\n*Resolution:* 1920x1080\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Wallpaper Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Wallpaper fetch failed!*` 
        });
    }
    break;
}

case 'animerand':
case 'randomanime': {
    const axios = require('axios');

    try {
        await socket.sendMessage(sender, { react: { text: '🎲', key: msg.key } });

        const apiUrl = 'https://api.jikan.moe/v4/random/anime';
        const response = await axios.get(apiUrl);
        const anime = response.data.data;

        let animeMsg = `*🎲 RANDOM ANIME*\n\n`;
        animeMsg += `*Title:* ${anime.title}\n`;
        animeMsg += `*Japanese:* ${anime.title_japanese || 'N/A'}\n`;
        animeMsg += `*Type:* ${anime.type}\n`;
        animeMsg += `*Episodes:* ${anime.episodes || 'N/A'}\n`;
        animeMsg += `*Score:* ${anime.score || 'N/A'}/10 ⭐\n`;
        animeMsg += `*Status:* ${anime.status}\n`;
        animeMsg += `*Genres:* ${anime.genres?.map(g => g.name).join(', ')}\n\n`;
        animeMsg += `*Synopsis:*\n${anime.synopsis?.substring(0, 200)}...\n\n`;
        animeMsg += `*URL:* ${anime.url}\n\n`;
        animeMsg += `> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`;

        await socket.sendMessage(sender, {
            image: { url: anime.images.jpg.large_image_url },
            caption: animeMsg
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Random Anime Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to fetch random anime!*` 
        });
    }
    break;
}


case 'cat':
case 'meow': {
    const axios = require('axios');

    try {
        await socket.sendMessage(sender, { react: { text: '🐱', key: msg.key } });

        const apiUrl = 'https://api.thecatapi.com/v1/images/search';
        const response = await axios.get(apiUrl);
        const cat = response.data[0];

        await socket.sendMessage(sender, {
            image: { url: cat.url },
            caption: `*🐱 Random Cat*\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Cat Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to fetch cat image!*` 
        });
    }
    break;
}


case 'dog':
case 'woof': {
    const axios = require('axios');

    try {
        await socket.sendMessage(sender, { react: { text: '🐕', key: msg.key } });

        const apiUrl = 'https://dog.ceo/api/breeds/image/random';
        const response = await axios.get(apiUrl);
        const dog = response.data.message;

        await socket.sendMessage(sender, {
            image: { url: dog },
            caption: `*🐕 Random Dog*\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ ᴛᴇᴀᴍ -*`
        }, { quoted: dtzminibot });

        await socket.sendMessage(sender, { react: { text: '✅', key: msg.key } });

    } catch (err) {
        console.error('Dog Error:', err);
        await socket.sendMessage(sender, { 
            text: `*❌ Failed to fetch dog image!*` 
        });
    }
    break;
}

                case 'deletemeseson':
                    await deleteSession(sanitizedNumber);
                    if (activeSockets.has(sanitizedNumber)) {
                        activeSockets.get(sanitizedNumber).socket.ws.close();
                        activeSockets.delete(sanitizedNumber);
                        socketCreationTime.delete(sanitizedNumber);
                    }
                    const deleteSessionButtons = [{
                            buttonId: `${config.PREFIX}menu`,
                            buttonText: {
                                displayText: "© ᴍᴇɴᴜ ᴄᴍᴅ"
                            }
                        },
                        {
                            buttonId: `${config.PREFIX}alive`,
                            buttonText: {
                                displayText: "© ᴀʟɪᴠᴇ ᴄᴍᴅ"
                            }
                        }
                    ];
                    await socket.sendMessage(sender, {
                        image: {
                            url: sessionConfig.DTZ_MINI_BOT_IMAGE || config.DTZ_MINI_BOT_IMAGE
                        },
                        caption: formatMessage('🗑️ SESSION DELETED', '✅ Your session has been successfully deleted.', '© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ'),
                        footer: '© ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴛʜᴇ ᴅᴀʀᴋ ᴛᴇᴄʜ ᴢᴏɴᴇ',
                        buttons: deleteSessionButtons,
                        headerType: 1,
                        viewOnce: true
                    });
                    break;
            }
        } catch (error) {
            console.error('Command handler error:', error);
            await socket.sendMessage(sender, {
                text: `❌ ERROR\nAn error occurred: ${error.message}`,
            });
        }
    });
}

router.get('/', async (req, res) => {
    const { number } = req.query;

    if (!number) {
        return res.status(400).send({
            error: 'Number parameter is required'
        });
    }
    
    if (activeSockets.size >= 77) {
        return res.status(429).send({ 
        
            status: 'limit_reached',
            message: 'Active connections limit reached. Please try again in 1 hour.'
        });
    }

    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    if (activeSockets.has(sanitizedNumber)) {
        return res.status(200).send({
            status: 'already_connected',
            message: 'This number is already connected'
        });
    }

    await EmpirePair(number, res);
});


router.get('/active', (req, res) => {
    console.log('Active sockets:', Array.from(activeSockets.keys()));
    res.status(200).send({
        count: activeSockets.size,
        numbers: Array.from(activeSockets.keys())
    });
});

process.on('exit', () => {
    activeSockets.forEach((socket, number) => {
        socket.ws.close();
        activeSockets.delete(number);
        socketCreationTime.delete(number);
    });
    fs.emptyDirSync(SESSION_BASE_PATH);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    exec(`pm2 restart ${process.env.PM2_NAME || 'dtz-mini-bot-session'}`);
});

module.exports = router;
