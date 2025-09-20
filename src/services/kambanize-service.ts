import axiosInstance, { AxiosInstance } from 'axios';

class KambanizeService {
  private axios: AxiosInstance;
  private boardId: string;
  private columnIds: string;

  constructor() {
    this.axios = axiosInstance.create({
      baseURL: process.env.KAMBANIZE_HOST ?? '',
      headers: {
        apikey: process.env.KAMBANIZE_API_KEY ?? '',
      },
    });
    this.boardId = process.env.KAMBANIZE_BOARD_ID ?? '';
    this.columnIds = process.env.KAMBANIZE_COLUMN_IDS ?? '';
  }

  public async getAllCards(): Promise<any> {
    const { data } = await this.axios.get('/api/v2/cards', {
      params: {
        board_id: this.boardId,
        column_ids: this.columnIds,
      },
    });

    return data;
  }

  public async getLoggedTime(cardIds: number[]): Promise<any> {
    const cardIdsParam = cardIds.join(',');

    const { data } = await this.axios.get('/api/v2/loggedTime', {
      params: {
        card_ids: cardIdsParam,
      },
    });

    return data;
  }

  public async getCardDatails(cardId: number): Promise<any> {
    const { data } = await this.axios.get('/api/v2/cards/' + cardId, {
      params: {
        board_id: this.boardId,
      },
    });

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
      board_id: params.board_id ?? Number(this.boardId),
      date: params.date,
      time: params.time,
      comment: params.comment ?? '',
    };

    const { data } = await this.axios.post('/api/v2/loggedTime', payload);
    return data;
  }
}

export { KambanizeService };
