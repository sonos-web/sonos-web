const {DeviceDiscovery, Listener} = require('sonos');
var socketio = require('socket.io')

module.exports = function (app) {
  const io = socketio.listen(app)
  io.on('connection', function(socket) {            
    console.log('a user connected')
  });


  async function getDevices() {
    return new Promise(function (resolve) {
      let devices = await DeviceDiscovery({timeout:5})
      console.log(devices)
    })
  }
  



    
  // DeviceDiscovery({timeout: 5}, function(device) {        
  //       Listener.subscribeTo(device).catch(error => {
  //         switch (error.statusCode) {
  //           case 500:
  //           // We get this error when attempting to subscribe
  //           // to satellite speakers that are invisible
  //           // Don't know of an easy way at this point to filter them out
  //           // We don't want to or need to subscribe to them
  //             break;
  //           default:
  //             console.log(error)
  //         }          
  //       });
  //       device.on('AVTransport', async function (data) {
  //           let transportInfo = await parseAVTransportInfo(device, data)
  //           io.emit('AVTransport State Changed', transportInfo)
  //       })

  //       device.on('RenderingControl', async function (data) {
  //        //console.log(data)
  //       })        
  // })
}

async function parseAVTransportInfo(device, data) {
  try {
    let deviceInfo = await device.deviceDescription()
    let deviceID = deviceInfo.UDN.split('uuid:')[1]

    return {
      zoneID: deviceID,
      zoneName: deviceInfo.roomName,
      currentTrack: data.CurrentTrackMetaDataParsed,
      nextTrack: data['r:NextTrackMetaDataParsed'],
      currentTransportActions: data.CurrentTransportActions,
      state: data.TransportState,
      currentPlayMode: data.CurrentPlayMode
    }    
  } catch (error) {
    console.log(error)
  }    
}
