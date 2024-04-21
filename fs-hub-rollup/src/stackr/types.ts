/**
 * enum representing the status of a match
 */
export enum MatchStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  SCORED = 'SCORED',
}
/**
 * representation of a player in the fs system
 */
type Player = {
  id: string; // unique identifier hash for the player
  name: string; // name of the player
};

/**
 * representation of a team in the fs system
 */
type Team = {
  id: string; // unique identifier hash for the team
  name: string; // name of the team
  players: Player[]; // list of players in the team
};

/**
 * representation of the match details
 */
type MatchDetails = {
  name: string; // name of the match
  description: string; // description of the match
  tournament: string; // name of the tournament
  startTime: number; // start time of the match in unix timestamp
  homeTeam: Team; // name of home team
  awayTeam: Team; // name of away team
  status: MatchStatus; // status of the match
};

/**
 * representation of a match event in the fs system
 */
type MatchEvent = {
  matchDetails: MatchDetails; // details of the match event
  matchUserScores: Record<string, number>; // mapping b/w user address and score
  matchPlayerPoints: Record<string, number>; // mapping b/w player hash and points
  matchUserSelectedPlayers: Record<string, string[]>; // mapping b/w user address and selected player hashes
};

type FSHubState = {
  managers: string[]; // list of admin addresses that can add details to the match event
  matchEvents: Record<string, MatchEvent>; // mapping b/w match id and match event
};

/**
 * A struct representing the input type of `CreateMatch` STF.
 */
type CreateMatchInput = {
  name: string;
  description: string;
  tournament: string;
  startTime: number;
  homeTeamName: string;
  awayTeamName: string;
};

/**
 * A struct representing the input type of `AddPlayersToTeam` STF.
 */
type AddPlayerToTeamInMatchInput = {
  matchName: string;
  teamName: string;
  playerName: string;
};

export type {
  FSHubState,
  MatchEvent,
  MatchDetails,
  Player,
  Team,
  CreateMatchInput,
  AddPlayerToTeamInMatchInput,
};
