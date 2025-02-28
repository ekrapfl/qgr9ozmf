import {
  providePersistState,
  sessionStorageStrategy,
} from '@ngrx-addons/persist-state';
import { includeKeys } from '@ngrx-addons/common';
import { provideSyncState } from '@ngrx-addons/sync-state';
import {
  createAction,
  createFeature,
  createReducer,
  on,
  provideState,
} from '@ngrx/store';

export const globalAction = createAction('[All] Global Action');

const stateA = {
  a: 0,
  control: 'test',
};

export const featureA = createFeature({
  name: 'a',
  reducer: createReducer(
    stateA,
    on(globalAction, (state) => {
      console.log('Reducer A');
      return {
        ...state,
        a: state.a + 1,
      };
    })
  ),
});

export const featureAProviders = [
  provideState(featureA),
  providePersistState({
    key: featureA.name,
    states: [
      {
        storage: sessionStorageStrategy,
      },
    ],
  }),
  provideSyncState<typeof stateA>({
    key: featureA.name,
    states: [
      {
        source: (state$) => state$.pipe(includeKeys(['control', 'a'])),
      },
    ],
  }),
];
