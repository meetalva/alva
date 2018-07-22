import * as Electron from 'electron';

Electron.webFrame.setZoomLevel(1);
Electron.webFrame.setVisualZoomLevelLimits(1, 1);
Electron.webFrame.setLayoutZoomLevelLimits(0, 0);
