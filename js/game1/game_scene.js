(function(g){

	const HeroController = function(sprite){
		this.sprite = sprite;
		this.speed = 0;
		this.directions = ["up", "left", "up", "right"];//タップ時[0]を採用してローテーション
		this.damage = 0;//ダメージ中/カウンターとしても機能する
		this.goal = false;
		this.timeup = false;
		this.fall = 0;
		this.switch_direction();
		const rand = this.random = Random();

		const ctrl = this;
		sprite.update = function(e){
			//ゴール
			if(!ctrl.goal){
				let dv = 0;
				let dw = 0;
				if(ctrl.damage > 0){
					dv = (rand.randint(0, 99) % 2) * 2 - 1;
					dw = (rand.randint(0, 99) % 2) * 2 - 1;
				}
				const accel = this.getAcceleration(ctrl.direction, ctrl.speed);
				const hit = this.moveBy(accel.v + dv, accel.w + dw, {repell_events:{wall: true, fall: false}});
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
			if(ctrl.timeup){ action = "damage"; }
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
		get timeup(){ return this._timeup; },
		set timeup(v){ this._timeup = !!v; },
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
			const map_data = AssetManager.assets.json.map_sample.data;
			const generator = MapGenerator(map_data);
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
			const level_label = TextBox(level_text).addChildTo(scene).setPosition(scene.gridX.center(), scene.gridY.center(-1));
			const timer = Timer().addChildTo(this).initialize(this, 60);
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
			.wait(500)
			.wait(500)
			.to({x: 0, y: 0}, 2000, "linear")
			.wait(800)
			.to({x: 0, y: bottom_y}, 2000, "linear")
			.call(function(){
				//start action
				level_label.remove();
				world.setScrollTracker(hero, {x: 0, y: options.height / 3.5});
				ctrl.speed = 2;
				chars.enemies.forEach(function(enemy){
					enemy.autonomousOn();
				});
				timer.count_start();
			});

			const action_stop = function(stop_hero_event){
				if(stop_hero_event){
					hero.clear(stop_hero_event);
				}
				timer.stop = true;
				world.setScrollTracker(null);
				chars.enemies.forEach(function(enemy){
					enemy.autonomousOff();
				});
				scene.clear("pointstart");////一旦OFF
			};
			const game_over = function(){
				const score_text = (options.score).toString();
				let level_text = (options.level+1).toString();
				level_text = (" ").repeat(score_text.length) + level_text;
				level_text = level_text.slice(-score_text.length);
				const fall_texts = [
					`GAME OVER`, "",
					`Level  ${level_text}`,
					`Score  ${score_text}`,
				];
				const fall_label = TextBox(fall_texts).addChildTo(scene).setPosition(scene.gridX.center(), scene.gridY.center(-1));
				//twitterに画像付きで登校する
				//$x("//canvas")[0].toDataURL("image/jpeg");

				//TODO: continue
				//TODO: title
			};

			//timeup
			timer.on("timeup", function(){
				action_stop(null);
				ctrl.timeup = true;
				ctrl.speed = 0;
				game_over();
			});
			//fall action
			hero.on("fall", function(e){
				const hero = e.hero;
				action_stop("fall");
				const map_pos = world.translatePositionToMapXY(hero.x, hero.y);
				const upper_chip1 = world.getHitMap(map_pos.mapX, map_pos.mapY - 1);
				const upper_chip2 = world.getHitMap(map_pos.mapX, map_pos.mapY - 2);
				if(upper_chip1.collision_rect && upper_chip2.collision_rect){//TODO: 地面にめり込むのが解消していない
					world.switchCharLayer(hero, "field", "bottom");
				}else{
					setTimeout(function(){
						world.switchCharLayer(hero, "field", "bottom");
					}, 800);
				}
				ctrl.set_fall();
				hero.on("falled", function(_){
					action_stop("falled");
					game_over();
				});
			});

			//goal action
			hero.on("goal", function(e){
				const hero = e.hero;
				const goal = e.goal;
				const distance = Math.floor(Math.abs(hero.x - goal.x));
				action_stop("goal");
				const score = Math.floor(timer.remain * (1 + Math.log10(options.level + 1)));
				ctrl.set_goal();
				ctrl.speed = 0;
				hero.tweener
				.call(function(){ goal.do_open(); }).wait(500)
				.call(function(){
					if(hero.x < goal.x){ ctrl.direction = "right"; }
					if(hero.x > goal.x){ ctrl.direction = "left"; }
				}).wait(500)
				.to({x: goal.x, y: hero.y}, distance * 80, "linear").wait(200)
				.call(function(){ ctrl.direction = "up"; }).wait(500)
				.call(function(){ hero.visible = false; }).wait(100)
				.call(function(){ goal.do_close(); }).wait(500)
				.call(function(){
					const goal_texts = [
						"Clear", "",
						`Score +${score.toString()}`
					];
					const goal_label = TextBox(goal_texts).addChildTo(scene).setPosition(scene.gridX.center(), scene.gridY.center(-1));
					setTimeout(function(){
						options.level += 1;
						options.score += score;
						scene.exit("game", options);
					}, 1500);
				})
			});


		},

	});

})(this);

