import {SOCKS_AUTH_DEFAULT_USER_PASS, TCP_GATEWAY_DEFAULT_CONFIG} from '../../service/external';

TCP_GATEWAY_DEFAULT_CONFIG.mwConfig.socks[5].proxyConfigList = [
  {
    socksVersion: 1,
    auth: SOCKS_AUTH_DEFAULT_USER_PASS,
    socksServer: {
      host: 'elif.site',
      // host: '124.156.155.64',
      port: 80,
    },
    matches: [
      /google/,
      /medium.com/,
      /nodejs.org/,
      /npmjs.com/,
      /reddit.com/,
      /quora.com/,
      /bonus.ly/,
      'stackoverflow.com',
      'www.howtogeek.com',
      /wikipedia/,
      /v2ex.com/,
      /youtube.com/,
      /github.com/,
    ],
  },
];

// TCP_GATEWAY_DEFAULT_CONFIG.mwConfig.assetsSyncUp = {
//   dir: '/Users/Shared/assets',
//   // git: 'git@github.com:fe/module/assets.git',
// };
export const localTcpGateWayConfig = TCP_GATEWAY_DEFAULT_CONFIG;
