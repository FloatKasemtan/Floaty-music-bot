import { Event } from "../structures/Event";

export default new Event("ready", () => {
  console.log("Floaty is ready to chill");
});
