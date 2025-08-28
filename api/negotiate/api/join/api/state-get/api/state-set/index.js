const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');

const CONN = process.env.AzureWebJobsStorage;
const CONTAINER = process.env.WORKSPACE_CONTAINER || 'workspaces';

app.http('state-set', {
  methods: ['POST'],
  authLevel: 'anonymous',
  extraOutputs: [{
    type: 'signalR',
    name: 'signalRMessages',
    hubName: 'starts',
    connectionStringSetting: 'AzureSignalRConnectionString'
  }],
  handler: async (req, ctx) => {
    const body = await req.json(); // { ws, state }
    const ws = (body.ws || 'default').trim();
    const state = body.state || {};
    state.updatedAt = Date.now();

    const bsc = BlobServiceClient.fromConnectionString(CONN);
    const container = bsc.getContainerClient(CONTAINER);
    await container.createIfNotExists();
    const blob = container.getBlockBlobClient(`${ws}.json`);
    await blob.upload(JSON.stringify(state), Buffer.byteLength(JSON.stringify(state)), { overwrite: true });

    // broadcast to the workspace group
    ctx.extraOutputs.set('signalRMessages', [{
      target: 'stateUpdated',
      arguments: [{ ws, state }],
      groupName: ws
    }]);

    return { status: 200, jsonBody: { ok: true, updatedAt: state.updatedAt } };
  }
});
