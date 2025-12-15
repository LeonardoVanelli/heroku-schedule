import axiosInstance, { AxiosInstance } from 'axios';

class KambanizeService {
  private axios: AxiosInstance;
  private columnIds: string;

  constructor() {
    this.axios = axiosInstance.create({
      baseURL: process.env.KAMBANIZE_HOST ?? '',
      headers: {
        apikey: process.env.KAMBANIZE_API_KEY ?? '',
      },
    });
    this.columnIds = process.env.KAMBANIZE_COLUMN_IDS ?? '';
  }

  public async getAllCards(): Promise<any> {
    const { data } = await this.axios.get('/api/v2/cards', {
      params: {
        column_ids: this.columnIds,
      },
    });
    const cards = data.data.data.map((card: any) => ({
      card_id: Number(card.card_id),
      board_id: Number(card.board_id),
    }));
    return cards;
  }

  public async getLoggedTime(cardIds: number[]): Promise<any> {
    const cardIdsParam = cardIds.join(',');

    const { data } = await this.axios.get('/api/v2/loggedTime', {
      params: {
        card_ids: cardIdsParam,
      },
    });

    return data.data;
  }

  public async getCardDatails(cardId: number): Promise<any> {
    const { data } = await this.axios.get('/api/v2/cards/' + cardId);

    return data;
  }

  public async insereLoggedTime(params: {
    cardId: number;
    board_id?: number;
    date: string;
    time: number;
    comment?: string;
  }): Promise<any> {
    const payload = {
      card_id: params.cardId,
      board_id: params.board_id,
      date: params.date,
      time: params.time,
      comment: params.comment ?? '',
    };

    const { data } = await this.axios.post('/api/v2/loggedTime', payload);
    return data;
  }

  public async getCardsType(): Promise<Map<number, string>> {
    const { data } = await this.axios.get('/api/v2/cardTypes');

    const cardTypes = new Map<number, string>(
      data.data.map((type: any) => [Number(type.type_id), type.name])
    );

    return cardTypes;
  }
}

export { KambanizeService };
