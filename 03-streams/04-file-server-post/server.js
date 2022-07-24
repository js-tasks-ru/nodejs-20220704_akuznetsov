const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':

      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end('Path not found');
        break;
      }

      if (fs.existsSync(filepath)) {
        res.statusCode = 409;
        res.end('Path already exists');
        break;
      }

      const limit = new LimitSizeStream({limit: 1048576});
      const stream = fs.createWriteStream(filepath);
      req.pipe(limit).pipe(stream);

      limit.on('error', (error) => {
        if (error.code === 'LIMIT_EXCEEDED') {
          fs.unlink(filepath, () => {
            res.statusCode = 413;
            res.end('Exceeded file size limit');
          });
          stream.destroy();
        }
      });

      stream
          .on('error', () => {
            res.statusCode = 500;
            res.end('Something went wrong');
          })
          .on('finish', () => {
            res.statusCode = 201;
            res.end('Successfully created file');
          });

      req.on('aborted', () => {
        fs.unlink(filepath, () => {
          res.end('Connection lost, file deleted');
        });
        stream.destroy();
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
