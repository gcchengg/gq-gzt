import env from '@/config/envMaps';
import Config from '@/config';
const { prefix, prefixAI } = env;
// const localPrefix = '/api-local'
//是否是本地环境
const startLocal = true
const isDev = startLocal && process.env.ENV_CONFIG === 'dev';
// const isProd = process.env.ENV_CONFIG !== 'dev';

export default {
  API: `${prefix}`,
  APIAI: process.env.ENV_CONFIG === 'dev' ? `${prefixAI}` : `https://feiwork-aso.faw.cn/ai`,
  UPLOAD:
    process.env.ENV_CONFIG === 'uat'
      ? `https://feiwork-gw-uat.faw.cn/api-dev/uwone-aso/file/upload`
      : process.env.ENV_CONFIG === 'dev'
      ? `${prefix}/uwone-aso/file/upload`
      : `https://feiwork-gw.faw.cn/api-dev/uwone-aso/file/upload`,
};
