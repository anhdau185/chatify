import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('IN_DESKTOP_ENV', true);
