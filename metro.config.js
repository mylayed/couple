// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite (сховище для Expo Go) тягне у вебзбірку wasm-файл; без цього Metro її не збирає
config.resolver.assetExts.push('wasm');

module.exports = config;
