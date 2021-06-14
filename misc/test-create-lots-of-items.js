// very naive performance test to see how many items we can create per second.
// feel free to run multiple instances of item-store to see how that affects the results.
var axios = require("axios");
var data = JSON.stringify({
    name: "Golden Goose",
    data: { level: "rare", type: "goose", attribute: "gold" },
    total_quantity: 10,
    available_quantity: 10
});

var config = {
    method: "post",
    url: "http://localhost:8000/item-store/item",
    headers: {
        "Content-Type": "application/json"
    },
    data: data
};

(async () => {
    try {
        const all = [];
        const time = Date.now();
        for (let i = 0; i < 1000; i++) {
            all.push(axios(config));
        }
        Promise.all(all).then(() => {
            console.log("done", Date.now() - time);
        });
    } catch (err) {
        console.error(err);
    }
})();

// latest benchmarks on AMD Ryzen 2700, 8 cores/16 threads, for 1000 item create
// 1 instance = 18s
// 2 instances = 12s
// 3 instances = 10s
// 5 instances = 8s
// 8 instances = 6s
// 16 instances = 4s
