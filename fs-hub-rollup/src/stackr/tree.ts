import { solidityPackedKeccak256 } from 'ethers';
import { MerkleTree } from 'merkletreejs';
import { FSHubState, MatchDetails } from './types';

export const constructTree = (state: FSHubState): MerkleTree => {
  // console.log('constructing tree');
  const adminHashes = state.managers.map((address) =>
    solidityPackedKeccak256(['address'], [address]),
  );
  const HashedMatchEvents = Object.entries(state.matchEvents).map(
    (matchEntry) => {
      // console.log(matchEntry[0]);
      // console.log(matchEntry[1].matchDetails);

      // function to get the hash of a match
      const getMatchHash = (matchDetails: MatchDetails) => {
        // console.log('matchDetails', matchDetails);
        const homeTeamPlayersHash = matchDetails.homeTeam.players.map(
          (player) => {
            return solidityPackedKeccak256(
              ['string', 'string'],
              [player.id, player.name],
            );
          },
        );
        // console.log('homeTeamPlayersHash', homeTeamPlayersHash);

        const awayTeamPlayersHash = matchDetails.awayTeam.players.map(
          (player) => {
            return solidityPackedKeccak256(
              ['string', 'string'],
              [player.id, player.name],
            );
          },
        );
        // console.log('awayTeamPlayersHash', awayTeamPlayersHash);

        const homeTeamHash = solidityPackedKeccak256(
          ['string', 'string', 'string'],
          [
            matchDetails.homeTeam.id,
            matchDetails.homeTeam.name,
            new MerkleTree(homeTeamPlayersHash).getHexRoot(),
          ],
        );
        // console.log('homeTeamHash', homeTeamHash);
        const awayTeamHash = solidityPackedKeccak256(
          ['string', 'string', 'string'],
          [
            matchDetails.awayTeam.id,
            matchDetails.awayTeam.name,
            new MerkleTree(awayTeamPlayersHash).getHexRoot(),
          ],
        );
        // console.log('awayTeamHash', awayTeamHash);

        const matchHash = solidityPackedKeccak256(
          [
            'string',
            'string',
            'string',
            'uint256',
            'string',
            'string',
            'string',
          ],
          [
            matchDetails.name,
            matchDetails.description,
            matchDetails.tournament,
            matchDetails.startTime,
            homeTeamHash,
            awayTeamHash,
            matchDetails.status.toString(),
          ],
        );
        return matchHash;
      };

      const matchHash = getMatchHash(matchEntry[1].matchDetails);
      // console.log('matchHash', matchHash);

      const matchUserScoreHashes = Object.entries(
        matchEntry[1].matchUserScores,
      ).map(([userAddress, score]) =>
        solidityPackedKeccak256(['address', 'uint256'], [userAddress, score]),
      );
      // console.log('matchUserScoreHashes', matchUserScoreHashes);
      const matchUserScoreRoot = new MerkleTree(
        matchUserScoreHashes,
      ).getHexRoot();
      // console.log('matchUserScoreRoot', matchUserScoreRoot);

      const matchPlayerPointHashes = Object.entries(
        matchEntry[1].matchPlayerPoints,
      ).map(([playerHash, points]) =>
        solidityPackedKeccak256(['string', 'uint256'], [playerHash, points]),
      );
      // console.log('matchPlayerPointHashes', matchPlayerPointHashes);
      const matchPlayerPointRoot = new MerkleTree(
        matchPlayerPointHashes,
      ).getHexRoot();
      // console.log('matchPlayerPointRoot', matchPlayerPointRoot);

      const matchUserSelectedPlayersHashes = Object.entries(
        matchEntry[1].matchUserSelectedPlayers,
      ).map(([userAddress, playerHashes]) =>
        solidityPackedKeccak256(
          ['address', 'string'],
          [userAddress, new MerkleTree(playerHashes).getHexRoot()],
        ),
      );
      // console.log('matchUserSelectedPlayersHashes', matchUserSelectedPlayersHashes);
      const matchUserSelectedPlayersRoot = new MerkleTree(
        matchUserSelectedPlayersHashes,
      ).getHexRoot();
      // console.log('matchUserSelectedPlayersRoot', matchUserSelectedPlayersRoot);

      return new MerkleTree([
        matchHash,
        matchUserScoreRoot,
        matchPlayerPointRoot,
        matchUserSelectedPlayersRoot,
      ]).getHexRoot();
    },
  );

  const adminsRoot = new MerkleTree(adminHashes).getHexRoot();
  const HashedMatchEventsRoot = new MerkleTree(HashedMatchEvents).getHexRoot();

  return new MerkleTree([adminsRoot, HashedMatchEventsRoot]);
};
