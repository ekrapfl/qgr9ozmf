import { Component, inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { providePersistStore } from '@ngrx-addons/persist-state';
import { provideSyncStore } from '@ngrx-addons/sync-state';
import { feature, featureAProviders, globalAction } from './feature';
import { provideStore, Store } from '@ngrx/store';
import { ManualRehydration, ManualSyncInitialization, appInitializer } from './app-initializer';

@Component({
  selector: 'app-root',
  template: `
    <h1>Persist/Sync Bug Repro</h1>
    <ul>
      <li>Open in two tabs</li>
      <li>Refresh the second tab</li>
      <li>Click "Update states" in the first tab</li>
      <li>Notice that the counter will not update in the second tab</li>
      <li>Click "Update states" in the first tab again</li>
      <li>Notice that the counter in the second tab will be updated correctly every time now</li>
    </ul>
    <button (click)="updateFeatures()">Update states</button>
    <div>A: {{ aState() }}</div>
  `,
})
export class DemoComponent {
  private readonly store = inject(Store);

  public aState = this.store.selectSignal(feature.selectA);

  public updateFeatures(): void {
    this.store.dispatch(globalAction());
  }
}

bootstrapApplication(DemoComponent, {
  providers: [
    provideAppInitializer(appInitializer),
    provideStore({}, { metaReducers: [] }),
    providePersistStore({ strategy: ManualRehydration }),
    provideSyncStore({ strategy: ManualSyncInitialization }),
    [...featureAProviders],
  ],
});
