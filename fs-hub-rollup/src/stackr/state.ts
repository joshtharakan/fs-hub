import { State } from '@stackr/sdk/machine';
import { FSHubState, MatchDetails, MatchEvent } from './types';
import MerkleTree from 'merkletreejs';
import { ZeroHash, solidityPackedKeccak256 } from 'ethers';
import { BytesLike } from 'ethers';
import { constructTree } from './tree';

// export class FSHubStateWrapper {

//     public tree: MerkleTree;
//     public FSHub: FSHubState;

//     constructor(state: FSHubState) {
//         this.tree = this.constructTree(state);
//         this.FSHub = state;
//     }

//     constructTree(state: FSHubState): MerkleTree {
//         const HashedMatchEvents = Object.entries(state.matchEvents).map((matchEntry) => {

//             const getMatchHash = (matchDetails: MatchDetails) => {
//                 const homeTeamPlayersHash = matchDetails.homeTeam.players.map((player) => {
//                     return solidityPackedKeccak256(
//                         ["string", "string"],
//                         [player.id, player.name]);
//                 });
//                 const awayTeamPlayersHash = matchDetails.awayTeam.players.map((player) => {
//                     return solidityPackedKeccak256(
//                         ["string", "string"],
//                         [player.id, player.name]);
//                 });

//                 const homeTeamHash = solidityPackedKeccak256(
//                     ["string", "string", "string"],
//                     [matchDetails.homeTeam.id, matchDetails.homeTeam.name, new MerkleTree(homeTeamPlayersHash).getHexRoot()]
//                 );
//                 const awayTeamHash = solidityPackedKeccak256(
//                     ["string", "string", "string"],
//                     [matchDetails.awayTeam.id, matchDetails.awayTeam.name, new MerkleTree(awayTeamPlayersHash).getHexRoot()]
//                 );
//                 const matchHash = solidityPackedKeccak256(
//                     ["string", "string", "string", "string", "uint256", "string", "string"],
//                     [matchDetails.name, matchDetails.description, matchDetails.tournament, matchDetails.startTime, homeTeamHash, awayTeamHash]
//                 );
//                 return matchHash;
//             }

//             const matchUserScoreHashes = Object.entries(matchEntry[1].matchUserScores).map(
//                 ([userAddress, score]) =>
//                     solidityPackedKeccak256(["address", "uint256"], [userAddress, score])
//             );

//             const matchPlayerPointHashes = Object.entries(matchEntry[1].matchPlayerPoints).map(
//                 ([playerHash, points]) =>
//                     solidityPackedKeccak256(["string", "uint256"], [playerHash, points])
//             );

//             const matchUserSelectedPlayersHashes = Object.entries(
//                 matchEntry[1].matchUserSelectedPlayers
//             ).map(([userAddress, playerHashes]) =>
//                 solidityPackedKeccak256(
//                     ["address", "string"],
//                     [userAddress, new MerkleTree(playerHashes).getHexRoot()]
//                 )
//             );
//             const adminsRoot = new MerkleTree(adminHashes).getHexRoot();
//             const matchUserScoreRoot = new MerkleTree(matchUserScoreHashes).getHexRoot();
//             const matchPlayerPointRoot = new MerkleTree(matchPlayerPointHashes).getHexRoot();
//             const matchUserSelectedPlayersRoot = new MerkleTree(matchUserSelectedPlayersHashes).getHexRoot();
//             return new MerkleTree([
//                 adminsRoot,
//                 getMatchHash(matchEntry[1].matchDetails),
//                 matchUserScoreRoot,
//                 matchPlayerPointRoot,
//                 matchUserSelectedPlayersRoot
//             ]).getHexRoot();
//         });
//         const adminHashes = state.managers.map((address) =>
//             solidityPackedKeccak256(["address"], [address])
//         );
//         return new MerkleTree(
//             adminHashes,
//             HashedMatchEvents
//         );
//     }
// }

export class FSHub extends State<FSHubState> {
  constructor(state: FSHubState) {
    super(state);
  }

  // transformer() {
  //   return {
  //     wrap: () => {
  //       return new FSHubStateWrapper(this.state);
  //     },
  //     unwrap: (wrappedState: FSHubStateWrapper) => {
  //       return wrappedState.FSHub;
  //     },
  //   };
  // }

  getRootHash(): string {
    // if (!this.state) {
    //     return ZeroHash;
    //   }
    //   return this.transformer().wrap().tree.getRoot();
    const tree = constructTree(this.state);
    return tree.getHexRoot();
  }
}
