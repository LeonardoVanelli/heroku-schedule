require('dotenv').config();
const apm = require('./apm');

const axios = require('axios');

async function getData() {
  const transaction = apm.startTransaction('GET post from API', 'custom');

  try {
    const response = await axios.get(process.env.HOST);
    console.log('Resposta:', response.data);

    transaction.result = 'success';
    

    console.log('Rodando o scheduler no Heroku 🚀');
  } catch (error) {
    console.error('Erro:', error.message);

    apm.captureError(error);
    transaction.result = 'error';
  } finally {
    transaction.end();
  }
}

getData();