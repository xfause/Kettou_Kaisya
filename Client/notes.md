
```js
// 如何快速本地组件间通信
import { EventBus } from "../eventBus";
EventBus.$emit("COMMAND_NAME", {
    // data you want to send
});
var that = this;
EventBus.$on("COMMAND_NAME", function (res) {
    // do something
    // res.xx = that.xx
});
```