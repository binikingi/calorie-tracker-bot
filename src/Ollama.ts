import { Ollama } from "ollama";
import { appConfig } from "./appConfig";

export const ollama = new Ollama({ host: appConfig.OLLAMA_HOST });
