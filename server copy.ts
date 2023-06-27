import { createServer } from 'http'
import axios from 'axios'
import 'dotenv/config'
import { SocksProxyAgent } from 'socks-proxy-agent'

const api = axios.create({
    baseURL: 'https://api.openai.com/v1',
    headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    httpsAgent: new SocksProxyAgent(process.env.SOCKS_PROXY!)
})

createServer(async (req, res) => {
    const { data } = await api.post('chat/completions', {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": 'Hello'}],
        "max_tokens": 20,
    })

    res.end(JSON.stringify(data))
    
}).listen(process.env.PORT)