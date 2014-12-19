/**
 * @jsx React.DOM
 */

'use strict';

define([
  'lib/react'
], function (React) {

  var App = React.createClass({
    render: function () {
      return (
        <div>
          Success
        </div>
      );
    }
  });

  React.renderComponent(<App />, document.getElementById('aux-view')); // jshint ignore:line

});
