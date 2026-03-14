import { NextRequest, NextResponse } from 'next/server';
import { executarApuracao } from '@/lib/motor-apuracao';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log('[apuracao] Recebendo requisição...');
    const body = await req.json();
    console.log('[apuracao] Body recebido, campos:', Object.keys(body));
    const { textoExtrato, nomeCliente, cpf, hashPdf } = body;

    if (!textoExtrato || typeof textoExtrato !== 'string') {
      return NextResponse.json({ error: 'textoExtrato é obrigatório' }, { status: 400 });
    }
    if (!nomeCliente || typeof nomeCliente !== 'string') {
      return NextResponse.json({ error: 'nomeCliente é obrigatório' }, { status: 400 });
    }
    if (!hashPdf || typeof hashPdf !== 'string') {
      return NextResponse.json({ error: 'hashPdf é obrigatório' }, { status: 400 });
    }

    console.log('[apuracao] Validação OK. Iniciando processamento...');
    console.log('[apuracao] Tamanho do extrato:', textoExtrato.length, 'caracteres');

    let resultado;
    try {
      resultado = executarApuracao({ textoExtrato, nomeCliente, cpf, hashPdf });
      console.log('[apuracao] Processamento concluído. Transações encontradas:', resultado.transacoes.length);
    } catch (execError) {
      console.error('[apuracao] Erro durante executarApuracao:', execError);
      throw execError;
    }

    // Validar se resultado é serializável
    try {
      JSON.stringify(resultado);
    } catch (jsonError) {
      console.error('[apuracao] Erro ao serializar resultado:', jsonError);
      throw new Error('Resultado não é serializável como JSON');
    }

    return NextResponse.json(resultado);
  } catch (err) {
    console.error('[apuracao] Erro completo:', err);
    console.error('[apuracao] Stack:', err instanceof Error ? err.stack : 'N/A');
    return NextResponse.json(
      {
        error: 'Erro interno ao processar extrato',
        details: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}
