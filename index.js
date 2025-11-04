const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req,res)=> res.send('Heello from CI-CD app! Change one'));
app.get('/health', (req,res)=> res.json({status:'ok'}));

app.listen(port, ()=> console.log('Listening on', port));
