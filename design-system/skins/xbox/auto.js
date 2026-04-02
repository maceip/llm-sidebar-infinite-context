//<script>
//****************************************************************
//  �2000 Microsoft Corporation. All rights reserved.
//****************************************************************

function AutoLoad() {
  // In preview mode (the skin chooser), we want to go ahead
  // and show the preview bitmap... so the following line will
  // "fault" out the preview jscript engine, but not the runtime
  // engine...

  if (player) {
  }

  view.width = 0;
  view.height = 0;
  view.backgroundImage = '';

  theme.currentViewID = 'mainBox';
}
