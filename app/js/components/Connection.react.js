var React = require('react'),
	bot = require('../bot'),
	config = require('../config'),
	chatClient = require('../chat/client'),
	tcpClient = require('../tcp-client');

module.exports = React.createClass({

	getInitialState: function() {
		return {
			connected: tcpClient.isConnected(),
			authorized: bot.authorized,
			joined: bot.joined,
			room: bot.room,
			secret: bot.secret,
			key: bot.key,
		};
	},

	componentDidMount: function() {
		tcpClient.on('connected', this.tcpConnected);
		tcpClient.on('disconnected', this.tcpDisconnected);
		this.joinBot();
	},

	componentWillUnmount: function() {
		tcpClient.removeListener('connected', this.tcpConnected);
		tcpClient.removeListener('disconnected', this.tcpDisconnected);
	},

	joinBot: function() {
		bot.connect(function() {
			this.setState({
				authorized: bot.authorized,
				joined: bot.joined,
				connected: tcpClient.isConnected()
			});
		}.bind(this));
	},

	tcpConnected: function() {
		this.setState({
			connected: true
		});
	},

	tcpDisconnected: function() {
		bot.disconnect(function() {
			this.setState({
				authorized: bot.authorized,
				joined: bot.joined,
				connected: tcpClient.isConnected()
			});
		}.bind(this));
	},

	currentState: function() {
		if(this.state.connected && this.state.authorized && this.state.joined) {
			return (<p>Active <span className='button' onClick={this._onDisconnectClick}>Disconnect</span></p>);
		}
		if(this.state.connected && this.state.authorized) {
			return (<p>Authorized  <span className='button' onClick={this._onConnectClick}>Join a Room</span></p>);
		}
		if(this.state.connected) {
			return (<p>Connected, not in room. <span className='button' onClick={this._onConnectClick}>Authorize and Join</span></p>);
		}
		return (<p>Not connected.  <span className='button' onClick={this._onConnectClick}>Connect</span></p>);
	},

	_updateBotKey: function(e) {
		bot.key = e.target.value;
		this.setState({ key: bot.key });
		this.joinBot();
	},

	_updateBotSecret: function(e) {
		bot.secret = e.target.value;
		this.setState({ secret: bot.secret });
		this.joinBot();
	},

	_updateBotRoom: function(e) {
		bot.room = e.target.value;
		this.setState({ room: bot.room });
		this.joinBot();
	},

	_onDisconnectClick: function(e) {
		tcpClient.disconnect();
	},

	_onConnectClick: function(e) {
		this.joinBot();
	},

	render: function() {
		var botLink = config.protocol + config.host + '/developers/bots';

		return (
			<div>
				<h2>Bot Status</h2>

				<div className='content bot-state'>
					{this.currentState()}
				</div>

				<h2>Credentials</h2>
				<div className='content credentials'>
					<p className='tip'>
						<a target='_blank' href={botLink} title='Set up your bot credentials'>
							Set up your bot credentials
						</a>
					</p>
					<div>
						<label htmlFor='key'>Bot Key</label>
						<input type='text' value={this.state.key} name='key' autoComplete='off' onChange={this._updateBotKey} />
					</div>
					<div>
						<label htmlFor='secret'>Bot Secret</label>
						<input type='text' value={this.state.secret} name='secret' autoComplete='off' onChange={this._updateBotSecret} />
					</div>
					<div>
						<label htmlFor='room'>Room</label>
						<input type='text' value={this.state.room} name='room' autoComplete='off' onChange={this._updateBotRoom} />
					</div>
				</div>
			</div>
		);
	}
});
