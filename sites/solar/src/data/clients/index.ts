import type { ClientData } from '../types';

const modules = import.meta.glob<{ default: ClientData }>('./*.ts', { eager: true });

const clients: Record<string, ClientData> = {};
for (const path in modules) {
  const id = path.replace('./', '').replace('.ts', '');
  clients[id] = modules[path].default;
}

const activeId = import.meta.env.CLIENT_ID || 'exemplo';
const activeClient = clients[activeId];

if (!activeClient) {
  throw new Error(
    `Cliente "${activeId}" não encontrado em src/data/clients/. ` +
      `Disponíveis: ${Object.keys(clients).join(', ')}`,
  );
}

export const client = activeClient;
