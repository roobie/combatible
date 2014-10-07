require.config({
  paths: {
    // make components more sensible
    "components": "../bower_components",
    // expose jquery
    "jquery": "../bower_components/jquery/dist/jquery"
  }
});

if (!window.requireTestMode) {
  require(['main'], function (main) {
    main.initialise();
  });
}
