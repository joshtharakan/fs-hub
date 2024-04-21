import { stackrConfig } from '../../stackr.config';
import { fsHubStateMachine } from './machine';
import { actionSchemas } from './action';
import { MicroRollup } from '@stackr/sdk';

type FSHubStateMachine = typeof fsHubStateMachine;

const fsHub = await MicroRollup({
  config: stackrConfig,
  actionSchemas: [
    actionSchemas.createMatchSchema,
    actionSchemas.addPlayerToTeamInMatchSchema,
  ],
  isSandbox: process.env.IS_SANDBOX === 'true',
  stateMachines: [fsHubStateMachine],
  stfSchemaMap: {
    createMatch: actionSchemas.createMatchSchema.identifier,
    addPlayerToTeamInMatch:
      actionSchemas.addPlayerToTeamInMatchSchema.identifier,
  },
});

await fsHub.init();

export { FSHubStateMachine, fsHub };
