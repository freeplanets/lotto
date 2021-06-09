const config = {
  aws: {
    region: "ap-southeast-1", // e.g. us-east-1
    iot: {
      // NOTE: get this value with `aws iot describe-endpoint`
      // endpoint: 'a3598bbh3zx9gg-ats.iot.ap-southeast-1.amazonaws.com',
      endpoint: "a3598bbh3zx9gg.iot.ap-southeast-1.amazonaws.com",
    },
    cognito: {
      // NOTE: Get this value with `aws cognito-identity list-identity-pools --max-results=5`
      identityPoolId: "ap-southeast-1:b2ca64ea-56ba-48fc-8230-5ca129e51a98",
    },
  },
  topics: {
    tick: "wsovermqtt/tick", // 行情頻道
    announcement: "wsovermqtt/announcement", // 公告頻道
    room: "wsovermqtt/room/", // 私人頻道前置
  },
};

export default config;
