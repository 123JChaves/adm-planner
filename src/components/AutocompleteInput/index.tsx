'use client';

import { useState, KeyboardEvent } from "react";

interface AutocompleteInput {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onSelect: (item: { id: number; nome: string }) => void;
    sugestoes: Array<{ id: number; nome: string }>;
    isNovo?: boolean;
    disabled?: boolean;
    placeholder?: string;
    error?: string;
}

export default function AutocompleteInput({
    label,
    value,
    onChange,
    sugestoes,
    onSelect,
    isNovo = false,
    disabled = false,
    placeholder = "",
    error
}: AutocompleteInput) {
    
    const [open, setOpen] = useState(false);
    const [cursor, setCursor] = useState(-1);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!open || sugestoes.length === 0) return;

        if (e.key === "ArrowDown") {
            setCursor(prev => (prev < sugestoes.length - 1 ? prev + 1 : prev));
        } 
        else if (e.key === "ArrowUp") {
            setCursor(prev => (prev > 0 ? prev - 1 : prev));
        } 
        else if (e.key === "Enter") {
            e.preventDefault();
            if (cursor >= 0 && cursor < sugestoes.length) {
                selecionarItem(sugestoes[cursor]);
            }
        }
        else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    const selecionarItem = (item: { id: number; nome: string }) => {
        onChange(item.nome);
        onSelect(item);
        setOpen(false);
        setCursor(-1);
    };

    return (
        <div className="flex flex-col relative w-full mb-4">
            <label className="font-bold text-sm flex justify-between items-center mb-1">
                <span>{label}:</span>
                {isNovo && (
                    <span className="text-orange-600 text-[10px] font-bold bg-orange-100 px-1 rounded animate-pulse">
                        [NOVO REGISTRO]
                    </span>
                )}
            </label>

            <input
                type="text"
                // --- ATRIBUTOS PARA MATAR O PREENCHIMENTO AUTOMÁTICO BIZARRO ---
                autoComplete="off" 
                name={`field-${label.toLowerCase().replace(/\s/g, '-')}`} // Nome aleatório para o browser não reconhecer
                data-lpignore="true" // Ignora LastPass
                // -------------------------------------------------------------
                value={value}
                disabled={disabled}
                placeholder={placeholder}
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                    onChange(e.target.value);
                    setOpen(true);
                    setCursor(-1);
                }}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                className={`border p-2 rounded outline-none focus:ring-2 transition-all ${
                    error ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
                } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />

            {error && <span className="text-red-500 text-[11px] font-bold mt-1">{error}</span>}

            {open && sugestoes.length > 0 && (
                <ul className="absolute z-50 top-[68px] w-full bg-white border border-gray-200 rounded shadow-2xl max-h-48 overflow-y-auto">
                    {sugestoes.map((item, index) => (
                        <li
                            key={item.id}
                            onMouseEnter={() => setCursor(index)}
                            onClick={() => selecionarItem(item)}
                            className={`p-3 cursor-pointer text-sm transition-colors ${
                                cursor === index 
                                ? 'bg-blue-600 text-white' 
                                : 'hover:bg-blue-50 text-gray-700'
                            }`}
                        >
                            {item.nome}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}