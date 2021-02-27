/**
 * Created by Emman on 25/02/2019.
 */
var fs = require('fs');
var mongoose = require("mongoose");
//const Messages = require('../models/emmessages');
//const  MessagingController = require('../controllers/MessagingController.js');


module.exports = function(io) {

    var channels = {};
    var sockets = {};

    io.on('connect',function(socket) {

        socket.on('connectedUser',function(receiver){

        });
        socket.channels = {};
        sockets[socket.id] = socket;

        console.log("["+ socket.id + "] connection accepted");

        socket.on('disconnect', function () {
            for (var channel in socket.channels) {
                part(channel);
            }
            console.log("["+ socket.id + "] disconnected");
            delete sockets[socket.id];
        });

        /////////// JOIN START

        socket.on('join', function (config) {
            console.log("["+ socket.id + "] join ", config);
            var channel = config.channel;
            var userdata = config.userdata;

            if (channel in socket.channels) {
                console.log("["+ socket.id + "] ERROR: already joined ", channel);
                return;
            }

            if (!(channel in channels)) {
                channels[channel] = {};
            }

            for (id in channels[channel]) {
                channels[channel][id].emit('addPeer', {'peer_id': socket.id, 'should_create_offer': false});
                socket.emit('addPeer', {'peer_id': id, 'should_create_offer': true});
            }

            channels[channel][socket.id] = socket;
            socket.channels[channel] = channel;
        });

        /////////// JOIN ENDS

    });
};

function part(channel) {
    console.log("["+ socket.id + "] part ");

    if (!(channel in socket.channels)) {
        console.log("["+ socket.id + "] ERROR: not in ", channel);
        return;
    }

    delete socket.channels[channel];
    delete channels[channel][socket.id];

    for (id in channels[channel]) {
        channels[channel][id].emit('removePeer', {'peer_id': socket.id});
        socket.emit('removePeer', {'peer_id': id});
    }
}