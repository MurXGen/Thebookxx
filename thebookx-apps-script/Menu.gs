/*************************************************************************
 * TheBookX — FILE 6 / 6 : Menu.gs
 * Custom menu, daily trigger (6am IST), and first-time setup.
 *************************************************************************/

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('TheBookX')
    .addItem('Generate today', 'generateToday')
    .addItem('Generate next 7 days', 'generateNext7Days')
    .addSeparator()
    .addItem('Install daily trigger (6am IST)', 'installDailyTrigger')
    .addItem('Remove triggers', 'removeTriggers')
    .addSeparator()
    .addItem('First-time setup', 'firstTimeSetup')
    .addItem('Open Web App URL', 'showWebAppUrl')
    .addToUi();
}

/** Guided first run: build tabs, then capture the Gemini key into Script Properties. */
function firstTimeSetup() {
  const ui = SpreadsheetApp.getUi();
  setup();
  const resp = ui.prompt(
    'Gemini API key',
    'Paste your Gemini API key (from aistudio.google.com/apikey).\nStored in Script Properties, never in the sheet.',
    ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() === ui.Button.OK) {
    const key = resp.getResponseText().trim();
    if (key) {
      PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', key);
      ui.alert('Saved. Next: Deploy ▸ New deployment ▸ Web app, then run Generate today.');
    } else {
      ui.alert('No key entered. Add it later via First-time setup.');
    }
  }
}

function installDailyTrigger() {
  removeTriggers();
  ScriptApp.newTrigger('generateToday')
    .timeBased()
    .everyDays(1)
    .atHour(6)              // interpreted in the project timezone
    .inTimezone(CFG.TZ)
    .create();
  SpreadsheetApp.getActive().toast('Daily trigger installed for 6am ' + CFG.TZ + '.', 'TheBookX', 6);
}

function removeTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'generateToday') ScriptApp.deleteTrigger(t);
  });
  SpreadsheetApp.getActive().toast('Daily triggers removed.', 'TheBookX', 5);
}

function showWebAppUrl() {
  const ui = SpreadsheetApp.getUi();
  let url;
  try { url = ScriptApp.getService().getUrl(); } catch (e) { url = null; }
  if (url) {
    ui.alert('Web App URL',
      'Phone page:\n' + url + '\n\nStudio JSON:\n' + url + '?format=json',
      ui.ButtonSet.OK);
  } else {
    ui.alert('Deploy the Web App first: Deploy ▸ New deployment ▸ Web app.');
  }
}
