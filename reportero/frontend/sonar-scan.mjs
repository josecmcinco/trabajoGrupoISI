import { customScanner } from '@sonar/scan';

const token = process.env.SONAR_TOKEN;

if (!token || token === 'REEMPLAZA_CON_EL_TOKEN_NUEVO') {
  throw new Error('Configura SONAR_TOKEN en frontend/.env antes de analizar.');
}

await customScanner({
  serverUrl: process.env.SONAR_HOST_URL ?? 'http://localhost:9000',
  token,
  options: {
    'sonar.projectKey': process.env.SONAR_PROJECT_KEY ?? 'videoclub_Fronted',
    'sonar.sources': 'src',
    'sonar.sourceEncoding': 'UTF-8',
  },
});
