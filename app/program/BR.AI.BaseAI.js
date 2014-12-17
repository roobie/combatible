(function() {
    "use strict";

    var BR = this.BR,
        ROT = this.ROT,
        StateMachine = this.StateMachine;

    function BaseAI(entity, properties) {
        this.init(entity, properties);
    };
    BR.AI.BaseAI = BaseAI;
    BR.AI.BaseAI.states = [];

    Object.defineProperties(BR.AI.BaseAI.prototype, {
        init: {
            value: function(entity, properties) {
                var self = this;
                this.entity = entity;
                Object.defineProperties(this, {
                    scheduler: {
                        get: function () {
                            return this.entity.scheduler;
                        }
                    },
                    speed: {
                        get: function () {
                            return (this.entity.speed || 1) * (1 - (this.entity.encumberance || 0));
                        }
                    },
                    learned_information: {
                        value: []
                    },
                    visited_tiles: {
                        value: Object.create(null)
                    },
                    fms: {
                        value: StateMachine.create({
                            /* Available states:
                             exploring
                             maneuvering
                             attacking
                             fleeing
                             hungry
                             horny
                             stalking
                             being_hunted
                             observing */
                            initial: "exploring",
                            events: [
                                { name: "explore",
                                  from: [ "searching_for_food",
                                          "searching_for_mate",
                                          "stalking" ],
                                  to: "attacking" },

                                { name: "maneuver",
                                  from: [ "exploring",
                                          "searching_for_food",
                                          "searching_for_mate",
                                          "stalking" ],
                                  to: "maneuvering" },

                                { name: "attack",
                                  from: [ "exploring",
                                          "searching_for_food",
                                          "searching_for_mate",
                                          "stalking" ],
                                  to: "attacking" },

                                { name: "flee",
                                  from: [ "attacking",
                                          "being_hunted" ],
                                  to: "fleeing" },

                                { name: "stalk",
                                  from: [ "exploring" ],
                                  to: "stalking" },

                                { name: "observe",
                                  from: [ "exploring",
                                          "stalking" ],
                                  to: "observing" },

                                { name: "search_for_food",
                                  from: [ "exploring",
                                          "observing" ],
                                  to: "searching_for_food" },

                                { name: "search_for_mate",
                                  from: [ "exploring",
                                          "observing" ],
                                  to: "searching_for_mate" }
                            ],
                            callbacks: {
                                onexplore: function(event, from, to, msg) {
                                },
                            }
                        })
                    }
                });

                this.strategic_state = "domination";
                this.operative_state = "exploring";
                this.state = "exploring";

                var interval = BR.make_interval(this, 50, function() {
                    self.maybe_forget_some_things();
                });

                this.entity.ondead = function() {
                    BR.clear_interval(interval);
                };
            }
        },
        act: {
            value: function() {
                // this.update_state();
                this.observe();
                var action = this.choose_action();
                this.scheduler.setDuration(this.speed * action.speed_modifier);
                action.execute.call(this);

                return {
                    then: function(done) {
                        return done();
                    }
                };
            }
        },
        observe: {
            value: function() {
                /// this method should observe:
                /// - the surrounding use the entities senses
                /// - the current needs of the entity
                this.observable_enemies = this.get_observable_enemies();
                this.observable_allies = this.get_observable_allies();
                this.observable_inanimates = this.get_observable_inanimates();

                this.prioritised_need = this.entity.get_prioritised_need();
                return void 0;
            }
        },
        get_path_to: {
            value: function(to_pos) {
                var ent = this.entity;
                var passable = function(x, y) {
                    return ent.can_walk_on(new BR.T.Pos(x, y));
                };
                var path_finder = new ROT.Path.AStar(to_pos.x, to_pos.y, passable);
                var path = [];
                var pather = function(x, y) {
                    path.push(new BR.T.Pos(x, y));
                };

                var this_pos = ent.position;
                path_finder.compute(this_pos.x, this_pos.y, pather);

                return path.length ? path : null;
            }
        },
        get_observable_inanimates: {
            value: function() {
                var self = this,
                    entity = self.entity;
                var observables = (entity.observable_tiles || [])
                        .reduce(function(out, t) {
                            var a = t.entities.filter(function(e) {
                                return BR.E.Inanimate.prototype.isPrototypeOf(e);
                            });

                            return out.concat(a);
                        }, []);

                return observables;
            }
        },
        get_observable_enemies: {
            value: function() {
                var self = this,
                    entity = self.entity;
                // var actions = t.get_available_actions();
                var observable_enemies = (entity.audible_tiles || []).filter(function(t) {
                    return t.entities.reduce(function(out, e) {
                        return out ||
                            (e.representation.glyph !==
                             entity.representation.glyph &&
                            !e.is_dead);
                    }, false);
                }).reduce(function(out, tile_with_enemies) {
                    var enemies = tile_with_enemies.entities.filter(function(e) {
                        var is_animate =
                                BR.E.Animate.prototype.isPrototypeOf(e);
                        var is_other_race = e.representation.glyph !== entity.representation.glyph;
                        return is_animate && is_other_race;
                    });
                    return out.concat(enemies);
                }, []);

                return observable_enemies;
            }
        },
        get_observable_allies: {
            value: function() {
                var self = this,
                    entity = self.entity;
                // var actions = t.get_available_actions();
                var observable_allies = (entity.audible_tiles || []).filter(function(t) {
                    return t.entities.reduce(function(out, e) {
                        return out ||
                            (e.race === entity.race &&
                             !e.is_dead);
                    }, false);
                }).reduce(function(out, tile_with_allies) {
                    var allies = tile_with_allies.entities.filter(function(e) {
                        var is_animate =
                                BR.E.Animate.prototype.isPrototypeOf(e);
                        var is_same_race = e.race === entity.race;
                        return is_animate && is_same_race;
                    });
                    return out.concat(allies);
                }, []);

                return observable_allies;
            }
        },
        go_to: {
            value: function(pos) {
                if (this.entity.position.eq(pos)) {
                    return true;
                }
                var path = this.get_path_to(pos);
                if (!path) {
                    return false;
                } else if (path.length === 0) {
                    return true;
                } else if (path[0].eq(this.entity.position)) {
                    path.shift();
                }

                //check again after shift.
                if (!path) {
                    return true;
                } else if (path.length === 0) {
                    return true;
                }

                var newp = path.shift();
                if (this.entity.can_move_to(newp)) {
                    if (this.entity.can_stand_up() &&
                        this.entity.is_prone) {
                        this.entity.set_prone(false);
                        return false;
                    }
                    this.entity.move_abs(newp);
                    this.visited_tiles[newp] = 1;
                } else if (this.entity.can_move_to_when_stackable(newp)) {
                    if (!this.entity.is_prone) {
                        this.entity.set_prone(true);
                        return false;
                    }
                    this.entity.move_abs(newp);
                    this.visited_tiles[newp] = 1;
                }
                return false;
            }
        },
        choose_action: {
            value: function() {
                var water_sources = this.observable_inanimates.filter(function(i) {
                    return i.names[0].value === "water";
                });

                if (this.prioritised_need === "thirst") {
                    if (water_sources.length) {
                        return {
                            execute: function() {
                                this.status = "go to drink";
                                if (this.go_to(water_sources[0].position)) {
                                    this.entity.drink(water_sources[0]);
                                }
                            },
                            speed_modifier: 1
                        };
                    // } else {
                    //     return {
                    //         execute: function() {
                    //             this.status = "looking for drink";
                    //             while
                    //                 (this.go_to(
                    //                     BR.world.map.get_random_empty_cell())) {}
                    //         },
                    //         speed_modifier: 1
                    //     }
                    }
                }

                var food_sources = this.observable_inanimates.filter(function(i) {
                    return i.names[0].value === "shrooms";
                });

                if (this.prioritised_need === "hunger" &&
                    food_sources.length) {
                    return {
                        execute: function() {
                            this.status = "go to eat";
                            if (this.go_to(food_sources[0].position)) {
                                this.entity.eat(food_sources[0]);
                            }
                        }
                    };
                }

                if (this.prioritised_need === "vengeance" &&
                    this.observable_enemies.length) {
                    return {
                        execute: function() {
                            this.status = "attacking";
                            if (this.go_to(this.observable_enemies[0].position)) {
                                this.entity.attack(this.observable_enemies[0]);
                            }
                        },
                        speed_modifier: 1
                    };
                }

                if (this.prioritised_need === "vengeance" &&
                    this.entity.needs.vengeance < 0.001 &&
                    this.observable_allies.length) {
                    return {
                        execute: function() {
                            this.status = "attacking";
                            if (this.go_to(this.observable_allies[0].position)) {
                                this.entity.attack(this.observable_allies[0]);
                            }
                        },
                        speed_modifier: 1
                    };
                }

                var self = this;
                var ally_of_other_sex = this.observable_allies.filter(function(e) {
                    return e.sex !== self.entity.sex;
                })[0];
                if (this.prioritised_need === "procreation" &&
                    ally_of_other_sex && this.observable_allies.length) {
                    return {
                        execute: function() {
                            this.status = "go to fuck";
                            this.status_target = ally_of_other_sex;
                            if (this.go_to(this.status_target.position)) {
                                this.entity.copulate_with(this.status_target);
                                this.status_target = null;
                            }
                        }
                    };
                }

                if (this.prioritised_need === "survival") {
                    return {
                        execute: function() {
                            this.status = "fleeing";
                            this.go_to(this.get_random_walkable_cell());
                        }
                    };
                }

                return {
                    name: "maybe_move",
                    execute: function rec() {
                        this.status = "exploring";
                        if (Math.random() < 0.22) {
                            return;
                        }
                        var a = this.get_random_walkable_cell();
                        while (a in this.visited_tiles) {
                            a = this.get_random_walkable_cell();
                        }
                        if (this.go_to(a)) {
                        }
                    },
                    speed_modifier: 1
                };
            }
        },
        get_random_walkable_cell: {
            value: function() {
                // var result = (function rec() {
                //     var c = BR.world.map.get_random_cell_close_to(
                //         this.entity.position, 10);

                //     return this.entity.can_move_to(c.position) ?
                //         c.position : rec.call(this);
                // }).call(this);

                if (!this.entity.audible_tiles) {
                    return this.entity.position;
                }

                var i = Math.floor(
                    ROT.RNG.getUniform() *
                        this.entity.audible_tiles.length);

                var result = this.entity.audible_tiles[i];
                return result.position;
            }
        },
        maybe_forget_some_things: {
            value: function() {
                var self = this;
                var get_key = function() {
                    var ks = Object.keys(self.visited_tiles);
                    var i = Math.floor(ROT.RNG.getUniform() * ks.length);
                    return ks[i];
                };

                // should perhaps use a coefficient...
                if (Math.random() < 0.8) {
                    delete this.visited_tiles[get_key()];
                }
                if (Math.random() < 0.3) {
                    delete this.visited_tiles[get_key()];
                }
                return false;
            }
        }
    });

}).call(this);
