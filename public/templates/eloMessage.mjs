export const getEloMsg = (prettiedMessage) =>
  `<html lang="en">
        <head>
          <style>
            html {
              width: 1000px;
              height: 600px;
              font-weight: bold;
              color: white;
              background: #0E1621;
              font-size: 4rem;
              font-family: Open Sans,sans-serif;
            }
            body {
              padding: 40px 0 0 40px;
            }
            .red {
              color: #F81E00;
            }
            .yellow {
              color: #FFC803;
            }
            .orange {
              color: #FF630C;
            }
            .green {
              color: #1DE100;
            }
            .white {
              color: #E5E5E4;
            }
          </style>
        </head>
    <body> ${prettiedMessage} </body>
</html>`;
