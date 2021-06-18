import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

const extensions = ['.js', '.ts'];

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/main.mjs',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({ extensions }),
      babel({ babelHelpers: 'bundled', extensions, include: ['src/**/*'] }),
    ],
  },
  {
    input: 'src/JitsiMeetAnalyticsHandler.ts',
    output: [
      {
        file: 'dist/JitsiMeetAnalyticsHandler.js',
        format: 'iife',
        sourcemap: false,
        name: 'JitsiMeetAnalyticsHandler',
      },
      {
        file: 'demo/iframe/JitsiMeetAnalyticsHandler.js',
        format: 'iife',
        sourcemap: false,
        name: 'JitsiMeetAnalyticsHandler',
      },
      {
        file: 'dist/JitsiMeetAnalyticsHandler.min.js',
        plugins: [terser()],
        format: 'iife',
        sourcemap: false,
        name: 'JitsiMeetAnalyticsHandler',
      },
      {
        file: 'demo/iframe/JitsiMeetAnalyticsHandler.min.js',
        plugins: [terser()],
        format: 'iife',
        sourcemap: false,
        name: 'JitsiMeetAnalyticsHandler',
      },
    ],
    plugins: [
      resolve({ extensions }),
      babel({ babelHelpers: 'bundled', extensions, include: ['src/**/*'] }),
    ],
  },
];
