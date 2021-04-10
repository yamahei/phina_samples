(function(g){

	const GEMA_DEBUG = true;
	const CTRL_DEFAULT_SPEED = 2;
	const CTRL_DEFAULT_SWORDS = 0;
	const DEFAULT_TIMER = 30;//sec

	const HeroController = function(sprite){
		this.sprite = sprite;
		this.speed = 0;
		this.directions = ["up", "left", "up", "right"];//タップ時[0]を採用してローテーション
		this.damage = 0;//ダメージ中/カウンターとしても機能する
		this.goal = false;
		this.timeup = false;
		this.fall = 0;
		this._visible = true;
		this.is_flyng = false;//アイテムwing使用中
		this.is_hide = false;//アイテムhide使用中
		this.is_sword = false;//アイテムsword使用中
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
				if(!ctrl.is_flyng){
					const accel = this.getAcceleration(ctrl.direction, ctrl.speed);
					const hit = this.moveBy(accel.v + dv, accel.w + dw, {repell_events:{wall: true, fall: false}});
					if(hit && hit.event_name == "fall"){
						this.fire({ type: "fall", hero: sprite });
					}
					this.outerLimit();
				}
				this.visible = ctrl.is_hide ? !this.visible : true;
			}else{
				this.visible = ctrl._visible;
			}
			//転落
			if(ctrl.fall && ctrl._visible){
				if(ctrl.fall > 8){
					this.fire({ type: "falled", hero: sprite });
					sprite.visible = false;
				}else{
					this.y += ctrl.fall;
					ctrl.fall *= 1.4;
				}
			}
			//通常の行動
			let action = this.action;
			if(!ctrl.goal && !ctrl.fall && ctrl._visible){
				if(ctrl.damage > 0){
					ctrl.damage -= 1;
					action = "damage";
				}else{
					if(ctrl.speed >= 3){ action = "run"; }
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
		set goal(v){
			this._goal = !!v;
			this.is_hide = false;
			this._visible = true;
		},
		get fall(){ return this._fall; },
		set fall(v){
			this._fall = v * 1;
			this.is_hide = false;
			this._visible = true;
		},
		get timeup(){ return this._timeup; },
		set timeup(v){ this._timeup = !!v; },
		get is_flyng(){ return this._is_flyng; },
		set is_flyng(v){ this._is_flyng = !!v; },
		get is_hide(){ return this._is_hide; },
		set is_hide(v){ this._is_hide = !!v; },
		get is_sword(){ return this._is_sword; },
		set is_sword(v){
			this._is_sword = !!v;
			this.switch_sword();
		},
		get swords(){ return this._swords; },
		set swords(v){
			this._swords = v * 1;
			this.is_sword = !!this.swords;
		},
	};
	HeroController.prototype.switch_direction = function(){
		this.direction = this.directions[0];
		this.directions.push(this.directions.shift());
		return this.direction;
	};
	HeroController.prototype.set_goal = function(){ this.goal = true; };
	HeroController.prototype.set_fall = function(){ this.fall = 1; };
	HeroController.prototype.switch_sword = function(){
		const name = this.is_sword ? "ken" : "";
		this.sprite.change_equipment(name);
	};

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
			const door = chars.events.find(function(event){ return event.event == "door"; });
			const treasure = chars.events.find(function(event){ return event.event == "treasure"; });
			const scene = this;
			const all_enemy_on = function(){
				chars.enemies.forEach(function(enemy){
					enemy && enemy.autonomousOn && enemy.autonomousOn();
				});
			}
			const all_enemy_off = function(){
				chars.enemies.forEach(function(enemy){
					enemy && enemy.autonomousOff && enemy.autonomousOff();
				});
			}

			if(options.usegl){
				const layer = scene.layer = GLLayer(options);//USE GPU
				layer.addChildTo(scene);
				layer.addChild(world);
			}else{
				scene.addChild(world);
			}

			const ctrl = this.hero_ctrl = new HeroController(chars.hero);
			world.on("addchar", function(e){
				//ゲーム開始後の動的追加
				const index = chars.enemies.indexOf(e.char);
				if(index < 0){
					chars.enemies.push(e.char);
				}
			});
			world.on("delchar", function(e){
				//ゲーム開始後の動的削除
				const index = chars.enemies.indexOf(e.char);
				if(index >= 0){
					chars.enemies.splice(index, 1);
				}
			});
			const gull_speed = 2;
			const speed_per_fps = 1000 / (options.fps * gull_speed);
			const on_wing_use = function(){
				const gull = SpriteCharBase("gull");
				world.addChar(gull);
				const hero_state = { speed: ctrl.speed };
				ctrl.is_flyng = true;
				ctrl.speed = 0;
				all_enemy_off();
				gull.tweener
				.call(function(){
					gull.setPosition(hero.x, hero.y + (16*8));
					gull.action = "stand";
					gull.direction = "up";
					gull.setCharAnimation();
				})
				.to({x: hero.x, y: hero.y+1}, (16*8) * speed_per_fps)
				.wait(250)
				.call(function(){
					gull.action = "walk";
					gull.setCharAnimation();
					let counter = 8 * 16;//8ブロックぶん
					const gull_leave = function(){
						gull.tweener
						.clear()
						.wait(250)
						.call(function(){
							gull.action = "stand";
							gull.direction = "left";
							gull.setCharAnimation();
						})
						.to({x: -24, y: gull.y}, (gull.x + 24) * speed_per_fps)
						.call(function(){ world.delChar(gull); })
					}
					const carry_action = function(){
						const hit = world.hitTestElement(gull);
						const end_by_wall = (hit && hit.event_name == "wall");
						const now_not_fall = (!hit || hit.event_name != "fall");
						if(end_by_wall || (--counter <= 0 && now_not_fall)){//終わる条件
							all_enemy_on();///
							item_setter.shoe();//set speed
							ctrl.is_flyng = false;
							gull_leave();
						}else{
							gull.y -= 1;
							hero.y = gull.y - 1;
							setTimeout(carry_action, speed_per_fps);
						}
					};
					carry_action();//1回目
				})

			};

			const hero = ctrl.sprite;
			const hero_damage_count = 8;
			const items = Items(options.items, options.width, options.height).addChildTo(scene);
			const item_shoe = function(){ return items.get_item_state("shoe")};
			const item_sword = function(){ return items.get_item_state("sword")};
			const item_setter = {
				shoe: function(){
					ctrl.speed = CTRL_DEFAULT_SPEED + (item_shoe() ? Math.log10(item_shoe() + 1) * 2 : 0);
				},
				sword: function(){
					ctrl.swords = CTRL_DEFAULT_SWORDS + (item_sword() ? Math.log10(item_sword() + 1) * 2 : 0);
				},
				time: null,//動的に設定しない
				wing: null,//動的に設定しない
			};
			const timer_sec = DEFAULT_TIMER + (options.items.time || 0) * 3;
			const timer = Timer().addChildTo(this).initialize(this, timer_sec);
			const tappable = DisplayElement().setInteractive(true).addChildTo(scene).setOrigin(0, 0).setPosition(0, timer.bottom).setWidth(scene.width).setHeight(items.top - timer.bottom);
			tappable.onpointstart = function(e){
				ctrl.switch_direction();
			};

			world.update = function(e){
				//goal?
				const goal = !hero.hitTestElement(door) ? false : true;
				if(goal){ hero.fire({ type: "goal", hero: hero, goal: door }); }
				//damage?
				const hit_enemy = chars.enemies.find(function(enemy){
					return enemy.autonomous && hero.hitTestElement(enemy);
				});
				if(!ctrl.is_hide && !ctrl.damage && hit_enemy){
					const sword = items.get_item_state("sword") * 1;
					const attack = hero.char_isin_my_direction(hit_enemy, sword);
					const can_attack = !!(["CharFire"].indexOf(hit_enemy.className) < 0);//剣が通じない
					if(ctrl.is_sword && attack && can_attack){
						const fps_of_6 = options.fps / 6;
						const damage = (2 + sword) * fps_of_6;
						hit_enemy.damageOn(damage);
					}
					else{
						//TODO: shield?
						ctrl.damage = hero_damage_count;
					}
				}
				if(ctrl.damage > 0){ timer.minus(); }
				//treasure?
				if(treasure && !treasure.is_open && hero.hitTestElement(treasure)){
					treasure.do_open();
					const type = items.get_item(treasure.type);
					item_setter[type] && item_setter[type]();//セットする
				}
			};
			if(GEMA_DEBUG){
				const item_names = { "wing": "B", "sword":"C", "shoe": "D", "time": "E" };
				const debug_item = function(name){
					const type = items.get_item(item_names[name]);
					item_setter[name] && item_setter[name]();//セットする
				}
				Object.keys(item_names).forEach(function(n){
					const func_name = `debug_${n}`;
					g[func_name] = function(){ return debug_item(n); };
				});
			}

			//ready action - 1.label-on 2.scroll 3.label-off
			const level_text = `Level ${level + 1}`;
			const level_label = TextBox(level_text).addChildTo(scene).setPosition(scene.gridX.center(), scene.gridY.center(-1));
			const scroll_time = Math.abs(world.getBottomY()) * 5;
			const bottom_y = world.getBottomY();
			world.setPosition(0, bottom_y);
			world.tweener
			.wait(1000)
			.to({x: 0, y: 0}, scroll_time, "linear")
			.wait(800)
			.to({x: 0, y: bottom_y}, scroll_time, "linear")
			.call(function(){
				//start action
				level_label.remove();
				world.setScrollTracker(hero, {x: 0, y: options.height / 4});
				item_setter.shoe();//set speed
				item_setter.sword();
				all_enemy_on();
				timer.count_start();
				// items.usable = true;
			});

			const action_stop = function(stop_hero_event){
				if(stop_hero_event){
					hero.clear(stop_hero_event);
				}
				// items.usable = false;
				timer.stop = true;
				world.setScrollTracker(null);
				all_enemy_off();
				tappable.clear("pointstart");
				scene.clear("pointstart");////一旦OFF
			};
			const game_over = function(){
				ctrl.speed = 0;
				let _score_text = (options.score).toString();
				let _level_text = (options.level+1).toString();
				let _retry_text = (options.retry).toString();
				const text_width = Math.max(...[_score_text, _level_text, _retry_text].map(function(t){ return t.length; }));
				const set_width = function(text, width){ return ((" ").repeat(width) + text).slice(-width); };
				const fall_texts = [
					`GAME OVER`, "",
					`Score  ${set_width(_score_text, text_width)}`,
					`Level  ${set_width(_level_text, text_width)}`,
					`Retry  ${set_width(_retry_text, text_width)}`,
				];
				const fall_label = TextBox(fall_texts).addChildTo(scene).setPosition(scene.gridX.center(), scene.gridY.center(-1));
				const selections = [
					{label: "Continue", event: "continue"},
					{label: "Tweet", event: "tweet"},
					{},
					{label: "Exit", event: "exit"},
				];
				const select = Selector(selections, {}).addChildTo(scene).setPosition(scene.gridX.center(), scene.gridY.center(+1));
				select.on("select", function(e){
					switch(e.event){
						case "continue":
							options.score = 0;
							options.retry += 1;
							//アイテムクリアしない⇒開始時点のアイテム
							scene.exit("game", options);
							break;
						case "tweet": alert("not yet");
							//twitterに画像付きで登校する
							//$x("//canvas")[0].toDataURL("image/jpeg");
							//Javascriptで画像付きツイートを行う
							//https://qiita.com/miura/items/036ef6da8f93bb65caac
							//https://github.com/oauth-io/oauth-js
							break;
						case "exit":
							options.level = 0;
							options.retry = 0;
							options.items = {};
							scene.exit("title", options);
							break;
					}
				});
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
				if(items.get_item_state("wing")){
					items.use_item("wing");
					on_wing_use();
					return;
				}
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
				const speed_per_fps = 1000 / (options.fps * 1);
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
				.to({x: goal.x, y: hero.y}, distance * speed_per_fps, "linear").wait(200)
				.call(function(){ ctrl.direction = "up"; }).wait(500)
				.call(function(){ ctrl._visible = false; }).wait(100)
				.call(function(){ goal.do_close(); }).wait(500)
				.call(function(){
					const goal_texts = [
						"Clear", "",
						(score > 0) ? `Score +${score.toString()}` : "No score"
					];
					const goal_label = TextBox(goal_texts).addChildTo(scene).setPosition(scene.gridX.center(), scene.gridY.center(-1));
					setTimeout(function(){
						options.level += 1;
						options.score += score;
						options.items = items.get_item_properties();
						const is_bonus = (options.level > 0) && (options.level % 4 == 0);
						const next_scene = is_bonus ? "bonus" : "game";
						scene.exit(next_scene, options);
					}, 1500);
				})
			});


		},

	});

})(this);

