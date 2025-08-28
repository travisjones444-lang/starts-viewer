const { app } = require('@azure/functions');

app.http('join', {
  methods: ['POST'],
  authLevel: 'anonymous',
  extraOutputs: [{
    type: 'signalR',
    name: 'signalRMessages',
    hubName: 'starts',
    connectionStringSetting: 'AzureSignalRConnectionString'
  }],
  handler: async (req, ctx) => {
    const { connectionId, group } = await req.json();
    ctx.extraOutputs.set('signalRMessages', [{
      // group management message
      action: 'add',
      groupName: group,
      connectionId
    }]);
    return { status: 200, jsonBody: { joined: group } };
  }
});
