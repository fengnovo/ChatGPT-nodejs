import { createServer } from 'http'
import axios from 'axios'
import 'dotenv/config'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { Stream } from 'stream'
import { createReadStream } from 'fs'

const api = axios.create({
    baseURL: 'https://api.openai.com/v1',
    headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    httpsAgent: new SocksProxyAgent(process.env.SOCKS_PROXY!)
})

createServer(async (req, res) => {
    const url = new URL(req.url!, 'file:///')
    const query = Object.fromEntries(url.searchParams.entries())
    console.log(query);
    switch (url.pathname) {
        case '/' :
            createReadStream('./index.html').pipe(res)
            break;
        case '/chat' :
            res.setHeader('Content-Type', 'text/event-stream')
            if(!query.prompt){
                res.statusCode = 400
                return res.end(JSON.stringify({
                    message: '请输入提问内容'
                }))
            }
            try {
                const { data } = await api.post<Stream>('chat/completions', {
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": query.prompt}],
                    "stream": true
                }, {
                    responseType: 'stream'
                })
                
                data.pipe(res)
            } catch (error) {
                res.statusCode = 200
                res.end(JSON.stringify({
                    message: 'connect ECONNREFUSED 127.0.0.1:7890'
                }))
            }
            break;
        default:
            break;
    }
    
}).listen(process.env.PORT)