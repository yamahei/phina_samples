(function(g){

	const HeroController = function(sprite){
		this.sprite = sprite;
		this.speed = 0;
		this.directions = ["up", "left", "up", "right"];//タップ時[0]を採用してローテーション
		this.damage = 0;//ダメージ中/カウンターとしても機能する
		this.goal = false;
		this.fall = 0;
		this.switch_direction();

		const ctrl = this;
		sprite.update = function(e){
			//ゴール
			if(!ctrl.goal){
				const accel = this.getAcceleration(ctrl.direction, ctrl.speed);
				const hit = this.moveBy(accel.v, accel.w, {repell_events:{wall: true, fall: false}});
				if(hit && hit.event_name == "fall"){
					this.fire({ type: "fall", hero: sprite });
				}
				this.outerLimit();
			}
			//転落
			if(ctrl.fall && sprite.visible){
				this.y += ctrl.fall;
				ctrl.fall *= 1.2;
				if(ctrl.fall > 5){
					this.fire({ type: "falled", hero: sprite });
					sprite.visible = false;
				}
			}
			//通常の行動
			let action = this.action;
			if(!ctrl.goal && !ctrl.fall && sprite.visible){
				if(ctrl.damage > 0){
					ctrl.damage -= 1;
					action = "damage";
				}else{
					if(ctrl.speed > 5){ action = "run"; }
					else if(ctrl.speed > 0){ action = "walk"; }
					else{ action = "stand"; }
				}
			}
			if(ctrl.goal){ action = "walk"; }
			this.setAnimationDirection(ctrl.direction);
			this.setAnimationAction(action);
		};
	};
	HeroController.prototype = {
		get sprite(){ return this._sprite; },
		set sprite(v){ this._sprite = v; },
		get speed(){ return (this.damage > 0) ? 0 : this._speed; },
		set speed(v){ this._speed = v * 1; },
		get status(){ return this._status; },
		set status(v){ this._status = v; },
		get direction(){ return this._direction; },
		set direction(v){this._direction = v; },
		get damage(){ return this._damage; },
		set damage(v){ this._damage = v * 1; },
		get goal(){ return this._goal; },
		set goal(v){ this._goal = !!v; },
		get fall(){ return this._fall; },
		set fall(v){ this._fall = v * 1; },
	};
	HeroController.prototype.switch_direction = function(){
		this.direction = this.directions[0];
		this.directions.push(this.directions.shift());
		return this.direction;
	};
	HeroController.prototype.set_goal = function(){ this.goal = true; };
	HeroController.prototype.set_fall = function(){ this.fall = 1; };

	phina.define('GameScene', {
		superClass: 'DisplayScene',
		init: function(options) {
			this.superInit(options);
			this.backgroundColor = '#212';
			this.canvas.imageSmoothingEnabled = false;
			const mad_data = AssetManager.assets.json.map_sample.data;
			const generator = MapGenerator(mad_data);
			const level = options.level;
			const world = generator.create(level);
			const chars = generator.chars;
			const scene = this;

			if(options.usegl){
				const layer = scene.layer = GLLayer(options);//USE GPU
				layer.addChildTo(scene);
				layer.addChild(world);
			}else{
				scene.addChild(world);
			}

			const ctrl = this.hero_ctrl = new HeroController(chars.hero);
			const hero = ctrl.sprite;
			scene.onpointstart = function(e){
				ctrl.switch_direction();
			};

			//ready action - 1.label-on 2.scroll 3.label-off
			const level_text = `Level ${level + 1}`;
			const level_label = TextBox(level_text).addChildTo(scene).setPosition(scene.gridX.center(), scene.gridY.center(-4));
			const bottom_y = world.getBottomY();
			world.update = function(e){
				//goal?
				const goal = chars.events.find(function(event){
					const far = (Math.abs(hero.y - event.y) > 100);
					return (far || !hero.hitTestElement(event)) ? false : true;
				});
				if(goal){ hero.fire({ type: "goal", hero: hero, goal: goal }); }
				//damage?
				const damage = chars.enemies.some(function(enemy){
					const far = (Math.abs(hero.y - enemy.y) > 100);
					return far ? false : hero.hitTestElement(enemy);
				});
				if(damage){ ctrl.damage = 10; }
			};
			world.setPosition(0, bottom_y);
			world.tweener
			.wait(800)
			.to({x: 0, y: 0}, 1500, "linear")
			.wait(800)
			.to({x: 0, y: bottom_y}, 1500, "linear")
			.call(function(){
				//start action
				level_label.remove();
				world.setScrollTracker(hero, {x: 0, y: options.height / 3.5});
				ctrl.speed = 2;
				chars.enemies.forEach(function(enemy){
					enemy.autonomousOn();
				});
			});

			const action_stop = function(stop_hero_event){
				hero.clear(stop_hero_event);
				world.setScrollTracker(null);
				chars.enemies.forEach(function(enemy){
					enemy.autonomousOff();
				});
				scene.clear("pointstart");////一旦OFF
			};

			//fall action
			hero.on("fall", function(e){
				console.log("fall");
				const hero = e.hero;
				action_stop("fall");
				if(hero.direction == "up"){//TODO: 地面にめり込むのが解消していない
					world.switchCharLayer(hero, "field", "bottom");
				}else{
					setTimeout(function(){
						world.switchCharLayer(hero, "field", "bottom");
					}, 500);
				}
				ctrl.set_fall();
				hero.on("falled", function(_){
					action_stop("falled");
					const fall_text = `GAME OVER`;
					const fall_label = TextBox(fall_text).addChildTo(scene).setPosition(scene.gridX.center(), scene.gridY.center(-4));
					// setTimeout(function(){
					// 	options.level += 1;
					// 	scene.exit("game", options);
					// }, 1500);
				});
			});

			//goal action
			hero.on("goal", function(e){
				const hero = e.hero;
				const goal = e.goal;
				const distance = Math.floor(Math.abs(hero.x - goal.x));
				action_stop("goal");
				ctrl.set_goal();
				ctrl.speed = 0;
				hero.tweener
				.call(function(){ goal.do_open(); }).wait(500)
				.call(function(){
					if(hero.x < goal.x){ ctrl.direction = "right"; }
					if(hero.x > goal.x){ ctrl.direction = "left"; }
				}).wait(500)
				.to({x: goal.x, y: hero.y}, distance * 80, "linear").wait(500)
				.call(function(){ ctrl.direction = "up"; }).wait(500)
				.call(function(){ hero.visible = false; }).wait(500)
				.call(function(){ goal.do_close(); }).wait(500)
				.call(function(){
					const goal_text = `Clear`;
					const goal_label = TextBox(goal_text).addChildTo(scene).setPosition(scene.gridX.center(), scene.gridY.center(-4));
					setTimeout(function(){
						options.level += 1;
						scene.exit("game", options);
					}, 1500);
				})
			});


		},

	});

})(this);

