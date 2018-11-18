import { startRenderer } from './renderer';
import * as MobileDnD from 'mobile-drag-drop';

// Convince iOS to collaborate with mobile-dnd
// tslint:disable-next-line:no-empty
window.addEventListener('touchmove', () => {});

MobileDnD.polyfill();
startRenderer();
