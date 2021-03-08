const fs = require('fs');
//const path = require('path');
const projectPath = __dirname + '/..';
const pkg = require(projectPath + '/package.json');

const filenames = {
    input: projectPath + '/src/index.ts',
    output: projectPath + '/' + pkg.main,
};

class ProjectBuilder {
    build() {
        require('esbuild').buildSync({
            entryPoints: [filenames.input],
            bundle: true,
            platform: 'node',
            target: 'node14',
            format: 'cjs',
            outfile: filenames.output,
            external: ['axios', 'fastify', 'fs'],
            define: {
                __BUILD_VERSION__: '"' + pkg.version + '"',
            },
        });

        this.replaceConstants();
    }

    replaceConstants() {
        try {
            let contents = fs.readFileSync(filenames.output, { encoding: 'utf-8' }).toString();
            contents = contents.replace(/__BUILD_VERSION__/g, pkg.version);
            contents = contents.replace(/__APP_NAME__/g, pkg.name);

            fs.writeFileSync(filenames.output, contents);
        } catch (err) {
            console.log(err);
        }
    }
}

function main() {
    console.log('Building project... (' + filenames.input.replace(projectPath, '.') + ')');

    const builder = new ProjectBuilder();

    builder.build();

    console.log('Build complete: ' + filenames.output.replace(projectPath, '.'));
}

main();
