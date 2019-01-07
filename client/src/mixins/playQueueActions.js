import groupsAPI from '../services/API/groups';

export default {
  methods: {
    playNow(uriObject) {
      const uriData = this.getURIData(uriObject);
      groupsAPI.playNow(this.activeZoneGroupId, uriData);
    },
    playNext(uriObject) {
      const uriData = this.getURIData(uriObject);
      groupsAPI.playNext(this.activeZoneGroupId, uriData);
    },
    addToEndOfQueue(uriObject) {
      const uriData = this.getURIData(uriObject);
      groupsAPI.addToEndOfQueue(this.activeZoneGroupId, uriData);
    },
    replaceQueueAndPlay(uriObject) {
      const uriData = this.getURIData(uriObject);
      groupsAPI.replaceQueueAndPlay(this.activeZoneGroupId, uriData);
    },
    getURIData(data) {
      return typeof data === 'string' ? { uri: data } : data;
    },
  },
  computed: {
    activeZoneGroupId() {
      return this.$store.state.activeZoneGroupId;
    },
  },
};
