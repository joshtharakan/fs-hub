import { FSHub } from './state';
import genesisState from '../../genesis-state.json';
import { transitions } from './transitions';
import { StateMachine } from '@stackr/sdk/machine';

const STATE_MACHINES = {
  FSHub: 'fs-hub',
};

const fsHubStateMachine = new StateMachine({
  id: STATE_MACHINES.FSHub,
  stateClass: FSHub,
  initialState: genesisState.state,
  on: transitions,
});

export { STATE_MACHINES, fsHubStateMachine };
