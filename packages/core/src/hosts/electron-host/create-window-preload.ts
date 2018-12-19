import * as Electron from 'electron';

Electron.webFrame.setLayoutZoomLevelLimits(-999999, 999999);
Electron.webFrame.setZoomFactor(1);

const ezl = Electron.webFrame.getZoomLevel();
Electron.webFrame.setLayoutZoomLevelLimits(ezl, ezl);
