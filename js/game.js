(function(self) {
	'use strict';
	var Wall, game;

	// I wanted to use sigmoid
	// I couldn't use sigmoid
	// I am sad now
	// RIP Sigmoid usage
	// 28/8/19 - 29/9/19
	// As a rememberance, here is what it once was.

	// sigmoid = function(n) { return Math.exp(n) / (1 + Math.exp(n)); }

	Wall = function(x, y, z, w, h, c) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		this.w = w || 1;
		this.h = h || 1;
		this.c = c || 'default';
		this._x=x,this._y=y,this._z=0;
	}, Wall.prototype = {
		'draw': function(c, ctx) {
			var d;

			if(this.c === 'default') {
				ctx.strokeStyle = this.z < 15 ? ('#' + (function(arr, i) {
					var idx;

					for(idx=0;idx<arr.length;++idx) {
						arr[idx] = Math.floor(arr[idx] * i);
					}

					return arr;
				})([ 0x11, 0xFF, 0x22 ], this.z / 5 - 2).join('')) : '#1F2';
			} else {
				ctx.strokeStyle = this.c;
			}
			ctx.lineWidth = 4;
			ctx.fillStyle = '#000';

			d = 1000 / this.z;

			ctx.beginPath();
			ctx.rect(c.width / 2 + (this.x) * d * 2, c.height / 2 - this.y * d * 4, d * this.w, d * this.h);
			ctx.fill();
			ctx.stroke();

			if(this.z < 11) return this.reset();
		},
		'reset': function() {
			this.x = Math.random() > .5 ? -1.1 : .1, this.y = this._y, this.z = 90;
			this._z ++;
			this.v = Math.exp(this._z) / (1 + Math.exp(this._z));
			return 1;
		}
	};

	game = {
		'canvas': null,
		'context': null,

		'conf': {
			'visualRange': 10,
			'distNewWall': 3,
			'speed': .4
		},

		'player': {
			'p': new Wall(-.2, -.5, 18, .7, 1, '#F20'),
			'vx': 0, 'ax': 0, 'SPD': 5e-2
		},

		'walls': new Array(8),

		'f': -100,

		'wid': 1, 'hei': 1,

		'pausedTicks': 60,

		'displayText': '',

		'points': 0,

		'draw': function() {
			var idx, walls;

			this.context.clearRect(0, 0, this.wid, this.hei);

			this.tick();

			// TODO: implement better sort
			walls = this.walls.concat(this.player.p).sort((a, b) => (b.z - a.z));

			for(idx = 0; idx < walls.length; ++idx) {
				this.points += walls[idx].draw(this.canvas, this.context) || 0;
			}

			// this.player.p.draw(this.canvas, this.context);

			this.context.fillStyle = '#1F2';
			this.context.font = '24px monospace';

			if(this.pausedTicks > 0) {
				this.context.fillText(this.displayText, (this.wid - this.context.measureText(this.displayText).width) / 2, 72);
			}

			// self.setTimeout(this.draw.bind(this), 125);
			self.requestAnimationFrame(this.draw.bind(this));
		},

		'tick': function() {
			var idx, m;

			if(this.pausedTicks > 0) {
				return --this.pausedTicks;
			}

			this.player.vx += this.player.ax;
			if(this.player.ax === 0) {
				// this.player.vx -= this.player.spd;
			}
			this.player.p.x += this.player.vx;

			m = +1 - this.player.p.w / 2;

			if(this.player.p.x < -1) {
				this.player.p.x = -1;
			} else if(this.player.p.x > m) {
				this.player.p.x = m;
			}
			if(this.player.p.x == -1 || this.player.p.x == m) {
				this.player.vx = 0;
				this.player.ax = 0;
			}

			for(idx = 0; idx < this.walls.length; ++idx) {
				this.walls[idx].z -= this.conf.speed;
				if(Math.abs(this.walls[idx].z - this.player.p.z) < .1 &&
					this.player.p.x + this.player.p.w > this.walls[idx].x &&
					this.player.p.x < this.walls[idx].x + this.walls[idx].w
				) {
					this.die();
				}
			}
			this.conf.speed += 1e-4;
		},

		'die': function() {
			var i;
			localStorage.setItem('best_block_score', Math.max(localStorage.getItem('best_block_score') - 0, this.points));
			this.displayText = 'You died!\n';
			this.displayText += 'Points: ' + this.points + '\n';
			this.displayText += 'Personal best: ' + localStorage.getItem('best_block_score');
			this.pausedTicks = 1200;
			setTimeout(self.location.reload.bind(self.location), 1500);
		},

		'resize': function(wid, hei) {
			this.wid = wid, this.hei = hei;
			this.canvas.width = this.wid;
			this.canvas.height = this.hei;
		},

		'init': function() {
			var idx;

			for(idx = 0; idx < this.walls.length; ++idx) {
				this.walls[idx] = new Wall(Math.random() > .5 ? -1.1 : .1, -.25, 50 + idx * 10, 2, 2);
			}

			this.canvas = document.createElement('canvas');
			this.context = this.canvas.getContext('2d');

			idx = this;

			// this.canvas.addEventListener('mousemove', function(evt) {
			// 	idx.player.p.x = 12 * ((evt.pageX - idx.canvas.getBoundingClientRect().left) / idx.canvas.width - .5);
			// });

			self.addEventListener('keydown', function(evt) {
				switch(evt.keyCode) {
					case 37:
					case 65:
						idx.player.ax = -idx.player.SPD;
						break;
					case 39:
					case 68:
						idx.player.ax = +idx.player.SPD;
						break;
				}
			});

			this.resize(720, 540);

			document.body.appendChild(this.canvas);

			this.draw();
		}
	};

	// I regret not making a Game instance

	// self.addEventListener('resize', game.resize.bind(game));
	var g = Object.assign({ }, game);
	self.addEventListener('DOMContentLoaded', g.init.bind(g));
})(this);