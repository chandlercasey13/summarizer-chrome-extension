import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';




export default {
    entry: {
        background: "./src/background/background.ts",
        index: "./src/index.tsx",
        contentScript: "./src/foreground/contentScript.ts",
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: { noEmit: false },
                        },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                exclude: /node_modules/,
                test: /\.css$/i,
                use: ["style-loader", "css-loader", "postcss-loader"],
            },
        ],
    },
    plugins: [
      
        new CopyPlugin({
            patterns: [{ from: "manifest.json", to: "../manifest.json" }],
        }),
        ...getHtmlPlugins(["index"]),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.css'],
    },
    output: {
        path: path.resolve("dist/js"),
        filename: "[name].js",
    },
};

function getHtmlPlugins(chunks) {
    return chunks.map(
        (chunk) =>
            new HtmlWebpackPlugin({
                title: "React extension",
                filename: `${chunk}.html`,
                chunks: [chunk],
            })
    );
}
