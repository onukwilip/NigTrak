export {};
declare module "*.scss";
declare global {
  interface Window {
    mqtt: any;
  }
}
