import { stackrConfig } from '../../stackr.config';
import { fsHubStateMachine } from './machine';
import { actionSchemas } from './action';
import { MicroRollup } from '@stackr/sdk';

type FSHubStateMachine = typeof fsHubStateMachine;

const fsHub = await MicroRollup({
  config: stackrConfig,
  actionSchemas: [...Object.values(actionSchemas)],
  isSandbox: process.env.IS_SANDBOX === 'true',
  stateMachines: [fsHubStateMachine],
  stfSchemaMap: {
    createMatch: actionSchemas.createMatchSchema.identifier,
    addPlayerToTeamInMatch:
      actionSchemas.addPlayerToTeamInMatchSchema.identifier,
    addPlayerSelectionForMatch:
      actionSchemas.addPlayerSelectionForMatchSchema.identifier,
    calculatePlayerPointsForMatch:
      actionSchemas.calculatePlayerPointsForMatchSchema.identifier,
    calculateAllUserScoreForMatch:
      actionSchemas.calculateAllUserScoreForMatchSchema.identifier,
  },
});

await fsHub.init();

export { FSHubStateMachine, fsHub };
