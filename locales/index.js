import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

async function loadJsonFile(filePath) {
  const dirname = fileURLToPath(new URL('.', import.meta.url));
  const absolutePath = path.join(dirname, filePath);
  const fileContent = await fs.readFile(absolutePath, 'utf-8');
  return JSON.parse(fileContent);
}

async function loadTranslations() {
  const [en, uk] = await Promise.all([
    loadJsonFile('./en/en.json'),
    loadJsonFile('./uk/uk.json'),
  ]);

  return { en, uk };
}

const { en, uk } = await loadTranslations();

export { en, uk };
