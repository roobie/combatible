/**
 * @jsx React.DOM
 */

'use strict';

define([
  'lib/react'
], function (React) {

  var App = React.createClass({displayName: "App",
    render: function () {
      return (
        React.createElement("div", null, 
          "Success"
        )
      );
    }
  });

  React.renderComponent(React.createElement(App, null), document.getElementById('aux-view')); // jshint ignore:line

});
