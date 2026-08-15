require("ts-node").register({
  compilerOptions: {
    module: "CommonJS",
  },
});

require("./test-500-discovery.ts");
