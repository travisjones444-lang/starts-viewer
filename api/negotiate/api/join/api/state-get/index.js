const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');

const CONN = process.env.AzureWebJobsStorage;
const CONTAINER = process.env.WORKSPACE_CONTAINER || 'workspaces';

app.http('state-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (req) => {
    const ws = (req.query.get('ws') || 'default').trim();
    const bsc = BlobServiceClient.fromConnectionString(CONN);
    const container = bsc.getContainerClient(CONTAINER);
    const blob = container.getBlockBlobClient(`${ws}.json`);
    if (!(await blob.exists())) {
      return { jsonBody: { version: 2, store:{}, completed:{}, changelog:[], notes:{}, missing:{}, sourceToggles:null, colorBy:null, uncompleteReasons:{}, updatedAt: 0 } };
    }
    const dl = await blob.download();
    const txt = await streamToString(dl.readableStreamBody);
    return { jsonBody: JSON.parse(txt) };
  }
});

async function streamToString(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', d => chunks.push(d));
    readable.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    readable.on('error', reject);
  });
}
