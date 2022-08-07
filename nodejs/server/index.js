const http = require('http')

http.createServer((req,res)=>{
    res.write('hello nodejs!')
    res.end()
}).listen(3000)