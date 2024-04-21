import { ActionSchema, SolidityType } from '@stackr/sdk';

// createMatchSchema is a schema for creating a match
export const createMatchSchema = new ActionSchema('createMatch', {
  name: SolidityType.STRING,
  description: SolidityType.STRING,
  tournament: SolidityType.STRING,
  startTime: SolidityType.UINT,
  homeTeamName: SolidityType.STRING,
  awayTeamName: SolidityType.STRING,
});

// addPlayersToTeamInMatchSchema is a schema for adding players to a team in a match
export const addPlayerToTeamInMatchSchema = new ActionSchema(
  'addPlayerToTeamInMatch',
  {
    matchName: SolidityType.STRING,
    teamName: SolidityType.STRING,
    playerName: SolidityType.STRING,
  },
);

// transferSchema is a collection of all the transfer actions
// that can be performed on the rollup
export const actionSchemas = {
  createMatchSchema,
  addPlayerToTeamInMatchSchema,
};
