
function NeuralNet(properties) {
    this.initialise(properties);
}

Object.defineProperties(NeuralNet.prototype, {
    initialise: {
        value: function(properties) {
            // 4 layers total:
            // input layer of size 1x1x2 (all volumes are 3D)
            // two fully connected layers of neurons
            // a softmax classifier predicting probabilities for two classes: 0,1
            var layer_defs = [
                { type:'input', out_sx:1, out_sy:1, out_depth:2 },
                { type:'fc', num_neurons:20, activation:'relu' },
                { type:'fc', num_neurons:20, activation:'maxout', group_size: 4 },
                { type:'fc', num_neurons:10, activation:'sigmoid' },
                { type:'softmax', num_classes:2 },
            ];
            this.net = new convnetjs.Net();
            this.net.makeLayers(layer_defs);
        }
    },
    example_neural_net_regression: {
        value: function() {
            var layer_defs = [];
            layer_defs.push({ type:'input', out_sx:1, out_sy:1, out_depth:2 });
            layer_defs.push({ type:'fc', num_neurons:5, activation:'sigmoid' });
            layer_defs.push({ type:'regression', num_neurons:1 });
            var net = new convnetjs.Net();
            net.makeLayers(layer_defs);

            var x = new convnetjs.Vol([0.5, -1.3]);

            // train on this datapoint, saying [0.5, -1.3] should map to value 0.7:
            // note that in this case we are passing it a list, because in general
            // we may want to  regress multiple outputs and in this special case we
            // used num_neurons:1 for the regression to only regress one.
            var trainer = new convnetjs.SGDTrainer(net, {
                learning_rate:0.01,
                momentum:0.0,
                batch_size:1,
                l2_decay:0.001
            });
            trainer.train(x, [0.7]);

            // evaluate on a datapoint. We will get a 1x1x1 Vol back, so we get the
            // actual output by looking into its 'w' field:
            var predicted_values = net.forward(x);
            console.log('predicted value: ' + predicted_values.w[0]);
        }
    },
    layers: {
        value: function() {
            var a = [
                // create layer of 10 linear neurons (no activation function by default)
                {type:'fc', num_neurons:10},
                // create layer of 10 neurons that use sigmoid activation function
                {type:'fc', num_neurons:10, activation:'sigmoid'}, // x->1/(1+e^(-x))
                {type:'fc', num_neurons:10, activation:'tanh'}, // x->tanh(x)
                {type:'fc', num_neurons:10, activation:'relu'}, // rectified linear units: x->max(0,x)
                // maxout units: (x,y)->max(x,y). num_neurons must be divisible by 2.
                // maxout "consumes" multiple filters for every output. Thus, this line
                // will actually produce only 5 outputs in this layer. (group_size is 2)
                // by default.
                {type:'fc', num_neurons:10, activation:'maxout'},
                // specify group size in maxout. num_neurons must be divisible by group_size.
                // here, output will be 3 neurons only (3 = 12/4)
                {type:'fc', num_neurons:12, group_size: 4, activation:'maxout'},
                // dropout half the units (probability 0.5) in this layer during training, for regularization
                {type:'fc', num_neurons:10, activation:'relu', drop_prob: 0.5},
                // layer computes tensor multiply instead of matrix multiply.
                // internally, uses a 'quadtransform' layer that expands input to contain all binary terms
                // you probably don't want to use this unless you're a pro.
                {type:'fc', num_neurons:10, activation:'relu', tensor: true}
            ];
        }
    },
    example_neural_net_classification: {
        value: function() {
            // 4 layers total:
            // input layer of size 1x1x2 (all volumes are 3D)
            // two fully connected layers of neurons
            // a softmax classifier predicting probabilities for two classes: 0,1
            var layer_defs = [];
            layer_defs.push({ type:'input', out_sx:1, out_sy:1, out_depth:2 });
            layer_defs.push({ type:'fc', num_neurons:20, activation:'relu' });
            layer_defs.push({ type:'fc', num_neurons:20, activation:'maxout', group_size: 4 });
            layer_defs.push({ type:'fc', num_neurons:10, activation:'sigmoid' });
            layer_defs.push({ type:'softmax', num_classes:2 });

            // create a net out of it
            var net = new convnetjs.Net();
            net.makeLayers(layer_defs);

            // the network always works on Vol() elements. These are essentially
            // simple wrappers around lists, but also contain gradients and dimensions
            // line below will create a 1x1x2 volume and fill it with 0.5 and -1.3
            var x = new convnetjs.Vol([0.5, -1.3]);

            var probability_volume = net.forward(x);
            console.log(
                'probability that x is class 0: ',
                probability_volume.w[0]);
            // prints 0.50101

            var trainer = new convnetjs.SGDTrainer(net, {
                learning_rate:0.01,
                momentum:0.0,
                batch_size:1,
                l2_decay:0.001
            });

            trainer.train(x, 0);
            var probability_volume2 = net.forward(x);
            console.log(
                'probability that x is class 0:',
                probability_volume2.w[0]);
            // prints 0.50374
        }
    }
});
