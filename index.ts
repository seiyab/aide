import OpenAI from "openai";
import readline from "node:readline";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI();

await main();

async function main() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	const { ask } = session(rl);

	while (true) {
		const end = await ask();
		if (end) break;
	}
	rl.close();
}

function session(rl: readline.Interface) {
	const history: ChatCompletionMessageParam[] = [];
	return {
		ask,
	};
	async function ask(): Promise<boolean> {
		return new Promise((resolve) => {
			rl.question("> ", async (input) => {
				if (input === "/exit") {
					resolve(true);
					return;
				}

				history.push({ role: "user", content: input });

				const stream = await openai.chat.completions.create({
					model: "gpt-4",
					messages: history,
					stream: true,
				});
				const chunks = [];
				for await (const chunk of stream) {
					const content = chunk.choices[0]?.delta?.content ?? "";
					rl.write(content);
					chunks.push(content);
				}
				rl.write("\n");
				history.push({ role: "assistant", content: chunks.join("") });
				resolve(false);
			});
		});
	}
}
