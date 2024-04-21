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

// addPlayerSelectionForMatchSchema is a schema for adding player selection for a match by a user
export const addPlayerSelectionForMatchSchema = new ActionSchema(
  'addPlayerSelectionForMatch',
  {
    matchName: SolidityType.STRING,
    playerName: SolidityType.STRING,
  },
);

export const calculatePlayerPointsForMatchSchema = new ActionSchema(
  'calculatePlayerPointsForMatch',
  {
    matchName: SolidityType.STRING,
    playerName: SolidityType.STRING,
    battingRuns: SolidityType.UINT,
    boundaries: SolidityType.UINT,
    sixer: SolidityType.UINT,
    wickets: SolidityType.UINT,
    bowledWickets: SolidityType.UINT,
    maidenOvers: SolidityType.UINT,
    catches: SolidityType.UINT,
    stumpings: SolidityType.UINT,
    runOutDirectHits: SolidityType.UINT,
    runOutAssists: SolidityType.UINT,
    captain: SolidityType.BOOL,
    viceCaptain: SolidityType.BOOL,
    announcedLineup: SolidityType.BOOL,
    playingSubstitute: SolidityType.BOOL,
  },
);

export const calculateAllUserScoreForMatchSchema = new ActionSchema(
  'calculateAllUserScoreForMatch',
  {
    matchName: SolidityType.STRING,
  },
);

// transferSchema is a collection of all the transfer actions
// that can be performed on the rollup
export const actionSchemas = {
  createMatchSchema,
  addPlayerToTeamInMatchSchema,
  addPlayerSelectionForMatchSchema,
  calculatePlayerPointsForMatchSchema,
  calculateAllUserScoreForMatchSchema,
};

// New Actions
// 1. Creating a Match ✅
// 2. Add players to the match ✅
// 3. Users add their player selection for the match ✅
// 4. Admins calculate player points for the match ✅
// 4. Admins calculate user scores for the match ✅ 
