import { useState, useEffect } from 'react'

export default function Home() {
  const [serverIP, setServerIP] = useState('')
  const [botName, setBotName] = useState('')
  const [logs, setLogs] = useState([])
  const [isRunning, setIsRunning] = useState(false)

  const startBot = async () => {
    setIsRunning(true)
    setLogs(prev => [...prev, 'Starting bot...'])
    
    const response = await fetch('/api/startBot', {
      method: 'POST',
      body: JSON.stringify({ serverIP, botName }),
      headers: { 'Content-Type': 'application/json' }
    })
    
    const data = await response.json()
    setLogs(prev => [...prev, data.message])
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Minecraft Bot Console</h1>
      
      <div className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Server IP"
          value={serverIP}
          onChange={(e) => setServerIP(e.target.value)}
          className="w-full p-2 bg-gray-800 rounded"
        />
        
        <input
          type="text"
          placeholder="Bot Name"
          value={botName}
          onChange={(e) => setBotName(e.target.value)}
          className="w-full p-2 bg-gray-800 rounded"
        />
        
        <button
          onClick={startBot}
          disabled={isRunning}
          className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          {isRunning ? 'Bot Running...' : 'Start Bot'}
        </button>
      </div>
      
      <div className="bg-gray-800 p-4 rounded h-96 overflow-auto">
        {logs.map((log, i) => (
          <div key={i} className="text-green-400">
            {log}
          </div>
        ))}
      </div>
    </div>
  )
}
