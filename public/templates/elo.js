import { readFileSync } from 'node:fs';

export const getEloTemplate = (msg) =>
  `<html lang="en">
        <head>
          <style>
            html {
              width: 1000px;
              height: 600px;
              font-weight: bold;
              color: white;
              background: #0E1621;
              font-size: 4.5rem;
              font-family: Open Sans, sans-serif;
            }
            body {
              padding: 40px;
            }
            .first::after,
            .second::after,
            .third::after,
            .fourth::after,
            .fifth::after,
            .sixth::after,
            .seventh::after,
            .eighth::after,
            .ninth::after,
            .tenth::after {
              width: 100px;
              height: 100px;
              position: absolute;
              margin-top: -5px;
              margin-left: 10px;
              padding-right: 50px;
            }
            .first::after {
              content: url(data:image/svg+xml;base64,${readFileSync(
                'public/images/faceit-levels/1.svg'
              ).toString('base64')});
            }
            .second::after {
              content: url(data:image/svg+xml;base64,${readFileSync(
                'public/images/faceit-levels/2.svg'
              ).toString('base64')});
            }
            .third::after {
              content: url(data:image/svg+xml;base64,${readFileSync(
                'public/images/faceit-levels/3.svg'
              ).toString('base64')});
            }
            .fourth::after {
              content: url(data:image/svg+xml;base64,${readFileSync(
                'public/images/faceit-levels/4.svg'
              ).toString('base64')});
            }
            .fifth::after {
              content: url(data:image/svg+xml;base64,${readFileSync(
                'public/images/faceit-levels/5.svg'
              ).toString('base64')});
            }
            .sixth::after {
              content: url(data:image/svg+xml;base64,${readFileSync(
                'public/images/faceit-levels/6.svg'
              ).toString('base64')});
            }
            .seventh::after {
              content: url(data:image/svg+xml;base64,${readFileSync(
                'public/images/faceit-levels/7.svg'
              ).toString('base64')});
            }
            .eighth::after {
              content: url(data:image/svg+xml;base64,${readFileSync(
                'public/images/faceit-levels/8.svg'
              ).toString('base64')});
            }
            .ninth::after {
              content: url(data:image/svg+xml;base64,${readFileSync(
                'public/images/faceit-levels/9.svg'
              ).toString('base64')});
            }
            .tenth::after {
              content: url(data:image/svg+xml;base64,${readFileSync(
                'public/images/faceit-levels/10.svg'
              ).toString('base64')});
            }
            .float-right {
              float: right;
            }
            .player-elo-block {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 5px;
            }
          </style>
        </head>
    <body> ${msg} </body>
</html>`;
