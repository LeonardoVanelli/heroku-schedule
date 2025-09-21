import 'dotenv/config';

import apm from 'elastic-apm-node';
import { KambanizeService } from './services/kambanize-service';
import { OpenaiService } from './services/openai-service';

async function getData() {
  const kanbanizeApi = new KambanizeService();
  const openaiService = new OpenaiService();

  const transaction = apm.startTransaction('GET post from API', 'custom');

  try {
    let cardsMap = await kanbanizeApi.getAllCards();
    const cardIds: number[] = cardsMap.map(
      (c: { card_id: number }) => c.card_id
    );
    console.log(`Encontrados ${cardsMap.length} cards nas colunas indicadas`);

    const loggedTimes = await kanbanizeApi.getLoggedTime(cardIds);

    const cardIdsToRemove = new Set(
      loggedTimes
        .filter((lt: any) =>
          lt.comment?.toLowerCase().includes(process.env.COMMENT_KEY)
        )
        .map((lt: any) => lt.card_id)
    );

    cardsMap = cardsMap.filter(
      (c: { card_id: number }) => !cardIdsToRemove.has(c.card_id)
    );

    const cardHoursMap = cardsMap.map((card: any) => {
      const totalTime = loggedTimes
        .filter((lt: any) => lt.card_id === card.card_id)
        .reduce((sum: number, lt: any) => sum + (lt.time || 0), 0);

      return {
        card_id: card.card_id,
        board_id: card.board_id,
        hours: totalTime || 0,
      };
    });

    console.log(
      `Sobraram ${cardHoursMap.length} cards para processar após aplicar os filtros`
    );

    for (const card of cardHoursMap) {
      try {
        const details = await kanbanizeApi.getCardDatails(card.card_id);
        const description = details.data.description;
        const horasProc = await openaiService.getHorasMotivoProcessados(
          description
        );
        const match = horasProc?.match(/Horas:\s*(\d+)\s+Motivo:\s*(.*)/s);

        let horas = 0;
        let motivo = horasProc;

        if (match && match[1] && match[2]) {
          horas = parseInt(match[1], 10) * 3600;
          motivo = match[2].trim();
        }
        const saldoHoras = horas - card.hours;
        const dataAtual = new Date();
        const hoje: string = `${dataAtual.getFullYear()}-${String(
          dataAtual.getMonth() + 1
        ).padStart(2, '0')}-${String(dataAtual.getDate()).padStart(2, '0')}`;

        if (saldoHoras > 0) {
          await kanbanizeApi.insereLoggedTime({
            cardId: card.card_id,
            board_id: card.board_id,
            date: hoje,
            time: saldoHoras,
            comment: `${motivo} ${process.env.COMMENT_KEY}`,
          });
        }
      } catch (err: any) {
        console.log(
          `Erro ao processar card ${card.card_id}: ${err.message || err}`
        );
      }
    }

    transaction.result = 'success';

    console.log('Processo finalizado com sucesso');
  } catch (error: any) {
    console.error('Erro:', error.message);

    apm.captureError(error);
    transaction.result = 'error';
  } finally {
    transaction.end();
  }
}

getData();
