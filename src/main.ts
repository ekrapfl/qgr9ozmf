import { Component, importProvidersFrom, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { providePersistStore } from '@ngrx-addons/persist-state';
import { provideSyncStore } from '@ngrx-addons/sync-state';
import { featureA, featureAProviders, globalAction } from './feature-a.module';
import { provideStore, Store } from '@ngrx/store';

@Component({
  selector: 'app-root',
  template: `
    <h1>Persist/Sync features</h1>
    <p>
      Open another tab and add update states to see sync in action. State will be
      rehydrated on page refresh.
    </p>
    <button (click)="updateFeatures()">Update states</button>
    <ul>
      <li>A: {{ aState() | json }}</li>
    </ul>
  `,
  imports: [JsonPipe],
})
export class DemoComponent {
  private readonly store = inject(Store);

  public aState = this.store.selectSignal(featureA.selectAState);

  public updateFeatures(): void {
    this.store.dispatch(globalAction());
  }
}

bootstrapApplication(DemoComponent, {
  providers: [
    provideStore({}, { metaReducers: [] }),
    providePersistStore(),
    provideSyncStore(),
    [...featureAProviders],
  ],
});
