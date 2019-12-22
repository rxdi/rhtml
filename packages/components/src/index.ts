import '@rhtml/renderer';

import { LensComponent } from './lens';
import { FetchComponent } from './fetch';
import { MonadComponent } from './part-monad';
import { RenderComponent } from './render';
import { StateComponent } from './state';
import { SettingsComponent } from './settings';

// export * from './types';
export * from './lens';
export * from './render';
export * from './part-monad';
export * from './settings';
export * from './state';
// export * from './tokens';

declare global {
  interface HTMLElementTagNameMap {
    'r-lens': LensComponent;
    'r-fetch': FetchComponent;
    'r-part': MonadComponent;
    'r-render': RenderComponent;
    'r-settings': SettingsComponent;
    'r-state': StateComponent;
  }
}
