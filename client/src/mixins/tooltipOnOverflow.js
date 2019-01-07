export default {
  methods: {
    tooltipOnOverFlow(event) {
      const element = event.target;
      if (element.offsetWidth < element.scrollWidth) {
        element.title = element.textContent.trim();
      } else {
        element.title = '';
      }
    },
  },
};
