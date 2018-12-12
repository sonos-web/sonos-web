const {Sonos, DeviceDiscovery, Listener} = require('sonos')

module.exports = async function () {
  DeviceDiscovery(function(device) {        
        Listener.subscribeTo(device).catch(error => {          
          console.log(`Error subscribing to ${device.host}`)
        });
        device.on('AVTransport', function (data) {
            let transportInfo = parseAVTransportInfo(device, data)
        })
  })
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
