const http = require('http')

http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost:3000')
    const {pathname, searchParams} = url
    console.log(pathname);
    switch (pathname) {
        case '/api/jsonp':
            res.write(`${searchParams.get('callback')}(${JSON.stringify({
                username:'hansum',
                age:'18'
            })})`)
            res.end()
            break;
        default:
            res.end('404');
            break;
    }
}).listen(3000)