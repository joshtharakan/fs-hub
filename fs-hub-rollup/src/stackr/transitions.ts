import { REQUIRE, STF, Transitions } from '@stackr/sdk/machine';
import {
  AddPlayerToTeamInMatchInput,
  CreateMatchInput,
  FSHubState,
  MatchStatus,
  Player,
} from './types';
import { FSHub } from './state';
import { solidityPackedKeccak256 } from 'ethers';

const createMatch: STF<FSHub, CreateMatchInput> = {
  handler: ({ state, inputs, msgSender }) => {
    const actor = msgSender.toString();
    // Ensure only managers can create match
    REQUIRE(state.managers.includes(actor), 'ACCESS_DENIED');

    const {
      name,
      description,
      tournament,
      startTime,
      homeTeamName,
      awayTeamName,
    } = inputs;

    // generate hash for match, home team and away team
    const matchID = solidityPackedKeccak256(['string'], [name]);

    if (state.matchEvents[matchID] !== undefined) {
      throw new Error('Match details already exists');
    }

    // input validation
    REQUIRE(name.length > 0, 'INVALID_NAME');
    REQUIRE(description.length > 0, 'INVALID_DESCRIPTION');
    REQUIRE(tournament.length > 0, 'INVALID_TOURNAMENT');
    REQUIRE(startTime > 0, 'INVALID_START_TIME');
    REQUIRE(homeTeamName.length > 0, 'INVALID_HOME_TEAM_NAME');
    REQUIRE(awayTeamName.length > 0, 'INVALID_AWAY_TEAM_NAME');

    // check if the match start time is in the future
    REQUIRE(startTime > Date.now(), 'INVALID_START_TIME');
    const teamAID = solidityPackedKeccak256(['string'], [homeTeamName]);
    const teamBID = solidityPackedKeccak256(['string'], [awayTeamName]);

    const matchDetails = {
      id: matchID,
      name,
      description,
      tournament,
      startTime,
      homeTeam: {
        id: teamAID,
        name: homeTeamName,
        players: [],
      },
      awayTeam: {
        id: teamBID,
        name: awayTeamName,
        players: [],
      },
      status: MatchStatus.NOT_STARTED,
    };
    state.matchEvents[matchID] = {
      matchDetails,
      matchUserScores: {},
      matchPlayerPoints: {},
      matchUserSelectedPlayers: {},
    };
    return state;
  },
};

const addPlayerToTeamInMatch: STF<FSHub, AddPlayerToTeamInMatchInput> = {
  handler: ({ state, inputs, msgSender }) => {
    const actor = msgSender.toString();
    // Ensure only managers can create match
    REQUIRE(state.managers.includes(actor), 'ACCESS_DENIED');

    // input validation
    const { matchName, teamName, playerName } = inputs;
    REQUIRE(teamName.length > 0, 'INVALID_TEAM_NAME');
    REQUIRE(playerName.length > 0, 'INVALID_PLAYERS');

    // generate hash for match, home team and away team
    const matchID = solidityPackedKeccak256(['string'], [matchName]);

    if (state.matchEvents[matchID] == undefined) {
      throw new Error('Could not find match details');
    }

    const teamID = solidityPackedKeccak256(['string'], [teamName]);
    const matchDetails = state.matchEvents[matchID].matchDetails;
    const playerID = solidityPackedKeccak256(['string'], [playerName]);
    const player = {
      id: playerID,
      name: playerName,
    };
    if (teamID === matchDetails.homeTeam.id) {
      matchDetails.homeTeam.players.push(player);
    } else if (teamID === matchDetails.awayTeam.id) {
      matchDetails.awayTeam.players.push(player);
    } else {
      REQUIRE(false, 'INVALID_TEAM_NAME');
    }
    return state;
  },
};

export const transitions: Transitions<FSHub> = {
  createMatch,
  addPlayerToTeamInMatch,
};
