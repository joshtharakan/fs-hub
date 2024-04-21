import { Wallet } from 'ethers';
import { STATE_MACHINES } from './stackr/machine';
import { FSHubStateMachine, fsHub } from './stackr/mru';
import {
  ActionSchema,
  AllowedInputTypes,
  ConfirmationEvents,
} from '@stackr/sdk';
import { Playground } from '@stackr/sdk/plugins';
import { AddPlayerToTeamInMatchInput, CreateMatchInput } from './stackr/types';
import { addPlayerToTeamInMatchSchema, createMatchSchema } from './stackr/action';

const signMessage = async (
  wallet: Wallet,
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

  const adminAcc = new Wallet(process.env.PRIVATE_KEY!); // 0xFC2298D538625d65648585e83D34499C3aEb0fbE

  const matchName = 'RR-MI';
  const homeTeamName = 'Rajastan Royals';
  const awayTeamName = 'Mumbai Indians';

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
  // await till the action is confirmed by using the subscription of events
  // await new Promise<void>((resolve) => {
  //   fsHub.events.subscribe(ConfirmationEvents.C2, (action) => {
  //     // console.log(action);
  //     resolve(undefined);
  //   });
  // // });


  const { state } = fsHubMRU;
  console.log('Current state:', state);

  // add players to the teams
  // RR players
  let inputRR: AddPlayerToTeamInMatchInput = {
    matchName: matchName,
    teamName: homeTeamName,
    playerName: ''
  };

  for (let player of ['Sanju Samson', 'Yashavi Jaiswal', 'Riyan Parag', 'Dhruv Jurel', 'Jos Buttler', 'David Miller', 'Shivam Dube', 'Chris Morris', 'Rahul Tewatia', 'Shreyas Gopal', 'Kartik Tyagi']) {
    inputRR.playerName = player;
    const signatureRR = await signMessage(adminAcc, addPlayerToTeamInMatchSchema, inputRR);
    const addPlayerActionRR = addPlayerToTeamInMatchSchema.actionFrom({
      inputs: inputRR,
      signature: signatureRR,
      msgSender: adminAcc.address,
    });
    const ackRR = await fsHub.submitAction('addPlayerToTeamInMatch', addPlayerActionRR);
    console.log('\n----------[output]----------');
    console.log('Action has been submitted.');
    console.log(ackRR);
  }

    // MI players
    let inputMI: AddPlayerToTeamInMatchInput = {
      matchName: matchName,
      teamName: awayTeamName,
      playerName: ''
    };
  
    for (let player of ['Rohit Sharma', 'Hardik Pandya', 'Suryakumar Yadav', 'Kwena Mapaka', 'Tim David' , 'Harvik Desai', 'Ishan Kishan', 'Naman Dhir', 'Jasprit Bumrah', 'Trent Boult', 'Rahul Chahar']) {
      inputMI.playerName = player;
      const signatureRR = await signMessage(adminAcc, addPlayerToTeamInMatchSchema, inputMI);
      const addPlayerActionRR = addPlayerToTeamInMatchSchema.actionFrom({
        inputs: inputMI,
        signature: signatureRR,
        msgSender: adminAcc.address,
      });
      const ackRR = await fsHub.submitAction('addPlayerToTeamInMatch', addPlayerActionRR);
      console.log('\n----------[output]----------');
      console.log('Action has been submitted.');
      console.log(ackRR);
    }
  console.log('Current state:', state);
};

main();
