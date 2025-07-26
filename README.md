# About
Generate a profile card from an osu!droid user with the help of [@floemia/osu-droid-utils](https://github.com/floemia/osu-droid-utils). osudroid!rx is also supported!

Still in development, expect bugs or design changes.
# Usage
## Installation
```bash
$ npm i @floemia/osu-droid-card @floemia/osu-droid-utils
```
## Import
```ts
import { DroidCard } from "@floemia/osu-droid-card";
import { DroidBanchoUser, DroidRXUser } from "@floemia/osu-droid-utils";
// require() is also supported!

```
# Usage
```ts
const user = await DroidBanchoUser.get({ uid: 177955 });
// const user = await DroidRXUser.get({ uid: 14 })
const card = await DroidCard.create(user);
console.log(card);
fs.writeFileSync(`./${user.username}.png`, card);
```

# Output
<img height="360" alt="image" src="https://github.com/user-attachments/assets/aba090cd-c367-4be9-b8ce-9321d82937d0" />
