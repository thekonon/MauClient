// Global project settings for MnauMnauGame

export type MnauConfigType = {
  ip: string; // Backend IP
  port: string; // Docker container port
};

const MnauConfig: MnauConfigType = {
  ip: window.location.hostname,
  port: "8080",
};

export default MnauConfig;
