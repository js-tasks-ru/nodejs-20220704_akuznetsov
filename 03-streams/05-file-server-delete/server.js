const fs = require('fs');
const http = require('http');
const path = require('path');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':

      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end('Path not found');
        break;
      }

      const stream = fs.createReadStream(filepath);
      stream.pipe(res);

      stream.on('error', (error) => {
        if (error.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('File not found');
        } else {
          res.statusCode = 500;
          res.end('Something went wrong');
        }
      });

      stream.on('end', () => {
        fs.unlink(filepath, () => {
          res.statusCode = 200;
          res.end('File deleted');
        });
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }

  req.on('aborted', () => {
    stream.destroy();
  });
});

module.exports = server;
