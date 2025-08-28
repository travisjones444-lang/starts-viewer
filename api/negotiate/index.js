// Azure Functions v4 (Node 18)
const { app } = require('@azure/functions');

app.http('negotiate', {
  methods: ['GET'],
  authLevel: 'anonymous',
  extraOutputs: [{
    type: 'signalRConnectionInfo',
    name: 'connectionInfo',
    hubName: 'starts',
    connectionStringSetting: 'AzureSignalRConnectionString'
  }],
  handler: async (req, ctx) => {
    // You can include userId if you want
    return { jsonBody: ctx.extraOutputs.get('connectionInfo') };
  }
});
