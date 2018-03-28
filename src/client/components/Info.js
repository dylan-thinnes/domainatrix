import React from "react";

import What from "./info/What";
import How  from "./info/How";
import Why  from "./info/Why";
import Who  from "./info/Who";

import Modal from "./Modal.js"

export const what = new Modal("what", "What is this?", <What/>);
export const why  = new Modal("why", "Why did you make this?", <Why/>);
export const how  = new Modal("how", "What is this built on?", <How/>);
export const who  = new Modal("who", "Who built this site?", <Who/>);
