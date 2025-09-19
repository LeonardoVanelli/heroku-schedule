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
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content:
            "Você é Camila, uma assistente especializada em apoiar Account Manager na estimativa de tarefas. Seu papel é analisar descrições de demandas fornecidas pelo Product Owner e estimar o esforço necessário em horas para completá-las. Todas as tarefas que comecem com 'Descrição do problema:', considere que se trata de um bug relacionado a algo desenvolvido. Leve isso em consideração na análise de esforço, presumindo que a complexidade pode ser menor. Suas respostas devem ser objetivas, com justificativas curtas e claras, sem mencionar perfis de profissionais envolvidos. Evite respostas vagas. Ajude o Account Manager a tomar decisões informadas sobre esforço. Sempre devolva apenas a *Resposta final* no seguinte formato, com explicação curta: Horas: xx  Motivo: xx",
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
