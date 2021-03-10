const fs = require('fs');
//const path = require('path');
const projectPath = __dirname + '/..';
const pkg = require(projectPath + '/package.json');

const filenames = {
    input: projectPath + '/src/index.ts',
    output: projectPath + '/' + pkg.main,
};

const standalone = process.env.BUILD_STANDALONE == 1;

class ProjectBuilder {
    build(standalone = false) {
        const externals = standalone ? ['fs'] : ['axios', 'fastify', 'fs'];

        require('esbuild').buildSync({
            entryPoints: [filenames.input],
            bundle: true,
            platform: 'node',
            target: 'node12',
            format: 'cjs',
            minify: standalone,
            outfile: standalone ? filenames.output.replace('.js', '.standalone.js') : filenames.output,
            external: externals,
            define: {
                __BUILD_VERSION__: '"' + pkg.version + '"',
            },
        });

        this.replaceConstants();
    }

    replaceConstants() {
        try {
            const fn = standalone ? filenames.output.replace('.js', '.standalone.js') : filenames.output;

            let contents = fs.readFileSync(fn, { encoding: 'utf-8' }).toString();
            contents = contents.replace(/__BUILD_VERSION__/g, pkg.version);
            contents = contents.replace(/__APP_NAME__/g, pkg.name);

            fs.writeFileSync(fn, contents);
        } catch (err) {
            console.log(err);
        }
    }
}

function main(standalone) {
    const fn = standalone ? filenames.output.replace('.js', '.standalone.js') : filenames.output;

    console.log('Building project... (' + filenames.input.replace(projectPath, '.') + ')');

    const builder = new ProjectBuilder();

    builder.build(standalone);

    console.log('Build complete: ' + fn.replace(projectPath, '.'));
}

main(standalone);
