import * as fs from "fs";
import { env } from "process";
import * as esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import { sassPlugin } from "esbuild-sass-plugin";

for (const dir of ["../dist", "../dist/web"]) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

const production = env.NODE_ENV === "production";
const development = env.NODE_ENV === "development";


/**
 * This should point to all entry points for JS add-ons.
 * Each one will create one js and one css file in `../src/dist/web'
 */
const entryPoints = ["src/editor.ts"];

/**
 * Esbuild build options
 * See https://esbuild.github.io/api/#build-api for more
 */
const options = {
    entryPoints,
    outdir: "../dist/web",
    format: "iife",
    target: "es6",
    bundle: true,
    minify: production,
    treeShaking: production,
    sourcemap: !production,
    pure: production ? ["console.log", "console.time", "console.timeEnd"] : [],
    external: ["svelte", "anki"],
    plugins: [
        sveltePlugin({
            preprocess: sveltePreprocess({
                scss: {
                    includePaths: ["anki/sass"],
                },
            }),
        }),
        sassPlugin(),
    ],
    loader: {
        ".png": "dataurl",
        ".svg": "text",
    },
};

const context = await esbuild.context(options);

if (development) {
    console.log("Watching for changes...");
    await context.watch();
}
else {
    await context.rebuild();
    context.dispose();
}
