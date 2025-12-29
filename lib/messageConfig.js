/**const channelInfo = {
    contextInfo: {
        // Remove the forwardedNewsletterMessageInfo that's causing the issue
        // Keep it simple for channels
    }
};*/

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'KnightBot MD',
            serverMessageId: -1
        }
    }
};



export { channelInfo };
