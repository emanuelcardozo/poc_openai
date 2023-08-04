const express = require('express');
const app = express();

require('dotenv').config();
app.use(express.static('./src'));

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
