import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import pdf from "pdf-parse-fork";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const promptText = (data.get("prompt") as string) || "";
    const historyRaw = (data.get("history") as string) || "[]";
    const file = data.get("file");

    const history = JSON.parse(historyRaw);

    let contextoLaudo = "O usuário não anexou um laudo em PDF nesta mensagem.";

    if (file && file instanceof File && file.size > 0) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const pdfData = await pdf(buffer);
        contextoLaudo = `CONTEÚDO DO LAUDO EXTRAÍDO: ${pdfData.text}`;
      } catch (pdfError) {
        console.error("Erro ao ler PDF:", pdfError);
        contextoLaudo = "Erro ao processar o arquivo PDF enviado.";
      }
    }

    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.2,
      streaming: true
    });

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", `Você é o Manoel, um Químico Especialista em Hemodiálise e especialista na RDC 11/2014. 
      Instruções:
      1. Se houver um laudo no contexto abaixo, analise-o tecnicamente.
      2. Se NÃO houver laudo, converse amigavelmente e tire dúvidas técnicas sobre tratamento de água para hemodiálise e normas vigentes.
      3. Seja sempre profissional e use termos técnicos da área química.
      
      Contexto atual: {contexto}`],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"]
    ]);

    const chain = RunnableSequence.from([
      promptTemplate,
      model,
    ]);

    // 2. Execução do Stream
    const langChainStream = await chain.stream({
      contexto: contextoLaudo,
      input: promptText,
      chat_history: history.map((m: any) =>
        m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
      ),
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of langChainStream) {
          const content = chunk.content;
          if (content) {
            controller.enqueue(encoder.encode(content as string));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error: any) {
    console.error("ERRO NO SERVIDOR:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}