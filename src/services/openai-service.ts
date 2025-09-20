import axiosInstance, { AxiosInstance } from 'axios';

class OpenaiService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axiosInstance.create({
      baseURL: process.env.OPENAI_HOST ?? '',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_TOKEN ?? ''}`,
      },
    });
  }

  public async getHorasMotivoProcessados(descricao: string): Promise<string> {
    const { data } = await this.axios.post('/v1/chat/completions', {
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: process.env.OPENAI_SYSTEM_CONTENT,
        },
        {
          role: 'user',
          content: descricao,
        },
      ],
    });
    const resposta =
      data?.choices?.[0]?.message?.content ?? 'Erro: resposta inválida';
    return resposta;
  }
}

export { OpenaiService };
