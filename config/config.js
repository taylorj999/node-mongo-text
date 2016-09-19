var config = {};

// system configuration, used to define back end features
// anything that never is required by the display layer goes in here
config.system = {};

config.system.mongoConnectString = 'mongodb://localhost:27017/textstore';
config.system.sessionKey = 'insertyoursecrethere';
config.system.serverPort = 3001;

// reserved tag keywords, things which are inferred and never assigned directly
config.system.reservedTags = ['new','deleted','untagged'];

// site configuration, used to build pages or allow/disallow actions globally
// anything that needs to be passed to the display layer goes in here
config.site = {};

config.site.resultsPerPage = 15;

module.exports = config;