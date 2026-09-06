
      import { Resvg } from '@resvg/resvg-js';
      import { readFileSync, writeFileSync } from 'fs';
      const svg = readFileSync("/Users/myhome/Projects/wiper-finder/twa/.splash-tmp/splash-300.svg", 'utf8');
      const resvg = new Resvg(svg, {
        fitTo: { mode: 'width', value: 300 },
        font: { fontFiles: ["/System/Library/Fonts/Supplemental/AppleGothic.ttf"], loadSystemFonts: true },
      });
      writeFileSync("/Users/myhome/Projects/wiper-finder/twa/app/src/main/res/drawable-mdpi/splash.png", resvg.render().asPng());
    