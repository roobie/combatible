/**
 * @jsx React.DOM
 */

'use strict';

define([
  'lib/react',

  'lib/radio'
], function (React, radio) {

  var App = React.createClass({displayName: "App",
    getInitialState: function () {
      return {};
    },
    dataChanged: function (data) {
      this.setState(data);
    },
    componentDidMount: function () {
      radio('data_changed').subscribe([this.dataChanged, this]);
    },
    componentWillUnmount: function () {
      radio('data_changed').unsubscribe(this.dataChanged);
    },
    render: function () {
      return (
        React.createElement("div", null, 
          React.createElement("code", null, 
            React.createElement("pre", null, JSON.stringify(this.state, null, 2))
          )
        )
      );
    }
  });

  React.render(React.createElement(App, null), document.getElementById('aux-view')); // jshint ignore:line

});
