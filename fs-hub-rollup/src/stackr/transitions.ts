import { REQUIRE, STF, Transitions } from '@stackr/sdk/machine';
import {
  AddPlayerSelectionForMatchInput,
  AddPlayerToTeamInMatchInput,
  CalculatePlayerPointsForMatchInput,
  CreateMatchInput,
  FSHubState,
  MatchStatus,
  Player,
} from './types';
import { FSHub } from './state';
import { solidityPackedKeccak256 } from 'ethers';
import e from 'express';

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
    // console.log('Create Match Result', state);
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
    // console.log('Add Players Result', state);
    return state;
  },
};

const addPlayerSelectionForMatch: STF<FSHub, AddPlayerSelectionForMatchInput> =
  {
    handler: ({ state, inputs, msgSender }) => {
      const actor = msgSender.toString();
      const { matchName, playerName } = inputs;
      const matchID = solidityPackedKeccak256(['string'], [matchName]);

      // input validation
      REQUIRE(matchName.length > 0, 'INVALID_MATCH_NAME');
      REQUIRE(playerName.length > 0, 'INVALID_PLAYER_NAME');

      if (state.matchEvents[matchID] == undefined) {
        throw new Error('Could not find match details');
      }
      const matchEvent = state.matchEvents[matchID];

      // check if the maximum number of players have been selected, which is 5 per user
      if (matchEvent.matchUserSelectedPlayers[actor]?.length > 5) {
        throw new Error('Maximum number of players selected');
      }

      const playerID = solidityPackedKeccak256(['string'], [playerName]);

      // check if the player is part of the match
      let playerFound = false;
      const matchDetails = matchEvent.matchDetails;
      if (
        matchDetails.homeTeam.players.find((player) => player.id === playerID)
      ) {
        playerFound = true;
      } else if (
        matchDetails.awayTeam.players.find((player) => player.id === playerID)
      ) {
        playerFound = true;
      }
      REQUIRE(playerFound, 'PLAYER_NOT_FOUND');

      if (matchEvent.matchUserSelectedPlayers[actor] === undefined) {
        matchEvent.matchUserSelectedPlayers[actor] = [playerID];
      } else {
        matchEvent.matchUserSelectedPlayers[actor].push(playerID);
      }
      // console.log('Add User Player Selection Result', state);
      return state;
    },
  };

const PointsSystem = {
  BATTING_POINTS: {
    RUNS: 1,
    FOURS: 1,
    SIXES: 2,
    DUCK: -5,
    HALF_CENTURY: 10,
    CENTURY: 20,
  },
  BOWLING_POINTS: {
    WICKET: 10,
    BOWLED: 5,
    MAIDEN_OVER: 5,
    ECONOMY_RATE: 1,
    FOUR_WICKET_HAUL: 10,
    FIVE_WICKET_HAUL: 20,
  },
  FIELDING_POINTS: {
    CATCH: 5,
    STUMPING: 10,
    RUN_OUT_DIRECT: 10,
    RUN_OUT_ASSIST: 5,
  },
  BONUS: {
    CAPTAIN: 4,
    VICE_CAPTAIN: 2,
    ANNOUNCED_LINEUP: 20,
    PLAYING_SUBSTITUTE: 10,
  },
};

const calculatePlayerPointsForMatch: STF<
  FSHub,
  CalculatePlayerPointsForMatchInput
> = {
  handler: ({ state, inputs, msgSender }) => {
    const actor = msgSender.toString();
    // Ensure only managers can create match
    REQUIRE(state.managers.includes(actor), 'ACCESS_DENIED');

    const { matchName, playerName } = inputs;
    const matchID = solidityPackedKeccak256(['string'], [matchName]);

    // input validation
    REQUIRE(matchName.length > 0, 'INVALID_MATCH_NAME');
    REQUIRE(playerName.length > 0, 'INVALID_PLAYER_NAME');

    if (state.matchEvents[matchID] == undefined) {
      throw new Error('Could not find match details');
    }
    const matchEvent = state.matchEvents[matchID];
    const points = calculatePoints(inputs);
    const playerID = solidityPackedKeccak256(['string'], [playerName]);

    matchEvent.matchPlayerPoints[playerID] = points;

    // console.log('Player Points Calculation Result', state);
    return state;
  },
};

const calculatePoints = (input: CalculatePlayerPointsForMatchInput) => {
  // calculate the points for the player
  // based on the player's performance
  // in the match
  let points = 0;

  // Calculate batting points
  const battingRuns = input.battingRuns;
  // check the range of runs and apply only one of the points
  if (battingRuns >= 100) {
    points += PointsSystem.BATTING_POINTS.CENTURY;
  } else if (battingRuns >= 50) {
    points += PointsSystem.BATTING_POINTS.HALF_CENTURY;
  } else if (battingRuns === 0) {
    points += PointsSystem.BATTING_POINTS.DUCK;
  }
  // add points for runs
  points += battingRuns * PointsSystem.BATTING_POINTS.RUNS;
  // add points for boundaries
  points += input.boundaries * PointsSystem.BATTING_POINTS.FOURS;
  // add points for sixes
  points += input.sixer * PointsSystem.BATTING_POINTS.SIXES;

  // Calculate bowling points
  // add points for wickets
  points += input.wickets * PointsSystem.BOWLING_POINTS.WICKET;
  // add points for bowled wickets
  points += input.bowledWickets * PointsSystem.BOWLING_POINTS.BOWLED;
  // add points for maiden overs
  points += input.maidenOvers * PointsSystem.BOWLING_POINTS.MAIDEN_OVER;
  // add bowling bonus
  if (input.wickets >= 4) {
    points += PointsSystem.BOWLING_POINTS.FOUR_WICKET_HAUL;
  } else if (input.wickets >= 5) {
    points += PointsSystem.BOWLING_POINTS.FIVE_WICKET_HAUL;
  }

  // Calculate fielding points
  // add points for catches
  points += input.catches * PointsSystem.FIELDING_POINTS.CATCH;
  // add points for stumpings
  points += input.stumpings * PointsSystem.FIELDING_POINTS.STUMPING;
  // add points for run outs direct hits
  points +=
    input.runOutDirectHits * PointsSystem.FIELDING_POINTS.RUN_OUT_DIRECT;
  // add points for run outs assists
  points += input.runOutAssists * PointsSystem.FIELDING_POINTS.RUN_OUT_ASSIST;
  // Calculate bonus points
  if (input.captain) {
    points *= PointsSystem.BONUS.CAPTAIN;
  } else if (input.viceCaptain) {
    points *= PointsSystem.BONUS.VICE_CAPTAIN;
  }
  if (input.announcedLineup) {
    points += PointsSystem.BONUS.ANNOUNCED_LINEUP;
  }
  if (input.playingSubstitute) {
    points += PointsSystem.BONUS.PLAYING_SUBSTITUTE;
  }
  return points;
};

const calculateAllUserScoreForMatch: STF<FSHub, CalculatePlayerPointsForMatchInput> = {
  handler: ({ state, inputs, msgSender }) => {
    const actor = msgSender.toString();
    // Ensure only managers can create match
    REQUIRE(state.managers.includes(actor), 'ACCESS_DENIED');

    const { matchName } = inputs;
    const matchID = solidityPackedKeccak256(['string'], [matchName]);

    // input validation
    REQUIRE(matchName.length > 0, 'INVALID_MATCH_NAME');

    if (state.matchEvents[matchID] == undefined) {
      throw new Error('Could not find match details');
    }
    const matchEvent = state.matchEvents[matchID];

    // calculate the score for each user and store it in the state
    Object.entries(matchEvent.matchUserSelectedPlayers).forEach(
      ([user, playerSelections]) => {
        let userScore = 0;
        playerSelections.forEach((player) => {
          userScore += matchEvent.matchPlayerPoints[player];
        });
        matchEvent.matchUserScores[user] = userScore;
      },
    );
    matchEvent.matchDetails.status = MatchStatus.SCORED;
    console.log('User Score Calculation Result', state);
    return state;
  },
};

export const transitions: Transitions<FSHub> = {
  createMatch,
  addPlayerToTeamInMatch,
  addPlayerSelectionForMatch,
  calculatePlayerPointsForMatch,
  calculateAllUserScoreForMatch,
};
