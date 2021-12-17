/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-url-polyfill/auto';

// import {URL, URLSearchParams} from 'whatwg-url';
// import {Buffer} from 'buffer';
AppRegistry.registerComponent(appName, () => App);
// react-native 0.59 add own global URLSearchParams without implementation
// https://github.com/facebook/react-native/blob/e6057095adfdc77ccbbff1c97b1e86b06dae340b/Libraries/Blob/URL.js#L66
// global.Buffer = Buffer;
// global.URL = URL;
// global.URLSearchParams = URLSearchParams;
