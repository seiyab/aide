import OpenAI from "openai";
import readline from "node:readline";

const openai = new OpenAI();

await main();

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const end = await ask(rl);
    if (end) break;
  }
  rl.close();
}

async function ask(rl: readline.Interface): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question("> ", async (input) => {
      if (input === "/exit") {
        resolve(true);
        return;
      }

      const stream = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: input }],
        stream: true,
      });
      for await (const chunk of stream) {
        rl.write(chunk.choices[0]?.delta?.content || "");
      }
      rl.write("\n");
      resolve(false);
    });
  });
}
