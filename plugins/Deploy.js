import axios from 'axios';

export default [
{
name: 'deploy',
aliases: ['startbot'],
description: 'Deploy WhatsApp bot',
usage: '.deploy <phone>',
execute: async (sock, message, args, context) => {
const { chatId, reply, react } = context;

try {  
   const phone = args[1];

//const session = args[2];
const text = message.message?.conversation || message.message?.extendedTextMessage?.text;

if (!text) {
return reply('❌ No text found in message!');
}

const session = text.split(' ').slice(2).join(' ');

if (!phone || !session) {
return reply('❌ Usage: .deploy <phone> <session>');
}

console.log('[DEPLOY] Sending payload:', { phoneNumber: phone, session });

const res = await axios.post(
'https://giveaway-p7i5.onrender.com/deploy',
{
phoneNumber: phone,
session
},
{
timeout: 60000,
headers: {
'Content-Type': 'application/json'
}
}
);

await react('✅');  
   await reply(`🚀 Deployment started!\n\nStatus: ${res.data?.status || 'OK'}`);  

 } catch (err) {  
   console.error('[DEPLOY]', err?.response?.data || err.message);  
     await reply(`${err.response?.data?.error || err.message}`);  
   await react('❌');  
       
 }

}
}
];
