import { Authflow } from 'prismarine-auth'
import mineflayer from 'mineflayer'
import { Configuration, OpenAIApi } from 'openai'

const OPENAI_API_KEY = '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'

let cmdPassword = null
let authorizedUsers = new Set()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { serverIP, botName } = req.body
  const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }))

  try {
    const authflow = new Authflow()
    const result = await authflow.getMinecraftProfile()

    const bot = mineflayer.createBot({
      host: serverIP,
      username: result.name,
      auth: 'microsoft',
      session: {
        accessToken: result.accessToken,
        clientToken: result.clientToken,
        selectedProfile: {
          name: result.name,
          id: result.id
        }
      },
      version: '1.20.1'
    })

    async function getAIResponse(username, message) {
      try {
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: `You are ${botName}, a friendly Minecraft bot. Keep responses short, fun and game-related.`
          }, {
            role: "user",
            content: message
          }],
          max_tokens: 60,
          temperature: 0.7
        })
        return completion.data.choices[0].message.content
      } catch (error) {
        return `Hey ${username}! What's up? 😊`
      }
    }

    bot.once('spawn', () => {
      bot.chat('Hello! I am online! Use !login <password> to start')
    })

    bot.on('chat', async (username, message) => {
      if (username === bot.username) return

      if (message.toLowerCase().includes(botName.toLowerCase())) {
        const aiResponse = await getAIResponse(username, message)
        bot.chat(`@${username} ${aiResponse}`)
        return
      }

      if (message.startsWith('!')) {
        const args = message.split(' ')
        const command = args[0].slice(1).toLowerCase()

        if (command === 'login') {
          if (!args[1]) {
            bot.chat('Usage: !login <password>')
            return
          }
          if (!cmdPassword) {
            cmdPassword = args[1]
            authorizedUsers.add(username)
            bot.chat(`Welcome ${username}! You're the administrator now.`)
            return
          }
          if (args[1] === cmdPassword) {
            authorizedUsers.add(username)
            bot.chat(`Welcome ${username}!`)
            return
          }
          bot.chat('Wrong password!')
          return
        }

        if (!authorizedUsers.has(username)) {
          bot.chat(`${username}, please use !login <password> first`)
          return
        }

        switch(command) {
          case 'help':
            bot.chat('Commands: !login, !come, !follow, !stop, !dance, !jump')
            break
            
          case 'dance':
            bot.chat('Dancing! 🕺')
            let danceMove = 0
            const dance = setInterval(() => {
              bot.setControlState('jump', true)
              bot.look(danceMove, 0)
              danceMove += 1
              if (danceMove > 6) {
                clearInterval(dance)
                bot.setControlState('jump', false)
              }
            }, 500)
            break
            
          case 'jump':
            bot.setControlState('jump', true)
            setTimeout(() => bot.setControlState('jump', false), 500)
            break
            
          case 'come':
            const player = bot.players[username]
            if (!player) {
              bot.chat("I can't see you!")
              return
            }
            bot.chat('Coming to you!')
            bot.lookAt(player.entity.position)
            bot.setControlState('forward', true)
            setTimeout(() => bot.setControlState('forward', false), 2000)
            break
            
          case 'stop':
            bot.clearControlStates()
            bot.chat('Stopped all actions!')
            break
        }
      }
    })

    res.json({ message: 'Bot started successfully!' })

  } catch (error) {
    res.status(500).json({ message: `Failed to start bot: ${error.message}` })
  }
}
