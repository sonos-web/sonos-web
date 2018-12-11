const rooms = require('express').Router()
const {Sonos, DeviceDiscovery} = require('sonos')

// Retrieve all
rooms.get('/', function (req, res) {
    DeviceDiscovery().once('DeviceAvailable', async function (device) {        
        let groups = await device.getAllGroups()
        res.status(200).send(parseZoneGroups(groups))
    })
})

/// Return a subset of the zone group information that is relevant
function parseZoneGroups(groups) {
    var zoneGroups = []
    var zones = []

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
            zones.push(room)
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

    // sort alphabetically
    zones.sort(function(zone1, zone2) {
        return zone1.name > zone2.name
    })
    zoneGroups.sort(function(group1, group2) {
        return group1.coordinator_name > group2.coordinator_name
    })           

    return {zoneGroups, zones}
}

module.exports = rooms
