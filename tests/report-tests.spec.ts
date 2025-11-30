Feature('Parallel Report Plugin');

BeforeSuite(({ I }) => {
  I.say('Before all tests in the suite');
});

Before(({ I }) => {
  I.say('Before each test');
});

Scenario.skip('Skipped test', ({ I }) => {
  I.say('Skipped test');
});

Scenario('Passing test', ({ I }) => {
  I.expectDeepEqual(true, true, 'You cannot defeat the truth.');
});

Scenario('Failing test', ({ I }) => {
  I.expectDeepEqual(true, false);
});

Scenario.todo('To Do test', ({ I }) => {
  I.say('Not implemented yet');
});

After(({ I }) => {
  I.say('After each test');
});

AfterSuite(({ I }) => {
  I.say('After all tests in the suite');
});
