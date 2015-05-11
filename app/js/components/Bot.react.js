var React = require('react'),
	Connection = require('./Connection.react');

var Bot = module.exports = React.createClass({
	render: function() {
		return (
			<div>
				<Connection />
			</div>
		);
	}
});
