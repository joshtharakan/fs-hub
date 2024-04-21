import { Wallet } from 'ethers';
import { STATE_MACHINES } from './stackr/machine';
import { FSHubStateMachine, fsHub } from './stackr/mru';
import {
  ActionSchema,
  AllowedInputTypes,
  ConfirmationEvents,
} from '@stackr/sdk';
import { Playground } from '@stackr/sdk/plugins';
import {
  AddPlayerSelectionForMatchInput,
  AddPlayerToTeamInMatchInput,
  CalculatePlayerPointsForMatchInput,
  CalculateUserScoresForMatchInput,
  CreateMatchInput,
} from './stackr/types';
import {
  addPlayerSelectionForMatchSchema,
  addPlayerToTeamInMatchSchema,
  calculateAllUserScoreForMatchSchema,
  calculatePlayerPointsForMatchSchema,
  createMatchSchema,
} from './stackr/action';
import { HDNodeWallet } from 'ethers';
import playerStats from '../playerStats.json';


const signMessage = async (
  wallet: Wallet | HDNodeWallet,
  schema: ActionSchema,
  payload: AllowedInputTypes,
) => {
  const signature = await wallet.signTypedData(
    schema.domain,
    schema.EIP712TypedData.types,
    payload,
  );
  return signature;
};


const adminAcc = new Wallet(process.env.PRIVATE_KEY!); // 0xFC2298D538625d65648585e83D34499C3aEb0fbE

const matchName = 'RR-MI';
const homeTeamName = 'Rajastan Royals';
const awayTeamName = 'Mumbai Indians';

const RRPlayers = [
  'Sanju Samson',
  'Yashavi Jaiswal',
  'Riyan Parag',
  'Dhruv Jurel',
  'Jos Buttler',
  'David Miller',
  'Shivam Dube',
  'Chris Morris',
  'Rahul Tewatia',
  'Shreyas Gopal',
  'Kartik Tyagi',
];

 
const MIPlayers = [
  'Rohit Sharma',
  'Hardik Pandya',
  'Suryakumar Yadav',
  'Kwena Mapaka',
  'Tim David',
  'Harvik Desai',
  'Ishan Kishan',
  'Naman Dhir',
  'Jasprit Bumrah',
  'Trent Boult',
  'Rahul Chahar',
];

const user1SelectedPlayers = [
  'Sanju Samson',
  'Rohit Sharma',
  'Tim David',
  'Jos Buttler',
  'Shivam Dube',
];

const user2SelectedPlayers = [
  'Hardik Pandya',
  'Jasprit Bumrah',
  'Riyan Parag',
  'Rahul Tewatia',
  'Dhruv Jurel',
];



const CreateMatch = async () => {

    const input: CreateMatchInput = {
      name: matchName,
      description: 'Rajastan Royals vs Mumbai Indians',
      tournament: 'IPL 2024',
      startTime: Date.now() + 2 * 24 * 60 * 60 * 1000, // two days from now
      homeTeamName: homeTeamName,
      awayTeamName: awayTeamName,
    };
    const signature = await signMessage(adminAcc, createMatchSchema, input);
    const createMatchAction = createMatchSchema.actionFrom({
      inputs: input,
      signature,
      msgSender: adminAcc.address,
    });
    const ack = await fsHub.submitAction('createMatch', createMatchAction);

    console.log('\n----------[output]----------');
    console.log('Action has been submitted.');
    console.log(ack);
    console.log('----------[/output]----------\n');
}

const addPlayersToTeam = async (teamName: string, players: string[]) => {
  // RR players
  let input: AddPlayerToTeamInMatchInput = {
    matchName: matchName,
    teamName: teamName,
    playerName: '',
  };

  for (let player of players) {
    input.playerName = player;
    const signatureRR = await signMessage(
      adminAcc,
      addPlayerToTeamInMatchSchema,
      input,
    );
    const addPlayerActionRR = addPlayerToTeamInMatchSchema.actionFrom({
      inputs: input,
      signature: signatureRR,
      msgSender: adminAcc.address,
    });
    const ackRR = await fsHub.submitAction(
      'addPlayerToTeamInMatch',
      addPlayerActionRR,
    );
    console.log('\n----------[output]----------');
    console.log('Action has been submitted.');
    console.log(ackRR);
  }
};

const userSelection = async (userWallet: HDNodeWallet, userSelectedPlayers: string[]) => {


  // User selection
  let userSelectionInput: AddPlayerSelectionForMatchInput = {
    matchName: matchName,
    playerName: '',
  };

  for (let player of userSelectedPlayers) {
    userSelectionInput.playerName = player;
    const userSelectionSignature = await signMessage(
      userWallet,
      addPlayerSelectionForMatchSchema,
      userSelectionInput,
    );
    const userSelectionAction = addPlayerSelectionForMatchSchema.actionFrom({
      inputs: userSelectionInput,
      signature: userSelectionSignature,
      msgSender: userWallet.address,
    });
    const userSelectionAck = await fsHub.submitAction(
      'addPlayerSelectionForMatch',
      userSelectionAction,
    );
    console.log('\n----------[output]----------');
    console.log('Action has been submitted.');
    console.log(userSelectionAck);
  }
}

const calculatePlayerPoints = async () => {
  const playerPoints = playerStats as CalculatePlayerPointsForMatchInput[];
  for (let player of playerPoints) {
    player.matchName = matchName;
    const signature = await signMessage(
      adminAcc,
      calculatePlayerPointsForMatchSchema,
      player,
    );
    const action = calculatePlayerPointsForMatchSchema.actionFrom({
      inputs: player,
      signature,
      msgSender: adminAcc.address,
    });
    const ack = await fsHub.submitAction('calculatePlayerPointsForMatch', action);
    console.log('\n----------[output]----------');
    console.log('Action has been submitted.');
    console.log(ack);
  }
}

const calculateUserScores = async () => {
  const input: CalculateUserScoresForMatchInput = {
    matchName: matchName,
  };
  const signature = await signMessage(adminAcc, calculateAllUserScoreForMatchSchema, input);
  const action = calculateAllUserScoreForMatchSchema.actionFrom({
    inputs: input,
    signature,
    msgSender: adminAcc.address,
  });
  const ack = await fsHub.submitAction('calculateAllUserScoreForMatch', action);
  console.log('\n----------[output]----------');
  console.log('Action has been submitted.');
  console.log(ack);
}


const main = async () => {
  // Initialize your Micro-rollup and add a State Machine to it.
  const fsHubMRU = fsHub.stateMachines.get<FSHubStateMachine>(
    STATE_MACHINES.FSHub,
  ) as FSHubStateMachine;
  if (!fsHubMRU) {
    throw new Error('Machine not found');
  }

  // const playground = Playground.init(fsHubMRU);

  //   playground.addGetMethod(
  //     "/custom/leaderboard",
  //     async (_req: Request, res: Response) => {
  //       // returns a simple leaderboard that sorts by score (descending)
  //       const state = Object.entries(fsHubMRU?.state || {});
  //       return res.send({ state });
  //     }
  // );

  // await till the action is confirmed by using the subscription of events
  // await new Promise<void>((resolve) => {
  //   fsHub.events.subscribe(ConfirmationEvents.C2, (action) => {
  //     // console.log(action);
  //     resolve(undefined);
  //   });
  // // });

  fsHub.events.subscribe(ConfirmationEvents.C2, (action) => {
        console.log(action);
  });

  const { state } = fsHubMRU;
  console.log('state:', state);

  // create a match
  console.log('Creating a match...');
  await CreateMatch();


  // add players to the teams
  // RR players
  console.log('Adding players to the teams...');
  await addPlayersToTeam(homeTeamName, RRPlayers);

  // MI players
  await addPlayersToTeam(awayTeamName, MIPlayers);

  console.log('User selection...');

  // user 1 selection
  const userWallet = Wallet.createRandom();
  await userSelection(userWallet, user1SelectedPlayers);
  
  // user 2 selection
  const userWallet2 = Wallet.createRandom();
  await userSelection(userWallet2, user2SelectedPlayers);

  console.log('Calculating player points...');
  // calculate player points from playerStats.json
  await calculatePlayerPoints();
  
  console.log('Calculating user scores...');
  // calculate all user scores
  await calculateUserScores();
  
};

main();
