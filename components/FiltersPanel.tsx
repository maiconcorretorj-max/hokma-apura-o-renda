'use client';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';

interface FiltersPanelProps {
  keywordInput: string;
  setKeywordInput: (v: string) => void;
  exclusionKeywords: string[];
  addKeyword: (k: string) => void;
  removeKeyword: (k: string) => void;
}

export function FiltersPanel({
  keywordInput,
  setKeywordInput,
  exclusionKeywords,
  addKeyword,
  removeKeyword,
}: FiltersPanelProps) {
  return (
    <div className="bg-card/50 border rounded-xl p-4 mb-8 space-y-4 shadow-sm">
      <div>
        <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          Exclusão por Palavras-chave
        </h3>
        <p className="text-xs text-muted-foreground">
          Transações contendo essas palavras serão automaticamente desativadas (ex: NUBANK, ESTORNO).
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Excluir transações contendo..."
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addKeyword(keywordInput);
          }}
          className="max-w-xs"
        />
        <Button variant="secondary" onClick={() => addKeyword(keywordInput)}>
          Adicionar
        </Button>
      </div>

      {exclusionKeywords.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {exclusionKeywords.map((kw) => (
            <Badge key={kw} variant="destructive" className="flex items-center gap-1 pr-1.5 py-1">
              {kw}
              <button
                onClick={() => removeKeyword(kw)}
                className="h-4 w-4 rounded-full hover:bg-destructive-foreground/20 inline-flex items-center justify-center transition-colors"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remover {kw}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
