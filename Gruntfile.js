module.exports = function(grunt) {
  var config, loadConfig;
  require('colors');
  require('load-grunt-tasks')(grunt);
  config = {
    cwd: process.cwd()
  };
  loadConfig = function(path) {
    var glob, key, object;
    glob = require("glob");
    object = {};
    key = void 0;
    glob.sync("*", {
      cwd: path
    }).forEach(function(option) {
      key = option.replace(/\.(js|coffee)$/, "");
      return object[key] = require(path + option);
    });
    return object;
  };
  grunt.util._.extend(config, loadConfig(config.cwd + "/tasks/options/"));
  grunt.initConfig(config);
  return grunt.loadTasks(config.cwd + "/tasks");
};
