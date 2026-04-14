/**
 * React Native CLI (>=0.79) loads runnable commands from `react-native.config.*`.
 *
 * In this repo the CLI package itself only exposes a minimal command set by default,
 * so we explicitly register the core Metro commands + platform run/build commands.
 */

const {
  startCommand,
  bundleCommand,
} = require('@react-native/community-cli-plugin');

const {commands: androidCommands} = require('@react-native-community/cli-platform-android');
const {commands: iosCommands} = require('@react-native-community/cli-platform-ios');

module.exports = {
  commands: [startCommand, bundleCommand, ...androidCommands, ...iosCommands],
};

