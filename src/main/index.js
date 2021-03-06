/**
 * @author   service@ntfstool.com
 * Copyright (c) 2020 ntfstool.com
 * Copyright (c) 2020 alfw.com
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the MIT General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * MIT General Public License for more details.
 *
 * You should have received a copy of the MIT General Public License
 * along with this program (in the main directory of the NTFS Tool
 * distribution in the file COPYING); if not, write to the service@ntfstool.com
 */

// import {app, BrowserWindow, Menu, Tray, ipcMain,globalShortcut,crashReporter,screen} from 'electron'

import {app,ipcMain,ipcRenderer,Notification} from 'electron'
const saveLog = require('electron-log');


import {checkNeedInitStore,setDefaultStore} from '../common/utils/AlfwStore.js'
import {openPages,openPageByName,toggleTrayMenu,exitAll,doChangeLangEvent,doDesktopAppEvent,doSudoPwdEvent} from '../main/lib/PageConfig.js'

app.disableHardwareAcceleration();//disable gpu

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

app.allowRendererProcessReuse = true;

try {
    app.on('ready', () => {
        checkNeedInitStore();
        openPages();
    })

    app.on('before-quit', () => {
        exitAll();
    })

    //for ctrl + c exit
    process.on("SIGINT", function () {
        console.log('WTF')
        exitAll();
        process.exit(0)

    });

    //Main process listen message
    ipcMain.on('MainMsgFromRender', function (event, arg) {
        console.warn(arg, "Main process listened the message");
        if (arg == "exitAll") {
            exitAll();
        } else if (arg == "resetConf") {
            setDefaultStore();
            event.returnValue = 'succ';
        } else {
            //TODO
            openPageByName(arg);
        }
    })

    //listen the TrayMenu
    ipcMain.on('toggleTrayMenu', function (event, arg) {
        toggleTrayMenu();
    })

    //listen the lang change
    ipcMain.on('ChangeLangEvent', function (event, arg) {
        doChangeLangEvent(arg);
    })

    //listen and send the device event
    ipcMain.on('DesktopAppEvent', function (event, arg) {
        doDesktopAppEvent(arg);
    })

    //sudo pwd event
    ipcMain.on('SudoPwdEvent', function (event, arg) {
        doSudoPwdEvent(arg);
    })

    //sudo pwd event
    ipcMain.on('NoticeEvent', function (event, arg) {
        console.warn(arg,"MainProcessNotice")
        new Notification(arg).show();
    })
}catch (e) {
    saveLog.error(e,"mainError exitAll");
    exitAll();
}

