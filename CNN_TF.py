import tensorflow as tf
import numpy as np
from tensorflow.examples.tutorials.mnist import input_data
from random import *

# ------------------------------------------ Functions ------------------------------------------ 

# Function to create a convolutional layer
# The activation function is RELU
def create_conv_layer(num_filters, input_channels, w_height, w_width, stride_length, input_arr):
    w = tf.Variable(tf.random_normal([w_height, w_width, input_channels, num_filters]), dtype=tf.float32)
    bias = tf.Variable(tf.random_normal([num_filters]), dtype=tf.float32)
    layer = tf.nn.conv2d(input_arr, filter=w, strides=[stride_length, stride_length, stride_length, stride_length], padding="SAME", use_cudnn_on_gpu=False)
    layer += bias
    layer = tf.nn.relu(layer)
    return layer

# Function to create a pooling layer
def create_pool_layer(conv_layer, ksize_x, ksize_y, stride_length):
    return tf.nn.max_pool(conv_layer, ksize = [1, ksize_x, ksize_y, 1], strides = [1, ksize_x, ksize_y, 1], padding="SAME")

# Function to create a fully connected layer
def fully_connected_layer(size_of_layer, size_prev_layer, prev_layer):
    w_fc = tf.Variable(tf.random_normal([size_prev_layer, size_of_layer], stddev=1/np.sqrt(size_prev_layer)), name='w_fc')
    b_fc = tf.Variable(tf.random_normal([size_of_layer], stddev=1), name='b_fc')

    fc_output = tf.add(tf.matmul(prev_layer, w_fc), b_fc)
    fc_output = tf.sigmoid(fc_output)
    return fc_output

# Function returning output error and difference between
# expected output and the networks output
def get_output(size_fc, last_fc_layer, size_of_output, expected_output, learning_rate):
    output_weights = tf.Variable(tf.random_normal([size_fc, size_of_output], stddev=1/np.sqrt(size_fc)), name='output_weights')
    output_bias = tf.Variable(tf.random_normal([size_of_output], stddev=1), name='output_bias')
    y_ = tf.add(tf.matmul(last_fc_layer, output_weights), output_bias)
    y_ = tf.sigmoid(y_)
    difference = tf.subtract(expected_output, y_)
    return y_, difference

# ------------------------------------------ Initialization ------------------------------------------ 

# Important hyper parameters
epochs = 40
# Size of local receptive field
w_height = 4
w_width = 4
w_height2 = 2
w_width2 = 2
# Size of pool layer
ksize_x = 2
ksize_y = 2
ksize_x2 = 2
ksize_y2 = 2
# Size of inputs for the different layers
input_size_x = 28
input_size_y = 28
input_size_x2 = input_size_x / ksize_x
input_size_y2 = input_size_y / ksize_y
# Number of filters for the different layers
num_filters = 15
num_filters2 = 30
# Learning rate
learning_rate = 0.01
# Batch size
batch_size = 50
# Number of neurons in the fully connected layers
fc_size = 500
output_size = 10

# Load the mnist data set
mnist = input_data.read_data_sets("MNIST_data/", one_hot=True)

# Input data
x = tf.placeholder(tf.float32, [None, input_size_x*input_size_y])
y = tf.placeholder(tf.float32, [None, output_size])
# Reshape input data into 28 x 28
x_shaped = tf.reshape(x, [-1, input_size_x, input_size_y, 1])

# ------------------------------------------ Operations ------------------------------------------ 

# Create the layers of the cnn
conv_layer_1 = create_conv_layer(num_filters, 1, w_height, w_width, 1, x_shaped)
pooled_layer = create_pool_layer(conv_layer_1, ksize_x, ksize_y, 1)

conv_layer_2 = create_conv_layer(num_filters2, num_filters, w_height2, w_width2, 1, pooled_layer)
pooled_layer2 = create_pool_layer(conv_layer_2, ksize_x2, ksize_y2, 1)
flattened_pooled2 = tf.reshape(pooled_layer2, [-1, (input_size_x2/ksize_x2) * (input_size_y2/ksize_y2) * num_filters2])

last_fc_layer = fully_connected_layer(fc_size, (input_size_x2/ksize_x2) * (input_size_y2/ksize_y2) * num_filters2, flattened_pooled2)

# Get the cnn output, difference between that output and the expected output, and the error
y_, difference = get_output(fc_size, last_fc_layer, output_size, y, learning_rate)
error = tf.reduce_mean(tf.reduce_sum(tf.multiply(difference, difference), axis=1))

# Train the network to reduce the error
optimizer = tf.train.GradientDescentOptimizer(learning_rate=learning_rate).minimize(error)

# Measure Accuracy
correct_prediction = tf.equal(tf.argmax(y, 1), tf.argmax(y_, 1))
accuracy = tf.reduce_mean(tf.cast(correct_prediction, tf.float64))

# set up init operator
init_op = tf.global_variables_initializer()

# ------------------------------------------ Run the session ------------------------------------------ 

with tf.Session() as sess:
    # First initialize everything
    sess.run(init_op)
    each_epoch = int(len(mnist.train.labels)/batch_size)

    # Print the initial accuracy of the network
    print 'Baseline Accuracy: {}'.format(sess.run(accuracy, feed_dict={x: mnist.test.images, y: mnist.test.labels}))

    # Train and Test the network
    for epoch in range(epochs):
        avg_cost = 0
        for sample in range(each_epoch):
            # Get input and output
            batch_input, batch_output = mnist.train.next_batch(batch_size=batch_size)
            # Get cost
            calc_error, _ = sess.run([error, optimizer], feed_dict={x: batch_input, y: batch_output})
            avg_cost += calc_error/batch_size
        print 'Epoch #{} cost: {}'.format(epoch, avg_cost)
        print 'Accuracy: {}'.format(sess.run(accuracy, feed_dict={x: mnist.test.images, y: mnist.test.labels}))
        print
