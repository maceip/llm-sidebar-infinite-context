/*
	xbox _fix
*/

// new code

function updateShuffRep() {
  if (player.settings.getMode('shuffle')) {
    shuffleButton.down = true;
  } else {
    shuffleButton.down = false;
  }

  if (player.settings.getMode('loop')) {
    loopButton.down = true;
  } else {
    loopButton.down = false;
  }
}

// open file
function openFile() {
  var media = theme.openDialog('FILE_OPEN', 'FILES_ALLMEDIA');
  if (media) {
    player.URL = media;
    player.controls.play();
  }
}

function updateToolTip(id, button, tip) {
  if ('true' == theme.loadPreference(id)) {
    eval(button + ".upToolTip = 'Hide " + tip + "'");
  } else {
    eval(button + ".upToolTip = 'Show " + tip + "'");
  }
}

function viewHotKeys() {
  switch (event.keycode) {
    case 122:
    case 90:
      player.controls.previous();
      break;
    case 120:
    case 88:
      player.controls.play();
      break;
    case 99:
    case 67:
      player.controls.pause();
      break;
    case 118:
    case 86:
      player.controls.stop();
      break;
    case 98:
    case 66:
      player.controls.next();
      break;
    case 108:
    case 76:
      openFile();
      break;
    case 80:
    case 102:
    case 70:
      break;
  }
}

var vidViewer = (eqViewer = visViewer = false);
var vidSets = false;
var visStatus = 1;
var contentStatus = 1;
var reverseA = false;

function onPlayStateChange() {
  //checks the playstates
  if (player) {
    switch (player.playState) {
      case 1:
        visStatus = visStatus;
        disableVis();

        updateMetadata();
        break;
      case 2:
        visButton.enabled = false;
        break;
      case 3:
        if (player.currentMedia.ImageSourceWidth > 0) {
          theme.openView('videoBox');
          disableVis();
          break;
        }
        visChooserPre();
        break;
      case 6:
        visStatus = visStatus;
        disableVis();

        metadata.value += player.status;
        break;
      case 7:
        visStatus = visStatus;
        disableVis();

        break;
      case 8:
        visStatus = visStatus;
        disableVis();

        break;
    }
  }

  if (!player.controls.isAvailable('Stop')) {
    visStatus = visStatus;
    shuffVis();
    disableVis();
  }
  updateMetadata();
}

function disableVis() {
  visAnimation.visible = false;
  visEffects.visible = false;
  visButton.enabled = false;
  visPrev.enabled = false;
  visNext.enabled = false;
  visPrev.moveTo(32, 41, 500);
  visNext.moveTo(142, 40, 500);
}
function updateMetadata() {
  if (player.openState != 13) return;

  metadata.value = player.status;

  authorppl = player.currentmedia.getiteminfo('#author');

  if (authorppl == '') {
    authorppl = player.currentmedia.getiteminfo('author');
  }

  if (authorppl != '') {
    authorppl += ' - ';
  }

  if (metadata.value != '') {
    metadata.value += ' - ';
  }

  bitrater = player.currentmedia
    .getiteminfo('#bitrate')
    .substring(0, player.currentmedia.getiteminfo('#bitrate').length - 3);

  if (bitrater == '') {
    bitrater = player.currentmedia
      .getiteminfo('bitrate')
      .substring(0, player.currentmedia.getiteminfo('bitrate').length - 3);
  }

  bitrater += bitrater ? ' kbps' : '0kbps';

  metadata.value += authorppl;
  metadata.value += player.currentmedia.name;
  metadata.scrolling = metadata.textWidth > metadata.width;
}

function visChooserPre() {
  visStatus = visStatus;
  shuffVis();
  visButton.enabled = true;
}

function openVidWindow() {
  theme.openview('videoBox');
  vidViewer = true;
  disableVis();
}

function mainLoader() {
  visEffects.currentEffectType = mediacenter.effectType;
  visEffects.currentPreset = mediacenter.effectPreset;

  loadPrefs();
  onPlayStateChange();
  updateMetadata();

  volume.value = player.settings.volume;
}

// playlist

function onLoadPL() {
  theme.savePreference('plViewer', 'true');
  var dwScale = theme.loadPreference('PlaylistWidth');

  if ('--' != dwScale) {
    plBox.width = dwScale;
  }
  dwScale = theme.loadpreference('PlaylistHeight');

  if ('--' != dwScale) {
    plBox.height = dwScale;
  }

  plFrame.setColumnResizeMode(0, 'stretches');
  plFrame.setColumnResizeMode(1, 'autosizedata');
  plFrame.setColumnResizeMode(2, 'autosizedata');
  plFrame.setColumnResizeMode(3, 'autosizedata');
}

function onClosePL() {
  theme.savepreference('PlaylistWidth', plBox.width);
  theme.savepreference('PlaylistHeight', plBox.height);
}

function togglePL() {
  if ('true' == theme.loadPreference('plViewer')) {
    theme.savePreference('plViewer', 'false');
    theme.closeView('plBox');
  } else {
    theme.openView('plBox');
  }
}

function toggleContent() {
  if ('true' == theme.loadPreference('contentViewer')) {
    theme.savePreference('contentViewer', 'false');
    theme.closeView('contentBox');
  } else {
    theme.openView('contentBox');
  }
}

function showEQ() {
  if (!eqViewer) {
    eqBack.visible = true;
    eqButton.upToolTip = 'Hide Equalizer';
    eqViewer = !eqViewer;
    visButtonEQKiller.visible = true;
    visButton.visible = false;
  } else {
    eqBack.visible = false;
    eqButton.upToolTip = 'Show Equalizer';
    eqViewer = !eqViewer;
    visButtonEQKiller.visible = false;
    visButton.visible = true;
  }
}

function shuffVis() {
  visStatus;
  switch (visStatus) {
    case 1:
      visViewer = false;
      visAnimation.visible = true;
      visEffects.visible = false;
      visPrev.enabled = false;
      visNext.enabled = false;
      visStatus = 1;
      visButton.upToolTip = 'Vis Effects - Click to change';
      break;
    case 2:
      visViewer = true;
      visAnimation.visible = false;
      visEffects.visible = true;
      visPrev.enabled = true;
      visNext.enabled = true;
      visPrev.moveTo(32, 21, 500);
      visNext.moveTo(142, 20, 500);
      visStatus = 2;
      visButton.upToolTip = 'Hide Vis Effects';
      break;
    case 3:
      visViewer = 'dos';
      visAnimation.visible = false;
      visEffects.visible = false;
      visPrev.enabled = false;
      visNext.enabled = false;
      visButton.enabled = true;
      visStatus = 0;
      visPrev.moveTo(32, 41, 500);
      visNext.moveTo(142, 40, 500);
      visButton.upToolTip = 'Vis Effects  - Click to change';
      break;
  }
}

function stopVideo() {
  if (player.currentMedia.ImageSourceWidth > 0) {
    player.controls.stop();
  }
  videoBox.close();
}

function moveVidSettings() {
  if (!vidSets) {
    settingsFrame.visible = true;
    vidSettings.moveTo(0, view.height - 111, 500);
    xUp.visible = true;
    xDown.visible = false;
    vidDrawerUpS.enabled = false;
    vidSets = !vidSets;
  } else {
    vidSettings.moveTo(0, view.height - 210, 500);
    xUp.visible = false;
    xDown.visible = true;
    vidDrawerUpS.enabled = true;
    vidSets = !vidSets;
  }
}

function hideVidSettings() {
  vidSets = vidSets;
  settingsFrame.visible = vidSets;
}

function contentSwitcher() {
  contentStatus;
  switch (contentStatus) {
    case 1:
      contentShow.backgroundImage = 'c_xbox.jpg';
      cPrev.visible = false;
      xboxText.moveTo(65, 172, 500);
      gamesText.moveTo(65, 235, 500);
      systemLink.visible = true;
      gamesLink.visible = false;
      abcLink.visible = false;
      winmediaLink.visible = false;
      csLink.visible = false;
      break;
    case 2:
      contentShow.backgroundImage = 'c_games.jpg';
      cPrev.visible = true;
      xboxText.moveTo(65, 92, 500);
      gamesText.moveTo(65, 172, 500);
      webText.moveTo(65, 235, 500);
      systemLink.visible = false;
      gamesLink.visible = true;
      abcLink.visible = false;
      winmediaLink.visible = false;
      csLink.visible = false;
      break;
    case 3:
      systemLink.visible = false;
      gamesLink.visible = false;
      abcLink.visible = true;
      winmediaLink.visible = false;
      csLink.visible = false;

      contentShow.backgroundImage = 'c_web.jpg';
      wLink.visible = false;
      xLink.visible = true;
      cNext.visible = true;
      gamesText.moveTo(65, 92, 500);
      webText.moveTo(65, 172, 500);
      winmediaText.moveTo(65, 235, 500);
      //winmediaTextL.moveTo(65,255,300);
      break;
    case 4:
      contentShow.backgroundImage = 'c_winmedia.jpg';
      wLink.visible = true;
      wLink2.visible = false;
      xLink.visible = false;
      cNext.visible = true;
      webText.moveTo(65, 92, 500);
      winmediaText.moveTo(65, 175, 500);
      winmediaTextCS.moveTo(65, 235, 500);
      systemLink.visible = false;
      gamesLink.visible = false;
      abcLink.visible = false;
      winmediaLink.visible = true;
      csLink.visible = false;
      break;
    case 5:
      wLink.visible = false;
      wLink2.visible = true;
      contentShow.backgroundImage = 'c_winmedia_cs.jpg';
      winmediaText.moveTo(65, 92, 500);
      winmediaTextCS.moveTo(65, 175, 500);
      cNext.visible = false;
      systemLink.visible = false;
      gamesLink.visible = false;
      abcLink.visible = false;
      winmediaLink.visible = false;
      csLink.visible = true;
      break;
  }
}

function shutDown() {
  savePrefs();
  mediacenter.effectType = visEffects.currentEffectType;
  mediacenter.effectPreset = visEffects.currentPreset;
}

function reverseAnim() {
  if (!reverseA) {
    introAnim.backgroundImage = 'intro_anim_rev.gif';
    reverseButton.upToolTip = 'Open Shutter';
    reverseButton.downToolTip = 'Open Shutter';
    introPNG.visible = true;
    disableVis();
    plButton.enabled = false;
    eqButton.enabled = false;
    reverseA = !reverseA;
    if ((eqViewer = eqViewer)) {
      showEQ();
    }
  } else {
    introAnim.backgroundImage = 'intro_anim.gif';
    reverseButton.upToolTip = 'Close Shutter';
    introPNG.visible = false;
    plButton.enabled = true;
    eqButton.enabled = true;
    reverseA = !reverseA;
    onPlayStateChange();
  }
}

function loadPrefs() {
  var _eqViewer = theme.loadPreference('eqViewer');
  var _visStatus = theme.loadPreference('visStatus');

  if (_eqViewer != '--') {
    eqViewer = _eqViewer.toLowerCase() == 'true' ? false : true;
  } else {
    eqViewer = true;
  }

  if ('true' == theme.loadPreference('plViewer')) {
    theme.openView('plBox');
  }

  if ('true' == theme.loadPreference('contentViewer')) {
    theme.openView('contentBox');
  }

  shuffVis();
  showEQ();
}

function savePrefs() {
  theme.savePreference('eqViewer', eqViewer);
  theme.savePreference('visStatus', visStatus);
}
///////////
function loadVidPrefs() {
  var _vidSets = theme.loadPreference('vidSets');

  if (_vidSets != '--') {
    vidSets = _vidSets.toLowerCase() == 'true' ? false : true;
  } else {
    vidSets = true;
  }

  checkSnapStatus();
  checkVideoPlayerState();
  moveVidSettings();
}

function saveVidPrefs() {
  theme.savePreference('vidSets', vidSets);
}

function loadVidSize() {
  var vidSizer = theme.loadPreference('videoWidth');

  if ('--' != vidSizer) {
    view.width = vidSizer;
  }
  vidSizer = theme.loadpreference('videoHeight');

  if ('--' != vidSizer) {
    view.height = vidSizer;
  }
}

function saveVidSize() {
  theme.savepreference('videoWidth', view.width);
  theme.savepreference('videoHeight', view.height);
  theme.savePreference('vidSnapper', 'false');
  //vidZoom.upToolTip = "Click To Set Video Size";
  mediacenter.videoZoom = 50;
}

function videoZoom() {
  if ('false' == theme.loadPreference('vidSnapper')) {
    mediacenter.videoZoom = 50;
  }
  if (mediacenter.videoZoom < 76) {
    mediacenter.videoZoom = 100;
  } else if (mediacenter.videoZoom < 101) {
    mediacenter.videoZoom = 150;
  } else if (mediacenter.videoZoom < 156) {
    mediacenter.videoZoom = 200;
  } else {
    mediacenter.videoZoom = 75;
  }
  SnapToVideo();
  //updateZoomToolTip();
}

function updateZoomToolTip() {
  vidZoom.upToolTip =
    'Video Size - [current: ' + mediacenter.videoZoom + '%] - [next: ';

  if (mediacenter.videoZoom < 76) {
    nextZoom = 100;
  } else if (mediacenter.videoZoom < 101) {
    nextZoom = 150;
  } else if (mediacenter.videoZoom < 156) {
    nextZoom = 200;
  } else {
    nextZoom = 75;
  }

  vidZoom.upToolTip += nextZoom + '%]';

  if ('false' == theme.loadPreference('vidSnapper')) {
    vidZoom.upToolTip = 'Click To Set Video Size';
  }
}

function SnapToVideo() {
  theme.savePreference('vidSnapper', 'true');

  var zoom = mediacenter.videoZoom;
  var viewWidth = player.currentMedia.imageSourceWidth * (zoom / 100.0);
  var viewHeight = player.currentMedia.imageSourceHeight * (zoom / 100.0);

  view.width = viewWidth + 91;
  view.height = viewHeight + 179;
}

function checkSnapStatus() {
  if ('false' == theme.loadPreference('vidSnapper')) {
    loadVidSize();
  } else {
    SnapToVideo();
  }
}

function checkVideoPlayerState() {
  if (player) {
    switch (player.playState) {
      case 0: //undefined
        break;
      case 1: //stopped
        break;
      case 2: //paused
        break;
      case 3: //playing
        videoWin.visible = true;
        xLogo.visible = false;
        checkSnapStatus();
        if (!player.currentMedia.ImageSourceWidth > 0) {
          view.close();
          break;
        }
        break;
      case 6: //buffering
        break;
      case 7: //waiting
        break;
      case 8: //media ended
        break;
      case 9: //Transitioning
        break;
      case 10: //Ready
        break;
    }
  }

  if (!player.controls.isAvailable('Stop')) {
    videoWin.visible = false;
    xLogo.visible = true;
  }
}

////////////////////

function resetCode() {
  event.keycode = 65;
}

function pressButton(event) {
  switch (event.keycode) {
    case 88:
    case 120:
      player.launchURL('http://www.xbox.com/downloads/wmskinee');
      break;
  }
}

function seekUpDown(event) {
  switch (event.keycode) {
    case 39:
      if (player.controls.currentPosition < 900) {
        player.controls.currentPosition += 10;
      } else {
        player.controls.currentPosition = 1000;
      }
      break;
    case 37:
      if (player.controls.currentPosition > 10) {
        player.controls.currentPosition -= 10;
      } else {
        player.controls.currentPosition = 0;
      }
      break;
  }
}

function volUpDown(event) {
  switch (event.keycode) {
    case 39:
      if (player.settings.volume < 95) {
        player.settings.volume += 5;
      } else {
        player.settings.volume = 100;
      }
      break;
    case 37:
      if (player.settings.volume > 5) {
        player.settings.volume -= 5;
      } else {
        player.settings.volume = 0;
      }
      break;
  }
}
