import { NextRequest, NextResponse } from 'next/server';
import { executarApuracao } from '@/api/apuracao';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export const config = {
  api: { bodyParser: { sizeLimit: '150mb' } },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    const resultado = executarApuracao({ textoExtrato, nomeCliente, cpf, hashPdf });

    return NextResponse.json(resultado);
  } catch (err) {
    console.error('[apuracao] Erro:', err);
    return NextResponse.json(
      { error: 'Erro interno ao processar extrato', details: String(err) },
      { status: 500 }
    );
  }
}
