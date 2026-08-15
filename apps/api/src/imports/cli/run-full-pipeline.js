require("ts-node").register({
  compilerOptions: {
    module: "CommonJS",
  },
});

require("./full-pipeline.ts");
