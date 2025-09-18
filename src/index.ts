import 'dotenv/config';

import axios from 'axios';
import apm from 'elastic-apm-node';
import { KambanizeService } from './services/kambanize-service';

async function getData() {
  const KBS = new KambanizeService();

  KBS.getAllCards();

  const transaction = apm.startTransaction('GET post from API', 'custom');

  try {
    const response = await axios.get(process.env.HOST ?? '');
    console.log('Resposta:', response.data);

    transaction.result = 'success';

    console.log('Rodando o scheduler no Heroku 🚀');
  } catch (error: any) {
    console.error('Erro:', error.message);

    apm.captureError(error);
    transaction.result = 'error';
  } finally {
    transaction.end();
  }
}

getData();
