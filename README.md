# About
This is a module that generates a profile card from an osu!droid user, both from the main server and osudroid!rx.

preview version, final ver coming soon™
# Usage
```ts
import fs from "fs";
import { DroidBanchoUser } from "miko-modules";
// or, for RX users
// import { DroidRXUser } from "miko-modules";

import { DroidCard } from "@floemia/osu-droid-card";

// both packages support CJS require()!
// const { DroidCard } = require("@floemia/osu-droid-card");
// const { DroidBanchoUser } = require("miko-modules");

const user = await DroidBanchoUser.get({ uid: 177955 });
// const user = await DroidRXUser.get({ uid: 14 })
if (!user) throw new Error("User not found");
const card = await DroidCard.create(user);
console.log(card);
fs.writeFileSync(`./${user.username}.png`, card);
```

# Output