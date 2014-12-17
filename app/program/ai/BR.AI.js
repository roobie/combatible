(function() {
    "use strict";
    var BR = this.BR;
    var convnetjs = this.convnetjs;
    var deepqlearn = this.deepqlearn;

    var OBSERVABLE_TYPES = [
        "area",
        "ally",
        "enemy",
    ].reduce(function(out, k, i) {
        out[k] = i;
        return out;
    }, {});

    function Brain(properties) {
        this.initialise(properties);
    }
    BR.Brain = Brain;

    Object.defineProperties(Brain.prototype, {
        initialise: {
            value: function(properties) {
                var num_inputs = properties.sensors.length * properties.sensor_states.length;
                var num_actions = properties.outputs.length;
                var temporal_window = properties.memory_length;
                var network_size =
                        num_inputs * temporal_window +
                        num_actions * temporal_window +
                        num_inputs;

                // the value function network computes a value of taking any of the possible actions
                // given an input state. Here we specify one explicitly the hard way
                // but user could also equivalently instead use opt.hidden_layer_sizes = [20,20]
                // to just insert simple relu hidden layers.
                var layer_defs = [
                    { type: 'input', out_sx: 1, out_sy: 1, out_depth: network_size},
                    { type: 'fc', num_neurons: 50, activation: 'relu'},
                    { type: 'fc', num_neurons: 50, activation: 'relu'},
                    { type: 'regression', num_neurons: num_actions},
                ];

                // options for the Temporal Difference learner that trains the above net
                // by backpropping the temporal difference learning rule.
                var tdtrainer_options = {
                    learning_rate:0.001,
                    momentum:0.0,
                    batch_size:64,
                    l2_decay:0.01
                };

                var opt = {
                    temporal_window: temporal_window,
                    experience_size: 300000,
                    start_learn_threshold: 1000,
                    gamma: 0.7,
                    learning_steps_total: 200000,
                    learning_steps_burnin: 3000,
                    epsilon_min: 0.05,
                    epsilon_test_time: 0.05,
                    layer_defs: layer_defs,
                    tdtrainer_options: tdtrainer_options
                };

                Object.defineProperties(this, {
                    $brain: {
                        value: new deepqlearn.Brain(num_inputs, num_actions, opt)
                    }
                });

                // // 4 layers total:
                // // input layer of size 1x1x2 (all volumes are 3D)
                // // two fully connected layers of neurons
                // // a softmax classifier predicting probabilities for two classes: 0,1
                // var layer_defs = [
                //     // { type: 'input', out_sx: 1, out_sy: 1, out_depth: 2 },
                //     // { type: 'fc', num_neurons: 20, activation: 'relu' },
                //     // { type: 'fc', num_neurons: 20, activation: 'maxout', group_size: 4 },
                //     // { type: 'fc', num_neurons: 10, activation: 'sigmoid' },
                //     // { type: 'softmax', num_classes: 2 },
                //     { type: 'input', out_sx: 1, out_sy: 1, out_depth: 5 },
                //     { type: 'fc', num_neurons: 40, activation: 'relu' },
                //     { type: 'fc', num_neurons: 20, activation: 'maxout' },
                //     { type:'regression', num_neurons:1 }
                //     //{ type: 'svm', num_classes: 2 }
                // ];
                // this.neural_net = new convnetjs.Net();
                // this.neural_net.makeLayers(layer_defs);

                // this.trainer = new convnetjs.Trainer(
                //     this.neural_net,
                //     {
                //         method: 'adadelta',
                //         l2_decay: 0.001,
                //         batch_size: 100
                //     });
            }
        },
        reinforce: {
            value: function(value) {
                this.$brain.backward(value);
            }
        },
        // train: {
        //     value: function(data, labels) {
        //         // for(var i = 0; i < data.length; i++) {
        //         //     var x = new convnetjs.Vol(1, 1, 2, 0.0); // a 1x1x2 volume initialized to 0's.
        //         //     x.w[0] = data[i][0]; // Vol.w is just a list, it holds your data
        //         //     x.w[1] = data[i][1];
        //         //     this.trainer.train(x, labels[i]);
        //         // }
        //         // var situation = new convnetjs.Vol([1,0,3,2,4]);
        //         // var stats, i;
        //         // for(i = 0; i < 10000; i++) {
        //         //     stats = this.trainer.train(situation, [0.7]);
        //         // }
        //         // console.log(stats);
        //     }
        // },
        compute: {
            value: function(inputs) {
                // var input = convnetjs.Vol(inputs);
                // var predicted_values = this.neural_net.forward(input);
                // return predicted_values.w[0];

                this.$brain.forward(inputs);
            }
        }
    });


    function EvolvingAI(properties) {
        this.initialise(properties);
    }

    Object.defineProperties(EvolvingAI.prototype, {
        initialise: {
            value: function(properties) {
                var array_to_object = function(out, k, i) {
                    out[k] = 1;
                    return out;
                };

                Object.defineProperties(this, {
                    entity: {
                        value: properties.entity
                    },
                    stateless_AIs: {
                        value: properties.stateless_AIs
                    },
                    observation_methods: {
                        value: properties.observation_methods
                    },
                    finite_state_machine: { // FSM
                        value: properties.finite_state_machine
                    },
                    // NN or another object that
                    // can map input to a transition probability
                    brain: {
                        value: properties.brain
                    },
                    state_map: {
                        value: properties.finite_state_machine
                            .states.reduce(
                                array_to_object,
                                Object.create(null))
                    },
                    transition_map: {
                        value: properties.finite_state_machine
                            .transitions.reduce(
                                array_to_object,
                                Object.create(null))
                    }
                });

                var
                self = this,
                dec_happiness = function() {
                    self.delta_happiness -= 0.1;
                }, inc_happiness = function() {
                    self.delta_happiness += 0.1;
                };
                this.entity.add_hook("damaged", dec_happiness);
                this.entity.add_hook("ate_meal", inc_happiness);
            }
        },
        adapt: {
            value: function() {
                var map_area = function() {
                    return 1;
                };
                var map_allies = function() {
                    return 1;
                };
                var map_enemies = function() {
                    return 1;
                };

                var self = this;
                var current_state = this.finite_state_machine.current;
                var possible_transitions = this.finite_state_machine.transitions;
                var prioritised_transitions = possible_transitions
                        .map(function(transition) {
                            var // FIXME: remake
                            // state and transition
                            i1 = self.state_map[current_state],
                            i2 = self.transition_map[transition],

                            // observations
                            i3 = map_area(self.observables),
                            i4 = map_allies(self.observables),
                            i5 = map_enemies(self.observables);

                            var probability = self.brain.compute([
                                i1, i2, i3, i4, i5
                            ]);

                            return {
                                transition: transition,
                                probability: probability
                            };
                        })
                        .filter(function(pair) {
                            return self.finite_state_machine.can(pair.transition);
                        })
                        .sort(function(a, b) {
                            return b.probability - a.probability;
                        });

                var pair = prioritised_transitions[0];
                // will trigger stateless_AI ->
                // this.finite_state_machine[pair.transition]();
                this.transition = pair.transition;
            }
        },
        execute: {
            value: function() {
                // will trigger stateless_AI ->
                this.finite_state_machine[this.transition]();
            }
        },
        observe: {
            value: function() {
                var current_state = this.finite_state_machine.current;
                var observe = this.observation_methods[current_state];
                this.observables = observe();
            }
        },
        evaluate: {
            value: function() {
                this.delta_happiness = 1;
            }
        },
        evolve: {
            value: function() {
                this.brain.reinforce(this.delta_happiness);
            }
        },
        act: {
            value: function() {
                this.evaluate();

                this.observe();

                this.adapt();

                this.execute();

                this.evolve();

                return {
                    then: function(done) {
                        done();
                    }
                };
            }
        }
    });
}).call(this);








    var test = new BR.Brain({
        sensors: [
            "visual",
            // "audible",
            // "hunger",
        ],
        sensor_states: [
            // "sees_e",
            // "sees_a",
            // "sees_f",
            // "hears"
            "v_f_n", // sees food north
            "v_f_ne", // etc...
            "v_f_e",
            "v_f_se",
            "v_f_s",
            "v_f_sw",
            "v_f_w",
            "v_f_nw",
        ],
        outputs: [
            "w_n", // sees food north
            "w_ne", // etc...
            "w_e",
            "w_se",
            "w_s",
            "w_sw",
            "w_w",
            "w_nw",
        ],
        memory_length: 5
    });


