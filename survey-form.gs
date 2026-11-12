// Creates the Module 4 survey as a Google Form.
// Paste into https://script.google.com (New project), then click Run.
function createSurvey() {
  var form = FormApp.create('Do you know what your habits cost you?');
  form.setDescription(
    'THE PROBLEM\n' +
    'A lot of students spend money on one or two habits every week, like food runs, snacks or ' +
    'cash purchases. Each purchase feels small, so nobody adds them up. Tracking happens in your ' +
    'head, there is no weekly limit, and by the end of the month you have no idea what you spent. ' +
    'For one student that comes to somewhere between $260 and $600 a month, and they cannot say ' +
    'which end of that range is true.\n\n' +
    'THE IDEA\n' +
    'A simple phone app for one or two habits, not your whole budget:\n' +
    '- Log a purchase in a few seconds, right at the counter.\n' +
    '- Month 1: track everything to learn your real starting number.\n' +
    '- After that: a weekly limit that drops by 10% of your starting number each month, until you are spending half.\n' +
    '- See at a glance how much of this week\'s limit is left.\n' +
    '- "Trips left this week": instead of just "$18 left," it tells you "1 pizza trip left this week" based on what you usually spend per trip.\n\n' +
    'Seven quick questions, about 2 minutes. Answers are anonymous. ' +
    'Please respond by Thursday, November 12.'
  );
  form.setCollectEmail(false);

  // --- Do other people share the problem? ---
  form.addSectionHeaderItem().setTitle('Part 1: Do you have this problem?');

  form.addMultipleChoiceItem()
    .setTitle('1. Do you regularly spend money on one or two habits without knowing the total?')
    .setChoiceValues(['Yes', 'Sometimes', 'No'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('2. How often do you make those purchases?')
    .setChoiceValues(['Less than once a week', '1-2 times a week', '3-5 times a week', 'Almost daily'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('3. About how much do you think you spend on them in a month?')
    .setChoiceValues(['Under $100', '$100-250', '$250-500', 'Over $500', 'No idea'])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('4. How do you keep track of it today? (Check all that apply)')
    .setChoiceValues(["I don't", 'In my head', 'Bank app', 'Notes or spreadsheet', 'Budgeting app'])
    .setRequired(true);

  // --- Would they use the idea? ---
  form.addSectionHeaderItem().setTitle('Part 2: Would the idea help?');

  form.addScaleItem()
    .setTitle('5. How likely would you be to use an app like this for a month?')
    .setBounds(1, 5)
    .setLabels('Would not use it', 'Would definitely use it')
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('6. Which part would help you most?')
    .setChoiceValues([
      'Seeing my real monthly total',
      'Having a weekly limit',
      'The step-by-step cut plan',
      'Seeing how many trips I have left this week',
      'None of these would help me'
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('7. What would stop you from using it, or what would it need to have?')
    .setRequired(false);

  Logger.log('Send this link: ' + form.getPublishedUrl());
  Logger.log('Edit / see responses: ' + form.getEditUrl());
}
