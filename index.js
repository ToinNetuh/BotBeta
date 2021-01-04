const { create, Client } = require('@open-wa/wa-automate')
const figlet = require('figlet')
const options = require('./utils/options')
const { color, messageLog } = require('./utils')
const HandleMsg = require('./HandleMsg')

const start = (aruga = new Client()) => {
    console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
    console.log(color(figlet.textSync('ARUGA BOT', { font: 'Ghost', horizontalLayout: 'default' })))
    console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
    console.log(color('[DEV]'), color('ArugaZ', 'yellow'))
    console.log(color('[~>>]'), color('BOT Started!', 'green'))

    // Mempertahankan sesi agar tetap nyala
    aruga.onStateChanged((state) => {
        console.log(color('[~>>]', 'red'), state)
        if (state === 'CONFLICT' || state === 'UNLAUNCHED') aruga.forceRefocus()
    })

    // ketika bot diinvite ke dalam group
    aruga.onAddedToGroup(async (chat) => {
	const groups = await aruga.getAllGroups()
	// kondisi ketika batas group bot telah tercapai,ubah di file settings/setting.json
	if (groups.length > groupLimit) {
	await aruga.sendText(chat.id, `Sorry, the group on this bot is full\nMax Group is: ${groupLimit}`).then(() => {
	      aruga.leaveGroup(chat.id)
	      aruga.deleteChat(chat.id)
	  }) 
	} else {
	// kondisi ketika batas member group belum tercapai, ubah di file settings/setting.json
	    if (chat.groupMetadata.participants.length < memberLimit) {
	    await aruga.sendText(chat.id, `Desculpe, Toin que faz figurar sai se os membros do grupo não excederem ${memberLimit} pessoas`).then(() => {
	      aruga.leaveGroup(chat.id)
	      aruga.deleteChat(chat.id)
	    })
	    } else {
        await aruga.simulateTyping(chat.id, true).then(async () => {
          await aruga.sendText(chat.id,`E aí vocês ~, eu sou Thoriq BOT. Para descobrir o comando BOT, digite ${prefix} menu`)
        })
	    }
	}
    })

    // ketika seseorang masuk/keluar dari group
   aruga.onGlobalParicipantsChanged(async (event) => {
        const host = await aruga.getHostNumber() + '@c.us'
        if (event.action === 'add' && event.who !== host) {
            const gChat = await aruga.getChatById(event.chat)
            const pChat = await aruga.getContact(event.who)
            const { contact, groupMetadata, name} = gChat
            const gatauih = await aruga.getProfilePicFromServer(event.who)
            const capt = `*ey yo,what up!* *@${event.who.replace('@c.us','')}*\n\nBem Vindo *${name}*\n\nNaum ah nada a dizer, apenas siga as regras do grupo ${name}* Grupo\n\n*Comandos do Toin que faz figurar ${prefix}menu , ${prefix}p*`
            await aruga.sendFileFromUrl(event.chat, gatauih, 'profile.jpg', capt)
        }
        // kondisi ketika seseorang dikick/keluar dari group
        if (event.action === 'remove' && event.who !== host) {
            const zchat = await aruga.getProfilePicFromServer(event.who)
            const aigo = `eh @${event.who.replace('@c.us', '')} Saiu porque e um merdinha.`
            await aruga.sendFileFromUrl(event.chat, zchat, 'profile.jpg', aigo)
        }
    })

    aruga.onIncomingCall(async (callData) => {
        // ketika seseorang menelpon nomor bot akan mengirim pesan
        await aruga.sendText(callData.peerJid, 'Desculpe, você não pode receber chamadas.\n\n-bot')
        .then(async () => {
            // bot akan memblock nomor itu
            await aruga.contactBlock(callData.peerJid)
        })
    })

    // ketika seseorang mengirim pesan
    aruga.onMessage(async (message) => {
        aruga.getAmountOfLoadedMessages() // menghapus pesan cache jika sudah 3000 pesan.
            .then((msg) => {
                if (msg >= 3000) {
                    console.log('[aruga]', color(`Alcance de mensagem carregada ${msg}, cortando cache de mensagem ... `, 'amarelo'))
                    aruga.cutMsgCache()
                }
            })
        HandleMsg(aruga, message)    
    
    })
	
    // Message log for analytic
    aruga.onAnyMessage((anal) => { 
        messageLog(anal.fromMe, anal.type)
    })
}

//create session
create(options(true, start))
    .then((aruga) => start(aruga))
    .catch((err) => new Error(err))
