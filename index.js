import { useState, useEffect } from 'react'

export default function Home() {
  const [serverIP, setServerIP] = useState('')
  const [botName, setBotName] = useState('')
  const [logs, setLogs] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState('Ready')

  const startBot = async () => {
    if (!serverIP || !botName) {
      setLogs(prev => [...prev, 'Please fill in all fields'])
      return
    }

    setIsRunning(true)
    setStatus('Starting...')
    setLogs(prev => [...prev, '> Starting bot...'])
    
    try {
      const response = await fetch('/api/startBot', {
        method: 'POST',
        body: JSON.stringify({ serverIP, botName }),
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      setLogs(prev => [...prev, `> ${data.message}`])
      setStatus(data.message)
    } catch (error) {
      setLogs(prev => [...prev, `> Error: ${error.message}`])
      setStatus('Error')
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-2">Minecraft Bot Console</h1>
      <p className="mb-8 text-gray-400">Status: {status}</p>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm mb-2">Server IP</label>
          <input
            type="text"
            placeholder="e.g., play.example.com"
            value={serverIP}
            onChange={(e) => setServerIP(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded border border-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-2">Bot Name</label>
          <input
            type="text"
            placeholder="e.g., CoolBot"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded border border-gray-700"
          />
        </div>
        
        <button
          onClick={startBot}
          disabled={isRunning}
          className={`w-full p-2 rounded transition ${
            isRunning 
              ? 'bg-gray-700 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Bot Running...' : 'Start Bot'}
        </button>
      </div>
      
      <div className="bg-gray-800 p-4 rounded h-96 overflow-auto font-mono">
        {logs.map((log, i) => (
          <div key={i} className="text-green-400">
            {log}
          </div>
        ))}
      </div>
    </div>
  )
}
