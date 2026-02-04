import { useState } from 'react';

type History = {
    id: string;
    role: string;
    content: string
}


export function useChat({ api }: { api: string }) {
    const [messages, setMessages] = useState<History[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent, options?: { experimental_attachments?: FileList | File[] }) => {
        e.preventDefault();
        if ((!input && !options?.experimental_attachments) || isLoading) return;

        setIsLoading(true);

        // 1. Prepara a mensagem do usuário
        const userMsg = { id: Date.now().toString(), role: 'user', content: input };
        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInput('');

        try {
            const formData = new FormData();
            formData.append('prompt', input);

            // 2. Lida com os anexos (PDF)
            if (options?.experimental_attachments) {
                const file = options.experimental_attachments[0];
                formData.append('file', file);
            }

            formData.append('history', JSON.stringify(messages));

            const response = await fetch(api, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Falha na requisição');

            // 3. Processa o Stream de resposta
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantText = '';

            // Adiciona o placeholder da resposta da IA
            setMessages((prev) => [...prev, { id: 'ai-' + Date.now(), role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantText += chunk;

                // Atualiza o estado das mensagens em tempo real
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = assistantText;
                    return updated;
                });
            }
        } catch (error) {
            console.error("Erro no chat:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        setMessages
    };
}