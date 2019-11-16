// install node_modules zip
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';


function zip(url) {
  var date = Date.now();
  return fetch(url)
  .then(response => {
    const num = Date.now() - date;
    console.log('fetch date', (num / 1000));
    return response.blob()
  })
  .then(JSZip.loadAsync)
  .then(async (zip) => {
    const num = Date.now() - date;
    console.log('zip date', (num / 1000));
    const symbolList = [];
    const dirList = [];
    const fileList = [];
    //debugger
    const arr = Object.keys(zip.files).map(name => (async () => {
      const obj = zip.files[name];
      // if (name.indexOf('cache-loader-with-compare-loader') > -1) {
      //   debugger
      // }
      const realPath = path.resolve('/app', name);
      
      // if (realPath === '/node_modules/_@alipay_tiny-cli@0.60.190816163146@@alipay/tiny-cli/node_modules/cache-loader-with-compare-loader.js') {
      //   debugger
      // }


      // dir
      if (obj.dir) {
        dirList.push({
          name: realPath,
        });
        return;
      }

     

      const content = await obj.async('string');


      

      // /\/node_modules\/[^_]/.test(realPath)
      // if (realPath.startsWith('/node_modules/.cache')) {
      //   debugger
      // }

      if (content.startsWith('./') || content.startsWith('../')  || content.startsWith('_')) {
        //console.log(name);
        symbolList.push({
          path: realPath,
          target: path.resolve(realPath, '../', content),
        });
        return;
      }

      const extname = path.extname(name);
      // if (extname!== '.js' && extname !== '.json') {
      //   return;
      // }

      //const extname = path.extname(name);
      //if (true) {
        //fileList[realPath] = content;
        fileList.push({
          name: realPath,
          content,
        });
      //}


    })());
    await Promise.all(arr);
    zip = null;
    return {
      symbolList,
      dirList,
      fileList,
    };
  })
  .then(({
    symbolList,
    dirList,
    fileList,
  }) => {

    {
      const num = Date.now() - date;
      console.log('zip 1', (num / 1000));
    }

    //debugger
    dirList.forEach(item => {
      fs.mkdirSync(item.name);
    });

    //vol.fromJSON(fileList);
    fileList.forEach(item => {
      fs.writeFileSync(item.name, item.content);
    });
    symbolList.forEach(item => {
      fs.symlinkSync(item.target, item.path);
    });

    const num = Date.now() - date;
    console.log('install all date', (num / 1000));

    symbolList = null;
    dirList = null;
    fileList = null;
    //alert(2)
  });
}

export default zip;

