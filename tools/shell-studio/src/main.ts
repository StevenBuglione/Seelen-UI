import { mount } from "svelte";
import App from "./App.svelte";
import "./studio.css";

const target = document.getElementById("app");
if (!target) {
  throw new Error("Shell Studio mount element is missing");
}

mount(App, { target });
