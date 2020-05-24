import scss from 'rollup-plugin-scss';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy2';
import zip from 'rollup-plugin-zip';

const releaseBuild = true;
const destinationDir = 'dist';

const toBundle = [
    'template.json',
    'system.json',
    'CypherSystem.css',
    "fonts/Karla/Karla-Regular.ttf",
    "fonts/Karla/Karla-Bold.ttf",
    "fonts/Karla/Karla-Italic.ttf",
    "fonts/Karla/Karla-BoldItalic.ttf",
    "fonts/Karla/OFL.txt",
    "lib/flexbox-grid/flexboxgrid.min.css",
    "lib/select2/select2.min.css",
    "lib/select2/select2.min.js",
    "templates/characterSheet.html",
    "templates/npcSheet.html",
    "templates/item/abilitySheet.html",
    "templates/item/armorSheet.html",
    "templates/item/artifactSheet.html",
    "templates/item/cypherSheet.html",
    "templates/item/gearSheet.html",
    "templates/item/odditySheet.html",
    "templates/item/skillSheet.html",
    "templates/item/weaponSheet.html",
    "LICENSE"
];

export default [{
    input: 'CypherSystem.js',
    output: {
        dir: destinationDir,
        format: 'umd',
    },
    plugins: [
        terser({
            sourcemap: !releaseBuild,
            compress: releaseBuild ? {} : false,
        }),
        scss({
            failOnError: true,
            output: true,
        }),
        copy({
            assets: toBundle,
        }),
        zip({
            dir: destinationDir,
        }),
    ],
}, ];