(function() {
    "use strict";

    var BR = this.BR;

    /*
     An animate is something that can have an ai and execute actions.
     */

    BR.E.Animate = function Animate(properties) {
        this.init(properties);
    };

    BR.E.Animate.prototype = Object.create(BR.E.Entity.prototype, {
        constructor: {
            value: BR.E.Animate
        },
        init: {
            value: function(properties) {
                properties = properties || {};
                BR.E.Entity.prototype.init.call(this, properties);
                if (!properties.noAI) {
                    this.ai = new BR.AI.BaseAI(this, {});
                }

                Object.defineProperties(this, {
                    sex: {
                        value: properties.sex || BR.E.sex.male
                    },
                    race: {
                        value: properties.race || "human"
                    },
                    caste: {
                        value: properties.caste || "peasant"
                    },
                    needs_coefficients: {
                        value: BR.mixin(Object.create(null), {
                            hunger: Math.random(),
                            thirst: Math.random(),
                            procreation: Math.random(),
                            vengeance: Math.random(),
                            survival: Math.random()
                        }, properties.needs_coefficients)
                    },
                    needs: {
                        value: BR.mixin(Object.create(null), {
                            hunger: 1,
                            thirst: 1,
                            procreation: 1,
                            vengeance: 1,///0.8,
                            survival: 1
                        })
                    }
                });

                this.attributes = BR.mixin({
                    // physical attrs:
                    strength: BR.rng.randomInt(400, 500),
                    dexterity: BR.rng.randomInt(400, 500),
                    agility: BR.rng.randomInt(400, 500),
                    toughness: BR.rng.randomInt(400, 500),
                    endurance: BR.rng.randomInt(400, 500),

                    // mental attrs:
                    logic: BR.rng.randomInt(400, 500),
                    memory: BR.rng.randomInt(400, 500),
                    wisdom: BR.rng.randomInt(400, 500),
                    empathy: BR.rng.randomInt(400, 500),
                    intuition: BR.rng.randomInt(400, 500),
                }, properties.attributes);

                this.senses = BR.mixin(Object.create(null), {
                    audition: BR.rng.randomInt(400, 500), // hearing
                    vision: BR.rng.randomInt(400, 500), // sight
                    olfaction: BR.rng.randomInt(400, 500), // smell
                    gustation: BR.rng.randomInt(400, 500), // taste
                }, properties.senses);

                this.hp = this.max_hp;

                var self = this;

                this.$interval_id = BR.make_interval(this, 20, function() {
                    if (isNaN(self.hp)) {
                        self.die();
                    }
                    // REGEN
                    if (self.needs.hunger > 0.8) {
                        self.hp = self.hp >= self.max_hp ?
                            self.max_hp :
                            self.hp + Math.floor(
                                (self.attributes.toughness +
                                 self.attributes.endurance) / 10);

                        this.inc_need("survival", 0.2);
                    }

                    self.hp = self.hp >= self.max_hp ?
                        self.max_hp : self.hp;

                    // NEEDS
                    this.dec_need("thirst", 0.02);
                    this.dec_need("hunger", 0.01);
                    if (this.needs_coefficients.procreation < 0.7) {
                        this.dec_need("procreation", 0.005);
                    }
                    if (this.needs_coefficients.vengeance > 0.8) {
                        this.dec_need("vengeance", 0.01);
                    } else {
                        this.inc_need("vengeance", 0.01);
                    }
                    if (this.needs.hunger < 0.3) {
                        this.dec_need("vengeance", 0.04);
                    }

                    // die of old age
                    // if (this.scheduler.getTime() - this.created_time > 5000) {
                    //     console.log(this.$hash, "died if ild age");
                    //     this.die();
                    // }
                }, 1000);
                $(function() {
                    BR.track.entities.push(self);
                });
            }
        },
        act: {
            value: function() {
                if (this.is_dead) {
                    this.draw();
                    return null;
                }

                // pre AI
                var old_pos = this.position.copy();

                // AI act
                var p = this.ai ? this.ai.act() : null;

                // post AI
                BR.draw(old_pos);
                this.compute_observable_tiles(old_pos, this.position);
                this.draw();

                return p;
            }
        },
        drink: {
            value: function() {
                this.inc_need("thirst", 0.5);
            }
        },
        eat: {
            value: function(entity) {
                BR.world.map.remove_entity(entity);
                this.inc_need("hunger", 0.5);
                this.inc_need("thirst", 0.1);
            }
        },
        copulate_with: {
            value: function(entity) {
                var self = this;
                if (self.sex === entity.sex) {
                    return;
                }
                this.inc_need("procreation", 1);
                entity.inc_need("procreation", 1);

                var m = function (need) {
                    return (self.needs_coefficients[need] +
                            entity.needs_coefficients[need]) / 2;
                };

                var n = function (a) {
                    return Math.floor(
                        (self.attributes[a] + entity.attributes[a]) / 2);
                };

                setTimeout(function() {
                    if (Math.random() < 0.5) {
                        return;
                    }
                    var sex = BR.rng.randomInt(3) ?
                            BR.E.sex.male :
                            BR.E.sex.female;
                    BR.add_entity(
                        true,
                        new BR.E.Animate({
                            position: self.position.copy(),
                            sex: sex,
                            race: self.race,
                            needs_coefficients: {
                                hunger: m("hunger"),
                                thirst: m("thirst"),
                                procreation: m("procreation"),
                                vengeance: m("vengeance"),
                            },
                            attributes: {
                                strength: m("strength"),
                                agility: m("agility"),
                                toughness: m("toughness"),
                            },
                            representation: self.race === "human" ?
                                {
                                    glyph: "@",
                                    color: {
                                        fg: [
                                            "#2E8B57",
                                            "#7FFF00"
                                        ][Number(sex === BR.E.sex.male)]
                                    }
                                } : {
                                    glyph: "λ",
                                    color: {
                                        fg: [
                                            "#DC143C",
                                            "#FA8072"
                                        ][Number(sex === BR.E.sex.male)]
                                    }
                                }
                        }));
                    BR.world.map.draw_all();
                }, 10000);
                if (BR.track.entities.length < 30) {
                }
            }
        },
        inc_need: {
            value: function(need, amount) {
                this.needs[need] += amount;
                if (this.needs[need] > 1) {
                    this.needs[need] = 1;
                }
                return true;
            }
        },
        dec_need: {
            value: function(need, amount) {
                if (this.needs[need] - amount < 0) {
                    return void 0;
                }
                this.needs[need] -= amount;

                var is_vital_need = need === "thirst" ||
                    need === "hunger";

                if (is_vital_need &&
                    this.needs[need] < 0.001) {
                    // sorry...
                    console.log(this.$hash, "died of ", need);
                    this.die();
                }
                return true;
            }
        },
        get_prioritised_need: {
            value: function() {
                var k, list = [];
                for (k in this.needs) {
                    list.push({
                        name: k,
                        value: this.needs[k] === 1 ?
                            0 :
                            (1 + (1 - this.needs[k])) * this.needs_coefficients[k]
                    });
                }

                this.prioritised_need = list.sort(function(a, b) {
                    return b.value - a.value;
                })[0].name;

                return this.prioritised_need;
            }
        },
        attack: {
            value: function(entity) {
                var diff = this.attributes.agility - entity.attributes.agility;
                if ((BR.rng.randomInt(100) + diff) > 50) {
                    this.inc_need("vengeance", 0.01);
                    entity.receive_damage(this.damage);
                }
                // miss
            }
        },
        receive_damage: {
            value: function(damage) {
                if (!damage) {
                    return;
                }
                this.hp -= damage;
                this.dec_need("vengeance", 0.13);
                this.dec_need("survival", 0.13);
                if (this.hp <= 0 || isNaN(this.hp)) {
                    console.log(this.$hash, "was killed");
                    this.die();
                }
            }
        },
        die: {
            value: function() {
                this.is_dead = true;
                this.representation.glyph = "X";
                this.reset_observable_tiles();
                //BR.track.entities.splice(
                    //BR.track.entities.indexOf(this), 1);
                this.ondead && this.ondead(this);

                BR.world.map.remove_entity(this);
                this.scheduler.remove(this);
                BR.clear_interval(this.$interval_id);
            }
        },
        reset_observable_tiles: {
            value: function() {
                var reset = function(tiles) {
                    if (tiles) {
                        tiles.forEach(function(t) {
                            t.draw();
                        });
                    }
                };
                reset(this.observable_tiles);
                reset(this.audible_tiles);
            }
        },
        compute_observable_tiles: {
            value: function(old_pos, new_pos) {
                var self = this;
                var dirs = {
                    "0,-1": 0,
                    "1,-1": 1,
                    "1,0": 2,
                    "1,1": 3,
                    "0,1": 4,
                    "-1,1": 5,
                    "-1,0": 6,
                    "-1,-1": 7
                };

                var sign_of = function(number) {
                    return number ?
                        (number < 0 ? -1 : 1) : 0;
                };

                //this.reset_observable_tiles();

                var observable_tiles = this.observable_tiles = [];
                var audible_tiles = this.audible_tiles = [];
                this.current_direction = dirs[new BR.T.Pos(
                    sign_of(new_pos.x - old_pos.x),
                    sign_of(new_pos.y - old_pos.y))] || 0;

                var f = function(tile_container, quality) {
                    var method = {
                        excellent: "compute",
                        good: "compute180",
                        bad: "compute90"
                    }[quality || "bad"];

                    if (quality === "excellent") {
                        BR.world.map.fov.compute(
                            self.position.x,
                            self.position.y,
                            // radius
                            // TODO: light coefficient
                            10, //Math.floor(this.senses.vision / 100),
                            function(x, y, r, visibility) {
                                var tile = BR.world.map[new BR.T.Pos(x, y)];
                                if (!tile) {
                                    return;
                                }
                                //tile.lighten(10);
                                tile_container.push(tile);
                            });
                    } else {
                        BR.world.map.fov[method](
                            self.position.x,
                            self.position.y,
                            // radius
                            // TODO: light coefficient
                            10, //Math.floor(this.senses.vision / 100),
                            self.current_direction,
                            function(x, y, r, visibility) {
                                var tile = BR.world.map[new BR.T.Pos(x, y)];
                                if (!tile) {
                                    return;
                                }
                                //tile.lighten(10);
                                tile_container.push(tile);
                            });
                    }

                };
                f(observable_tiles, this.fov || "good");
                f(audible_tiles, this.foh || "excellent");
            }
        },
        current_direction: {
            get: function() {
                return this.$direction;
            },
            set: function(value) {
                this.$direction = value;
            }
        },
        speed: {
            get: function() {
                var speed;
                var base_speed =
                        1000 *
                        Math.pow(
                            Math.E, -(this.attributes.agility / 1000));

                speed = base_speed * this.is_prone ? 0.44 : 1;

                return speed;
            }
        },
        max_hp: {
            get: function() {
                return this.attributes.toughness + this.attributes.endurance;
            }
        },
        damage: {
            get: function() {
                return Math.floor(this.attributes.strength / 20);
            }
        },
        hooks: {
            value: {
                moved: [
                    function(pos) {
                        this.visited_tiles[pos] = 1;
                    }
                ]
            }
        },
        stackable: {
            get: function() {
                return this.$stackable || this.is_prone;
            }
        },
        can_stand_up: {
            value: function() {
                return BR.world.map[this.position].is_empty_except(this);
            }
        },
        set_prone: {
            value: function(b) {
                this.is_prone = b;
            }
        }
    });

}).call(this);
