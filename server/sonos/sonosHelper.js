const {Sonos, DeviceDiscovery} = require('sonos');


var SonosHelper = function SonosHelper(sonos) {

}

/// Return a subset of the zone group information that is relevant
const parseZoneGroups = function (groups) {
    var zoneGroups = []    

    for(group of groups) {        
        zoneGroups.push({
            id: group.ID,
            coordinator_name: null,
            coordinator: group.Coordinator,            
            members: []
        })
        // iterate over all the members in this group...
        for(zone of group.ZoneGroupMember) {
            // find the zone group for this zone             
            let zoneGroup = zoneGroups.filter(function(zoneGroup) {
                return zoneGroup.coordinator === group.Coordinator
            })[0]
            let room = {
                id: zone.UUID,                
                name: zone.ZoneName,
                isCoordinator: zone.UUID === group.Coordinator,
            }
            zoneGroup.members.push(room)
        }
    }

    for(zoneGroup of zoneGroups) {
        // assign the coordinator name to the group for referencing
        let coordinator = zoneGroup.members.filter(function(member) {
            return member.isCoordinator
        })[0]
        zoneGroup.coordinator_name = coordinator.name

        // sort members alphabetically
        zoneGroup.members.sort(function(member1, member2) {
            return member1.name > member2.name
        })     
    }

    zoneGroups.sort(function(group1, group2) {
        return group1.coordinator_name > group2.coordinator_name
    })           

    return {zoneGroups}
}

/// Returns an instance of Sonos given its UUID
/// There has to be a better way of doing this
const getDeviceById = async function (deviceId) {
    return new Promise(function (resolve) {
        DeviceDiscovery(async function (device) {
            let deviceInfo = await device.deviceDescription()
            let deviceID = deviceInfo.UDN.split('uuid:')[1]
            if (deviceID === deviceId) {
               return resolve(device)
            }
        })
    })  
   
}

// const visibleZoneIds = function (groups) {
//     let zoneGroups = parseZoneGroups(groups);
//     var visibleZoneIds = []
//     for (group of zoneGroups) {
//         for (member of group.members) {
//             visibleZoneIds.push(member.id)
//         }
//     }
//     return visibleZoneIds
// }

module.exports.parseZoneGroups = parseZoneGroups
module.exports.getDeviceById = getDeviceById