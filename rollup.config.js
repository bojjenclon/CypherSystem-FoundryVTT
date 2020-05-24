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
    
    "templates/PCSheet.html",
    "templates/NPCSheet.html",
    "templates/item/AbilitySheet.html",
    "templates/item/ArmorSheet.html",
    "templates/item/ArtifactSheet.html",
    "templates/item/CypherSheet.html",
    "templates/item/GearSheet.html",
    "templates/item/OdditySheet.html",
    "templates/item/SkillSheet.html",
    "templates/item/WeaponSheet.html",

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