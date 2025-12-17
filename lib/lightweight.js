import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const STORE_FILE = path.join(process.cwd(), 'data', 'session', 'Mstore.js');

class LightweightStore {
    constructor() {
        this.messages = {};
        this.contacts = {};
        this.chats = {};
        this.groupMetadata = {};
        this.maxInMemory = 30;
    }

    bind(ev) {
        // Messages handler
        ev.on('messages.upsert', ({ messages }) => {
            messages.forEach(msg => {
                try {
                    if (msg.key && msg.key.remoteJid) {
                        const jid = msg.key.remoteJid;
                        
                        if (!this.messages[jid]) {
                            this.messages[jid] = [];
                        }
                        
                        this.messages[jid].push(msg);
                        
                        if (this.messages[jid].length > this.maxInMemory) {
                            this.messages[jid].shift();
                        }
                    }
                } catch (error) {
                    console.error(chalk.red('❌ Error in messages.upsert:'), error.message);
                }
            });
        });

        // ✅ CONTACTS UPDATE - Auto-fill PN using getSenderId()
        ev.on('contacts.update', (contacts) => {
            try {
                contacts.forEach(contact => {
                    if (contact.id) {
                        // ✅ Get real phone number using your function
                        const realPN =global.sender;
                       // console.log('sen',global.sender);
                        //getSenderId(contact.id);
                        
                        if (this.contacts[contact.id]) {
                            this.contacts[contact.id] = {
                                ...this.contacts[contact.id],
                                ...contact,
                                PN: realPN  // ✅ Auto-fill with real number
                            };
                        } else {
                            this.contacts[contact.id] = {
                                ...contact,
                                PN: realPN  // ✅ Auto-fill with real number
                            };
                        }
                        
                         }
                });
            } catch (error) {
                console.error(chalk.red('❌ Error updating contacts:'), error.message);
            }
        });

        // ✅ INITIAL CONTACTS SET - Auto-fill PN using getSenderId()
        ev.on('contacts.set', ({ contacts }) => {
            try {
                
                
                contacts.forEach(contact => {
                    if (contact.id) {
                        // ✅ Get real phone number using your function
                        const realPN = getSenderId(contact.id);
                        
                        this.contacts[contact.id] = {
                            ...contact,
                            PN: realPN  // ✅ Auto-fill with real number
                        };
                    }
                });
                
                
            } catch (error) {
                console.error(chalk.red('❌ Error setting contacts:'), error.message);
            }
        });

        // Chats handlers
        ev.on('chats.set', ({ chats }) => {
            try {
                chats.forEach(chat => {
                    if (chat.id) {
                        this.chats[chat.id] = chat;
                    }
                });
            } catch (error) {
                console.error(chalk.red('❌ Error setting chats:'), error.message);
            }
        });

        ev.on('chats.update', (chats) => {
            try {
                chats.forEach(chat => {
                    if (chat.id) {
                        this.chats[chat.id] = {
                            ...this.chats[chat.id],
                            ...chat
                        };
                    }
                });
            } catch (error) {
                console.error(chalk.red('❌ Error updating chats:'), error.message);
            }
        });
    }

    loadMessage(jid, id) {
        try {
            if (this.messages[jid]) {
                const memMsg = this.messages[jid].find(m => m.key.id === id);
                if (memMsg) return memMsg;
            }
            return null;
        } catch (error) {
            console.error(chalk.red('❌ Error loading message:'), error.message);
            return null;
        }
    }

    writeToFile() {
        try {
            const data = {
                contacts: this.contacts,
                chats: this.chats,
                groupMetadata: this.groupMetadata
            };
            
            fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
            
        } catch (error) {
            console.error(chalk.red('❌ Error writing store:'), error.message);
        }
    }

    readFromFile() {
        try {
            const storeDir = path.dirname(STORE_FILE);
            if (!fs.existsSync(storeDir)) {
                fs.mkdirSync(storeDir, { recursive: true });
            }

            if (fs.existsSync(STORE_FILE)) {
                const fileContent = fs.readFileSync(STORE_FILE, 'utf8');
                
                if (!fileContent || fileContent.trim() === '' || fileContent === '{}') {
                    console.log(chalk.yellow('[GIFT-MD] ⚠️ Store file empty, initializing...'));
                    this.writeToFile();
                    return;
                }
                
                const data = JSON.parse(fileContent);
                
                // ✅ Load contacts (PN already saved from before)
                this.contacts = data.contacts || {};
                this.chats = data.chats || {};
                this.groupMetadata = data.groupMetadata || {};
                
                console.log(chalk.green('[GIFT-MD] ✅ Store loaded from disk'));
               
            } else {
                console.log(chalk.blue('[GIFT-MD] 📁 Creating new store...'));
                this.writeToFile();
            }
        } catch (error) {
            console.error(chalk.red('❌ Store error, resetting:'), error.message);
            this.contacts = {};
            this.chats = {};
            this.groupMetadata = {};
            
            if (fs.existsSync(STORE_FILE)) {
                fs.unlinkSync(STORE_FILE);
            }
            this.writeToFile();
        }
    }
}

const store = new LightweightStore();
export default store;
