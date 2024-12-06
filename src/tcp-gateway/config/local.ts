import {SOCKS_AUTH_USER_PASS, TCP_GATEWAY_CONFIG} from '../../service/external';

TCP_GATEWAY_CONFIG.mwConfig.socksConfig[5].proxyConfigList = [
  {
    socksVersion: 1,
    auth: SOCKS_AUTH_USER_PASS,
    socksServer: {
      host: 'elif.site',
      // host: '124.156.155.64',
      port: 80,
    },
    matches: [
      /google/,
      /medium.com/,
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
export const localTcpGateWayConfig = TCP_GATEWAY_CONFIG;
